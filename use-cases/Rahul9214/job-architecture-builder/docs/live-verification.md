# Live SuperDocs verification record

Template for the human-run Phase 7A live path. Do not invent values. Leave unexecuted rows as `not run`.

Never paste `SUPERDOCS_API_KEY` or other credentials here.

## Session

| Field | Value |
| --- | --- |
| Date | 2026-08-25 (upload through first surgical review); 2026-08-26 (repair, surgical attempts 2–3, export, search submit, local domain-apply gate) |
| Operator | human |
| Environment (`SUPERDOCS_BASE_URL`) | not recorded here |
| Local session id | `job-arch-live` |
| SuperDocs session id (if different) | not copied into git |
| Runtime state file | `.runtime/live-state.json` |
| Notes | Multi-document upload and templates passed. Framework and profile reviewed edits were approved. The original profile fill duplicated Level expectations; in-place repair was approved. Surgical attempt 1 was rejected (unrelated Complexity rewrite). Surgical attempt 2 was rejected (duplicated live baseline). Surgical attempt 3 was approved (version + Scope only). Review prevented the incorrect changes. Rejected attempts remain in history. Search was submitted and reached processing; Search verification is not complete until a resume poll records a valid terminal result. Do not copy live document or job ids into git. |

## Demo subset

Corpus A roles (synthetic):

- `ns-swe-backend` — typical engineering IC
- `ns-swe-ii-payments` — broader/higher-scope engineering IC (surgical target)
- `ns-em-platform` — people manager
- `ns-program-coordinator` — sparse/provisional

Search query: `Find documents or role profiles that reference the IC4 level.`

## Operations

| Operation | Status | Document / session / job ids (non-secret) | Elapsed | Final status | Proposed-change count | Decisions | Export result | Preservation result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `prepare` (local DOCX only) | succeeded (local) | generated under `artifacts/live/` | not recorded | local write; filled profile has exactly one Level expectations block | | | | |
| `upload` (4 JDs + 2 templates) | succeeded | session `job-arch-live`; four distinct JD `document_id`s; framework and profile documents uploaded | not recorded | roster ok; durables now present in `.runtime/` | | | | |
| roster / multi-document check | succeeded | four coexisting JD documents; distinct session `document_id`s | not recorded | **passed** | | | | |
| templates | succeeded | framework and role-profile templates uploaded | not recorded | **passed** | | | | |
| `framework` reviewed edit | succeeded | live job id not copied into git | not recorded | completed after human approve | not recorded | **approved** | | |
| `decide --job framework` | succeeded | | not recorded | remote completed; mutation applied candidate | not recorded | approve | | |
| `profile` (SuperDocs fill against already-filled DOCX) | succeeded as a job; produced a malformed live baseline | live job id not copied into git | not recorded | remote completed after human approve; live Level expectations duplicated | not recorded | **approved** | | duplicated dimensions then in the live document |
| `decide --job profile` | approved | | not recorded | remote completed; `mutation_applied=true` for the fill; structural result was duplicated dimensions | not recorded | approve | | |
| `surgical-update` (attempt 1) | submitted; reached human review; **rejected** | live job id not copied into git | not recorded | remote `completed`; review rejected; mutation not applied | 1 | **rejected — unrelated Complexity rewrite** | not exported | planner semantic spill |
| `decide --job surgical` (attempt 1) | rejected | human rejected the Complexity rewrite | not recorded | `review_outcome=rejected`; `mutation_applied=false`; `domain_applied=false` | 1 | reject | | versions not advanced |
| `surgical-update` (attempt 2, planner-corrected) | submitted; reached human review; **rejected** | live job id not copied into git | not recorded | remote `completed`; review rejected; mutation not applied | 1 | **rejected — malformed duplicated baseline** | not exported | BEFORE already showed duplicated Level expectations |
| `decide --job surgical` (attempt 2) | rejected | human rejected applying a correct scope patch onto a duplicated baseline | not recorded | `review_outcome=rejected`; `mutation_applied=false`; `domain_applied=false` | 1 | reject | | versions not advanced |
| local planner bug | discovered after attempt 1 | `plan_level_updates` re-rendered full `level_expectations` | | fixed offline | | | | |
| local resume bug | discovered after attempt 1 | completed rejected job treated as success | | fixed offline; rejected attempts remain in history | | | | |
| local profile-baseline bug | discovered after attempt 2 | SuperDocs fill replaced a too-narrow header span on an already-filled profile | | fixed offline: upload filled profile as source of truth; do not SuperDocs-fill it | | | | |
| `repair-profile` (in-place duplicate removal) | succeeded | live job id not copied into git | not recorded | remote completed after human approve; mutation applied on the existing profile lineage | not recorded | **approved** | | |
| `export --kind profile` after repair | succeeded | wrote `exports/profile.docx` | not recorded | **passed** | | | succeeded | |
| `verify-profile-structure` (repair-era export) | initial run failed on paragraph-based field boundaries; corrected verifier then **passed** | existing `exports/profile.docx` at that time (file later re-exported after surgical 3) | | repair-era: section count 1; SuperDocs stored Level expectations as one paragraph / multiple runs / `w:br` | | | | |
| `surgical-update` (attempt 3) | submitted; reached human review; **approved** | live job id not copied into git | not recorded | remote `completed`; `review_outcome=approved`; `mutation_applied=true`; `domain_applied` not inferred from completed | 1 | **approved — version + Scope only** | | |
| `decide --job surgical` (attempt 3) | approved | human approved version + Scope only | not recorded | `review_outcome=approved`; `mutation_applied=true`; `domain_applied=false` until verification-gated finalize | 1 | approve | | |
| `export --kind profile` after surgical 3 | succeeded | wrote `exports/profile.docx` | not recorded | **passed** | | | succeeded | |
| repaired/exported profile structure | **passed** | checked `exports/profile.docx` | | semantic structure PASS; Level expectations section count = 1; header = IC4 definition version 2; no structural violations | | | | |
| `verify-export` preservation | **passed** | checked `exports/profile.docx` | | new sequencing-veto fragment found; purpose preserved; responsibilities preserved; autonomy/complexity/impact/leadership/people_management unchanged (complexity: `Matches the published complexity of this level.`) | | | | **passed** with those observed checks |
| `finalize-domain` | succeeded (local) | no SuperDocs call | | `domain_applied=true`; dependency/source version 1 → 2; idempotent re-run keeps version 2; rejected attempts remain in history (2) | | | | |
| `search` | submitted; reached **processing**; not proven terminal | live job id not copied into git | not recorded | resume must poll the same job id and must not POST another search. Live Search verification is **not complete** until that poll records a valid terminal result | | | | |
| `export --kind framework` | not run | | | | | | | |

