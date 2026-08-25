"""Map framework objects to SuperDocs template/edit payloads. No HTTP."""

from __future__ import annotations

from job_architecture.framework import FrameworkDocument
from job_architecture.models import RoleProfile
from job_architecture.propagation import UpdatePlan

FRAMEWORK_TEMPLATE_ID = "job-architecture-framework"
PROFILE_TEMPLATE_ID = "job-architecture-role-profile"


def framework_to_template_payload(framework: FrameworkDocument) -> dict[str, object]:
    return {
        "template_id": FRAMEWORK_TEMPLATE_ID,
        "filename": "job-architecture-framework.md",
        "markdown": render_framework_markdown(framework),
        "metadata": {
            "organization": framework.organization,
            "family_count": len(framework.families),
            "profile_count": len(framework.profiles),
            "level_ids": [item.id for item in framework.levels],
        },
    }


def profile_to_template_payload(profile: RoleProfile) -> dict[str, object]:
    return {
        "template_id": PROFILE_TEMPLATE_ID,
        "filename": f"{profile.id}.md",
        "markdown": render_profile_markdown(profile),
        "metadata": {
            "profile_id": profile.id,
            "role_id": profile.role_id,
            "family_id": profile.family_id,
            "level_id": profile.level_id,
            "classification": profile.classification,
        },
    }


def update_plan_to_edit_instruction(plan: UpdatePlan) -> str:
    return (
        f"In the role profile, update ONLY the '{plan.section_id}' section. "
        "Do not rewrite the rest of the profile. Do not change purpose, "
        "responsibilities, or any other section. Replace the current "
        f"'{plan.section_id}' text with exactly the following:\n\n{plan.after}"
    )


def render_framework_markdown(framework: FrameworkDocument) -> str:
    lines = [
        f"# Job architecture — {framework.organization}",
        "",
        "## Purpose",
        framework.purpose,
        "",
        "## Principles",
        *[f"- {item}" for item in framework.principles],
        "",
        "## Career tracks",
        *[f"- {item.name} (`{item.id}`): {item.description}" for item in framework.tracks],
        "",
        "## Canonical levels",
    ]
    for level in framework.levels:
        lines.extend(
            [
                f"### {level.label} (`{level.id}`, version {level.version})",
                f"- Scope: {level.scope}",
                f"- Autonomy / decision authority: {level.decision_authority or level.autonomy}",
                f"- Complexity: {level.complexity}",
                f"- Impact: {level.impact}",
                f"- Leadership: {level.leadership}",
                f"- People management: {level.people_management or 'None'}",
                "",
            ]
        )
    lines.extend(["## Job families", ""])
    for family in framework.families:
        lines.append(f"- **{family.name}** (`{family.id}`): {family.description}")
    lines.extend(["", "## Competency matrices", ""])
    for matrix in framework.competency_matrices:
        lines.append(f"### {matrix.family_name}")
        if matrix.evidence_limited:
            lines.append(f"Limitation: {matrix.limitation}")
        for competency in matrix.competencies:
            lines.append(f"- {competency.name} (`{competency.id}`): {competency.description}")
        lines.append("")
    lines.extend(["## Role mappings", ""])
    for mapping in framework.role_mappings:
        lines.append(
            f"- `{mapping.role_id}`: {mapping.fit_status.value}; "
            f"family={mapping.family_id or 'none'}; level={mapping.level_id or 'none'}; "
            f"profile={mapping.profile_id or 'none'}"
        )
    lines.extend(["", "## Provisional roles", ""])
    for item in framework.provisional_roles:
        lines.append(f"- `{item.role_id}` ({item.title}): {item.summary}")
    lines.extend(["", "## Misfits", ""])
    for item in framework.misfits:
        lines.append(f"- `{item.role_id}` ({item.title}): {item.summary}")
    return "\n".join(lines).rstrip() + "\n"


def render_profile_markdown(profile: RoleProfile) -> str:
    responsibilities = "\n".join(f"- {item}" for item in profile.responsibilities)
    return "\n".join(
        [
            f"# {profile.display_title}",
            "",
            f"- Job family: {profile.family_name or profile.family_id}",
            f"- Career track: {profile.track_name or profile.track_id}",
            f"- Level: {profile.level_label or profile.level_id}",
            f"- Classification: {profile.classification}",
            "",
            "## Role purpose",
            profile.summary,
            "",
            "## Responsibilities",
            responsibilities,
            "",
            "## Scope / decision making",
            profile.scope_decision_making,
            "",
            "## Core competencies",
            profile.core_competencies,
            "",
            "## Level expectations",
            profile.level_expectations,
            "",
            "## Progression",
            profile.progression,
            "",
            "## Source / evidence note",
            profile.evidence_note,
            "",
        ]
    )
