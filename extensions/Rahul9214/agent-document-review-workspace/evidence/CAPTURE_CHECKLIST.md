# Extra-credit evidence capture

## Required screenshots

- [ ] `01-workspace-overview.png` — Agent timeline + before/after diff + verification inspector.
- [ ] `02-claim-mismatch.png` — Red mismatch state visible with agent claim and artifact check.
- [ ] `03-review-decisions.png` — Two approved changes and one rejected change visible in the queue.
- [ ] `04-export-proof.png` — Evidence JSON / DOCX export success visible.

## Required command evidence

```powershell
npm install
npm run build
npm test
```

Save the clean terminal output as `05-build-and-tests.txt` or a screenshot.

## Optional 30–45 second extra-credit clip

1. Open workspace.
2. Select correct change → Approve.
3. Select unrelated payment change → show mismatch → Reject.
4. Select false claim → show no artifact change.
5. Export evidence.

## Form-ready description (only after the evidence above exists)

> Extra credit — SuperDocs Agent Review Workspace. I built the Open Task List's coding-agent document review surface as a VS Code panel: before/after changes grouped by agent turn, explicit approve/reject decisions, independent review state, a claimed-vs-actual verifier that catches an agent reporting an edit that did not happen, support for more than one agent client through one neutral model, and evidence/DOCX export. I used deterministic synthetic documents for repeatable review states and kept the integration boundary explicit rather than claiming fixture activity was live MCP traffic.