## Multi-document roster

| Check | Result |
| --- | --- |
| Distinct document ids | **passed** (live roster) |
| All four JD uploads present | **passed** (live roster) |
| Durable ids present on roster | **passed** (live roster) |
| Durable ids persisted in `.runtime/` | failed on first run (`null`); later repaired in local state without copying ids into git |
| Framework starter id | present in `.runtime/` (not copied into git) |
| Profile document id | present in `.runtime/` (not copied into git); same lineage kept for in-place repair and surgical 3 |

## Surgical preservation

Do not claim byte identity of DOCX container files. SuperDocs may rewrite package metadata.

| Check | Result |
| --- | --- |
| Local filled profile structure | **valid** (exactly one of each Level expectations field) |
| Live SuperDocs profile structure after original fill | **invalid** (dimensions duplicated) |
| Live SuperDocs profile after repair + surgical 3 export | **passed**: one Level expectations section; header IC4 definition version 2; Scope contains the approved sequencing-veto addition |
| Autonomy unchanged | **passed** |
| Complexity unchanged | **passed** (`Matches the published complexity of this level.`) |
| Impact unchanged | **passed** |
| Leadership unchanged | **passed** |
| People-management unchanged | **passed** |
| New fragment present | **passed** (preservation verifier found the sequencing-veto addition) |
| Purpose preserved | **passed** |
| Responsibilities preserved | **passed** |
| Surgical attempt 1 | **rejected** — unrelated Complexity rewrite. Review prevented the incorrect change. |
| Surgical attempt 2 | **rejected** — malformed duplicated baseline. Review prevented the incorrect change. |
| Surgical attempt 3 | **approved** — version + Scope only. `mutation_applied=true`. Local `finalize-domain` then set `domain_applied=true` and advanced IC4 1 → 2 after structure + preservation verification. |
| Rejected attempts in history | **kept** (attempt 1 and attempt 2) |

## Observed SuperDocs bugs / rough edges

| Observation | Impact | Workaround |
| --- | --- | --- |
| Upload POST / focused document ref can omit `durable_document_id` while `GET /v1/sessions/{id}/documents` returns it | `.runtime/live-state.json` stored null durable ids even though the CLI printed roster durables | After roster verification, reconcile persisted documents by `document_id`. Re-run `upload` to repair; do not re-upload completed JDs. Never replace a known durable id with null. |
| SuperDocs proposed the full local AFTER block, including an unrelated Complexity rewrite | First surgical review had to be rejected | Local bug: `plan_level_updates` fully re-rendered `level_expectations`. Fixed to patch only changed canonical dimensions. |
| SuperDocs reports `status=completed` after a rejected review | Remote execution finished, but mutation was not applied | Persist `review_outcome` and `mutation_applied` separately from `remote_job_status`. `domain_applied` stays false until verification-gated finalize. |
| SuperDocs `replace_span` can target only the Level expectations header/`IC4 (definition version 1)` line and insert the full block above the existing dimension lines | Live profile had each canonical dimension twice | Do not SuperDocs-fill an already-filled profile. Repair in place, then surgical-update only on a verified unique block. |
| SuperDocs exported Level expectations as one paragraph with multiple runs and `w:br` | First structural verifier treated layout as missing fields | Parse canonical markers, not Word paragraph boundaries. |
| Search job can remain in processing after submit | Live Search is not complete on submit | Resume polls the same job id; do not POST another search. Mark complete only on a valid terminal result. |

## Decision log

| Job | Change id | Approve / reject | Timestamp |
| --- | --- | --- | --- |
| framework | (live change id not copied into git) | approve | 2026-08-25 |
| profile fill | (live change id not copied into git) | approve | 2026-08-25 |
| surgical (attempt 1, unrelated Complexity rewrite) | (live change id not copied into git) | reject | 2026-08-25 |
| surgical (attempt 2, malformed duplicated baseline) | (live change id not copied into git) | reject | 2026-08-26 |
| profile_repair (remove duplicate Level expectations) | (live change id not copied into git) | approve | 2026-08-26 |
| surgical (attempt 3, version + Scope only) | (live change id not copied into git) | approve | 2026-08-26 |
