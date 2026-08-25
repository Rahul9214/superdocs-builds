"""Job-architecture domain models, evidence clustering, and fixture loading.

This package is independently usable. It does not call SuperDocs or invoke
an AI model.
"""

from job_architecture.architecture import ArchitectureResult, build_architecture
from job_architecture.assess import assess_role
from job_architecture.cluster import ClusteringResult, cluster_corpus, evidence_signature
from job_architecture.evidence import extract_role_evidence, evidence_from_markdown
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
    "ArchitectureResult",
    "CareerTrack",
    "CareerTrackKind",
    "ClusteringResult",
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
    "assess_role",
    "build_architecture",
    "cluster_corpus",
    "evidence_from_markdown",
    "evidence_signature",
    "extract_role_evidence",
]
