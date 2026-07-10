global.window = global;

const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'catalog-data.js');

require(catalogPath);

const imageBySize = {
  Pequeno: './assets/catalog-fallbacks/small-boat.png',
  Mediano: './assets/catalog-fallbacks/motor-yacht.png',
  Grande: './assets/catalog-fallbacks/superyacht.png',
  Premium: './assets/catalog-fallbacks/superyacht.png'
};

window.PRIME_YACHTS.forEach((yacht) => {
  yacht.image = imageBySize[yacht.size] || imageBySize.Mediano;
});

fs.writeFileSync(
  catalogPath,
  `window.PRIME_YACHTS = ${JSON.stringify(window.PRIME_YACHTS, null, 2)};\n`
);
