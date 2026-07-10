global.window = global;

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const catalogPath = path.join(root, 'catalog-data.js');
const mediaRoot = path.join(root, 'assets', 'vehicles');
const manifestPath = path.join(root, 'catalog-media.js');
const shouldDownload = process.argv.includes('--download');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity;

require(catalogPath);

const mediaExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.mov', '.m4v']);
const videoExtensions = new Set(['.mp4', '.webm', '.mov', '.m4v']);

function slugify(value) {
  return String(value || 'vehicle')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 70) || 'vehicle';
}

function keyFor(vehicle, index) {
  return vehicle.mediaKey || `${String(index + 1).padStart(3, '0')}-${slugify(vehicle.name)}`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function toRelative(filePath) {
  return `./${path.relative(root, filePath).replace(/\\/g, '/')}`;
}

function walkMedia(dir) {
  if(!fs.existsSync(dir)) return [];

  const files = [];
  for(const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if(entry.isDirectory()) {
      files.push(...walkMedia(fullPath));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if(mediaExtensions.has(ext)) {
      files.push({
        type: videoExtensions.has(ext) ? 'video' : 'image',
        src: toRelative(fullPath)
      });
    }
  }
  return files.sort((a, b) => a.src.localeCompare(b.src));
}

function sourceFor(url) {
  if(!url) return null;
  try {
    const parsed = new URL(url);
    const ext = path.extname(parsed.pathname).toLowerCase();
    if(mediaExtensions.has(ext)) return { url, kind: 'media', ext };

    if(parsed.hostname.includes('dropbox.com')) {
      parsed.searchParams.set('dl', '1');
      return { url: parsed.toString(), kind: 'zip', ext: '.zip' };
    }
  } catch (_) {
    return null;
  }

  return null;
}

function extensionFromResponse(response, fallback = '.bin') {
  const type = response.headers.get('content-type') || '';
  if(type.includes('jpeg')) return '.jpg';
  if(type.includes('png')) return '.png';
  if(type.includes('webp')) return '.webp';
  if(type.includes('gif')) return '.gif';
  if(type.includes('mp4')) return '.mp4';
  if(type.includes('quicktime')) return '.mov';
  if(type.includes('zip')) return '.zip';
  return fallback;
}

async function downloadFile(source, dir, index) {
  const response = await fetch(source.url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(90000)
  });
  if(!response.ok) throw new Error(`HTTP ${response.status}`);

  const ext = extensionFromResponse(response, source.ext);
  const name = `${String(index + 1).padStart(2, '0')}-source${ext}`;
  const outPath = path.join(dir, name);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outPath, buffer);

  if(ext === '.zip') {
    const extractDir = path.join(dir, '_extracted');
    ensureDir(extractDir);
    try {
      execFileSync('powershell', ['-NoProfile', '-Command', `Expand-Archive -LiteralPath '${outPath.replace(/'/g, "''")}' -DestinationPath '${extractDir.replace(/'/g, "''")}' -Force`], { stdio: 'ignore' });
    } catch (error) {
      fs.writeFileSync(path.join(dir, 'download-warning.txt'), `Zip descargado, pero no se pudo extraer automaticamente: ${error.message}\n`);
    }
  }
}

async function main() {
  ensureDir(mediaRoot);

  let attempted = 0;
  for(const [index, yacht] of window.PRIME_YACHTS.entries()) {
    const key = keyFor(yacht, index);
    yacht.mediaKey = key;
    const dir = path.join(mediaRoot, key);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'source-url.txt'), `${yacht.photoLink || ''}\n`);

    if(shouldDownload && attempted < limit) {
      const source = sourceFor(yacht.photoLink);
      if(source && walkMedia(dir).length === 0) {
        attempted += 1;
        try {
          console.log(`downloading ${key}`);
          await downloadFile(source, dir, index);
          console.log(`downloaded ${key}`);
        } catch (error) {
          fs.writeFileSync(path.join(dir, 'download-error.txt'), `${error.message}\n`);
          console.log(`failed ${key}: ${error.message}`);
        }
      }
    }
  }

  fs.writeFileSync(
    catalogPath,
    `window.PRIME_YACHTS = ${JSON.stringify(window.PRIME_YACHTS, null, 2)};\n`
  );

  const manifest = {};
  for(const [index, yacht] of window.PRIME_YACHTS.entries()) {
    const key = keyFor(yacht, index);
    const items = walkMedia(path.join(mediaRoot, key));
    if(items.length) manifest[key] = items;
  }

  fs.writeFileSync(
    manifestPath,
    `window.PRIME_MEDIA = ${JSON.stringify(manifest, null, 2)};\n`
  );

  console.log(`folders=${window.PRIME_YACHTS.length}`);
  console.log(`manifestItems=${Object.values(manifest).reduce((sum, items) => sum + items.length, 0)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
