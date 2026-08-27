# Demo guide

## Fastest path

PowerShell:

```powershell
cd <this-folder>
.\run-demo.ps1
```

Open `http://localhost:8031`.

The browser demo is dependency-free and exists so the interaction/evidence flow can be reviewed immediately. The `src/` folder contains the VS Code extension implementation shape; `package.json` declares the extension command and DOCX export dependency.

## 45-second evidence sequence

1. Start on **Renewal notice** and capture the full three-pane workspace.
2. Click **Approve & continue**. Revert now appears for that applied change.
3. Click **Revert** and confirm only the renewal-notice item returns to original content.
4. Approve **Support escalation**, then on **Payment terms** capture the red **Mismatch** state and click **Reject**.
5. Select the **Claude Code** item and capture its false-claim mismatch.
6. Click **Export evidence** and save the JSON.
7. Capture the final queue showing approved/rejected/reverted states.

Revert is shown only after a change is approved or applied. It is hidden for pending, rejected, and already-reverted items.
