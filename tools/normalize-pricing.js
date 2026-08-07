const fs = require('fs');

global.window = global;
require('../catalog-data.js');

const yachts = global.PRIME_YACHTS || [];

function moneyNumber(value) {
  const match = String(value || '').match(/\$\s*([\d,.]+)|\b(\d+(?:\.\d+)?)\s*k\b/i);
  if (!match) return null;
  if (match[2]) return Math.round(Number(match[2]) * 1000);
  return Number(match[1].replace(/,/g, ''));
}

function money(value) {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

function fallbackTable(feet) {
  if (feet <= 50) return [
    { label: '4 horas', value: '$150 – $200', min: 150, estimated: true },
    { label: '6 horas', value: '$200 – $300', min: 200, estimated: true },
    { label: '8 horas', value: '$300 – $450', min: 300, estimated: true }
  ];
  if (feet <= 75) return [
    { label: '4 horas', value: '$200 – $300', min: 200, estimated: true },
    { label: '6 horas', value: '$300 – $450', min: 300, estimated: true },
    { label: '8 horas', value: '$450 – $1,050', min: 450, estimated: true }
  ];
  return [
    { label: '4 horas', value: '$400 – $650', min: 400, estimated: true },
    { label: '6 horas', value: '$450 – $1,050', min: 450, estimated: true },
    { label: '8 horas', value: '$850 – $1,550', min: 850, estimated: true }
  ];
}

function durationLabel(line) {
  if (/per\s*hour|\/\s*hr|por\s*hora/i.test(line)) return 'Por hora';
  const match = line.match(/(\d+)\s*(?:hours?|hrs?|horas?|h)\b/i);
  return match ? `${match[1]} horas` : '';
}

function conditionLabel(line) {
  const clean = line
    .replace(/\$\s*[\d,.]+(?:\s*[–-]\s*\$?\s*[\d,.]+)?/g, '')
    .replace(/\b\d+(?:\.\d+)?\s*k\b/gi, '')
    .replace(/\b\d+\s*(?:hours?|hrs?|horas?|h)\b/gi, '')
    .replace(/[:|–—-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (/mon|monday|lunes|thur|jueves|weekday|laborable/i.test(clean)) return 'Lun–Jue';
  if (/fri|friday|viernes|sun|sunday|domingo/i.test(clean)) return 'Vie/Dom';
  if (/sat|saturday|sábado|sabado/i.test(clean)) return 'Sábado';
  if (/weekend|fin de semana/i.test(clean)) return 'Fin de semana';
  return '';
}

function extractTable(yacht) {
  if (Array.isArray(yacht.priceTable) && yacht.priceTable.length && yacht.priceTable.every((row) => row.estimated)) {
    return fallbackTable(Number(yacht.feet) || 40);
  }
  if (/Tarifas sujetas a horario|Precio desde \$300 USD/i.test(String(yacht.rates || ''))) {
    return fallbackTable(Number(yacht.feet) || 40);
  }
  const source = String(yacht.rates || '').split('|').map((line) => line.trim()).filter(Boolean);
  const rows = [];

  for (const line of source) {
    if (/deposit|dep[oó]sito|tip|gratuity|propina|extra|slide|pool|trampoline|jungle|security/i.test(line)) continue;
    const amount = moneyNumber(line);
    if (amount === null) continue;
    const duration = durationLabel(line);
    if (!duration && source.length > 1) continue;
    const condition = conditionLabel(line);
    const label = [duration || 'Tarifa base', condition].filter(Boolean).join(' · ');
    const rangeMatch = line.match(/\$\s*[\d,.]+\s*[–-]\s*\$?\s*[\d,.]+/);
    const value = rangeMatch ? rangeMatch[0].replace(/\s*-\s*/, ' – ') : money(amount);
    const key = `${label.toLowerCase()}|${value}`;
    if (!rows.some((row) => row.key === key)) rows.push({ label, value, min: amount, key });
  }

  if (!rows.length) return fallbackTable(Number(yacht.feet) || 40);
  return rows.map(({ key, ...row }) => row);
}

for (const yacht of yachts) {
  const priceTable = extractTable(yacht);
  const lowest = Math.min(...priceTable.map((row) => row.min));
  yacht.priceTable = priceTable.map(({ min, ...row }) => row);
  yacht.price = money(lowest);
  yacht.priceLabel = priceTable.every((row) => row.estimated) ? 'desde · tarifa estimada' : 'precio desde';
  if (priceTable.every((row) => row.estimated)) {
    yacht.rates = priceTable.map((row) => `${row.label}: ${row.value}`).join(' | ');
  }
}

fs.writeFileSync('catalog-data.js', `window.PRIME_YACHTS = ${JSON.stringify(yachts, null, 2)};\n`, 'utf8');
console.log(`Normalized pricing for ${yachts.length} vessels.`);
