const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROJECT_URL = 'https://knszwrcrsljpwjkgkxfn.supabase.co';
const BUCKET = 'miniaturas';
const OUTPUT_DIR = path.join(__dirname, '.miniaturas-upload');
const OUTPUT_MANIFEST = path.join(__dirname, 'miniaturas-manifest.json');
const LEGACY_STAGING = path.join(__dirname, '.thumbnail-upload');
const LEGACY_MANIFEST = path.join(__dirname, 'catalog-thumbnails-manifest.json');
const MAX_SOURCE_BYTES = 40 * 1024 * 1024;

// These cards currently share two manually uploaded objects. The previous
// card-keyed staging keeps their six distinct, verified thumbnail images.
const RESTORE_DISTINCT_CARD_KEYS = new Set([
  '031-45ft-tempest',
  '033-48ft-princess-fly-bridge',
  '068-2019-azimut-s7-72ft',
  '073-84-azimut-azure',
  '084-94ft-sunseeker-2003-refit-2019-lm',
  '087-105aqua-wjacuzzi'
]);

const fallbackBySize = {
  Pequeno: './assets/catalog-fallbacks/small-boat.png',
  Mediano: './assets/catalog-fallbacks/motor-yacht.png',
  Grande: './assets/catalog-fallbacks/superyacht.png',
  Premium: './assets/catalog-fallbacks/superyacht.png'
};

function readPublishableKey(){
  const source = fs.readFileSync(path.join(ROOT, 'catalog-sync.js'), 'utf8');
  const match = source.match(/const publishableKey = '([^']+)'/);
  if(!match) throw new Error('No se encontro la publishable key de Supabase.');
  return match[1];
}

function loadCatalog(){
  global.window = global;
  require(path.join(ROOT, 'catalog-data.js'));
  require(path.join(ROOT, 'catalog-thumbnails.js'));
  require(path.join(ROOT, 'catalog-media.js'));
  if(!Array.isArray(global.PRIME_YACHTS)) throw new Error('PRIME_YACHTS no esta disponible.');
  return {
    yachts: global.PRIME_YACHTS,
    thumbnails: global.PRIME_THUMBNAILS || {},
    media: global.PRIME_MEDIA || {}
  };
}

async function fetchOverrides(publishableKey){
  const query = new URLSearchParams({
    select: 'card_key,changes,deleted,updated_at',
    order: 'card_key.asc'
  });
  const response = await fetch(`${PROJECT_URL}/rest/v1/prime_catalog_overrides?${query}`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      Accept: 'application/json'
    }
  });
  if(!response.ok) throw new Error(`No se pudieron leer los overrides: HTTP ${response.status}`);
  return response.json();
}

function isVideo(source = ''){
  return /\.(?:mp4|webm|mov|m4v)(?:\?|$)/i.test(String(source));
}

function isBingImageUrl(source = ''){
  try {
    const hostname = new URL(String(source), PROJECT_URL).hostname.toLowerCase();
    return hostname === 'bing.com' || hostname.endsWith('.bing.com') ||
      hostname === 'bing.net' || hostname.endsWith('.bing.net');
  } catch (_) {
    return false;
  }
}

