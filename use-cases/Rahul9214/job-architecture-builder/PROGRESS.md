# Progress



## Phase 0 — Specification lock



\- \[x] Assignment reviewed

\- \[x] Task 2 identified

\- \[x] Required outcomes frozen

\- \[x] Acceptance criteria frozen

\- \[x] Required SuperDocs surfaces identified

\- \[x] Non-goals defined



## Phase 1 — Repository foundation



\- \[x] Fork created

\- \[x] Fork cloned locally

\- \[x] Official repository added as upstream

\- \[x] main synchronized

\- \[x] Feature branch created

\- \[x] Project folder created under use-cases/Rahul9214/

\- \[x] Initial directory skeleton created

\- \[ ] Foundation files populated

\- \[ ] Repository boundary validated

\- \[ ] Foundation commit created

\- \[ ] Branch pushed



## Phase 2 — Synthetic corpus



\- \[x] Define fictional company

\- \[x] Define job-family distribution

\- \[x] Build corpus A

\- \[x] Build independent corpus B

\- \[x] Include ambiguous roles

\- \[x] Include title/scope conflict

\- \[x] Include hybrid role

\- \[x] Include sparse-evidence role

\- \[x] Validate fixture schemas



## Phase 3 — Domain model



\- \[x] Role evidence model

\- \[x] Job family model

\- \[x] Career track model

\- \[x] Level definition model

\- \[x] Competency model

\- \[x] Role assessment model

\- \[x] Misfit/provisional model

\- \[x] Role profile model

\- \[x] Dependency graph (typed `DependencyEdge` only; traversal/propagation remains Phase 6)



## Phase 4 — Architecture reasoning



\- \[x] Evidence extraction

\- \[x] Family classification

\- \[x] Corpus-level evidence clustering

\- \[x] Track assignment

\- \[x] Level inference (IC1–IC5 and M1–M3)

\- \[x] Confidence/evidence explanation

\- \[x] Misfit handling

\- \[x] Title independence tests



Phase 4 hardening: clustering uses field-weighted TF-IDF plus occupational score cosine, with a compatibility gate so distinct crafts do not merge on generic JD language. Family catalog labels a cluster only after the group exists. Same-primary roles still need content overlap; hybrid, sparse, and misfit roles stay unclustered or appear as bridges. Canonical management levels remain M1–M3.



## Phase 5 — SuperDocs integration



\- \[x] Upload

\- \[x] Multi-document

\- \[x] Search

\- \[x] Templates

\- \[x] Async reviewed edits

\- \[x] Approval flow

\- \[x] Export

\- \[x] Error handling

\- \[x] Idempotency/retry boundaries



Phase 5 implements a SuperDocs adapter under `src/job_architecture/superdocs/`. Domain reasoning still does not call SuperDocs. HTTP details stay behind `SuperDocsClientProtocol`. All pytest coverage for this phase is offline (httpx MockTransport). The live smoke script is manual and is not part of pytest.



## Phase 6 — Surgical propagation



\- \[x] Dependency detection

\- \[x] Impact analysis

\- \[x] Proposed profile changes

\- \[x] Preservation measurement

\- \[x] Review gate

\- \[x] Regression tests



Phase 6 generates a `FrameworkDocument` from architecture-domain objects: canonical IC1–IC5 and M1–M3, family competency matrices, employee-readable profiles, misfit/provisional review artifacts, and explicit `DependencyEdge` records. Level changes are planned as section-level `UpdatePlan`s, stay unapplied until approved, and are checked with deterministic section hashes. SuperDocs payload/instruction transforms exist but make no HTTP calls. Frontend, live publication, and DOCX templates remain later.



## Phase 7 — UI



\- \[ ] Corpus workspace

\- \[ ] Architecture view

\- \[ ] Misfit/provisional review

\- \[ ] Role profile view

\- \[ ] Change-impact view

\- \[ ] Human review

\- \[ ] Export flow

\- \[ ] Responsive behavior



## Phase 8 — Verification



\- \[ ] Unit tests

\- \[ ] Integration tests

\- \[ ] SuperDocs contract tests

\- \[ ] Corpus A acceptance

\- \[ ] Corpus B acceptance

\- \[ ] Failure/retry tests

\- \[ ] Secret scan

\- \[ ] Clean-clone verification

\- \[ ] Build verification

\- \[ ] README finalized

\- \[ ] Screenshots added

\- \[ ] Final PR prepared
