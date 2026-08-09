global.window = global;

const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'catalog-data.js');

require(catalogPath);

const bingUrl = /(?:^|\/\/)(?:[^/]+\.)?bing\.(?:com|net)(?:[/:?#]|$)/i;
let cleaned = 0;
window.PRIME_YACHTS.forEach((yacht) => {
  ['image', 'coverImage'].forEach((field) => {
    if(!bingUrl.test(String(yacht[field] || ''))) return;
    delete yacht[field];
    cleaned += 1;
  });
});

fs.writeFileSync(
  catalogPath,
  `window.PRIME_YACHTS = ${JSON.stringify(window.PRIME_YACHTS, null, 2)};\n`
);

console.log(`Removed ${cleaned} Bing cover URL${cleaned === 1 ? '' : 's'}.`);
