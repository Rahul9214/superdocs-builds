import test from 'node:test';
import assert from 'node:assert/strict';

const model = await import('../dist/model.js');
const fixtures = await import('../dist/fixtures.js');

test('rejecting one change leaves other changes untouched', () => {
  const original = structuredClone(fixtures.initialState);
  const next = model.updateChangeStatus(original, 'chg-3', 'rejected');
  assert.equal(next.changes.find(c => c.id === 'chg-3').status, 'rejected');
  assert.equal(next.changes.find(c => c.id === 'chg-1').status, 'pending');
  assert.equal(next.changes.find(c => c.id === 'chg-2').status, 'pending');
});

test('claim mismatches are explicit and countable', () => {
  const counts = model.summary(fixtures.initialState);
  assert.equal(counts.mismatch, 2);
  assert.equal(counts.verified, 2);
});

test('evidence export preserves claimed versus actual', () => {
  const evidence = model.evidenceRecord(fixtures.initialState);
  const mismatch = evidence.decisions.find(c => c.id === 'chg-4');
  assert.equal(mismatch.verification, 'mismatch');
  assert.match(mismatch.claim, /Updated the current status/);
  assert.match(mismatch.actual, /No corresponding document change/);
});
