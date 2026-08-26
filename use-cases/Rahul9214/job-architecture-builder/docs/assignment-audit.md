# Task 2 assignment audit

Recorded against branch `task2-job-architecture-builder`, commit `274866eda8d266221853e79bff6862bfe653a9fc`, plus uncommitted Phase 9 documentation and a small production CSS contrast fix for `.chip.warn`.

Do not treat a row as PASS without the cited evidence. Live SuperDocs claims cite `docs/live-verification.md` only.

## Required outcomes

| Requirement | Implementation evidence | Verification evidence | File / test / UI | Status |
| --- | --- | --- | --- | --- |
| Existing job descriptions as input | Markdown JDs under `fixtures/corpus-a` and `fixtures/corpus-b`; parsed into `RoleEvidence` | Fixture schema tests; Sources page lists 21 Northstar / Meridian roles | `src/job_architecture/evidence.py`; `tests/test_fixtures.py`; `/sources` | PASS |
| Job families | Catalog families; corpus clusters labeled after grouping | Architecture metrics `proposed_families`; framework family cards | `src/job_architecture/family.py`; `catalog.py`; `/architecture`, `/framework` | PASS |
| Levels | Canonical IC1–IC5 and M1–M3 with occupied M2/M3 remaining in catalog | Framework tables show IC1–IC5 and M1–M3; management tests | `src/job_architecture/level.py`; `tests/test_management_levels.py`; `/framework` | PASS |
| Career tracks | IC vs people-manager from people-management evidence | EM Platform Services is `people_manager`; EM Developer Experience is IC | `src/job_architecture/track.py`; `tests/test_adversarial.py`; Architecture chips | PASS |
| Competency matrices | Per-family matrices on `FrameworkDocument`; evidence-limited flag when thin | Framework UI lists matrices per family | `src/job_architecture/framework.py`; `/framework` Competency matrices | PASS |
| Role profiles | Structured employee-readable profiles; misfits are review artifacts | Profiles API and UI; IC4 profile contains level expectations | `src/job_architecture/profiles.py`; `tests/test_web_acceptance.py`; `/profiles` | PASS |

## Required behaviors and evidence dimensions

| Requirement | Implementation evidence | Verification evidence | File / test / UI | Status |
| --- | --- | --- | --- | --- |
| 8. Evidence instead of title matching | Title excluded from clustering tokens and family scoring; family/track/level inferred from JD dimensions | Metamorphic title-swap tests keep family/track/level | `scoring.py`, `clustering`; `tests/test_adversarial.py::test_title_swap_does_not_change_family_track_level` | PASS |
| 9. Title / evidence conflict handling | Typed `TitleConflict` after evidence assignment; generic seniority / management / understatement rules | Dedicated tests for Workplace Tools, Payments, EM DX, EM Platform, Corpus B Principal | `src/job_architecture/assess.py`; `tests/test_title_conflict.py`; Architecture “Title vs evidence” | PASS |
| Evidence dimensions (scope, autonomy, complexity, impact, leadership, management, decision authority, stakeholders, domain, outcomes) | Copied from JD sections into `RoleEvidence`; UNSTATED when missing | Role drawer “Evidence signals”; extraction tests | `src/job_architecture/evidence.py`; `/architecture` drawer | PASS |
| 10. Honest provisional roles | Sparse, hybrid, and fit-changing title conflicts remain provisional | Program Coordinator sparse; Solutions Architect hybrid | `tests/test_adversarial.py`; `/exceptions` Provisional | PASS |
| 11. Honest misfits | Outside-architecture roles stay misfit with reasons; no auto-assign | Developer Advocate; Medical Science Liaison | `tests/test_adversarial.py`; `/exceptions` Misfit | PASS |
| 7. Defensible clustering | Field-weighted TF-IDF + occupational cosine, compatibility gate, title omitted; hybrids/sparse/misfits unclustered or bridges | Clustering tests; Architecture “Craft neighborhoods” | `tests/test_clustering.py`; `/architecture` | PASS |

## SuperDocs surfaces (A5)

| Requirement | Implementation evidence | Verification evidence | File / test / UI | Status |
| --- | --- | --- | --- | --- |
| 12. Multi-document | Upload with `open_mode=new_focused`; session roster | Live record: four JD document ids coexisted | `src/job_architecture/superdocs/client.py`; `docs/live-verification.md` roster | PASS |
| 13. Search | Async chat with `cross_session_search=true`; resume polls same job id | Live resume: 0 extra mutating calls, no second POST, `completed`, `verified/terminal/has_result=true` | `scripts/superdocs_live.py`; live-verification Search row | PASS |
| 14. Templates | Template upload-base64 for framework and role-profile | Live record: two templates uploaded | live-verification templates row; `templates/*.md` | PASS |
| 15. Review | `approval_mode=ask_every_time`; per-change approve/reject | Framework/profile/repair approved; surgical 1–2 rejected; attempt 3 approved | live-verification decision log; `/review` for local plans | PASS |
| 16. Export | `POST /v1/documents/export` with documented `html` + `session_id` + `format` + `filename`; local DOCX also from web | Live profile DOCX export succeeded; live framework attempts 1–2 HTTP-succeeded but returned a source JD; attempt 3 HTML export semantic PASS | live-verification `export --kind profile` PASS; `export --kind framework` attempt 3 **PASS** (attempts 1–2 kept as failed evidence); `/export` | PASS |

