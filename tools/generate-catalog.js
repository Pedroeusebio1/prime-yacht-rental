const fs = require('fs');

const rawPath = process.argv[2];
const outPath = process.argv[3] || 'catalog-data.js';

if (!rawPath) {
  throw new Error('Usage: node tools/generate-catalog.js <raw-catalog-path> [out-path]');
}

let raw = fs.readFileSync(rawPath, 'utf8')
  .replace(/\r/g, '')
  .replace(/\[[^\]]+\]\s*Javier:\s*/g, '')
  .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
  .replace(/⸻|—————————|____+|“”/g, '\n')
  .replace(/\u2028/g, '\n');

const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean);
const headingHints = /(\b\d{2,3}\s*(?:ft|FT|Ft|’|'|”|\u2019)\b|\b\d{2,3}FT\b|Azimut|Sunseeker|Sea Ray|Sundancer|Monterrey|Regal|Cranchi|Fjord|Formula|Pardo|Saxdor|Marquis|Meridian|Galeon|Princess|Viking|Predator|Pershing|Catamaran|Vandutch|Prestige|Supremes|Absolute|Dominator|Maiora|Tycoon|Broward|Wally|Compass|Sirena|Bearpaw|Acqua|Bonus Round|Wellcraft|Maxum|Tempest|Cigarette|Schaefer|Barletta|Rinker|Axopar|Doral|Warrior|Jasmin|Monaco|EverBlue|Finstar|Money Waves|Salt Shaker|A-Yacht|Del Mar|Infinity|Hostage)/i;
const rateLike = /(hours?|hrs?|horas?|hr)\b.*\$|\$.*\b(hours?|hrs?|horas?|hr)\b|^\$?\d[\d,.]*\s*(?:4|5|6|8)?\s*(?:hours?|hrs?|horas?|hr)\b/i;
const junkHeading = /^(prices?|pricing|included|pictures?|photos?|calendar|location|departure|pickup|broker pricing|rates|weekday|weekend|monday|friday|saturday|sunday|mon|fri|sat|sun|plus|deposit|required|take|from|tip|gratuity|captain|gasoline|water|cooler|toys|available|dm to book|allweekend|whole sale|wholesale|charter rates|times|markets|stocks|jems|sane marina|francesco)/i;
const urlRe = /(https?:\/\/[^\s)]+)/g;

function isHeading(line) {
  if (line.length < 4 || line.length > 95) return false;
  if (junkHeading.test(line)) return false;
  if (/^https?:\/\//i.test(line)) return false;
  if (rateLike.test(line)) return false;
  if (/^\d+\s*(?:hours?|hrs?|horas?|h)\b/i.test(line)) return false;
  return headingHints.test(line);
}

function cleanTitle(title) {
  return title
    .replace(/^[-*\s]+/, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+-\s+13\s+(?:people|guests).*$/i, '')
    .replace(/\s+13\s+(?:people|max|guests).*$/i, '')
    .replace(/\s+available.*$/i, '')
    .trim();
}

function feetFrom(text) {
  const match = text.match(/(\d{2,3})\s*(?:ft|FT|Ft|’|'|”|\u2019)/i);
  return match ? Number(match[1]) : 40;
}

function category(feet) {
  if (feet <= 38) return ['Pequeno', '26 a 38 pies'];
  if (feet <= 58) return ['Mediano', '40 a 58 pies'];
  if (feet <= 88) return ['Grande', '60 a 88 pies'];
  return ['Premium', '90 pies o mas'];
}

function passengers(text) {
  const match = text.match(/(?:max(?:imum)?\s*)?(\d{1,2})\s*(?:guests?|people|ppl|pasajeros?)/i)
    || text.match(/capacity:\s*(\d{1,2})/i);
  return match ? Number(match[1]) : 13;
}

function location(text) {
  const match = text.match(/(?:departure|location|pick\s*up location|pickup|from)\s*[:-]?\s*([^\n]+)/i);
  if (match) return match[1].replace(/[|].*/, '').trim();
  if (/miami river/i.test(text)) return 'Miami River';
  if (/venetian marina/i.test(text)) return 'Venetian Marina';
  if (/bayside/i.test(text)) return 'Bayside / Downtown Miami';
  if (/haulover|halouver/i.test(text)) return 'Haulover';
  return 'Miami, FL';
}

function rates(text) {
  const rateLines = text
    .split('\n')
    .filter((line) => /\$|\b\d+[,.]?\d*\s*k\b|\d+\s*(?:usd|\/\s*hr|per hour)/i.test(line) && !/^https?:\/\//i.test(line))
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  if (!rateLines.length) return 'Precio desde $300 USD. Tarifas sujetas a horario y disponibilidad.';
  return rateLines.slice(0, 12).join(' | ');
}

function firstPrice(rateText) {
  const match = rateText.match(/\$\s*([\d,.]+)/)
    || rateText.match(/\b(\d+(?:\.\d+)?)\s*k\b/i)
    || rateText.match(/\b(\d{3,5})\s*(?:usd|\/\s*hr|per hour)/i);

  if (!match) return '$300';
  if (/k\b/i.test(match[0])) return `$${Math.round(Number(match[1]) * 1000)}`;
  return `$${match[1].replace(/\.00$/, '')}`;
}

function priceLabel(rateText) {
  const match = rateText.match(/(\d+)\s*(?:hours?|hrs?|horas?|h)\b/i);
  return match ? `${match[1]} horas` : 'desde';
}

function notes(text, urls) {
  const bits = [];
  if (/gratuity|tip/i.test(text)) bits.push('Gratuidad/tip segun nota del operador.');
  if (/captain/i.test(text)) bits.push('Incluye capitan cuando se indica en el catalogo.');
  if (/water toys|floating mat|cooler|ice|gasoline|fuel|jacuzzi|slide|pool|trampoline|bbq/i.test(text)) {
    bits.push('Extras indicados en la ficha original disponibles segun reserva.');
  }
  if (urls.length) bits.push('Fotos disponibles en el boton Ver mas fotos.');
  return bits.join(' ') || 'Ficha actualizada desde el catalogo del cliente. Confirmar disponibilidad antes de reservar.';
}

const blocks = [];
let current = null;

for (const line of lines) {
  if (isHeading(line)) {
    if (current) blocks.push(current);
    current = { title: line, lines: [line] };
  } else if (current) {
    current.lines.push(line);
  }
}

if (current) blocks.push(current);

const seen = new Set();
const yachts = [];

for (const block of blocks) {
  const name = cleanTitle(block.title);
  const key = name.toLowerCase();
  if (!name || seen.has(key)) continue;

  seen.add(key);
  const text = block.lines.join('\n');
  const urls = [...text.matchAll(urlRe)].map((match) => match[1].replace(/[.,]+$/, ''));
  const feet = feetFrom(`${name}\n${text}`);
  const [size, sizeLabel] = category(feet);
  const rateText = rates(text);

  yachts.push({
    name,
    feet,
    size,
    sizeLabel,
    passengers: passengers(text),
    location: location(text),
    rates: rateText,
    price: firstPrice(rateText),
    priceLabel: priceLabel(rateText),
    photoLink: urls[0] || '',
    image: '',
    notes: notes(text, urls),
    description: text.replace(urlRe, '').replace(/\n{2,}/g, '\n').slice(0, 1600)
  });
}

fs.writeFileSync(outPath, `window.PRIME_YACHTS = ${JSON.stringify(yachts, null, 2)};\n`, 'utf8');
console.log(`Created ${yachts.length} catalog entries at ${outPath}`);
