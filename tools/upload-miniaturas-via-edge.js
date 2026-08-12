const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(__dirname, 'miniaturas-manifest.json');
const RESULTS_PATH = path.join(__dirname, 'miniaturas-upload-results.json');
const CATALOG_THUMBNAILS_PATH = path.join(ROOT, 'catalog-thumbnails.js');
const FUNCTION_URL = 'https://knszwrcrsljpwjkgkxfn.supabase.co/functions/v1/thumbnail-migration-admin';
const TOKEN = process.env.PRIME_THUMBNAIL_MIGRATION_TOKEN;
const LIMIT_ARGUMENT = process.argv.find((argument) => argument.startsWith('--limit='));
const LIMIT = LIMIT_ARGUMENT ? Number(LIMIT_ARGUMENT.split('=')[1]) : Infinity;

if(LIMIT_ARGUMENT && (!Number.isFinite(LIMIT) || LIMIT < 1)) {
  throw new Error('El limite debe ser un entero positivo.');
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const existing = fs.existsSync(RESULTS_PATH)
  ? JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'))
  : { generated_at: null, project_id: manifest.project_id, bucket: manifest.bucket, cards: [] };
const completed = new Map((existing.cards || []).map((card) => [card.card_key, card]));

function localPath(card){
  const resolved = path.resolve(ROOT, card.local_file);
  const relative = path.relative(ROOT, resolved);
  if(relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Ruta local invalida: ${card.local_file}`);
  return resolved;
}

async function callFunction(body){
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-migration-token': TOKEN
      },
      body: JSON.stringify(body)
    });
    const text = await response.text();
    let payload = {};
    try { payload = text ? JSON.parse(text) : {}; } catch (_) {}
    if(!response.ok || payload.ok !== true) {
      const error = new Error(`HTTP ${response.status}: ${text.slice(0, 600)}`);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

async function uploadCard(card){
  const bytes = fs.readFileSync(localPath(card));
  let payload;
  let reusedExisting = false;
  try {
    payload = await callFunction({
      action: 'upload',
      objectName: card.object_name,
      contentType: card.content_type,
      dataBase64: bytes.toString('base64'),
      sha256: card.sha256
    });
  } catch (error) {
    const detail = String(error.payload && error.payload.detail || '');
    if(error.status !== 400 || !/already exists|duplicate/i.test(detail)) throw error;
    payload = await callFunction({ action: 'sign', objectName: card.object_name });
    reusedExisting = true;
  }
  return {
    card_key: card.card_key,
    title: card.title,
    object_name: card.object_name,
    content_type: card.content_type,
    bytes: card.bytes,
    sha256: card.sha256,
    signed_url: payload.signedUrl,
    reused_existing: reusedExisting,
    uploaded_at: new Date().toISOString()
  };
}

async function mapLimit(items, limit, worker){
  const results = new Array(items.length);
  let next = 0;
  async function run(){
    while(true) {
      const index = next;
      next += 1;
      if(index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function main(){
  const pending = manifest.cards
    .filter((card) => {
      const prior = completed.get(card.card_key);
      return !prior || prior.sha256 !== card.sha256 || prior.object_name !== card.object_name || !prior.signed_url;
    })
    .slice(0, LIMIT);

  if(pending.length && !TOKEN) throw new Error('Falta PRIME_THUMBNAIL_MIGRATION_TOKEN.');

  const uploaded = await mapLimit(pending, 3, async (card, index) => {
    const result = await uploadCard(card);
    console.log(`uploaded=${index + 1}/${pending.length} key=${card.card_key} file=${card.object_name}`);
    return result;
  });
  uploaded.forEach((card) => completed.set(card.card_key, card));

  const ordered = manifest.cards.map((card) => completed.get(card.card_key)).filter(Boolean);
  const output = {
    generated_at: new Date().toISOString(),
    project_id: manifest.project_id,
    bucket: manifest.bucket,
    card_count: ordered.length,
    cards: ordered
  };
  fs.writeFileSync(RESULTS_PATH, `${JSON.stringify(output, null, 2)}\n`);

  if(ordered.length === manifest.cards.length) {
    const thumbnailMap = Object.fromEntries(ordered.map((card) => [card.card_key, card.signed_url]));
    const source = `(function(global){\n  'use strict';\n\n  global.PRIME_THUMBNAILS = Object.freeze(${JSON.stringify(thumbnailMap, null, 2)});\n})(window);\n`;
    fs.writeFileSync(CATALOG_THUMBNAILS_PATH, source);
  }
  console.log(`complete uploaded_now=${uploaded.length} total_results=${ordered.length}`);
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
