const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PROJECT_URL = 'https://knszwrcrsljpwjkgkxfn.supabase.co';
const BUCKET = 'catalog-thumbnails';
const PUBLIC_BASE = `${PROJECT_URL}/storage/v1/object/public/${BUCKET}`;
const MAX_SOURCE_BYTES = 40 * 1024 * 1024;
const PYTHON = process.env.PRIME_THUMBNAIL_PYTHON || 'python';
const STAGING_DIR = path.join(__dirname, '.thumbnail-upload');

const syncSource = fs.readFileSync(path.join(ROOT, 'catalog-sync.js'), 'utf8');
const publishableKeyMatch = syncSource.match(/const publishableKey = '([^']+)'/);
if(!publishableKeyMatch) throw new Error('No se encontró la clave publishable de Supabase.');
const PUBLISHABLE_KEY = publishableKeyMatch[1];

global.window = global;
require(path.join(ROOT, 'catalog-data.js'));

const fallbackBySize = {
  Pequeno: './assets/catalog-fallbacks/small-boat.png',
  Mediano: './assets/catalog-fallbacks/motor-yacht.png',
  Grande: './assets/catalog-fallbacks/superyacht.png',
  Premium: './assets/catalog-fallbacks/superyacht.png'
};

const sourceAdventures = [
  { mediaKey: 'adventure-001-jet-ski-spark', image: './assets/catalog-fallbacks/jetski.png' },
  { mediaKey: 'adventure-002-jet-ski-premium', image: './assets/catalog-fallbacks/jetski.png' },
  { mediaKey: 'adventure-003-atv-honda-rancher', image: 'https://loremflickr.com/900/650/atv,beach,adventure?lock=103' },
  { mediaKey: 'adventure-004-utv-honda-pioneer', image: './assets/adventures/utv-honda-pioneer.png' },
  { mediaKey: 'adventure-005-atv-group-experience', image: 'https://resmark-production.s3.amazonaws.com/images/QeygN9/aa998b9b8f6e73b603e3a243d805461f5c0229db/original' },
  { mediaKey: 'adventure-006-jet-car-miami', image: 'https://loremflickr.com/900/650/jet-car,miami,water?lock=106' }
];

// Fresh, downloadable sources recovered from the owners' shared Google Drive
// and Dropbox folders when the previously saved preview URL had expired.
const recoverySources = {
  '015-36ft-sundancer': './assets/vehicles/015-36ft-sundancer/_extracted/DJI_0804.jpg',
  '016-37ft-monterrey': './assets/covers/37ft-monterrey.jpg',
  '033-48ft-princess-fly-bridge': 'https://drive.google.com/thumbnail?id=1HKneD21AafYvZ9APZYAzkNSoFMS0st_T&sz=w1600',
  '038-50ft-sea-ray': './assets/vehicles/038-50ft-sea-ray/_extracted/Photo 002.jpg',
  '046-55ft-azimut': 'https://drive.google.com/thumbnail?id=1tHfwJPk_a3ym27RwSx4MSDNag1qaaRfA&sz=w1600',
  '047-azimut-55-fly-bayside': 'https://drive.google.com/thumbnail?id=1kny-UbPeAfb-tKimOHqahYJ7xUdOAne8&sz=w1600',
  '056-60searay': 'https://drive.google.com/thumbnail?id=1a48IriLSpwkYiLiYhKskPuNGNrdz6CGu&sz=w1600',
  '062-warrior-ii-66ft': './assets/catalog/062-warrior-ii-66ft.png',
  '063-azimut-andiamo-68-with-jacuzzi': 'https://drive.google.com/thumbnail?id=1cKxnPjXchRuSEqM5oRTLSswMwNIoGdCY&sz=w1600',
  '065-68ft-money-waves': './assets/vehicles/065-68ft-money-waves/_extracted/Photo Apr 29 2025, 6 42 37 PM.jpg',
  '068-2019-azimut-s7-72ft': 'https://drive.google.com/thumbnail?id=1QHFBzF1hCfT9DIcXiQc026pzcvPa0UpA&sz=w1600',
  '070-75-yacht-azimut-fly': 'https://drive.google.com/thumbnail?id=1rEGnMKXnJwzRINbNFLUFKTpSWALpMVG6&sz=w1600',
  '073-84-azimut-azure': 'https://uc5a1b9bcddbfdcf24f27aa76912.previews.dropboxusercontent.com/p/thumb/ADG0--dWyunL4mr9-XpfpEghNrgBnr2IIHa_5FFmGFgsa2hVyNm8_TrUzgc-hKahlVjXhNDLkLVxEyU6vAeHMPN_rIFTX5wmi_T35qaqfyz2oofUGN79ghpKrxJwrhJbogMdWDfLmihr6XAVPBwcA_0qATGwbhQaPyn0Co-pRwWmUGIksG9uth7dAR0RyddSgB_CyjIeY1gWiV3e0qPOEau1mmFL5wq9W1LnfuqBNYHqIyUZtC8pKQZm6nJbpDcC1VGvqdipIMQtBwIN_uYTzEL4YlwP-5mO1FgXgk0RBevIow/p.png?size=1024x1024&size_mode=2',
  '080-105-ft-bearpaw-with-jacuzzi': 'https://drive.google.com/thumbnail?id=1zZE-FVgz6FdUHtejfLtFTycdaOR2V1U9&sz=w1600',
  '084-94ft-sunseeker-2003-refit-2019-lm': 'https://drive.google.com/thumbnail?id=18zsGhC5cZ2hZpr-a6dzHYm-eENohGpIc&sz=w1600',
  '087-105aqua-wjacuzzi': 'https://drive.google.com/thumbnail?id=1lggLmfJjf2STI5C4Q07i3jL1OPHL_wlm&sz=w1600'
};

