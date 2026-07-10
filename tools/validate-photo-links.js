global.window = global;

const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'catalog-data.js');
require(catalogPath);

function isBingLink(url) {
  return /bing\.com\/images|tse\d*\.mm\.bing\.net/i.test(String(url || ''));
}

async function checkLink(url) {
  if(!url || isBingLink(url)) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal
    });

    if(response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        redirect: 'follow',
        signal: controller.signal
      });
    }

    return response.status >= 200 && response.status < 400;
  } catch (_) {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  let ok = 0;
  let hidden = 0;

  for(const yacht of window.PRIME_YACHTS) {
    yacht.photoLinkOk = await checkLink(yacht.photoLink);
    if(yacht.photoLinkOk) ok += 1;
    else hidden += 1;
  }

  fs.writeFileSync(
    catalogPath,
    `window.PRIME_YACHTS = ${JSON.stringify(window.PRIME_YACHTS, null, 2)};\n`
  );

  console.log(`usable=${ok}`);
  console.log(`hidden=${hidden}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
