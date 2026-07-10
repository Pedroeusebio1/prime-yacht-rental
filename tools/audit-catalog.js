global.window = global;
require('../catalog-data.js');

const yachts = global.PRIME_YACHTS || [];
console.log(`total=${yachts.length}`);
console.log(`withoutPhotoLink=${yachts.filter((yacht) => !yacht.photoLink).length}`);
console.log(`withDirectImage=${yachts.filter((yacht) => yacht.image).length}`);

yachts.forEach((yacht, index) => {
  console.log(`${index + 1}. ${yacht.name} | ${yacht.feet || ''}FT | ${yacht.photoLink ? 'link' : 'NO LINK'} | image=${yacht.image || ''}`);
});
