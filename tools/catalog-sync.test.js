const test = require('node:test');
const assert = require('node:assert/strict');
const sync = require('../catalog-sync.js');

const sanitize = (changes) => Object.fromEntries(
  Object.entries(sync.isPlainObject(changes) ? changes : {}).filter(([key]) => ['name', 'price'].includes(key))
);

test('normalizes the legacy changes and deleted arrays', () => {
  const state = sync.normalizeSharedState({
    version: 1,
    updatedAt: '2026-08-08T12:00:00.000Z',
    changes: { boatA: { name: 'Legacy', ignored: true } },
    deleted: ['boatB']
  }, sanitize);

  assert.equal(state.schemaVersion, 2);
  assert.deepEqual(state.records.boatA.changes, { name: 'Legacy' });
  assert.equal(state.records.boatB.deleted, true);
});

test('merges a local card mutation without losing a different remote card', () => {
  const remote = sync.normalizeSharedState({
    schemaVersion: 2,
    revision: 4,
    records: {
      boatA: { version: 4, mutationId: 'device-a:1', deleted: false, changes: { price: '$650' } }
    }
  }, sanitize);
  const pending = {
    boatB: {
      generation: 2,
      mutationId: 'device-b:2',
      baseVersion: 0,
      deleted: false,
      changes: { name: 'Boat B' }
    }
  };

  const records = sync.applyPendingOperations(remote, pending, 5, '2026-08-08T12:05:00.000Z');
  assert.equal(records.boatA.changes.price, '$650');
  assert.equal(records.boatB.changes.name, 'Boat B');
  assert.equal(records.boatB.version, 5);
});

test('keeps deletion and restore as explicit per-card records', () => {
  const remote = { records: {} };
  const deleted = sync.applyPendingOperations(remote, {
    boatA: { mutationId: 'device:1', deleted: true, changes: {} }
  }, 1, '2026-08-08T12:00:00.000Z');
  assert.deepEqual(sync.deriveOverrides(deleted), { changes: {}, deleted: ['boatA'] });

  const restored = sync.applyPendingOperations({ records: deleted }, {
    boatA: { mutationId: 'device:2', deleted: false, changes: {} }
  }, 2, '2026-08-08T12:01:00.000Z');
  assert.deepEqual(sync.deriveOverrides(restored), { changes: {}, deleted: [] });
  assert.equal(restored.boatA.deleted, false);
});

test('does not acknowledge a newer mutation queued during an earlier write', () => {
  const snapshot = {
    boatA: { generation: 1, mutationId: 'device:1', changes: { price: '$650' } }
  };
  const current = {
    boatA: { generation: 2, mutationId: 'device:2', changes: { price: '$700' } }
  };

  assert.deepEqual(sync.acknowledgeBatch(current, snapshot), current);
  assert.deepEqual(sync.acknowledgeBatch(snapshot, snapshot), {});
});

test('detects stale same-card writes and legacy migration collisions', () => {
  const remote = { version: 7, mutationId: 'other-device:4', deleted: false, changes: { price: '$700' } };

  assert.equal(sync.operationConflicts(remote, { baseVersion: 6, mutationId: 'this-device:2' }), true);
  assert.equal(sync.operationConflicts(remote, { baseVersion: 7, mutationId: 'this-device:2' }), false);
  assert.equal(sync.operationConflicts(remote, { baseVersion: 7, mutationId: 'legacy:1', source: 'legacy' }), true);
  assert.equal(sync.operationConflicts(remote, { baseVersion: 6, mutationId: 'other-device:4' }), false);
});

test('rebases a newer same-card mutation after its previous write succeeds', () => {
  const snapshot = {
    boatA: { generation: 1, mutationId: 'device:1', baseVersion: 3, changes: { price: '$650' } }
  };
  const current = {
    boatA: { generation: 2, mutationId: 'device:2', baseVersion: 3, changes: { price: '$700' } }
  };
  const records = {
    boatA: { version: 4, mutationId: 'device:1', deleted: false, changes: { price: '$650' } }
  };

  const rebased = sync.rebaseNewerPending(current, snapshot, records);
  assert.equal(rebased.boatA.mutationId, 'device:2');
  assert.equal(rebased.boatA.baseVersion, 4);
  assert.equal(sync.operationConflicts(records.boatA, rebased.boatA), false);
});

test('shared payload retains Unicode and compatibility fields', () => {
  const records = {
    boatA: {
      version: 3,
      mutationId: 'device:3',
      updatedAt: '2026-08-08T12:00:00.000Z',
      deleted: false,
      changes: { name: 'Barletta — edición', price: '$650' }
    }
  };
  const payload = sync.buildSharedPayload(records, 3, '2026-08-08T12:00:00.000Z');
  const roundTrip = JSON.parse(JSON.stringify(payload));

  assert.equal(roundTrip.changes.boatA.name, 'Barletta — edición');
  assert.equal(roundTrip.revision, 3);
});
