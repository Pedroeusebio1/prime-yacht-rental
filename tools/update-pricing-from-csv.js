const fs = require('fs');
const path = require('path');

const csvPath = process.argv[2];
const shouldApply = process.argv.includes('--apply');
const sqlOutputArg = process.argv.find((argument) => argument.startsWith('--sql-output='));
const sqlOutputPath = sqlOutputArg ? sqlOutputArg.slice('--sql-output='.length) : '';
const verifySqlOutputArg = process.argv.find((argument) => argument.startsWith('--verify-sql-output='));
const verifySqlOutputPath = verifySqlOutputArg ? verifySqlOutputArg.slice('--verify-sql-output='.length) : '';

if (!csvPath) {
  console.error('Usage: node tools/update-pricing-from-csv.js <tarifario.csv> [--apply]');
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value.replace(/\r$/, ''));
    rows.push(row);
  }

  const [headers, ...data] = rows;
  return data
    .filter((values) => values.some((cell) => cell.trim()))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header.trim(), (values[index] || '').trim()])));
}

function normalizeName(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseAmount(value) {
  if (!String(value || '').trim()) return null;
  const amount = Number(String(value).replace(/[$,\s]/g, ''));
  return Number.isFinite(amount) ? amount : null;
}

function money(amount) {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const durationColumns = [
  ['2hr', '2 horas'],
  ['3hr', '3 horas'],
  ['4hr', '4 horas'],
  ['5hr', '5 horas'],
  ['6hr', '6 horas'],
  ['7hr', '7 horas'],
  ['8hr', '8 horas'],
  ['12hr', '12 horas']
];

const aliases = new Map([
  [normalizeName('36ft 2024 NX'), normalizeName('36ft 2024 NX - 12 people (Miami Beach Marina)')],
  [normalizeName('65FT VIKING FLYBRIDGE'), normalizeName('65FT VIKING')],
  [normalizeName('68ft Luxury Azimut - 13 People (Regal Marina)'), normalizeName('42FT REGAL')]
]);

const catalogPath = path.resolve(__dirname, '..', 'catalog-data.js');
global.window = global;
require(catalogPath);

const yachts = global.PRIME_YACHTS || [];
const sheetRows = parseCsv(fs.readFileSync(path.resolve(csvPath), 'utf8'));
const catalogByName = new Map(yachts.map((yacht, index) => [normalizeName(yacht.name), { yacht, index }]));
const matchedCatalogIndexes = new Set();
const unmatchedSheet = [];
const blankPricing = [];
const staticPricingMismatches = [];
let updated = 0;
const updates = [];

for (const row of sheetRows) {
  const sheetName = row.Bote;
  const sheetKey = normalizeName(sheetName);
  const catalogKey = aliases.get(sheetKey) || sheetKey;
  const match = catalogByName.get(catalogKey);

  if (!match) {
    unmatchedSheet.push(sheetName);
    continue;
  }

  if (matchedCatalogIndexes.has(match.index)) {
    throw new Error(`Multiple spreadsheet rows matched catalog boat: ${match.yacht.name}`);
  }
  matchedCatalogIndexes.add(match.index);

  const priceTable = durationColumns.flatMap(([column, label]) => {
    const amount = parseAmount(row[column]);
    return amount === null ? [] : [{ label, value: money(amount) }];
  });

  if (!priceTable.length) {
    blankPricing.push(match.yacht.name);
    continue;
  }

  const lowest = Math.min(...priceTable.map((priceRow) => parseAmount(priceRow.value)));
  const nextPricing = {
    rates: priceTable.map((priceRow) => `${priceRow.label}: ${priceRow.value}`).join(' | '),
    price: money(lowest),
    priceLabel: 'precio desde',
    priceTable
  };
  const currentPricing = {
    rates: match.yacht.rates,
    price: match.yacht.price,
    priceLabel: match.yacht.priceLabel,
    priceTable: match.yacht.priceTable
  };
  if (JSON.stringify(currentPricing) !== JSON.stringify(nextPricing)) {
    staticPricingMismatches.push(match.yacht.name);
  }
  Object.assign(match.yacht, nextPricing);
  updates.push({
    mediaKey: match.yacht.mediaKey,
    price: match.yacht.price,
    priceLabel: match.yacht.priceLabel,
    priceTable: match.yacht.priceTable,
    rates: match.yacht.rates
  });
  updated += 1;
}

const unmatchedCatalog = yachts
  .filter((_, index) => !matchedCatalogIndexes.has(index))
  .map((yacht) => yacht.name);

console.log(`sheetRows=${sheetRows.length}`);
console.log(`matched=${matchedCatalogIndexes.size}`);
console.log(`priced=${updated}`);
console.log(`blankPricing=${blankPricing.length}`);
console.log(`unmatchedSheet=${unmatchedSheet.length}`);
console.log(`unmatchedCatalog=${unmatchedCatalog.length}`);
console.log(`staticPricingMismatches=${staticPricingMismatches.length}`);
if (blankPricing.length) console.log(`blankPricingNames=${blankPricing.join(' | ')}`);
if (unmatchedSheet.length) console.log(`unmatchedSheetNames=${unmatchedSheet.join(' | ')}`);
if (unmatchedCatalog.length) console.log(`unmatchedCatalogNames=${unmatchedCatalog.join(' | ')}`);
if (staticPricingMismatches.length) console.log(`staticPricingMismatchNames=${staticPricingMismatches.join(' | ')}`);

if (unmatchedSheet.length) process.exitCode = 1;
if (shouldApply && !unmatchedSheet.length) {
  fs.writeFileSync(catalogPath, `window.PRIME_YACHTS = ${JSON.stringify(yachts, null, 2)};\n`, 'utf8');
  console.log(`Updated ${updated} boat price tables in ${catalogPath}`);
}

if (sqlOutputPath && !unmatchedSheet.length) {
  const values = updates.map((update) => `(
    ${sqlLiteral(update.mediaKey)},
    ${sqlLiteral(update.price)},
    ${sqlLiteral(update.priceLabel)},
    ${sqlLiteral(update.rates)},
    ${sqlLiteral(JSON.stringify(update.priceTable))}::jsonb
  )`).join(',\n');
  const sql = `begin;
with tariff(card_key, price, price_label, rates, price_table) as (
  values
${values}
)
update public.prime_catalog_overrides as catalog
set changes = (catalog.changes - 'ratesEn' - 'priceLabelEn')
  || jsonb_build_object(
    'price', tariff.price,
    'priceLabel', tariff.price_label,
    'rates', tariff.rates,
    'priceTable', tariff.price_table
  )
from tariff
where catalog.card_key = tariff.card_key;

do $$
declare
  expected_count integer := ${updates.length};
  actual_count integer;
begin
  select count(*) into actual_count
  from public.prime_catalog_overrides as catalog
  where catalog.card_key in (${updates.map((update) => sqlLiteral(update.mediaKey)).join(', ')});
  if actual_count <> expected_count then
    raise exception 'Expected % matching catalog rows, found %', expected_count, actual_count;
  end if;
end $$;
commit;
`;
  fs.writeFileSync(path.resolve(sqlOutputPath), sql, 'utf8');
  console.log(`Wrote Supabase pricing update SQL to ${path.resolve(sqlOutputPath)}`);
}

if (verifySqlOutputPath && !unmatchedSheet.length) {
  const values = updates.map((update) => `(
    ${sqlLiteral(update.mediaKey)},
    ${sqlLiteral(update.price)},
    ${sqlLiteral(update.priceLabel)},
    ${sqlLiteral(update.rates)},
    ${sqlLiteral(JSON.stringify(update.priceTable))}::jsonb
  )`).join(',\n');
  const sql = `with tariff(card_key, price, price_label, rates, price_table) as (
  values
${values}
), comparison as (
  select
    tariff.card_key,
    catalog.card_key is not null as matched,
    catalog.deleted,
    catalog.changes ->> 'price' is not distinct from tariff.price
      and catalog.changes ->> 'priceLabel' is not distinct from tariff.price_label
      and catalog.changes ->> 'rates' is not distinct from tariff.rates
      and catalog.changes -> 'priceTable' is not distinct from tariff.price_table
      and not (catalog.changes ? 'ratesEn')
      and not (catalog.changes ? 'priceLabelEn') as pricing_matches
  from tariff
  left join public.prime_catalog_overrides as catalog using (card_key)
)
select
  count(*) as expected,
  count(*) filter (where matched) as matched,
  count(*) filter (where deleted) as deleted,
  count(*) filter (where pricing_matches) as pricing_matches,
  coalesce(jsonb_agg(card_key order by card_key) filter (where not matched or not pricing_matches), '[]'::jsonb) as mismatches
from comparison;
`;
  fs.writeFileSync(path.resolve(verifySqlOutputPath), sql, 'utf8');
  console.log(`Wrote Supabase verification SQL to ${path.resolve(verifySqlOutputPath)}`);
}