function apiHeaders(extra = {}){
  return {
    apikey: PUBLISHABLE_KEY,
    Authorization: `Bearer ${PUBLISHABLE_KEY}`,
    ...extra
  };
}

async function fetchOverrides(){
  const query = new URLSearchParams({
    select: 'card_key,changes,deleted',
    deleted: 'eq.false',
    order: 'card_key.asc'
  });
  const response = await fetch(`${PROJECT_URL}/rest/v1/prime_catalog_overrides?${query}`, {
    headers: apiHeaders({ Accept: 'application/json' })
  });
  if(!response.ok) throw new Error(`No se pudieron leer los overrides: HTTP ${response.status}`);
  return response.json();
}

function effectiveCards(overrides){
  const byKey = new Map(overrides.map((row) => [row.card_key, row.changes || {}]));
  const yachts = global.PRIME_YACHTS.map((base) => {
    const effective = { ...base, ...(byKey.get(base.mediaKey) || {}) };
    return {
      mediaKey: base.mediaKey,
      category: 'yachts',
      source: recoverySources[base.mediaKey] || effective.coverImage || effective.image || fallbackBySize[effective.size] || fallbackBySize.Mediano,
      hadImageOverride: Boolean((byKey.get(base.mediaKey) || {}).coverImage || (byKey.get(base.mediaKey) || {}).image)
    };
  });
  const adventures = sourceAdventures.map((base) => {
    const changes = byKey.get(base.mediaKey) || {};
    return {
      mediaKey: base.mediaKey,
      category: 'adventures',
      source: changes.coverImage || changes.image || base.image,
      hadImageOverride: Boolean(changes.coverImage || changes.image)
    };
  });
  return [...yachts, ...adventures];
}

