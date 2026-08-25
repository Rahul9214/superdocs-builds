# Job Architecture and Levelling Framework Builder



Task 2 submission for the SuperDocs build assignment.



The project converts synthetic job-description evidence into a defensible job architecture consisting of job families, career tracks, level definitions, competency matrices, and employee-readable role profiles.



The implementation is designed around three control principles:



1\. evidence over title matching;

2\. explicit treatment of uncertainty and misfits;

3\. surgical propagation of canonical framework changes into dependent profiles.



## Status



Phase 6 framework generation and surgical propagation are implemented on top of Phase 4 reasoning and the Phase 5 SuperDocs adapter. Domain generation still does not call SuperDocs.



The reasoning core parses synthetic Markdown job descriptions into `RoleEvidence`, clusters roles from evidence tokens (not titles), then proposes family, track, and canonical level with explicit fit status (`strong_fit`, `provisional`, `misfit`). Domain reasoning still does not call SuperDocs or any model provider; only `src/job_architecture/superdocs/` talks to the SuperDocs HTTP API.



See:



\- \[Task specification](TASK2.md)

\- \[Progress](PROGRESS.md)

\- \[Assumptions](ASSUMPTIONS.md)

\- \[Test plan](TEST\_PLAN.md)



## Run the tests



```text
python -m venv .venv
.venv\Scripts\pip install -e ".[dev]"
.venv\Scripts\python -m pytest
.venv\Scripts\python -m compileall src tests
```



No live SuperDocs key is required for pytest. The only runtime HTTP dependency is httpx (explicit timeouts, streaming export, MockTransport). Fixtures live under `fixtures/corpus-a`, `fixtures/corpus-b`, and `fixtures/superdocs`.



## Confidence



Confidence is a coarse consistency score, not a probability:



\- 0.2 sparse evidence

\- 0.4 hybrid / unresolved family

\- 0.5 title-vs-evidence conflict, with evidence-based family/track/level retained

\- 0.7–0.9 strong-fit assignment

\- 0.8 confident misfit (role is outside the supported architecture)



## Clustering



A cluster is a craft neighborhood: core roles may merge when they are occupationally compatible and share enough content under average linkage of supported pairs.



Similarity is not raw token Jaccard. Each role has a TF-IDF vector over field-weighted occupational tokens (responsibilities and domain first) and a vector of family-lexicon evidence scores. Title, team, organization, and stakeholder lists are omitted. Generic JD language is stopworded; employer-name tokens are dropped from the corpus rather than hardcoded.



Distinct strong crafts do not merge unless each role carries the other's primary dimension. Same-primary roles still need a TF-IDF floor, so sharing a family score is not enough to cluster. Family catalog labels are applied only after groups exist.



Hybrid, sparse, and misfit roles are not absorbed to force complete coverage. They may appear as bridges or remain unclustered.



Diagnostics per cluster: intra-cluster cohesion, nearest other cluster, separation, ambiguous members, and label confidence when labeled.



Limitations: TF-IDF and lexicon weights are small and explicit; chained neighborhoods can be looser than a clique; this is not embedding-based clustering.



## Canonical levels



IC1–IC5 on the individual-contributor track. M1–M3 on the people-manager track. M2 and M3 exist in the framework even when no current fixture occupies them. Management level is inferred from people-management evidence, never from title.




## SuperDocs adapter



HTTP code lives in `src/job_architecture/superdocs/`. Application code should depend on `SuperDocsClientProtocol`, not on httpx.



Official surfaces used:



\- Upload: `POST /v1/documents/upload` (`open_mode=new_focused` so extra JDs/templates do not replace each other)

\- Session roster: `GET /v1/sessions/{session_id}/documents`

\- Saved files: `GET /v1/documents`, `POST /v1/sessions/{session_id}/documents/open`

\- Templates: `POST /v1/templates/upload-base64`, `GET /v1/templates`

\- Reviewed async edit: `POST /v1/chat/async` with `approval_mode=ask_every_time`

\- Job poll: `GET /v1/jobs/{job_id}`

\- Approve/reject: `POST /v1/chat/{session_id}/approve` (top-level `approved` is always required)

\- Large-edit continue: `POST /v1/chat/{session_id}/continue` when `metadata.awaiting_kind=continue_prompt`

\- Search: async chat with `cross_session_search=true` (there is no dedicated search endpoint)

