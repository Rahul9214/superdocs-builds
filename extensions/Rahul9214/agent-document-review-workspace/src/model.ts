import { WorkspaceState, ReviewStatus } from './types';

export function updateChangeStatus(state: WorkspaceState, id: string, status: ReviewStatus): WorkspaceState {
  const changes = state.changes.map(change => change.id === id ? { ...change, status } : change);
  const next = changes.find(c => c.status === 'pending');
  return { ...state, changes, selectedChangeId: next?.id ?? id };
}

export function summary(state: WorkspaceState) {
  const counts = { pending: 0, approved: 0, rejected: 0, applied: 0, reverted: 0, verified: 0, mismatch: 0 };
  for (const change of state.changes) {
    counts[change.status] += 1;
    counts[change.verification] += 1;
  }
  return counts;
}

export function evidenceRecord(state: WorkspaceState) {
  return {
    generatedAt: new Date().toISOString(),
    product: 'SuperDocs Agent Review Workspace',
    documents: state.documents,
    decisions: state.changes.map(({ id, documentId, agent, turn, section, claim, actual, verification, status }) => ({
      id, documentId, agent, turn, section, claim, actual, verification, status
    }))
  };
}
