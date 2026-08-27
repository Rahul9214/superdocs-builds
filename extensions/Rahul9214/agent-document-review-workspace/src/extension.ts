import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { initialState } from './fixtures';
import { evidenceRecord, updateChangeStatus } from './model';
import { WorkspaceState } from './types';

let state: WorkspaceState = structuredClone(initialState);

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('superdocsAgentReview.open', () => openWorkspace(context)));
}

async function openWorkspace(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'superdocsAgentReview',
    'SuperDocs Agent Review',
    vscode.ViewColumn.One,
    { enableScripts: true, retainContextWhenHidden: true }
  );

  const render = () => panel.webview.html = getHtml(state);
  render();

  panel.webview.onDidReceiveMessage(async message => {
    if (message.type === 'select') {
      state = { ...state, selectedChangeId: message.id };
      render();
      return;
    }
    if (message.type === 'decision') {
      state = updateChangeStatus(state, message.id, message.status);
      render();
      return;
    }
    if (message.type === 'reset') {
      state = structuredClone(initialState);
      render();
      return;
    }
    if (message.type === 'exportEvidence') {
      const uri = await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file(path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd(), 'superdocs-review-evidence.json')) });
      if (uri) {
        fs.writeFileSync(uri.fsPath, JSON.stringify(evidenceRecord(state), null, 2), 'utf8');
        vscode.window.showInformationMessage(`Evidence exported: ${path.basename(uri.fsPath)}`);
      }
      return;
    }
    if (message.type === 'exportDocx') {
      const approved = state.changes.filter(c => c.status === 'approved' || c.status === 'applied');
      const doc = new Document({ sections: [{ children: [
        new Paragraph({ text: 'Reviewed Vendor Agreement — Demo Export', heading: HeadingLevel.TITLE }),
        new Paragraph('This synthetic artifact demonstrates the review/export state used by the workspace.'),
        ...approved.map(c => new Paragraph(`${c.section}: ${c.after}`))
      ] }] });
      const buffer = await Packer.toBuffer(doc);
      const uri = await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file(path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd(), 'reviewed-vendor-agreement.docx')) });
      if (uri) {
        fs.writeFileSync(uri.fsPath, buffer);
        vscode.window.showInformationMessage(`DOCX exported: ${path.basename(uri.fsPath)}`);
      }
    }
  });
}

