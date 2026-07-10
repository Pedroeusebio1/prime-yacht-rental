global.window = global;

const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'catalog-data.js');

require(catalogPath);

function cleanKeyword(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function typeKeywords(yacht) {
  const name = cleanKeyword(yacht.name);

  if (/tritoon|catamaran/.test(name)) return 'catamaran boat ocean';
  if (/wellcraft|sundeck|rinker|legacy|nx|axopar|fjord|pardo|saxdor|cigarette/.test(name)) return 'sport boat miami water';
  if (/sunseeker/.test(name)) return `${name} yacht miami`;
  if (/azimut/.test(name)) return `${name} yacht miami`;
  if (/sea ray|sundancer/.test(name)) return `${name} yacht miami`;
  if (/regal/.test(name)) return `${name} yacht miami`;
  if (/cranchi/.test(name)) return `${name} yacht miami`;
  if (/pershing|predator/.test(name)) return `${name} luxury yacht miami`;
  if (/galeon|marquis|meridian|viking|princess|prestige|fairline/.test(name)) return `${name} luxury motor yacht miami`;
  if (/jacuzzi|dominator|maiora|wally|broward|custom line|superyacht|tycoon|infinity/.test(name)) return `${name} superyacht miami ocean`;

  if (yacht.size === 'Pequeno') return 'small sport boat miami water';
  if (yacht.size === 'Grande') return 'large luxury yacht miami';
  if (yacht.size === 'Premium') return 'superyacht miami ocean';
  return 'motor yacht miami water';
}

window.PRIME_YACHTS.forEach((yacht, index) => {
  const name = cleanKeyword(yacht.name) || `${yacht.feet || ''}ft yacht`;
  const keywords = encodeURIComponent(`${name} ${typeKeywords(yacht)} ${yacht.feet || ''}ft boat yacht miami ${index + 1}`);
  yacht.image = `https://tse1.mm.bing.net/th?q=${keywords}&w=900&h=650&c=7&rs=1&p=0&o=5&pid=1.7`;
});

fs.writeFileSync(
  catalogPath,
  `window.PRIME_YACHTS = ${JSON.stringify(window.PRIME_YACHTS, null, 2)};\n`
);
