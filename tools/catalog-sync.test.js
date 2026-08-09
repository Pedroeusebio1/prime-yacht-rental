'use strict';

const assert = require('node:assert/strict');
const store = require('../catalog-sync.js');

function mockResponse(payload, status = 200){
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => payload === null ? '' : JSON.stringify(payload)
  };
}

async function run(){
  const sanitized = store.sanitizeChanges({
    name: '<script>alert(1)</script>',
    price: '$999',
    feet: 999,
    passengers: '12',
    image: 'javascript:alert(1)',
    coverImage: './assets/boat.jpg',
    photoLink: 'http://insecure.example.com',
    imageFit: 'contain',
    imagePosition: 'right center',
    imageBackground: 'dark',
    detailImageFit: 'contain',
    detailImagePosition: 'center top',
    detailImageBackground: 'cream',
    unknown: 'ignored',
    __proto__: { polluted: true },
    priceTable: [
      { label: '4 horas', labelEn: '4 hours', value: '$650' },
      { label: '', labelEn: '', value: '' }
    ]
  });

  assert.equal(sanitized.name, '<script>alert(1)</script>');
  assert.equal(sanitized.price, '$650');
  assert.equal(sanitized.feet, 200);
  assert.equal(sanitized.passengers, 12);
  assert.equal(sanitized.image, '');
  assert.equal(sanitized.coverImage, './assets/boat.jpg');
  assert.equal(sanitized.photoLink, '');
  assert.equal(sanitized.imageFit, 'contain');
  assert.equal(sanitized.imagePosition, 'right center');
  assert.equal(sanitized.imageBackground, 'dark');
  assert.equal(sanitized.detailImageFit, 'contain');
  assert.equal(sanitized.detailImagePosition, 'center top');
  assert.equal(sanitized.detailImageBackground, 'cream');
  assert.equal(Object.prototype.hasOwnProperty.call(sanitized, 'unknown'), false);
  assert.equal({}.polluted, undefined);
  assert.deepEqual(sanitized.priceTable, [{ label: '4 horas', labelEn: '4 hours', value: '$650' }]);

  assert.equal(store.sanitizeChanges({
    price: '$2',
    priceTable: [{ label: '1 hora · 2 pasajeros', value: '2 riders · $145' }]
  }).price, '$145');
  assert.equal(store.sanitizeChanges({
    price: '$9,999',
    priceTable: [{ label: 'Tarifa compacta', value: '$1.5k' }]
  }).price, '$1,500');
  assert.deepEqual(store.sanitizeChanges({
    image: 'https://tse1.mm.bing.net/th?q=yacht',
    coverImage: 'https://www.bing.com/images/search?q=yacht'
  }), { image: '', coverImage: '' });
  assert.deepEqual(store.sanitizeChanges({
    image: 'https://images.example.com/yacht.jpg',
    coverImage: './assets/covers/yacht.jpg'
  }), {
    image: 'https://images.example.com/yacht.jpg',
    coverImage: './assets/covers/yacht.jpg'
  });

  const calls = [];
  const responses = [
    mockResponse([
      { card_key: 'yacht-001', changes: { name: 'Nuevo nombre', image: 'data:text/html,test' }, deleted: false, updated_at: '2026-08-08T00:00:00Z' },
      { card_key: '__proto__', changes: { name: 'No' }, deleted: false }
    ]),
    mockResponse({
      access_token: 'user-access-token',
      refresh_token: 'user-refresh-token',
      expires_in: 3600,
      user: { email: store.adminEmail }
    }),
    mockResponse([
      { card_key: 'yacht-001', changes: { name: 'Guardado', imageFit: 'cover' }, deleted: false, updated_at: '2026-08-08T00:01:00Z' }
    ]),
    mockResponse([]),
    mockResponse(null, 204)
  ];
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    return responses.shift();
  };

  const state = await store.load();
  assert.equal(state['yacht-001'].changes.name, 'Nuevo nombre');
  assert.equal(state['yacht-001'].changes.image, '');
  assert.equal(Object.prototype.hasOwnProperty.call(state, '__proto__'), false);
  assert.match(calls[0].url, /prime_catalog_overrides/);
  assert.ok(calls[0].options.headers.apikey.startsWith('sb_publishable_'));
  assert.equal(calls[0].options.headers.Authorization, undefined);
  assert.equal(store.completeInvite, undefined);
  assert.equal(store.hasPendingInvite, undefined);

  await assert.rejects(
    () => store.signIn('short'),
    (error) => error.code === 'weak_password'
  );
  assert.equal(calls.length, 1);

  await store.signIn('password123');
  const signInBody = JSON.parse(calls[1].options.body);
  assert.deepEqual(signInBody, { email: store.adminEmail, password: 'password123' });
  const row = await store.save('yacht-001', { name: 'Guardado', imageFit: 'cover', injected: true });
  assert.equal(row.changes.name, 'Guardado');
  assert.equal(calls[2].options.headers.Authorization, 'Bearer user-access-token');
  assert.match(calls[2].url, /rpc\/save_prime_catalog_override/);
  const savedBody = JSON.parse(calls[2].options.body);
  assert.deepEqual(savedBody.p_changes, { name: 'Guardado', imageFit: 'cover' });
  assert.equal(savedBody.p_expected_updated_at, null);

  await assert.rejects(
    () => store.save('yacht-001', { name: 'Conflicto' }, false, row.updatedAt),
    (error) => error.code === 'conflict' && error.status === 409
  );

  await store.signOut();
  assert.equal(store.isAuthenticated(), false);
  assert.equal(responses.length, 0);

  console.log('catalog-sync tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
