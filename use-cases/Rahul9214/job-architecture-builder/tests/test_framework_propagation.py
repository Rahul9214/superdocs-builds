"""Phase 6: framework generation, profiles, dependencies, surgical propagation."""

from __future__ import annotations

from dataclasses import replace
from pathlib import Path

import pytest

from job_architecture.architecture import build_architecture, extract_corpus_evidence
from job_architecture.documents import (
    profile_to_template_payload,
    update_plan_to_edit_instruction,
)
from job_architecture.fixtures import load_corpus
from job_architecture.framework import generate_framework
from job_architecture.graph import DependencyGraph, DependencyGraphError, validate_dependency_graph
from job_architecture.hashes import hash_section
from job_architecture.models import (
    PROFILE_SECTION_IDS,
    DependencyEdge,
    FitStatus,
)
from job_architecture.propagation import (
    ChangeStatus,
    analyze_level_change,
    apply_approved_plans,
    approve_plans,
    plan_level_updates,
    reject_plans,
    snapshot_hashes,
)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
GENERATION_FILES = (
    "framework.py",
    "profiles.py",
    "matrices.py",
    "graph.py",
    "propagation.py",
    "documents.py",
    "hashes.py",
)


def _framework(corpus_id: str):
    corpus = load_corpus(corpus_id)
    architecture = build_architecture(corpus)
    evidences = extract_corpus_evidence(corpus)
    return architecture, generate_framework(architecture, evidences)


def test_framework_contains_canonical_ic_and_m_levels():
    _, framework = _framework("corpus-a")
    labels = {item.label for item in framework.levels}
    assert labels >= {"IC1", "IC2", "IC3", "IC4", "IC5", "M1", "M2", "M3"}
    for level in framework.levels:
        assert level.version >= 1
        assert level.scope
        assert level.autonomy
        assert level.decision_authority
        assert level.complexity
        assert level.impact
        assert level.leadership


def test_strong_fit_roles_map_to_profiles():
    architecture, framework = _framework("corpus-a")
    strong = {item.role_id for item in architecture.assessments if item.fit_status is FitStatus.STRONG_FIT}
    profile_roles = {item.role_id for item in framework.profiles}
    assert strong <= profile_roles
    mapped = {item.role_id for item in framework.role_mappings if item.profile_id}
    assert strong <= mapped


def test_provisional_roles_remain_visible():
    architecture, framework = _framework("corpus-a")
    provisional = {item.role_id for item in architecture.assessments if item.fit_status is FitStatus.PROVISIONAL}
    artifact_ids = {item.role_id for item in framework.provisional_roles}
    profile_ids = {
        item.role_id for item in framework.profiles if item.classification == FitStatus.PROVISIONAL.value
    }
    assert provisional == artifact_ids | profile_ids
    for profile in framework.profiles:
        if profile.classification == FitStatus.PROVISIONAL.value:
            assert "provisional" in profile.evidence_note.lower()
            assert "not finalized" in profile.evidence_note.lower()


def test_misfits_are_not_normalized():
    architecture, framework = _framework("corpus-a")
    misfits = {item.role_id for item in architecture.assessments if item.fit_status is FitStatus.MISFIT}
    assert misfits
    assert {item.role_id for item in framework.misfits} == misfits
    assert not {item.role_id for item in framework.profiles} & misfits
    for artifact in framework.misfits:
        assert "misfit" in artifact.summary.lower()
        assert artifact.reasons


def test_family_matrices_are_consistent():
    _, framework = _framework("corpus-a")
    family_ids = {item.id for item in framework.families}
    assert {item.family_id for item in framework.competency_matrices} == family_ids
    for matrix in framework.competency_matrices:
        assert matrix.competencies
        names = [item.name for item in matrix.competencies]
        assert len(names) == len(set(names))
        for competency in matrix.competencies:
            assert competency.family_id == matrix.family_id
            assert competency.indicators_by_level


def test_dependency_graph_has_level_to_profile_edges():
    _, framework = _framework("corpus-a")
    level_edges = [
        edge
        for edge in framework.dependency_graph.edges
        if edge.source_type == "level_definition" and edge.target_section == "level_expectations"
    ]
    assert level_edges
    assert {edge.target_id for edge in level_edges} == {item.id for item in framework.profiles}
    competency_edges = [
        edge for edge in framework.dependency_graph.edges if edge.source_type == "competency"
    ]
    assert competency_edges


def test_ic4_change_selects_ic4_and_excludes_other_levels():
    _, framework = _framework("corpus-a")
    old = framework.level("IC4")
    ic4_ids = {item.id for item in framework.profiles_for_level("IC4")}
    assert ic4_ids
    new = replace(old, scope=old.scope + " Explicit domain veto added.", version=old.version + 1)
    analysis = analyze_level_change(
        old,
        new,
        framework.dependency_graph,
        framework.profiles,
        levels=framework.levels,
    )
    assert set(analysis.affected_profile_ids) == ic4_ids
    excluded = {item.id for item in framework.profiles if item.level_id != old.id}
    assert set(analysis.unaffected_profile_ids) == excluded
    for profile in framework.profiles:
        if profile.level_label in {"IC1", "IC2", "IC3", "IC5", "M1", "M2", "M3"}:
            assert profile.id not in analysis.affected_profile_ids


