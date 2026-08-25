"""Job-architecture domain models and fixture loading.

This package is independently usable. It does not call SuperDocs, cluster
roles, or invoke an AI model.
"""

from job_architecture.models import (
    CareerTrack,
    CareerTrackKind,
    Competency,
    DependencyEdge,
    FitStatus,
    JobFamily,
    LevelDefinition,
    MisfitReason,
    RoleAssessment,
    RoleEvidence,
    RoleProfile,
    SourceReference,
)

__all__ = [
    "CareerTrack",
    "CareerTrackKind",
    "Competency",
    "DependencyEdge",
    "FitStatus",
    "JobFamily",
    "LevelDefinition",
    "MisfitReason",
    "RoleAssessment",
    "RoleEvidence",
    "RoleProfile",
    "SourceReference",
]