function hasDirectImage(source = ''){
  return Boolean(source && !isBingImageUrl(source) &&
    (/^https?:\/\//i.test(source) || /\.(?:jpg|jpeg|png|webp|gif)(?:\?|$)/i.test(source)));
}

function normalizedMedia(item){
  if(typeof item === 'string') return { type: isVideo(item) ? 'video' : 'image', src: item };
  const src = item && item.src ? item.src : '';
  return { type: item && item.type ? item.type : (isVideo(src) ? 'video' : 'image'), src };
}

function effectiveThumbnail(vehicle, media){
  if(hasDirectImage(vehicle.coverImage)) return vehicle.coverImage;
  const gallery = Array.isArray(media[vehicle.mediaKey])
    ? media[vehicle.mediaKey].map(normalizedMedia).filter((item) => item.src && !isBingImageUrl(item.src))
    : [];
  const galleryImage = gallery.find((item) => item.type === 'image');
  if(galleryImage) return galleryImage.src;
  if(hasDirectImage(vehicle.image)) return vehicle.image;
  return fallbackBySize[vehicle.size] || fallbackBySize.Mediano;
}

function effectiveCards(catalog, overrides){
  const byKey = new Map(overrides.map((row) => [row.card_key, row]));
  return catalog.yachts.map((base) => {
    const row = byKey.get(base.mediaKey) || {};
    if(row.deleted === true) return null;
    const staticThumbnail = catalog.thumbnails[base.mediaKey];
    const withStatic = staticThumbnail
      ? { ...base, image: staticThumbnail, coverImage: staticThumbnail }
      : { ...base };
    const vehicle = { ...withStatic, ...(row.changes || {}) };
    return {
      card_key: base.mediaKey,
      title: vehicle.name,
      source: effectiveThumbnail(vehicle, catalog.media),
      updated_at: row.updated_at || null
    };
  }).filter(Boolean);
}

function slugifyTitle(value){
  return String(value || 'bote')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .toLowerCase() || 'bote';
}

function safeLocalPath(source){
  const resolved = path.resolve(ROOT, String(source).replace(/^\.\//, ''));
  const relative = path.relative(ROOT, resolved);
  if(relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Ruta local fuera del proyecto: ${source}`);
  }
  return resolved;
}

function legacyFileFor(cardKey, legacyManifest){
  const card = legacyManifest.cards && legacyManifest.cards[cardKey];
  if(!card || !card.object_path) throw new Error(`No hay staging previo para ${cardKey}.`);
  const fileName = path.basename(card.object_path);
  if(fileName !== card.object_path) throw new Error(`Object path previo invalido para ${cardKey}.`);
  const localPath = path.join(LEGACY_STAGING, fileName);
  if(!fs.existsSync(localPath)) throw new Error(`Falta el staging previo de ${cardKey}: ${localPath}`);
  return localPath;
}

function sourceReference(source){
  try {
    const url = new URL(source);
    if(url.hostname === 'knszwrcrsljpwjkgkxfn.supabase.co' && url.pathname.includes('/miniaturas/')) {
      return `${url.origin}${decodeURIComponent(url.pathname)}`;
    }
    return source;
  } catch (_) {
    return source;
  }
}

function sniffFormat(buffer, contentType = ''){
  if(buffer.length >= 12 && buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return { format: 'jpeg', content_type: 'image/jpeg' };
  }
  if(buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { format: 'png', content_type: 'image/png' };
  }
  if(buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return { format: 'webp', content_type: 'image/webp' };
  }
  if(buffer.length >= 6 && /^GIF8[79]a$/.test(buffer.toString('ascii', 0, 6))) {
    return { format: 'gif', content_type: 'image/gif' };
  }
  if(buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp' && /^(?:avif|avis)$/.test(buffer.toString('ascii', 8, 12))) {
    return { format: 'avif', content_type: 'image/avif' };
  }
  const prefix = buffer.subarray(0, Math.min(buffer.length, 512)).toString('utf8').trimStart();
  if(/^<svg(?:\s|>)/i.test(prefix) || (/^<\?xml/i.test(prefix) && /<svg(?:\s|>)/i.test(prefix))) {
    return { format: 'svg', content_type: 'image/svg+xml' };
  }
  const normalizedType = String(contentType).split(';')[0].trim().toLowerCase();
  const byType = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/svg+xml': 'svg'
  };
  if(byType[normalizedType]) return { format: byType[normalizedType], content_type: normalizedType };
  throw new Error(`El contenido descargado no es una imagen reconocida (${contentType || 'sin content-type'}).`);
}

function sourceExtension(source){
  try {
    const pathname = decodeURIComponent(new URL(source, PROJECT_URL).pathname);
    const match = pathname.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : '';
  } catch (_) {
    return '';
  }
}

function extensionFor(format, source){
  const candidate = sourceExtension(source);
  if(format === 'jpeg' && ['jpg', 'jpeg'].includes(candidate)) return candidate;
  if(candidate === format) return candidate;
  return format === 'jpeg' ? 'jpg' : format;
}

async function downloadRemote(source){
  let lastError;
  for(let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch(source, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136 Safari/537.36'
        }
      });
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const declaredSize = Number(response.headers.get('content-length') || 0);
      if(declaredSize > MAX_SOURCE_BYTES) throw new Error(`archivo mayor de ${MAX_SOURCE_BYTES} bytes`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if(!buffer.length || buffer.length > MAX_SOURCE_BYTES) throw new Error(`tamano invalido: ${buffer.length}`);
      return { buffer, content_type: response.headers.get('content-type') || '' };
    } catch (error) {
      lastError = error;
      if(attempt < 3) await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error(`descarga fallida: ${lastError && lastError.message ? lastError.message : 'error desconocido'}`);
}

async function sourceBytes(card, legacyManifest){
  const useLegacy = RESTORE_DISTINCT_CARD_KEYS.has(card.card_key) ||
    /\/storage\/v1\/object\/public\/catalog-thumbnails\//i.test(card.source);
  if(useLegacy) {
    const localPath = legacyFileFor(card.card_key, legacyManifest);
    return {
      buffer: fs.readFileSync(localPath),
      content_type: 'image/webp',
      resolved_source: localPath,
      source_kind: RESTORE_DISTINCT_CARD_KEYS.has(card.card_key)
        ? 'restored-distinct-card-staging'
        : 'prepared-current-static-thumbnail'
    };
  }
  if(/^https:\/\//i.test(card.source)) {
    const result = await downloadRemote(card.source);
    return { ...result, resolved_source: card.source, source_kind: 'current-remote-thumbnail' };
  }
  const localPath = safeLocalPath(card.source);
  return {
    buffer: fs.readFileSync(localPath),
    content_type: '',
    resolved_source: localPath,
    source_kind: 'current-local-thumbnail'
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

function ensureFreshOutput(){
  if(fs.existsSync(OUTPUT_DIR)) throw new Error(`La carpeta de salida ya existe: ${OUTPUT_DIR}`);
  if(fs.existsSync(OUTPUT_MANIFEST)) throw new Error(`El manifiesto de salida ya existe: ${OUTPUT_MANIFEST}`);
  fs.mkdirSync(OUTPUT_DIR);
}

async function main(){
  const publishableKey = readPublishableKey();
  const catalog = loadCatalog();
  const overrides = await fetchOverrides(publishableKey);
  const cards = effectiveCards(catalog, overrides);
  const legacyManifest = JSON.parse(fs.readFileSync(LEGACY_MANIFEST, 'utf8'));

  if(cards.length !== 94) throw new Error(`Se esperaban 94 botes activos y se encontraron ${cards.length}.`);
  const slugs = cards.map((card) => slugifyTitle(card.title));
  if(new Set(slugs).size !== slugs.length) throw new Error('Los titulos normalizados generan nombres duplicados.');

  ensureFreshOutput();
  const prepared = await mapLimit(cards, 4, async (card, index) => {
    try {
      const source = await sourceBytes(card, legacyManifest);
      const detected = sniffFormat(source.buffer, source.content_type);
      const extension = extensionFor(detected.format, source.resolved_source);
      const objectName = `${slugifyTitle(card.title)}.${extension}`;
      const outputPath = path.join(OUTPUT_DIR, objectName);
      fs.writeFileSync(outputPath, source.buffer, { flag: 'wx' });
      const sha256 = crypto.createHash('sha256').update(source.buffer).digest('hex');
      console.log(`prepared=${index + 1}/${cards.length} key=${card.card_key} file=${objectName}`);
      return {
        card_key: card.card_key,
        title: card.title,
        source: sourceReference(card.source),
        source_kind: source.source_kind,
        object_name: objectName,
        local_file: path.relative(ROOT, outputPath).replace(/\\/g, '/'),
        content_type: detected.content_type,
        bytes: source.buffer.length,
        sha256,
        previous_updated_at: card.updated_at
      };
    } catch (error) {
      throw new Error(`${card.card_key} (${card.title}): ${error.message || error}`);
    }
  });

  const manifest = {
    generated_at: new Date().toISOString(),
    project_id: 'knszwrcrsljpwjkgkxfn',
    bucket: BUCKET,
    bucket_public: false,
    card_count: prepared.length,
    excluded_deleted_card_keys: ['067-70ft'],
    restored_distinct_card_keys: [...RESTORE_DISTINCT_CARD_KEYS],
    cards: prepared
  };
  fs.writeFileSync(OUTPUT_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });
  console.log(`complete cards=${prepared.length} directory=${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
