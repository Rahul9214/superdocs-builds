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
2. Click **Approve & continue** twice.
3. On **Payment terms**, capture the red **Mismatch** state and click **Reject**.
4. Select the **Claude Code** item and capture its false-claim mismatch.
5. Click **Export evidence** and save the JSON.
6. Capture the final queue showing approved/rejected states.