\- Export: `POST /v1/documents/export` (file bytes; streamed to a path or binary handle)



Configuration (server-side only): `SUPERDOCS_API_KEY`, `SUPERDOCS_BASE_URL`, `REQUEST_TIMEOUT_SECONDS`. A missing key raises `ConfigurationError`. The key is never included in `repr`, error strings, or fixtures.



### Long-running jobs



Mapped states: `queued` (`pending`), `processing` (`in_progress`), `awaiting_approval`, `completed`, `failed`. Slow processing is not treated as failure. `JobTimeoutError` means this process stopped waiting; the SuperDocs job may still be running. Default poll wait is 300 seconds; jobs can take minutes.



### Review semantics



Reviewed edits always send `ask_every_time`. Polling stops at `awaiting_approval`. Proposed changes expose before/after/reason/identifier. Nothing is approved unless `submit_review` is called with explicit per-change decisions. Mixed decisions are not treated as all-approved (`ApprovalResult.all_approved`). Calling `/approve` on a `continue_prompt` pause is the wrong endpoint; use `continue_large_edit`.



Proposed-change payloads may arrive as a JSON-encoded string (SSE-style double parse). `parse_pending_changes` handles decoded objects, JSON strings, nested JSON strings, and malformed input. Malformed content raises `ProposedChangeParseError` instead of becoming an empty valid change list.



### Retry and idempotency



Not exactly-once.



\- Safe retry: GET job/roster/template/document list, bounded, only on timeout/429/5xx.

\- Unsafe / do not blind-retry: POST upload, chat/async, approve, continue, export after timeout or an ambiguous transport failure (`AmbiguousOutcomeError`). Inspect jobs or the session roster before sending again.

\- Already-completed: an in-process `operation_key` returns the prior successful result. This cache is per client instance and is not durable across processes.



### Offline vs live tests



pytest uses `httpx.MockTransport` and never needs a live key. Do not run paid SuperDocs operations from tests.



Manual live smoke (requires `SUPERDOCS_API_KEY`, not invoked by pytest):



```text
python scripts/superdocs_smoke.py
```



The script uploads `fixtures/superdocs/smoke-role.md`, starts a reviewed edit, prints pending changes, and stops without approving unless you pass `--decide approve|reject`. Export is opt-in via `--export PATH`.



## Canonical framework and surgical propagation



`generate_framework(architecture, evidences)` builds a `FrameworkDocument` from architecture-domain objects, not from parsed prose.



The framework contains organization purpose and principles, IC and people-manager tracks, canonical IC1–IC5 and M1–M3 (stable `level_id` + `version`, with scope, autonomy/decision authority, complexity, impact, leadership, and people-management), occupied job families, per-family competency matrices, role mappings, employee-readable profiles, provisional review artifacts, and misfits.



### Profile schema



Classified roles (strong-fit, and provisional roles that still have family/track/level) use one profile schema: title, family, track, level, purpose, responsibilities, scope/decision making, core competencies, level expectations, progression, evidence note, and classification. Provisional profiles stay marked provisional. Misfits and unclassified provisional roles are review artifacts, not normalized profiles.



Templates live in `templates/framework.md` and `templates/role-profile.md`.



### Dependency graph



Edges are explicit. A canonical level definition points at a profile's `level_expectations` section. A family competency points at `core_competencies`. Impact analysis does not string-search rendered prose.



### Propagation and preservation



`analyze_level_change` returns affected profile ids, affected sections, unaffected ids, and old/new dependency versions. `plan_level_updates` emits section-level `UpdatePlan`s in `planned` status. Human review is `approved` or `rejected`. Only approved plans apply. Rejected plans leave profiles and dependency versions unchanged.



Deterministic SHA-256 hashes cover every structured profile section. After apply, intended sections must change and every other section/profile must keep the same hash. `PreservationReport.violations` is a hard failure. Planning the same canonical change a second time yields no semantic edits.



`documents.py` maps framework/profile/update-plan objects to SuperDocs template payloads and targeted edit instructions. It does not perform HTTP.



## Later SuperDocs usage



The adapter covers upload, multi-document sessions, search, templates, reviewed async edits, approval, and export. Phase 6 prepared framework/profile payloads and targeted edit instructions. Frontend and live publication remain later.



## Data policy



All demonstration job descriptions and organization data are synthetic.



No real employee data or credentials belong in this repository.
