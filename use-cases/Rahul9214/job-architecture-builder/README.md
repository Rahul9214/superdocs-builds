# Job Architecture and Levelling Framework Builder



Task 2 submission for the SuperDocs build assignment.



The project converts synthetic job-description evidence into a defensible job architecture consisting of job families, career tracks, level definitions, competency matrices, and employee-readable role profiles.



The implementation is designed around three control principles:



1\. evidence over title matching;

2\. explicit treatment of uncertainty and misfits;

3\. surgical propagation of canonical framework changes into dependent profiles.



## Status



Phase 4 architecture reasoning is implemented and independently testable.



The reasoning core parses synthetic Markdown job descriptions into `RoleEvidence`, clusters roles from evidence tokens (not titles), then proposes family, track, and canonical level with explicit fit status (`strong_fit`, `provisional`, `misfit`). It does not call SuperDocs or any model provider.



See:



\- \[Task specification](TASK2.md)

\- \[Progress](PROGRESS.md)

\- \[Assumptions](ASSUMPTIONS.md)

\- \[Test plan](TEST\_PLAN.md)



## Run the reasoning tests



```text
python -m venv .venv
.venv\Scripts\pip install pytest
.venv\Scripts\python -m pytest
.venv\Scripts\python -m compileall src tests
```



No API key is required. Fixtures live under `fixtures/corpus-a` and `fixtures/corpus-b`.



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




## Planned SuperDocs usage



The implementation will demonstrate:



\- multi-document workflows;

\- document search;

\- reusable templates;

\- explicit human review;

\- document export.



## Data policy



All demonstration job descriptions and organization data are synthetic.



No real employee data or credentials belong in this repository.
