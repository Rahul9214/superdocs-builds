# Task 2 Test Plan



## Domain reasoning



\- role evidence parsing — implemented (Phase 4; offline, no SuperDocs)

\- title independence — implemented (metamorphic title-swap tests)

\- family similarity — implemented (lexicon labels applied after corpus-level clustering)

\- career-track assignment — implemented (people-management evidence, not title)

\- level inference — implemented (canonical IC1–IC5 and M1–M3; unoccupied M2/M3 remain in the catalog)

\- corpus clustering — implemented (TF-IDF + occupational cosine, compatibility gate, title excluded)

\- clustering diagnostics — implemented (cohesion, separation, nearest cluster, label confidence, bridges, unclustered members)

\- cluster defensibility — implemented (incompatible functional evidence must not merge without cross-domain scores)

\- title-independence of clustering — implemented (signature, neighbors, and membership survive title rename)

\- evidence provenance — implemented (source excerpts on supporting/counter evidence)

\- confidence calculation — implemented (coarse buckets, not fake precision)

\- provisional assignment — implemented (sparse, hybrid, title/evidence conflict)

\- misfit assignment — implemented (outside supported architecture)



Phase 4 tests cover both synthetic corpora with the same engine. Reasoning source files are checked for fixture IDs, organization names, and corpus-specific branches. Hybrid, sparse, and misfit roles are asserted unclustered rather than absorbed for coverage.



## Architecture generation



\- family definitions — implemented (canonical catalog; occupied families exposed by `build_architecture`)

\- corpus-level clusters — implemented (`ArchitectureResult.clusters` / `.clustering`)

\- level definitions — implemented (IC1–IC5, M1–M3)

\- career tracks — implemented (IC and people-manager)

\- competency matrices — not started (later phase)

\- role profiles — not started (later phase)

\- dependency graph — model only (traversal remains later)



## Adversarial cases



\- misleading senior title with junior scope

\- modest title with senior scope

\- hybrid role spanning families

\- sparse job description

\- contradictory responsibilities

\- management title without people responsibility

\- highly specialized role outside standard architecture



## Surgical propagation



\- impacted profiles identified

\- unaffected profiles excluded

\- correct dependent section updated

\- unrelated sections preserved

\- preservation hashes stable

\- repeated propagation is safe



## Human review



\- changes enter pending state — SuperDocs adapter implemented (offline); UI later

\- approve applies accepted changes — adapter submits explicit per-change decisions

\- reject leaves content unchanged — adapter sends `approved=false`

\- partial decision handling — mixed item-level decisions; `ApprovalResult.all_approved` is false unless every item is approved

\- completion blocked while required decisions remain — polling stops at `awaiting_approval`; nothing is auto-approved

\- publication remains explicit — export is a separate call and is not implied by job completion



## SuperDocs



Offline contract tests (`tests/test_superdocs_*.py`) use `httpx.MockTransport`. They do not read `SUPERDOCS_API_KEY` and must not call the live API.



\- upload — implemented (`POST /v1/documents/upload`, default `open_mode=new_focused`)

\- multi-document session — implemented (session roster + explicit document ids)

\- document targeting — implemented (`document_id` on reviewed edit)

\- search — implemented as async chat with `cross_session_search=true` (no dedicated search endpoint in the official API)

\- template use — implemented (`POST /v1/templates/upload-base64`, `GET /v1/templates`)

\- async edit — implemented (`POST /v1/chat/async` with `approval_mode=ask_every_time`)

\- awaiting approval — implemented (poll `GET /v1/jobs/{job_id}`; distinguish HITL vs `continue_prompt`)

\- approve — implemented (`POST /v1/chat/{session_id}/approve`)

\- reject — implemented (same endpoint, `approved=false`)

\- export — implemented (`POST /v1/documents/export`, streamed bytes; empty/JSON bodies are failure)

\- proposed-change double JSON parse — implemented (`parse_pending_changes`)



Live smoke (manual only, not pytest): `python scripts/superdocs_smoke.py`



## Reliability



\- missing API key — implemented (`ConfigurationError`)

\- invalid API key — implemented (HTTP 401/403 → `AuthenticationError`)

\- timeout — implemented (GET → `TransientHttpError` with bounded retry; mutating timeout → `AmbiguousOutcomeError`, no retry)

\- malformed response — implemented (`MalformedResponseError` / `ProposedChangeParseError`)

\- upload failure — implemented (typed HTTP errors; mutating timeout is ambiguous)

\- async job failure — implemented (`JobFailedError`); polling timeout is `JobTimeoutError` (job may still be running)

\- approval failure — implemented (`ApprovalError`)

\- export failure — implemented (`ExportError`; no success without received bytes)

\- retry after uncertain outcome — mutating calls are not blind-retried

\- duplicate request — in-process `operation_key` returns the already-completed result

\- idempotency — not exactly-once; see README retry/idempotency section



## Security



\- API key absent from frontend — no frontend in this phase; key is server-side env only

\- API key absent from logs — settings/client/error repr redacts the key; auth headers are not logged

\- API key absent from fixtures — offline fake uses `sk_test_offline_not_a_real_key`

\- API key absent from repository history — `.env` is gitignored; `.env.example` has a placeholder

\- no real employee data — synthetic fixtures only



## Acceptance corpora



### Corpus A



Primary synthetic organization used during implementation.



### Corpus B



Independent synthetic organization used to prove the logic is not hard-coded to Corpus A.