function safeLocalPath(source){
  const resolved = path.resolve(ROOT, source.replace(/^\.\//, ''));
  const relative = path.relative(ROOT, resolved);
  if(relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Ruta local fuera del proyecto: ${source}`);
  }
  return resolved;
}

function googleDriveFallback(source){
  const match = source.match(/\/u\/\d+\/d\/([^=/?]+)/i);
  return match
    ? `https://drive.usercontent.google.com/download?id=${encodeURIComponent(match[1])}&export=download&confirm=t`
    : '';
}

async function downloadRemote(source){
  const candidates = [source, googleDriveFallback(source)].filter(Boolean);
  let lastError;
  for(const candidate of candidates) {
    for(let attempt = 1; attempt <= 2; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      try {
        const response = await fetch(candidate, {
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136 Safari/537.36'
          }
        });
        if(!response.ok) throw new Error(`HTTP ${response.status}`);
        const contentLength = Number(response.headers.get('content-length') || 0);
        if(contentLength > MAX_SOURCE_BYTES) throw new Error(`archivo mayor de ${MAX_SOURCE_BYTES} bytes`);
        const buffer = Buffer.from(await response.arrayBuffer());
        if(!buffer.length || buffer.length > MAX_SOURCE_BYTES) throw new Error(`tamaño inválido: ${buffer.length}`);
        return buffer;
      } catch(error) {
        lastError = error;
        if(attempt < 2) await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
      } finally {
        clearTimeout(timeout);
      }
    }
  }
  throw new Error(`descarga fallida (${lastError && lastError.message ? lastError.message : 'error desconocido'})`);
}

async function sourceBuffer(source){
  if(/^https:\/\//i.test(source)) return downloadRemote(source);
  return fs.readFileSync(safeLocalPath(source));
}

function runPython(args){
  return new Promise((resolve, reject) => {
    execFile(PYTHON, args, { windowsHide: true, timeout: 120000 }, (error, stdout, stderr) => {
      if(error) {
        reject(new Error((stderr || error.message).trim()));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

async function normalizeSource(source, index, tempDir){
  const input = path.join(tempDir, `source-${index}.bin`);
  const output = path.join(tempDir, `source-${index}.webp`);
  fs.writeFileSync(input, await sourceBuffer(source));
  const detailsText = await runPython([path.join(__dirname, 'normalize-thumbnail.py'), input, output]);
  const buffer = fs.readFileSync(output);
  fs.unlinkSync(input);
  fs.unlinkSync(output);
  return {
    buffer,
    sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
    details: JSON.parse(detailsText)
  };
}

function encodedPublicUrl(objectPath){
  const encoded = objectPath.split('/').map(encodeURIComponent).join('/');
  return `${PUBLIC_BASE}/${encoded}`;
}

async function mapLimit(items, limit, worker){
  const results = new Array(items.length);
  let nextIndex = 0;
  async function run(){
    while(true) {
      const index = nextIndex;
      nextIndex += 1;
      if(index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

function prepareStagingDirectory(){
  if(!fs.existsSync(STAGING_DIR)) {
    fs.mkdirSync(STAGING_DIR);
    return;
  }
  for(const name of fs.readdirSync(STAGING_DIR)) {
    const target = path.join(STAGING_DIR, name);
    if(!fs.statSync(target).isFile()) throw new Error(`La carpeta temporal contiene una subcarpeta inesperada: ${target}`);
    fs.unlinkSync(target);
  }
}

function writeOutputs(cards, sourceResults){
  const manifestCards = {};
  const staticMap = {};
  cards.forEach((card) => {
    const normalized = sourceResults.get(card.source);
    const suffix = normalized.sha256.slice(0, 12);
    const objectPath = `${card.category}--${card.mediaKey}-${suffix}.webp`;
    const publicUrl = encodedPublicUrl(objectPath);
    const localFile = path.join(STAGING_DIR, objectPath);
    fs.writeFileSync(localFile, normalized.buffer);
    staticMap[card.mediaKey] = publicUrl;
    manifestCards[card.mediaKey] = {
      source: card.source,
      public_url: publicUrl,
      object_path: objectPath,
      local_file: localFile,
      sha256: normalized.sha256,
      bytes: normalized.details.bytes,
      width: normalized.details.width,
      height: normalized.details.height,
      had_image_override: card.hadImageOverride
    };
  });

  const manifest = {
    generated_at: new Date().toISOString(),
    project_id: 'knszwrcrsljpwjkgkxfn',
    bucket: BUCKET,
    card_count: cards.length,
    source_count: sourceResults.size,
    cards: manifestCards
  };
  fs.writeFileSync(
    path.join(__dirname, 'catalog-thumbnails-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  );

  const mappingSource = `(function(global){\n  'use strict';\n\n  global.PRIME_THUMBNAILS = Object.freeze(${JSON.stringify(staticMap, null, 2)});\n})(window);\n`;
  fs.writeFileSync(path.join(ROOT, 'catalog-thumbnails.js'), mappingSource);
}

async function main(){
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prime-yacht-thumbnails-'));
  try {
    prepareStagingDirectory();
    const overrides = await fetchOverrides();
    const cards = effectiveCards(overrides);
    const uniqueSources = [...new Set(cards.map((card) => card.source))];
    console.log(`cards=${cards.length} uniqueSources=${uniqueSources.length}`);

    const sourceResultsList = await mapLimit(uniqueSources, 4, async (source, index) => {
      try {
        const result = await normalizeSource(source, index, tempDir);
        console.log(`downloaded=${index + 1}/${uniqueSources.length} bytes=${result.details.bytes}`);
        return result;
      } catch(error) {
        return { error: error.message || String(error) };
      }
    });
    const failedSources = uniqueSources
      .map((source, index) => ({ source, index, result: sourceResultsList[index] }))
      .filter((item) => item.result.error);
    if(failedSources.length) {
      for(const failure of failedSources) {
        const keys = cards.filter((card) => card.source === failure.source).map((card) => card.mediaKey);
        console.error(`failed=${failure.index + 1}/${uniqueSources.length} keys=${keys.join(',')} error=${failure.result.error} source=${failure.source}`);
      }
      throw new Error(`${failedSources.length} fuentes no se pudieron preparar.`);
    }
    const sourceResults = new Map(uniqueSources.map((source, index) => [source, sourceResultsList[index]]));

    writeOutputs(cards, sourceResults);
    console.log(`prepared cards=${cards.length} files=${fs.readdirSync(STAGING_DIR).length}`);
  } finally {
    for(const name of fs.readdirSync(tempDir)) fs.unlinkSync(path.join(tempDir, name));
    fs.rmdirSync(tempDir);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
