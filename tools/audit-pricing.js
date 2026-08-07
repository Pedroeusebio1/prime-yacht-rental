global.window = global;
require('../catalog-data.js');

function amount(value) {
  const match = String(value || '').match(/\$\s*([\d,]+)/);
  return match ? Number(match[1].replace(/,/g, '')) : null;
}

const yachts = global.PRIME_YACHTS || [];
const invalid = yachts.filter((yacht) => {
  if (!Array.isArray(yacht.priceTable) || !yacht.priceTable.length) return true;
  const prices = yacht.priceTable.map((row) => amount(row.value)).filter(Number.isFinite);
  return !prices.length || amount(yacht.price) !== Math.min(...prices);
});
const estimated = yachts.filter((yacht) => yacht.priceTable.some((row) => row.estimated));

console.log(`total=${yachts.length}`);
console.log(`completeTables=${yachts.length - invalid.length}`);
console.log(`estimatedFallbacks=${estimated.length}`);
console.log(`invalid=${invalid.length}`);
if (invalid.length) {
  console.log(invalid.map((yacht) => yacht.name).join('\n'));
  process.exitCode = 1;
}