function esc(value: string) {
  return value.replace(/[&<>\"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] ?? c));
}

function getHtml(state: WorkspaceState) {
  const selected = state.changes.find(c => c.id === state.selectedChangeId) ?? state.changes[0];
  const pending = state.changes.filter(c => c.status === 'pending').length;
  const mismatch = state.changes.filter(c => c.verification === 'mismatch').length;

  const changeRows = state.changes.map(c => `
    <button class="change-row ${c.id === selected.id ? 'active' : ''}" onclick="selectChange('${c.id}')">
      <span class="agent-dot ${c.agent.includes('Cursor') ? 'cursor' : 'claude'}"></span>
      <span class="row-main"><strong>${esc(c.agent)}</strong><small>Turn ${c.turn} · ${esc(c.section)}</small></span>
      <span class="pill ${c.status}">${c.status}</span>
    </button>`).join('');

  return `<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>
    :root{--bg:#f6f3ef;--surface:#fff;--ink:#211f26;--muted:#716b74;--border:#ded8d2;--primary:#6d3cc7;--primary-soft:#f1ebfb;--coral:#e46d52;--green:#26735b;--green-soft:#eaf5f0;--red:#b44545;--red-soft:#fbecec;--amber:#9a651a;--amber-soft:#fff4e4;--shadow:0 12px 30px rgba(36,25,44,.08)}
    *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;height:100vh;overflow:hidden}
    button{font:inherit}.app{height:100vh;display:grid;grid-template-rows:58px 1fr 68px}.topbar{display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid var(--border);background:#fbfaf8}.brand{display:flex;align-items:center;gap:10px}.brand-mark{width:30px;height:30px;border-radius:9px;background:linear-gradient(145deg,var(--primary),#a46ce4);display:grid;place-items:center;color:white;font-weight:800}.brand-title{font-weight:750}.brand-sub{color:var(--muted);font-size:12px}.top-stats{display:flex;gap:8px}.chip{border:1px solid var(--border);border-radius:999px;padding:6px 10px;background:white;color:var(--muted)}.chip.alert{border-color:#efb1a3;color:#9d432f;background:#fff4f0}
    .workspace{display:grid;grid-template-columns:290px minmax(480px,1fr) 330px;min-height:0}.rail,.inspector{background:#fbfaf8;overflow:auto}.rail{border-right:1px solid var(--border);padding:16px}.inspector{border-left:1px solid var(--border);padding:18px}.eyebrow{font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);font-weight:800}.run-card{border:1px solid var(--border);background:white;border-radius:14px;padding:13px;margin:10px 0 14px;box-shadow:0 4px 14px rgba(28,21,32,.04)}.run-title{display:flex;align-items:center;justify-content:space-between}.status-dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 4px var(--green-soft)}.timeline{margin-top:10px;display:grid;gap:8px}.step{display:flex;gap:8px;color:var(--muted);font-size:12px}.step strong{color:var(--ink)}
    .change-list{display:grid;gap:8px}.change-row{width:100%;border:1px solid transparent;background:transparent;border-radius:12px;padding:10px;text-align:left;display:grid;grid-template-columns:10px 1fr auto;gap:9px;align-items:center;color:var(--ink);cursor:pointer}.change-row:hover{background:white;border-color:var(--border)}.change-row.active{background:var(--primary-soft);border-color:#d7c5f4}.row-main{display:grid;gap:2px}.row-main small{color:var(--muted);font-size:11px}.agent-dot{width:8px;height:8px;border-radius:50%}.cursor{background:var(--primary)}.claude{background:var(--coral)}.pill{border-radius:999px;padding:3px 7px;font-size:10px;text-transform:uppercase;letter-spacing:.05em;background:#eee}.pill.pending{background:var(--amber-soft);color:var(--amber)}.pill.approved,.pill.applied{background:var(--green-soft);color:var(--green)}.pill.rejected,.pill.reverted{background:var(--red-soft);color:var(--red)}
    .main{padding:20px 24px;overflow:auto}.main-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}.doc-title{font-size:21px;font-weight:780}.doc-meta{color:var(--muted);font-size:12px;margin-top:3px}.counter{color:var(--muted);font-size:12px}.diff-grid{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--border);border-radius:16px;overflow:hidden;background:white;box-shadow:var(--shadow)}.pane{padding:18px;min-height:250px}.pane+ .pane{border-left:1px solid var(--border)}.pane.before{background:#fffaf8}.pane.after{background:#f8fcfa}.pane-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;color:var(--muted);margin-bottom:18px}.doc-block{font-family:Georgia,serif;font-size:18px;line-height:1.7}.deleted{background:#fde8e3;text-decoration:line-through;text-decoration-color:#cf7665;border-radius:4px;padding:2px 4px}.added{background:#dff3e8;border-radius:4px;padding:2px 4px}.context{margin-top:16px;border:1px solid var(--border);border-radius:14px;background:white;padding:14px}.context h3{margin:0 0 6px;font-size:13px}.context p{margin:0;color:var(--muted)}
    .verify-card{border:1px solid var(--border);border-radius:14px;background:white;padding:14px;margin-top:10px}.verify-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.verify-badge{border-radius:999px;padding:4px 8px;font-size:11px;font-weight:700}.verify-badge.verified{background:var(--green-soft);color:var(--green)}.verify-badge.mismatch{background:var(--red-soft);color:var(--red)}.quote{background:#f7f5f2;border-radius:10px;padding:10px;margin:6px 0 12px;color:#4f4952}.meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.meta{border-top:1px solid var(--border);padding-top:8px}.meta small{display:block;color:var(--muted)}
    .bottom{display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-top:1px solid var(--border);background:#fbfaf8}.actions{display:flex;gap:9px}.btn{border:1px solid var(--border);background:white;color:var(--ink);padding:10px 14px;border-radius:10px;cursor:pointer;font-weight:650}.btn:hover{transform:translateY(-1px)}.btn.primary{background:var(--primary);border-color:var(--primary);color:white}.btn.danger{color:var(--red)}.btn.ghost{background:transparent}.decision-summary{font-size:12px;color:var(--muted)}
    @media(max-width:1050px){.workspace{grid-template-columns:240px 1fr}.inspector{display:none}}@media(max-width:760px){body{overflow:auto}.app{height:auto;min-height:100vh}.workspace{grid-template-columns:1fr}.rail{border-right:0;border-bottom:1px solid var(--border)}.diff-grid{grid-template-columns:1fr}.pane+.pane{border-left:0;border-top:1px solid var(--border)}.bottom{position:sticky;bottom:0}.top-stats{display:none}}
  </style></head><body>
  <div class="app">
    <header class="topbar"><div class="brand"><div class="brand-mark">S</div><div><div class="brand-title">SuperDocs Agent Review</div><div class="brand-sub">Human control for agent-driven document changes</div></div></div><div class="top-stats"><span class="chip">${state.documents.length} documents</span><span class="chip">${pending} pending</span><span class="chip alert">${mismatch} mismatches</span></div></header>
    <section class="workspace">
      <aside class="rail"><div class="eyebrow">Agent run</div><div class="run-card"><div class="run-title"><strong>${esc(selected.agent)}</strong><span class="status-dot"></span></div><div class="timeline"><div class="step">✓ <span><strong>Opened document</strong><br>${esc(selected.documentId)}.docx</span></div><div class="step">✓ <span><strong>Located target</strong><br>${esc(selected.section)}</span></div><div class="step">◉ <span><strong>Proposed changes</strong><br>Waiting on human review</span></div><div class="step">○ <span><strong>Export</strong><br>Blocked until review completes</span></div></div></div><div class="eyebrow">Changes</div><div class="change-list">${changeRows}</div></aside>
      <main class="main"><div class="main-head"><div><div class="eyebrow">Document change</div><div class="doc-title">${esc(state.documents.find(d => d.id===selected.documentId)?.name ?? selected.documentId)}</div><div class="doc-meta">${esc(selected.section)} · ${esc(selected.agent)} · Turn ${selected.turn}</div></div><div class="counter">${state.changes.indexOf(selected)+1} / ${state.changes.length}</div></div>
      <div class="diff-grid"><section class="pane before"><div class="pane-label">Before</div><div class="doc-block"><span class="deleted">${esc(selected.before)}</span></div></section><section class="pane after"><div class="pane-label">After</div><div class="doc-block"><span class="added">${esc(selected.after)}</span></div></section></div>
      <div class="context"><h3>Review scope</h3><p>Only this proposed section is in scope. Approving or rejecting it does not change the other review items.</p></div></main>
      <aside class="inspector"><div class="eyebrow">Verification</div><div class="verify-card"><div class="verify-head"><strong>Claim vs actual</strong><span class="verify-badge ${selected.verification}">${selected.verification === 'verified' ? '✓ Verified' : '⚠ Mismatch'}</span></div><small>AGENT CLAIM</small><div class="quote">${esc(selected.claim)}</div><small>ARTIFACT CHECK</small><div class="quote">${esc(selected.actual)}</div><div class="meta-grid"><div class="meta"><small>Agent</small>${esc(selected.agent)}</div><div class="meta"><small>Status</small>${esc(selected.status)}</div><div class="meta"><small>Document</small>${esc(selected.documentId)}</div><div class="meta"><small>Turn</small>${selected.turn}</div></div></div></aside>
    </section>
    <footer class="bottom"><div class="decision-summary">Review is explicit. Nothing is exported until the reviewer decides.</div><div class="actions"><button class="btn ghost" onclick="send('reset')">Reset demo</button><button class="btn" onclick="send('exportEvidence')">Export evidence</button><button class="btn danger" onclick="decision('rejected')">Reject</button><button class="btn primary" onclick="decision('approved')">Approve & continue</button><button class="btn" onclick="send('exportDocx')">Export DOCX</button></div></footer>
  </div>
  <script>const vscode=acquireVsCodeApi();function send(type){vscode.postMessage({type})}function selectChange(id){vscode.postMessage({type:'select',id})}function decision(status){vscode.postMessage({type:'decision',id:'${selected.id}',status})}</script>
  </body></html>`;
}

export function deactivate() {}