## Surgical propagation (A3) and human gate (A4)

| Requirement | Implementation evidence | Verification evidence | File / test / UI | Status |
| --- | --- | --- | --- | --- |
| 17. Changed level definition | `analyze_level_change` / web impact | Offline acceptance plans an IC4 scope change | `src/job_architecture/impact.py`; `/impact`; `tests/test_web_acceptance.py` | PASS |
| 18. Dependent-profile detection | Explicit `DependencyEdge` level → `level_expectations` | Impact payload affected vs unaffected counts | `src/job_architecture/graph.py`; `/impact` | PASS |
| 19. Surgical updates | Patch only changed canonical dimensions | Live attempt 3: version + Scope only; attempt 1 rejected for Complexity spill | `plan_level_updates`; live-verification surgical 3 | PASS |
| 20. Preservation of unrelated content | SHA-256 section hashes; `PreservationReport.violations` fail | Live `verify-export` passed; offline apply keeps purpose | `tests/test_framework_propagation.py`; live-verification preservation | PASS |
| 21. Explicit human approval/rejection | No auto-approve; CLI `--confirm`; web Approve/Reject | Decision log; review UI | `scripts/superdocs_live.py`; `/review` | PASS |
| 22. Rejected change remains unapplied | `review_outcome=rejected`, `mutation_applied=false` even if remote `completed` | Surgical attempts 1–2 kept in history; versions not advanced | `tests/test_live_review_resume.py`; live-verification | PASS |
| Domain apply only after verification | `finalize-domain` local; remote `completed` is not apply | Live finalize after structure + preservation | `tests/test_live_domain_apply.py`; live-verification | PASS |

## Production engineering (A6)

| Requirement | Implementation evidence | Verification evidence | File / test / UI | Status |
| --- | --- | --- | --- | --- |
| 23. Second-corpus validation | Same engine on Meridian fixtures | `tests/test_web_acceptance.py::test_corpus_b_smoke_path`; Corpus B UI uses `/api/*/{corpus_id}` | fixtures/corpus-b; `/` organization select | PASS |
| 24. Offline tests | pytest MockTransport; Vitest mocked fetch | pytest and `npm test` without a live key | `tests/`; `web/src/test/` | PASS |
| 25. Actionable failure handling | Typed SuperDocs errors; UI `role="alert"` messages | Client tests for timeout/5xx; Export/Review error banners | `src/job_architecture/superdocs/`; Status.tsx | PASS |
| 26. Retries / resume / idempotency | Safe GET retry; no blind POST retry; `operation_key`; Search resume same job | Documented in README; live Search resume 0 extra POSTs | `client.py`; live-verification Search | PASS |
| 27. Secret hygiene | `.env` gitignored; runtime state refuses secret keys; API status redacts | `docs/security-check.md`; `tests/test_web_api.py` secret markers | `.gitignore`; `live/state.py` | PASS |
| 28. Clean-clone reproducibility | README install from a fresh clone of this branch | `docs/clean-clone-verification.md` | temp clone under `%TEMP%` | PASS |
| 29. Reviewer-facing documentation | README + TASK2 + this audit + live/manual/security/clone docs | Files in `docs/` and README | README.md; docs/* | PASS |

## Acceptance criteria summary

| ID | Criterion | Status |
| --- | --- | --- |
| A1 | Defensible architecture with exposed reasoning | PASS — supporting/counter evidence and source locators |
| A2 | Honest misfits / provisional | PASS |
| A3 | Surgical propagation + preservation | PASS (offline + live profile path) |
| A4 | Human gate | PASS |
| A5 | SuperDocs upload, multi-document, search, templates, review, export | PASS — framework reviewed edit proven; framework export attempt 3 HTML semantic PASS (attempts 1–2 failed with a source JD and are retained as evidence) |
| A6 | Production engineering | PASS |

## Non-goals (NOT APPLICABLE)

HRIS, ATS, compensation benchmarking, salary bands, employee-record management, auth/RBAC, generic document editing, generic chatbot, real private HR data, automatic approval, automatic publication — none implemented; none required.

## Hosted deployment

NOT APPLICABLE. No hosted SuperDocs or public deployment is claimed. Reviewer UI is local FastAPI.
