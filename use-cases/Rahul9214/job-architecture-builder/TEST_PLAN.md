# Task 2 Test Plan



## Domain reasoning



\- role evidence parsing

\- title independence

\- family similarity

\- career-track assignment

\- level inference

\- evidence provenance

\- confidence calculation

\- provisional assignment

\- misfit assignment



## Architecture generation



\- family definitions

\- level definitions

\- career tracks

\- competency matrices

\- role profiles

\- dependency graph



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