def test_only_intended_sections_change_and_hashes_hold():
    _, framework = _framework("corpus-a")
    old = framework.level("IC4")
    new = replace(old, impact=old.impact + " Added reliability bar.", version=old.version + 1)
    analysis = analyze_level_change(
        old, new, framework.dependency_graph, framework.profiles, levels=framework.levels
    )
    plans = approve_plans(
        plan_level_updates(
            analysis,
            old_level=old,
            new_level=new,
            dependency_graph=framework.dependency_graph,
            profiles=framework.profiles,
        )
    )
    before = snapshot_hashes(framework.profiles)
    updated, graph, report, applied = apply_approved_plans(
        plans,
        framework.profiles,
        framework.dependency_graph,
        new_level=new,
        expected_before=before,
    )
    assert report.ok
    assert report.violations == ()
    changed_ids = {item.profile_id for item in report.changed_sections}
    assert changed_ids == set(analysis.affected_profile_ids)
    for item in report.changed_sections:
        assert item.section_id == "level_expectations"
    by_id = {item.id: item for item in updated}
    for profile in framework.profiles:
        for section_id in PROFILE_SECTION_IDS:
            if profile.id in changed_ids and section_id == "level_expectations":
                assert hash_section(by_id[profile.id], section_id) != before[profile.id][section_id]
            else:
                assert hash_section(by_id[profile.id], section_id) == before[profile.id][section_id]
    for edge in graph.for_source("level_definition", old.id):
        if edge.target_id in changed_ids:
            assert edge.source_version == new.version


def test_second_application_is_idempotent():
    _, framework = _framework("corpus-a")
    old = framework.level("IC4")
    new = replace(old, leadership=old.leadership + " Coaches via written RFCs.", version=old.version + 1)
    analysis = analyze_level_change(
        old, new, framework.dependency_graph, framework.profiles, levels=framework.levels
    )
    planned = plan_level_updates(
        analysis,
        old_level=old,
        new_level=new,
        dependency_graph=framework.dependency_graph,
        profiles=framework.profiles,
    )
    approved = approve_plans(planned)
    updated, graph, report, _ = apply_approved_plans(
        approved, framework.profiles, framework.dependency_graph, new_level=new
    )
    assert report.ok
    second_plans = plan_level_updates(
        analysis,
        old_level=old,
        new_level=new,
        dependency_graph=graph,
        profiles=updated,
    )
    assert second_plans == ()
    before = snapshot_hashes(updated)
    again, graph2, report2, _ = apply_approved_plans(
        approved, updated, graph, new_level=new, expected_before=before
    )
    assert report2.ok
    assert report2.changed_sections == ()
    assert snapshot_hashes(again) == before
    for left, right in zip(graph.edges, graph2.edges, strict=True):
        assert left.source_version == right.source_version


def test_rejected_update_remains_unapplied():
    _, framework = _framework("corpus-a")
    old = framework.level("IC4")
    new = replace(old, scope=old.scope + " Rejected draft.", version=old.version + 1)
    analysis = analyze_level_change(
        old, new, framework.dependency_graph, framework.profiles, levels=framework.levels
    )
    rejected = reject_plans(
        plan_level_updates(
            analysis,
            old_level=old,
            new_level=new,
            dependency_graph=framework.dependency_graph,
            profiles=framework.profiles,
        )
    )
    assert rejected and all(item.status is ChangeStatus.REJECTED for item in rejected)
    before = snapshot_hashes(framework.profiles)
    updated, graph, report, finished = apply_approved_plans(
        rejected, framework.profiles, framework.dependency_graph, new_level=new, expected_before=before
    )
    assert report.changed_sections == ()
    assert snapshot_hashes(updated) == before
    for edge in graph.edges:
        original = next(item for item in framework.dependency_graph.edges if item.id == edge.id)
        assert edge.source_version == original.source_version
    assert all(item.status is ChangeStatus.REJECTED for item in finished)


def test_dependency_version_updates_only_after_apply():
    _, framework = _framework("corpus-a")
    old = framework.level("IC4")
    new = replace(old, autonomy=old.autonomy + " Domain sequencing authority.", version=old.version + 1)
    analysis = analyze_level_change(
        old, new, framework.dependency_graph, framework.profiles, levels=framework.levels
    )
    planned = plan_level_updates(
        analysis,
        old_level=old,
        new_level=new,
        dependency_graph=framework.dependency_graph,
        profiles=framework.profiles,
    )
    for edge in framework.dependency_graph.for_source("level_definition", old.id):
        assert edge.source_version == old.version
    _, graph, _, _ = apply_approved_plans(
        approve_plans(planned), framework.profiles, framework.dependency_graph, new_level=new
    )
    for edge in graph.for_source("level_definition", old.id):
        assert edge.source_version == new.version


