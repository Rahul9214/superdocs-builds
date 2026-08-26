# PR checklist

Do **not** open the PR from this document. Fill it when committing and pushing later.

## Required

- [x] Project folder is `use-cases/Rahul9214/job-architecture-builder/`
- [x] No files outside that folder were modified for this work
- [x] README is the reviewer entry point
- [x] Screenshots present under `screenshots/` (overview, architecture, title-evidence-conflict, exceptions, framework, profile, change-impact, review, export)
- [x] Working-tree tests green after Phase 9 (see final report)
- [x] Clean-clone of `274866eda8d266221853e79bff6862bfe653a9fc` green (`docs/clean-clone-verification.md`)
- [x] Secret scan recorded (`docs/security-check.md`)
- [x] Live SuperDocs evidence recorded (`docs/live-verification.md`)
- [x] Task 2 audit complete (`docs/assignment-audit.md`)
- [x] No secrets in tracked files
- [x] `.env`, `.runtime/`, `exports/`, `artifacts/`, `.venv/`, `node_modules/`, `web/dist/` not tracked
- [ ] Branch pushed / up to date with remote (human)
- [ ] Commit history coherent after Phase 9 files are committed (human)
- [ ] PR not opened yet (by request)

## Suggested PR

**Title:** `feat: add job architecture and levelling framework builder`

**Body:**

```text
## Problem

HR and people-strategy reviewers need a defensible job architecture from existing job descriptions, without title matching, silent misfit absorption, or unreviewed document mutation.

## Solution

A local FastAPI + React workspace over a deterministic domain engine. It clusters JD evidence, proposes families/tracks/levels, keeps provisional and misfit roles honest, generates framework documents and profiles, and plans surgical level updates with a human gate.

## SuperDocs surfaces

Upload (multi-document session), templates, reviewed async edits, approve/reject, Search (async cross-session search), and export. Live CLI is optional; the reviewer UI works offline.

## Evidence-based architecture

Family, track, and level come from JD evidence. Titles are excluded from clustering. Typed title_conflict metadata flags seniority/management/scope mismatches without changing the evidence-based assignment.

## Honest exceptions

Sparse, hybrid, and outside-architecture roles remain provisional or misfit. The UI does not auto-assign them.

## Surgical propagation

Canonical level edits identify dependent profiles via explicit edges and patch only the corresponding level-expectation fields. Unrelated sections are hash-checked.

## Human review

No default approval. Mixed approve/reject is supported. Rejected plans remain unapplied.

## Testing

Offline pytest (domain, SuperDocs fake, live orchestration fake, web API) and Vitest (mocked fetch). Clean-clone of this branch followed README without a SuperDocs key.

## Live verification

Recorded in docs/live-verification.md. Search verified terminal on resume (no second POST). Surgical attempts 1–2 rejected and retained. Attempt 3 approved (version + Scope). Live framework export attempts 1–2 HTTP succeeded but returned a source JD (attempt 2 proved ids do not select). Attempt 3 documented HTML export: semantic verification PASS. Framework reviewed edit is proven.

## Screenshots

See screenshots/ and README.

## Limitations

Lexical/TF-IDF reasoning, in-memory web store, no HRIS/auth, no hosted deploy, live SuperDocs requires the reviewer’s key.
```
