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



\- changes enter pending state

\- approve applies accepted changes

\- reject leaves content unchanged

\- partial decision handling

\- completion blocked while required decisions remain

\- publication remains explicit



## SuperDocs



\- upload

\- multi-document session

\- document targeting

\- search

\- template use

\- async edit

\- awaiting approval

\- approve

\- reject

\- export



## Reliability



\- missing API key

\- invalid API key

\- timeout

\- malformed response

\- upload failure

\- async job failure

\- approval failure

\- export failure

\- retry after uncertain outcome

\- duplicate request

\- idempotency



## Security



\- API key absent from frontend

\- API key absent from logs

\- API key absent from fixtures

\- API key absent from repository history

\- no real employee data



## Acceptance corpora



### Corpus A



Primary synthetic organization used during implementation.



### Corpus B



Independent synthetic organization used to prove the logic is not hard-coded to Corpus A.
