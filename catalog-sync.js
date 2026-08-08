(function(global){
  'use strict';

  const projectUrl = 'https://knszwrcrsljpwjkgkxfn.supabase.co';
  const publishableKey = 'sb_publishable_kmFr40MwFGqX4mfoprBK2g_oe1xvbP7';
  const tableName = 'prime_catalog_overrides';
  const adminEmail = 'info@primeyachtrental.com';
  const validImageFits = new Set(['cover', 'contain']);
  const validImagePositions = new Set(['center center', 'center top', 'center bottom', 'left center', 'right center']);
  const validImageBackgrounds = new Set(['blur', 'cream', 'dark', 'white']);
  const stringLimits = {
    name: 120,
    price: 80,
    location: 240,
    rates: 1800,
    notes: 3000,
    priceLabel: 120,
    locationEn: 240,
    ratesEn: 1800,
    notesEn: 3000,
    priceLabelEn: 120
  };

  let session = null;
  let refreshPromise = null;
  let pendingInvite = null;

  class CatalogSyncError extends Error {
    constructor(code, message, status = 0){
      super(message);
      this.name = 'CatalogSyncError';
      this.code = code;
      this.status = status;
    }
  }

  function captureInviteFromUrl(){
    if(!global.location || typeof global.location.hash !== 'string') return;
    const params = new URLSearchParams(global.location.hash.replace(/^#/, ''));
    if(params.get('type') !== 'invite' || !params.get('access_token')) return;
    pendingInvite = {
      accessToken: String(params.get('access_token') || '').slice(0, 4096),
      refreshToken: String(params.get('refresh_token') || '').slice(0, 4096),
      expiresIn: Math.max(30, Number(params.get('expires_in')) || 3600)
    };
  }

  captureInviteFromUrl();

  function limitedText(value, maxLength){
    if(value === null || value === undefined) return '';
    if(!['string', 'number', 'boolean'].includes(typeof value)) return '';
    return String(value).replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLength);
  }

  function safeUrl(value, allowRelative){
    const raw = limitedText(value, 2048);
    if(!raw) return '';
    if(/[\u0000-\u001F\u007F]/.test(raw)) return '';

    try {
      const base = global.document && global.document.baseURI
        ? global.document.baseURI
        : 'https://primeyachtrental.com/';
      const url = new URL(raw, base);
      if(url.username || url.password) return '';
      if(url.protocol === 'https:') return raw;
      if(allowRelative && !/^[a-z][a-z\d+.-]*:/i.test(raw) && /^https?:$/.test(url.protocol)) return raw;
    } catch (_) {}
    return '';
  }

  function finiteInteger(value, min, max){
    const number = Number(value);
    if(!Number.isFinite(number)) return null;
    return Math.min(max, Math.max(min, Math.round(number)));
  }

  function sanitizePriceTable(value){
    if(!Array.isArray(value)) return [];
    return value.slice(0, 20).map((row) => {
      if(!row || typeof row !== 'object' || Array.isArray(row)) return null;
      const label = limitedText(row.label, 120);
      const labelEn = limitedText(row.labelEn, 120);
      const price = limitedText(row.value, 80);
      if(!label && !labelEn && !price) return null;
      return {
        label,
        labelEn,
        value: price,
        ...(row.estimated === true ? { estimated: true } : {})
      };
    }).filter(Boolean);
  }

  function priceAmount(value){
    const text = String(value || '').trim();
    const currencyMatches = [...text.matchAll(/\$\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k)?\b/gi)];
    const matches = currencyMatches.length
      ? currencyMatches
      : [...text.matchAll(/^\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k)?(?:\s*[–-]\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k)?)?\s*$/gi)];
    const amounts = matches.flatMap((match) => {
      const values = [Number(match[1].replace(/,/g, '')) * (match[2] ? 1000 : 1)];
      if(match[3]) values.push(Number(match[3].replace(/,/g, '')) * (match[4] ? 1000 : 1));
      return values;
    }).filter(Number.isFinite);
    return amounts.length ? Math.min(...amounts) : null;
  }

  function formattedPrice(value){
    return `$${Math.round(value).toLocaleString('en-US')}`;
  }

  function sanitizeChanges(value){
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const clean = {};

    Object.entries(stringLimits).forEach(([field, limit]) => {
      if(Object.prototype.hasOwnProperty.call(source, field)) clean[field] = limitedText(source[field], limit);
    });

    if(Object.prototype.hasOwnProperty.call(source, 'feet')) {
      const feet = finiteInteger(source.feet, 0, 200);
      if(feet !== null) clean.feet = feet;
    }
    if(Object.prototype.hasOwnProperty.call(source, 'passengers')) {
      const passengers = finiteInteger(source.passengers, 1, 100);
      if(passengers !== null) clean.passengers = passengers;
    }
    if(Object.prototype.hasOwnProperty.call(source, 'image')) clean.image = safeUrl(source.image, true);
    if(Object.prototype.hasOwnProperty.call(source, 'coverImage')) clean.coverImage = safeUrl(source.coverImage, true);
    if(Object.prototype.hasOwnProperty.call(source, 'photoLink')) clean.photoLink = safeUrl(source.photoLink, false);
    if(Object.prototype.hasOwnProperty.call(source, 'photoLinkEnabled')) clean.photoLinkEnabled = source.photoLinkEnabled === true;
    if(validImageFits.has(source.imageFit)) clean.imageFit = source.imageFit;
    if(validImagePositions.has(source.imagePosition)) clean.imagePosition = source.imagePosition;
    if(validImageBackgrounds.has(source.imageBackground)) clean.imageBackground = source.imageBackground;
    if(Object.prototype.hasOwnProperty.call(source, 'priceTable')) {
      clean.priceTable = sanitizePriceTable(source.priceTable);
      const amounts = clean.priceTable.map((row) => priceAmount(row.value)).filter(Number.isFinite);
      if(amounts.length) clean.price = formattedPrice(Math.min(...amounts));
    }

    return clean;
  }

  function sanitizeCardKey(value){
    const key = limitedText(value, 160);
    if(['__proto__', 'prototype', 'constructor'].includes(key.toLowerCase())) return '';
    return /^[a-z0-9][a-z0-9._-]{0,159}$/i.test(key) ? key : '';
  }

  function normalizeRows(rows){
    const normalized = Object.create(null);
    (Array.isArray(rows) ? rows : []).forEach((row) => {
      if(!row || typeof row !== 'object') return;
      const key = sanitizeCardKey(row.card_key);
      if(!key) return;
      normalized[key] = {
        changes: sanitizeChanges(row.changes),
        deleted: row.deleted === true,
        updatedAt: limitedText(row.updated_at, 80)
      };
    });
    return normalized;
  }

  function errorMessage(payload, fallback){
    if(payload && typeof payload === 'object') {
      return payload.error_description || payload.msg || payload.message || payload.error || fallback;
    }
    return fallback;
  }

  async function apiRequest(path, options = {}){
    const headers = {
      apikey: publishableKey,
      Accept: 'application/json',
      ...(options.headers || {})
    };
    if(options.token) headers.Authorization = `Bearer ${options.token}`;
    if(options.body !== undefined) headers['Content-Type'] = 'application/json';

    let response;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), 15000) : null;
    try {
      response = await fetch(`${projectUrl}${path}`, {
        method: options.method || 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: 'no-store',
        ...(controller ? { signal: controller.signal } : {})
      });
    } catch (_) {
      throw new CatalogSyncError('network', 'No se pudo conectar con Supabase.');
    } finally {
      if(timeout) clearTimeout(timeout);
    }

    const responseText = await response.text();
    let payload = null;
    if(responseText) {
      try { payload = JSON.parse(responseText); } catch (_) { payload = responseText; }
    }
    if(!response.ok) {
      const code = response.status === 401 ? 'unauthorized'
        : response.status === 403 ? 'forbidden'
          : response.status === 429 ? 'rate_limit'
            : 'request_failed';
      throw new CatalogSyncError(code, errorMessage(payload, 'Supabase rechazó la solicitud.'), response.status);
    }
    return payload;
  }

  function setSession(payload){
    if(!payload || !payload.access_token) {
      session = null;
      return null;
    }
    session = {
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token || '',
      expiresAt: Date.now() + Math.max(30, Number(payload.expires_in) || 3600) * 1000,
      email: limitedText(payload.user && payload.user.email, 320).toLowerCase()
    };
    return { email: session.email };
  }

  async function refreshSession(){
    if(!session || !session.refreshToken) throw new CatalogSyncError('unauthorized', 'La sesión expiró.');
    if(refreshPromise) return refreshPromise;
    refreshPromise = apiRequest('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: { refresh_token: session.refreshToken }
    }).then(setSession).finally(() => { refreshPromise = null; });
    return refreshPromise;
  }

  async function accessToken(){
    if(!session) throw new CatalogSyncError('unauthorized', 'Inicia sesión para guardar cambios.');
    if(session.expiresAt - Date.now() < 45000) await refreshSession();
    return session.accessToken;
  }

  async function authorizedRequest(path, options = {}){
    try {
      return await apiRequest(path, { ...options, token: await accessToken() });
    } catch (error) {
      if(error && error.code === 'unauthorized' && session && session.refreshToken) {
        await refreshSession();
        return apiRequest(path, { ...options, token: await accessToken() });
      }
      throw error;
    }
  }

  async function load(){
    const columns = 'card_key,changes,deleted,updated_at';
    const rows = await apiRequest(`/rest/v1/${tableName}?select=${encodeURIComponent(columns)}&order=card_key.asc`);
    return normalizeRows(rows);
  }

  async function signIn(email, password){
    const normalizedEmail = limitedText(email, 320).toLowerCase();
    if(normalizedEmail !== adminEmail) throw new CatalogSyncError('forbidden', 'Este correo no tiene acceso a Manage.');
    const payload = await apiRequest('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: { email: normalizedEmail, password: String(password || '') }
    });
    const publicSession = setSession(payload);
    if(!publicSession || publicSession.email !== adminEmail) {
      session = null;
      throw new CatalogSyncError('forbidden', 'Esta cuenta no tiene acceso a Manage.');
    }
    return publicSession;
  }

  async function completeInvite(password){
    if(!pendingInvite || !pendingInvite.accessToken) {
      throw new CatalogSyncError('invalid_invite', 'La invitación no está disponible o expiró.');
    }
    const nextPassword = String(password || '');
    if(nextPassword.length < 8) {
      throw new CatalogSyncError('weak_password', 'La contraseña debe tener al menos 8 caracteres.');
    }

    const invite = pendingInvite;
    const currentPayload = await apiRequest('/auth/v1/user', { token: invite.accessToken });
    const currentUser = currentPayload && currentPayload.user ? currentPayload.user : currentPayload;
    const email = limitedText(currentUser && currentUser.email, 320).toLowerCase();
    if(email !== adminEmail) {
      pendingInvite = null;
      throw new CatalogSyncError('forbidden', 'Esta invitación no pertenece a la cuenta administrativa.');
    }

    const updatedPayload = await apiRequest('/auth/v1/user', {
      method: 'PUT',
      token: invite.accessToken,
      body: { password: nextPassword }
    });
    const updatedUser = updatedPayload && updatedPayload.user ? updatedPayload.user : updatedPayload;
    const updatedEmail = limitedText(updatedUser && updatedUser.email, 320).toLowerCase();
    if(updatedEmail !== adminEmail) {
      throw new CatalogSyncError('forbidden', 'Supabase no confirmó la cuenta administrativa.');
    }

    const publicSession = setSession({
      access_token: invite.accessToken,
      refresh_token: invite.refreshToken,
      expires_in: invite.expiresIn,
      user: { email: updatedEmail }
    });
    pendingInvite = null;
    if(global.history && typeof global.history.replaceState === 'function' && global.location) {
      global.history.replaceState(null, '', `${global.location.pathname || ''}${global.location.search || ''}`);
    }
    return publicSession;
  }

  async function save(cardKey, changes, deleted = false, expectedUpdatedAt = null){
    const key = sanitizeCardKey(cardKey);
    if(!key) throw new CatalogSyncError('invalid_card', 'La tarjeta no tiene un identificador válido.');
    const cleanChanges = sanitizeChanges(changes);
    const expectedVersion = limitedText(expectedUpdatedAt, 80) || null;
    const rows = await authorizedRequest('/rest/v1/rpc/save_prime_catalog_override', {
      method: 'POST',
      body: {
        p_card_key: key,
        p_changes: cleanChanges,
        p_deleted: deleted === true,
        p_expected_updated_at: expectedVersion
      }
    });
    const normalized = normalizeRows(rows);
    if(!normalized[key]) {
      throw new CatalogSyncError('conflict', 'La tarjeta cambió en otro dispositivo.', 409);
    }
    return normalized[key];
  }

  async function signOut(){
    const token = session && session.accessToken;
    session = null;
    refreshPromise = null;
    if(!token) return;
    try {
      await apiRequest('/auth/v1/logout', { method: 'POST', token });
    } catch (_) {}
  }

  const api = Object.freeze({
    adminEmail,
    completeInvite,
    hasPendingInvite: () => Boolean(pendingInvite),
    load,
    normalizeRows,
    sanitizeChanges,
    save,
    signIn,
    signOut,
    isAuthenticated: () => Boolean(session)
  });

  global.PrimeCatalogStore = api;
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
