(function(root, factory){
  const api = factory();
  if(typeof module === 'object' && module.exports) module.exports = api;
  else root.PrimeCatalogSync = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  const blockedKeys = new Set(['__proto__', 'prototype', 'constructor']);

  function isPlainObject(value){
    if(!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function safeEntries(value){
    if(!isPlainObject(value)) return [];
    return Object.entries(value).filter(([key]) => key && !blockedKeys.has(key));
  }

  function normalizeRecord(record, sanitizeChanges = (changes) => changes){
    if(!isPlainObject(record)) return null;
    const cleanChanges = sanitizeChanges(isPlainObject(record.changes) ? record.changes : {});
    return {
      version: Number.isInteger(record.version) && record.version >= 0 ? record.version : 0,
      mutationId: typeof record.mutationId === 'string' ? record.mutationId.slice(0, 180) : '',
      updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt.slice(0, 60) : null,
      deleted: record.deleted === true,
      changes: record.deleted === true || !isPlainObject(cleanChanges) ? {} : cleanChanges
    };
  }

  function normalizeSharedState(raw, sanitizeChanges = (changes) => changes){
    if(!isPlainObject(raw)) return null;
    const declaredVersion = Number(raw.schemaVersion || raw.version || 1);
    if(!Number.isFinite(declaredVersion) || declaredVersion > 2) return null;

    const records = {};
    if(isPlainObject(raw.records)) {
      safeEntries(raw.records).forEach(([key, value]) => {
        const record = normalizeRecord(value, sanitizeChanges);
        if(record) records[key] = record;
      });
    } else {
      safeEntries(raw.changes).forEach(([key, changes]) => {
        records[key] = {
          version: 0,
          mutationId: `legacy:${key}`.slice(0, 180),
          updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt.slice(0, 60) : null,
          deleted: false,
          changes: sanitizeChanges(changes)
        };
      });
      const deleted = Array.isArray(raw.deleted) ? raw.deleted : [];
      deleted.forEach((key) => {
        if(typeof key !== 'string' || !key || blockedKeys.has(key)) return;
        records[key] = {
          version: 0,
          mutationId: `legacy-delete:${key}`.slice(0, 180),
          updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt.slice(0, 60) : null,
          deleted: true,
          changes: {}
        };
      });
    }

    return {
      schemaVersion: 2,
      revision: Number.isInteger(raw.revision) && raw.revision >= 0 ? raw.revision : 0,
      updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt.slice(0, 60) : null,
      records
    };
  }

  function operationRecord(operation, version){
    return {
      version: Number.isInteger(version) && version >= 0 ? version : 0,
      mutationId: operation.mutationId,
      updatedAt: operation.updatedAt || null,
      deleted: operation.deleted === true,
      changes: operation.deleted === true ? {} : { ...(operation.changes || {}) }
    };
  }

  function overlayPending(remoteRecords, pending){
    const records = {};
    safeEntries(remoteRecords).forEach(([key, record]) => { records[key] = { ...record, changes: { ...(record.changes || {}) } }; });
    safeEntries(pending).forEach(([key, operation]) => {
      if(!isPlainObject(operation)) return;
      records[key] = operationRecord(operation, records[key] ? records[key].version : (operation.baseVersion || 0));
    });
    return records;
  }

  function applyPendingOperations(remoteState, pending, revision, updatedAt){
    const records = {};
    safeEntries(remoteState && remoteState.records).forEach(([key, record]) => { records[key] = { ...record, changes: { ...(record.changes || {}) } }; });
    safeEntries(pending).forEach(([key, operation]) => {
      if(!isPlainObject(operation)) return;
      records[key] = operationRecord({ ...operation, updatedAt }, revision);
    });
    return records;
  }

  function acknowledgeBatch(pending, snapshot){
    const next = {};
    safeEntries(pending).forEach(([key, operation]) => { next[key] = operation; });
    safeEntries(snapshot).forEach(([key, operation]) => {
      const current = next[key];
      if(current && current.mutationId === operation.mutationId && current.generation === operation.generation) delete next[key];
    });
    return next;
  }

  function rebaseNewerPending(pending, snapshot, records, skippedKeys = []){
    const next = acknowledgeBatch(pending, snapshot);
    const skipped = new Set(skippedKeys);
    safeEntries(snapshot).forEach(([key]) => {
      if(skipped.has(key) || !next[key]) return;
      const remoteRecord = isPlainObject(records) ? records[key] : null;
      next[key] = {
        ...next[key],
        baseVersion: remoteRecord && Number.isInteger(remoteRecord.version) ? remoteRecord.version : 0
      };
    });
    return next;
  }

  function operationConflicts(remoteRecord, operation){
    if(!isPlainObject(remoteRecord) || !isPlainObject(operation)) return false;
    if(remoteRecord.mutationId && remoteRecord.mutationId === operation.mutationId) return false;
    if(operation.source === 'legacy') return true;
    const baseVersion = Number.isInteger(operation.baseVersion) && operation.baseVersion >= 0 ? operation.baseVersion : 0;
    const remoteVersion = Number.isInteger(remoteRecord.version) && remoteRecord.version >= 0 ? remoteRecord.version : 0;
    return remoteVersion !== baseVersion;
  }

  function deriveOverrides(records){
    const changes = {};
    const deleted = [];
    safeEntries(records).forEach(([key, record]) => {
      if(!isPlainObject(record)) return;
      if(record.deleted === true) deleted.push(key);
      else if(isPlainObject(record.changes) && Object.keys(record.changes).length) changes[key] = record.changes;
    });
    return { changes, deleted };
  }

  function buildSharedPayload(records, revision, updatedAt){
    const overrides = deriveOverrides(records);
    return {
      schemaVersion: 2,
      revision,
      updatedAt,
      records,
      changes: overrides.changes,
      deleted: overrides.deleted
    };
  }

  return {
    acknowledgeBatch,
    applyPendingOperations,
    buildSharedPayload,
    deriveOverrides,
    isPlainObject,
    normalizeSharedState,
    operationConflicts,
    overlayPending,
    rebaseNewerPending
  };
});
