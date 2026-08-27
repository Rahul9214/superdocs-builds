# SuperDocs Agent Review Workspace

A compact VS Code review panel for agent-driven document changes. It is based directly on the SuperDocs Open Task List entry **“Agent document workspace for coding tools.”**

## What it demonstrates

1. **Agent activity stream** grouped by turn and document.
2. **Before / after document diff** for each proposed change.
3. **Approve / reject decisions** that apply independently per change.
4. **Claim-vs-actual verification** that catches an agent claiming an edit that is not present in the artifact.
5. **Multiple agent clients** represented through one neutral review model (Cursor Agent + Claude Code fixtures).
6. **Evidence + DOCX export** after review, with reviewer state preserved in the evidence record.

This is intentionally a **human control surface**, not another chat UI and not a SuperDocs clone.

## Run locally

```bash
npm install
npm run build
npm test
```

Then open the folder in VS Code and press **F5** to launch an Extension Development Host. Run:

**SuperDocs: Open Agent Review Workspace**

## Demo scenario

Use the synthetic `vendor-agreement.docx` review queue:

- approve the requested renewal-notice change;
- approve the concise support paragraph;
- reject the unrelated payment-term mutation;
- inspect a second agent turn where the agent claims an edit happened but the artifact contains no corresponding change;
- export the evidence JSON;
- export the reviewed DOCX.

## Evidence to capture

Take these screenshots during the demo:

1. **Overview state** — first change selected, showing the three-pane workspace.
2. **Mismatch state** — select `Payment terms` or the Claude Code change so the red `Mismatch` inspector is visible.
3. **Decision state** — after approving two changes and rejecting one, show the queue statuses together.
4. **Export proof** — save `superdocs-review-evidence.json` and `reviewed-vendor-agreement.docx`; capture the VS Code success toast or file explorer.

Also keep the terminal output for:

```bash
npm run build
npm test
```

Do not include API keys, tokens, or private documents in screenshots.

## Integration boundary

The demo uses deterministic synthetic agent events so every reviewer sees the same failure/review states. The review model is agent-neutral and shaped to accept real agent/SuperDocs events later. No claim is made here that the synthetic fixtures are live SuperDocs MCP calls.