def test_malformed_dependency_graph_fails_safely():
    _, framework = _framework("corpus-a")
    dangling = DependencyEdge(
        id="bad-edge",
        source_type="level_definition",
        source_id=framework.level("IC4").id,
        target_type="role_profile",
        target_id="profile-does-not-exist",
        target_section="level_expectations",
    )
    with pytest.raises(DependencyGraphError, match="Dangling"):
        validate_dependency_graph(DependencyGraph(edges=(dangling,)), framework.profiles, framework.levels)
    unknown_section = replace(
        framework.dependency_graph.edges[0],
        id="bad-section",
        target_section="not_a_section",
    )
    with pytest.raises(DependencyGraphError, match="Unknown target_section"):
        validate_dependency_graph(
            DependencyGraph(edges=(unknown_section,)), framework.profiles, framework.levels
        )


def test_corpus_b_uses_same_generation_path():
    architecture, framework = _framework("corpus-b")
    assert framework.organization == architecture.organization
    labels = {item.label for item in framework.levels}
    assert labels >= {"IC1", "IC2", "IC3", "IC4", "IC5", "M1", "M2", "M3"}
    strong = {item.role_id for item in architecture.assessments if item.fit_status is FitStatus.STRONG_FIT}
    assert strong <= {item.role_id for item in framework.profiles}
    misfits = {item.role_id for item in architecture.assessments if item.fit_status is FitStatus.MISFIT}
    assert misfits <= {item.role_id for item in framework.misfits}
    assert {item.family_id for item in framework.competency_matrices} == {item.id for item in framework.families}


def test_generation_logic_has_no_corpus_specific_identifiers():
    src = PROJECT_ROOT / "src" / "job_architecture"
    forbidden = (
        "corpus-a",
        "corpus-b",
        "northstar",
        "meridian",
        "ns-swe",
        "ns-em",
        "mh-",
        "workplace tools",
        "developer advocate",
        "medical science",
        "program coordinator",
        "solutions architect",
        "patient portal widgets",
    )
    for name in GENERATION_FILES:
        text = (src / name).read_text(encoding="utf-8").lower()
        for token in forbidden:
            assert token not in text, f"{name} contains {token!r}"


def test_hero_acceptance_corpus_a_measurable_preservation():
    architecture, framework = _framework("corpus-a")
    occupied = [
        (level, framework.profiles_for_level(level.id))
        for level in framework.levels
        if framework.profiles_for_level(level.id)
    ]
    occupied.sort(key=lambda item: len(item[1]), reverse=True)
    old, occupants = occupied[0]
    assert len(occupants) >= 2
    new = replace(
        old,
        scope=old.scope + " Surgical change for preservation proof.",
        version=old.version + 1,
    )
    analysis = analyze_level_change(
        old, new, framework.dependency_graph, framework.profiles, levels=framework.levels
    )
    assert set(analysis.affected_profile_ids) == {item.id for item in occupants}
    plans = plan_level_updates(
        analysis,
        old_level=old,
        new_level=new,
        dependency_graph=framework.dependency_graph,
        profiles=framework.profiles,
    )
    assert {item.profile_id for item in plans} == set(analysis.affected_profile_ids)
    instruction = update_plan_to_edit_instruction(plans[0])
    assert "ONLY" in instruction
    assert "rewrite the rest of the profile" in instruction.lower() or "Do not rewrite" in instruction
    payload = profile_to_template_payload(framework.profiles[0])
    assert payload["template_id"] == "job-architecture-role-profile"
    before = snapshot_hashes(framework.profiles)
    updated, _, report, applied = apply_approved_plans(
        approve_plans(plans),
        framework.profiles,
        framework.dependency_graph,
        new_level=new,
        expected_before=before,
    )
    assert applied and all(item.status is ChangeStatus.APPLIED for item in applied)
    assert report.ok
    assert len(report.violations) == 0
    affected = len(analysis.affected_profile_ids)
    changed_sections = len(report.changed_sections)
    untouched = len(report.unchanged_sections)
    assert affected >= 2
    assert changed_sections == affected
    expected_untouched = len(framework.profiles) * len(PROFILE_SECTION_IDS) - changed_sections
    assert untouched == expected_untouched
    by_id = {item.id: item for item in updated}
    for profile in occupants:
        assert "Surgical change for preservation proof" in by_id[profile.id].level_expectations
        assert by_id[profile.id].summary == profile.summary
        assert by_id[profile.id].responsibilities == profile.responsibilities
        assert by_id[profile.id].core_competencies == profile.core_competencies
    print(
        f"affected profiles: {affected}; changed sections: {changed_sections}; "
        f"untouched sections verified: {untouched}; violations: 0"
    )
    assert architecture.assessments
