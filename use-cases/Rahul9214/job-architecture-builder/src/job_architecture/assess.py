"""Combine family, track, and level inferences into a RoleAssessment.

Confidence is a coarse, explainable completeness/consistency score, not a
probability that the assignment is metaphysically true.

  0.2  sparse or almost no usable evidence
  0.4  hybrid or material conflict; assignment withheld or cautious
  0.5  family or track proposed with remaining ambiguity
  0.7  clear evidence for the proposed assignment
  0.8  clear misfit: outside the supported architecture
  0.9  strong, consistent evidence across family, track, and level

Title text is consulted only after evidence-based family/track/level are
chosen, and only to flag overstated seniority or manager-title conflicts.
Title never sets family, track, or level.
"""

from __future__ import annotations

from job_architecture.catalog import TITLE_MANAGER_CLAIM, TITLE_SENIORITY_CLAIM
from job_architecture.evidence import is_sparse_evidence
from job_architecture.family import FamilyInference, infer_family
from job_architecture.level import LevelInference, infer_level
from job_architecture.models import FitStatus, MisfitReason, RoleAssessment, RoleEvidence, SourceReference
from job_architecture.scoring import format_hit
from job_architecture.track import TrackInference, infer_track


def _title_conflicts(title: str, track: TrackInference, level: LevelInference) -> list[str]:
    conflicts: list[str] = []
    if TITLE_MANAGER_CLAIM.search(title) and track.track_id == "individual_contributor":
        conflicts.append(
            "Title claims a manager role, but people-management evidence supports an individual-contributor track."
        )
    if TITLE_SENIORITY_CLAIM.search(title) and level.level_label in {"IC1", "IC2"}:
        conflicts.append(
            "Title claims seniority, but scope/autonomy/impact evidence supports a junior IC level."
        )
    return conflicts


def _confidence(
    *,
    sparse: bool,
    hybrid: bool,
    outside: bool,
    conflicts: list[str],
    family: FamilyInference,
    track: TrackInference,
) -> float:
    if sparse:
        return 0.2
    if outside:
        return 0.8
    if hybrid:
        return 0.4
    if conflicts:
        return 0.5
    if family.family_id and track.decisive:
        return 0.9
    if family.family_id:
        return 0.7
    return 0.4


def assess_role(evidence: RoleEvidence, *, raw_markdown: str | None = None) -> RoleAssessment:
    sparse = is_sparse_evidence(evidence, raw_markdown)
    family = infer_family(evidence)
    track = infer_track(evidence)
    level = infer_level(evidence, track)
    conflicts = _title_conflicts(evidence.title, track, level)

    supporting = [format_hit(hit) for hit in (*family.supporting, *track.supporting, *level.supporting)]
    counter = [format_hit(hit) for hit in (*family.counter, *track.counter, *level.counter)]
    counter.extend(conflicts)

    # Deduplicate while preserving order.
    supporting = list(dict.fromkeys(item for item in supporting if item))
    counter = list(dict.fromkeys(item for item in counter if item))

    misfit_reasons: list[MisfitReason] = []
    proposed_family = family.family_id
    proposed_track = track.track_id
    proposed_level = level.level_label
    fit = FitStatus.STRONG_FIT

    if sparse:
        fit = FitStatus.PROVISIONAL
        proposed_family = None
        proposed_track = None
        proposed_level = None
        misfit_reasons.append(
            MisfitReason(
                code="insufficient_evidence",
                summary="Job description is too thin to defend a family or level.",
                detail="Generic duties and unspecified scope are not enough for a strong-fit assignment.",
                source_references=[
                    ref
                    for ref in evidence.source_references
                    if ref.locator in {"role purpose", "responsibilities", "scope and autonomy"}
                ][:3],
            )
        )
    elif family.is_outside:
        fit = FitStatus.MISFIT
        proposed_family = None
        proposed_track = None
        proposed_level = None
        misfit_reasons.append(
            MisfitReason(
                code="outside_architecture",
                summary="Role evidence sits outside the supported job-architecture families.",
                detail="Forcing a catalog family would misrepresent the work.",
                source_references=_refs_from_hits(evidence, family.supporting),
            )
        )
    elif family.is_hybrid:
        fit = FitStatus.PROVISIONAL
        proposed_family = None
        proposed_level = None
        rival = ", ".join(family.rival_ids) if family.rival_ids else "multiple families"
        misfit_reasons.append(
            MisfitReason(
                code="hybrid_unresolved",
                summary="Evidence spans more than one family without a defensible primary.",
                detail=f"Competing signals: {rival}.",
                source_references=_refs_from_hits(evidence, family.supporting),
            )
        )
    elif conflicts:
        fit = FitStatus.PROVISIONAL
        # Keep evidence-based family/track/level; do not let the title replace them.
    elif proposed_family is None:
        fit = FitStatus.PROVISIONAL
        proposed_level = None
        misfit_reasons.append(
            MisfitReason(
                code="insufficient_family_signal",
                summary="No catalog family crossed the assignment threshold.",
                detail="Family scores were too weak or too mixed to assign.",
            )
        )
    else:
        fit = FitStatus.STRONG_FIT

    confidence = _confidence(
        sparse=sparse,
        hybrid=family.is_hybrid,
        outside=family.is_outside,
        conflicts=conflicts,
        family=family,
        track=track,
    )

    return RoleAssessment(
        role_id=evidence.role_id,
        fit_status=fit,
        confidence=confidence,
        proposed_family=proposed_family,
        proposed_track=None if fit is FitStatus.MISFIT or sparse else proposed_track,
        proposed_level=None if fit is FitStatus.MISFIT or sparse or family.is_hybrid else proposed_level,
        supporting_evidence=supporting[:12],
        counter_evidence=counter[:12],
        misfit_reasons=misfit_reasons,
    )


def _refs_from_hits(evidence: RoleEvidence, hits) -> list[SourceReference]:
    excerpts = {hit.excerpt.rstrip("…") for hit in hits if hit.excerpt}
    refs: list[SourceReference] = []
    for ref in evidence.source_references:
        if any(excerpt.lower() in (ref.excerpt or "").lower() or excerpt.lower() in evidence.domain_depth.lower() for excerpt in excerpts):
            refs.append(ref)
        if len(refs) >= 3:
            break
    return refs or list(evidence.source_references[:2])
