
(function(){
  const translations = {
    es: {},
    en: {
      'language.label': 'Select language',
      'nav.destinations': 'Destinations', 'nav.deals': 'Deals', 'nav.contact': 'Contact', 'nav.book': 'Book Now',
      'hero.eyebrow': 'Miami, FL & Dominican Republic',
      'hero.title': 'Experience luxury on the <em>sea</em>, without borders',
      'hero.lead': 'Prime Yacht Rental offers an exclusive fleet of yachts, boats, jet skis and ATVs in Miami and the Dominican Republic. Private charters, captain included, and five-star service for every occasion.',
      'hero.priceFrom': 'Starting at',
      'hero.viewFleet': 'View Yachts & Boats', 'hero.quote': 'Personalized Quote',
      'stats.vessels': 'Vessels', 'stats.countries': 'Countries', 'stats.days': 'Days a week', 'stats.largest': 'Largest yacht',
      'locations.eyebrow': 'Two coasts, one exceptional brand',
      'locations.title': 'Set sail in <span class="accent">Miami</span> and the <span class="accent">Dominican Republic</span>',
      'locations.intro': 'One simple booking, two world-class destinations. Choose where you want to enjoy your Prime experience.',
      'locations.us': 'United States', 'locations.dr': 'Dominican Republic',
      'locations.miami': "Our flagship fleet: more than 70 vessels from 26' to 120', plus jet skis and ATVs, departing from the finest marinas along the Miami River, Venetian Islands, Miami Beach and Bill Bird Marina.",
      'locations.boca': 'Set sail for Catalina Island, Palmilla Beach and Saona Island. Perfect for private parties and family getaways, just minutes from Santo Domingo.',
      'locations.punta': "Cruise to Punta Cana's natural pool aboard a private yacht. Crystal-clear water, white sand and Prime service at every nautical mile.",
      'fleet.eyebrow': 'The Prime Fleet',
      'fleet.intro': 'Explore our selection of yachts and boats available in Miami and the Dominican Republic. Each rental includes a captain, fuel, ice and water, plus the extras shown on each listing.',
      'fleet.searchLabel': 'Search vessels', 'fleet.searchPlaceholder': 'Search by name, size, location or passengers…', 'fleet.search': 'Search', 'fleet.more': 'View More Vessels',
      'modal.capacity': 'Capacity', 'modal.location': 'Location', 'modal.rates': 'Rates', 'modal.extras': 'Extras', 'modal.photos': 'View more photos', 'modal.request': 'Request a Quote',
      'adventures.eyebrow': 'Off the water… and on it', 'adventures.title': '<span class="accent">Jet Ski & ATV</span> Adventures',
      'deals.title': '<span class="accent">Exclusive</span> Deals', 'deals.early': 'Start early and enjoy a special rate every day.',
      'deals.weekdayTitle': 'Weekdays', 'deals.weekday': 'Book 3 hours and enjoy the 4th on us.', 'deals.weekendTitle': 'Weekends', 'deals.weekend': 'Book 4 hours and enjoy the 5th on us.',
      'deals.sunday': 'Book 5 hours and pay for only 4.', 'deals.combos': 'Combine a yacht, jet ski, ATV or UTV in a private experience tailored to you.',
      'cta.title': 'Ready to set sail with <span class="accent">Prime</span>?', 'cta.text': 'Message us to create your ideal experience in Miami or the Dominican Republic. Fast response, no obligation.',
      'footer.about': 'Yacht, boat, jet ski and ATV rentals in Miami, FL and the Dominican Republic (Boca Chica, La Romana and Punta Cana). Live the Prime experience.',
      'footer.navigation': 'Navigation', 'footer.open': 'Open 7 days a week', 'footer.rights': '© 2026 Prime Yacht Rental. All rights reserved.'
    }
  };

  const spanish = new Map();
  document.querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-placeholder], [data-i18n-aria]').forEach((el) => {
    const key = el.dataset.i18n || el.dataset.i18nHtml || el.dataset.i18nPlaceholder || el.dataset.i18nAria;
    spanish.set(key, el.dataset.i18nHtml ? el.innerHTML : (el.dataset.i18nPlaceholder ? el.placeholder : (el.dataset.i18nAria ? el.getAttribute('aria-label') : el.textContent)));
  });

  function translate(key, fallback = '') {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
    return lang === 'en' ? (translations.en[key] || fallback) : (spanish.get(key) || fallback);
  }
  function applyLanguage(language, announce = true) {
    const lang = language === 'en' ? 'en' : 'es';
    document.documentElement.lang = lang;
    document.title = lang === 'en' ? 'Prime Yacht Rental — Miami & Dominican Republic' : 'Prime Yacht Rental — Miami & República Dominicana';
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = translate(el.dataset.i18n, el.textContent); });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = translate(el.dataset.i18nHtml, el.innerHTML); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = translate(el.dataset.i18nPlaceholder, el.placeholder); });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', translate(el.dataset.i18nAria, el.getAttribute('aria-label'))); });
    document.querySelectorAll('[data-language]').forEach((button) => {
      const active = button.dataset.language === lang;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    try { localStorage.setItem('prime-language', lang); } catch (_) {}
    if(announce) document.dispatchEvent(new CustomEvent('prime:languagechange', { detail: { language: lang } }));
  }
  window.PrimeI18n = { translate, applyLanguage, get language(){ return document.documentElement.lang; } };
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-language]');
    if(button) applyLanguage(button.dataset.language);
  });
  let saved = 'es';
  try { saved = localStorage.getItem('prime-language') || (navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es'); } catch (_) {}
  applyLanguage(saved, false);
})();

(function(){
  const slides = document.querySelectorAll('#heroBgTrack .hero-bg-slide');
  const dotsWrap = document.getElementById('heroDots');
  if(!slides.length || !dotsWrap) return;

  let current = 0;
  const total = slides.length;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ver imagen ${i + 1}`);
    if(i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll('button');

  function goTo(index){
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + total) % total;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next(){ goTo(current + 1); }

  setInterval(next, 5000);
})();

(function(){
  const header = document.querySelector('header');
  const samePageLinks = document.querySelectorAll('a[href^="#"]');

  samePageLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if(!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if(!target) return;

      event.preventDefault();
      const headerOffset = header ? header.offsetHeight + 22 : 96;
      const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: 'smooth'
      });

      history.pushState(null, '', targetId);
    });
  });
})();

(function(){
  const catalogGrid = document.getElementById('catalogGrid');
  const filterBar = document.getElementById('filterBar');
  const catalogSearch = document.getElementById('catalogSearch');
  const catalogSearchBtn = document.getElementById('catalogSearchBtn');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const adventuresGrid = document.getElementById('adventuresGrid');
  const statBoats = document.getElementById('statBoats');
  const heroStartingPrice = document.getElementById('heroStartingPrice');
  const modal = document.getElementById('yachtModal');
  const editorAccess = document.getElementById('editorAccess');
  const editorExitMode = document.getElementById('editorExitMode');
  const editorLoginModal = document.getElementById('editorLoginModal');
  const editorLoginForm = document.getElementById('editorLoginForm');
  const editorLoginFeedback = document.getElementById('editorLoginFeedback');
  const fleetEditor = document.getElementById('fleetEditor');
  const fleetEditorForm = document.getElementById('fleetEditorForm');
  const catalogStore = window.PrimeCatalogStore;

  if(!catalogGrid || !filterBar || !loadMoreBtn || !modal) return;

  const isEnglish = () => document.documentElement.lang === 'en';
  const ui = (es, en) => isEnglish() ? en : es;
  function englishLocation(value){
    return String(value || '')
      .replace(/Rep[uú]blica Dominicana/gi, 'Dominican Republic')
      .replace(/R[ií]o Miami/gi, 'Miami River')
      .replace(/y Biscayne Bay/gi, 'and Biscayne Bay')
      .replace(/Boca Chica, La Romana y Punta Cana/gi, 'Boca Chica, La Romana and Punta Cana');
  }
  function localizedLocation(value){ return isEnglish() ? englishLocation(value) : value; }
  function englishRate(value){
    return String(value || '')
      .replace(/(\d+)\s*horas?/gi, '$1 hours')
      .replace(/por hora/gi, 'per hour')
      .replace(/por tour/gi, 'per tour')
      .replace(/grupo privado/gi, 'private group')
      .replace(/seg[uú]n ruta/gi, 'based on route')
      .replace(/Lun\s*[–—-]\s*Jue/gi, 'Mon–Thu')
      .replace(/lunes a jueves/gi, 'Monday through Thursday')
      .replace(/D[ií]as laborables/gi, 'Weekdays')
      .replace(/Fin de semana/gi, 'Weekend')
      .replace(/Vie\/Dom/gi, 'Fri/Sun')
      .replace(/S[aá]bado/gi, 'Saturday')
      .replace(/S[aá]b(?=\b|[./\s]|$)/gi, 'Sat')
      .replace(/Dep[oó]sito requerido/gi, 'Required deposit')
      .replace(/Tarifa base/gi, 'Base rate')
      .replace(/Tarifas de fin de semana disponibles en la ficha/gi, 'Weekend rates available in the listing')
      .replace(/Precio desde/gi, 'Rates from')
      .replace(/Tarifas sujetas a horario y disponibilidad/gi, 'Rates subject to schedule and availability')
      .replace(/Cotizar/gi, 'Request quote');
  }
  function localizedRate(value){ return isEnglish() ? englishRate(value) : value; }

  const catalogThumbnails = window.PRIME_THUMBNAILS || {};
  const yachtFallbackImages = {
    Pequeno: './assets/catalog-fallbacks/small-boat.png',
    Mediano: './assets/catalog-fallbacks/motor-yacht.png',
    Grande: './assets/catalog-fallbacks/superyacht.png',
    Premium: './assets/catalog-fallbacks/superyacht.png'
  };
  function yachtStartingPrice(yacht){
    const tableAmounts = Array.isArray(yacht && yacht.priceTable)
      ? yacht.priceTable.map((row) => rateValueNumber(row && row.value)).filter(Number.isFinite)
      : [];
    if(tableAmounts.length) return Math.min(...tableAmounts);
    const listedPrice = rateValueNumber(yacht && yacht.price);
    return Number.isFinite(listedPrice) ? listedPrice : Number.POSITIVE_INFINITY;
  }
  function compareYachtPrices(a, b){
    const aPrice = yachtStartingPrice(a);
    const bPrice = yachtStartingPrice(b);
    if(aPrice === bPrice) return 0;
    return aPrice < bPrice ? -1 : 1;
  }
  function yachtsByStartingPrice(items){
    return items
      .map((yacht, sourceIndex) => ({ yacht, sourceIndex }))
      .sort((a, b) => compareYachtPrices(a.yacht, b.yacht) || a.sourceIndex - b.sourceIndex)
      .map((item) => item.yacht);
  }

  const legacyEditorStorageKey = 'prime-yacht-editor-v1';
  const legacyDeletedStorageKey = 'prime-yacht-deleted-v1';
  function yachtStorageKey(yacht){ return yacht.mediaKey || yacht.name; }
  function readLegacyEditorChanges(){
    try {
      const value = JSON.parse(localStorage.getItem(legacyEditorStorageKey) || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch (_) { return {}; }
  }
  function readLegacyDeletedYachts(){
    try {
      const deleted = JSON.parse(localStorage.getItem(legacyDeletedStorageKey) || '[]');
      return Array.isArray(deleted) ? deleted : [];
    } catch (_) { return []; }
  }
  function cloneVehicle(vehicle){
    return {
      ...vehicle,
      ...(Array.isArray(vehicle.priceTable)
        ? { priceTable: vehicle.priceTable.map((row) => ({ ...row })) }
        : {})
    };
  }
  function withStaticThumbnail(vehicle){
    const staticImage = catalogThumbnails[yachtStorageKey(vehicle)];
    return staticImage
      ? { ...vehicle, image: staticImage, coverImage: staticImage }
      : vehicle;
  }
  const deletedYachtKeys = new Set();
  const sourceYachts = Array.isArray(window.PRIME_YACHTS)
    ? window.PRIME_YACHTS.map(cloneVehicle).map(withStaticThumbnail)
    : [];
  const originalYachts = new Map(sourceYachts.map((yacht) => [yachtStorageKey(yacht), cloneVehicle(yacht)]));
  const yachts = sourceYachts.length ? yachtsByStartingPrice(sourceYachts.map(cloneVehicle)) : [];
  const catalogMedia = window.PRIME_MEDIA || {};

  const filters = [
    { key: 'Todos', label: 'Todos' },
    { key: 'Pequeno', label: '26-38 pies' },
    { key: 'Mediano', label: '40-58 pies' },
    { key: 'Grande', label: '60-88 pies' },
    { key: 'Premium', label: '90+ pies' }
  ];

  const sourceAdventures = [
    {
      name: 'Jet Ski Spark',
      category: 'Jet Ski',
      size: 'Acuatico',
      sizeLabel: 'Jet Ski',
      passengers: 2,
      location: 'Miami, FL',
      rates: '1 hora · 1 pasajero: $135 | 1 hora · 2 pasajeros: $145 | 1 hora · Paquete deluxe con video y fotos: $175',
      ratesEn: '1 hour · Single rider: $135 | 1 hour · Double rider: $145 | 1 hour · Deluxe video and photo package: $175',
      price: '$135',
      priceLabel: 'por hora',
      notes: 'Máximo 2 horas por reservación. El paquete deluxe incluye videos y fotografías.',
      notesEn: 'Maximum 2 hours per booking. The deluxe package includes videos and photos.',
      mediaKey: 'adventure-001-jet-ski-spark',
      image: './assets/catalog-fallbacks/jetski.png',
      imageTags: 'jet-ski,miami,water',
      fallback: './assets/hero/hero-02.gif'
    },
    {
      name: 'Jet Ski Premium',
      category: 'Jet Ski',
      size: 'Acuatico',
      sizeLabel: 'Jet Ski Premium',
      passengers: 2,
      location: 'Miami, FL',
      rates: '1 hora · 1 pasajero: $135 | 1 hora · 2 pasajeros: $145 | 1 hora · Paquete deluxe con video y fotos: $175',
      ratesEn: '1 hour · Single rider: $135 | 1 hour · Double rider: $145 | 1 hour · Deluxe video and photo package: $175',
      price: '$135',
      priceLabel: 'por hora',
      notes: 'Máximo 2 horas por reservación. El paquete deluxe incluye videos y fotografías.',
      notesEn: 'Maximum 2 hours per booking. The deluxe package includes videos and photos.',
      mediaKey: 'adventure-002-jet-ski-premium',
      image: './assets/catalog-fallbacks/jetski.png',
      imageTags: 'luxury-jet-ski,miami,water',
      fallback: './assets/hero/hero-03.gif'
    },
    {
      name: 'ATV Honda Rancher',
      category: 'ATV',
      size: 'Terrestre',
      sizeLabel: 'ATV',
      passengers: 1,
      location: 'Miami, FL',
      rates: '1 hora: $120',
      ratesEn: '1 hour: $120',
      price: '$120',
      priceLabel: '1 hora',
      notes: 'Experiencia en ATV disponible en Miami por reservación.',
      notesEn: 'ATV experience available in Miami by reservation.',
      mediaKey: 'adventure-003-atv-honda-rancher',
      imageTags: 'atv,beach,adventure',
      fallback: './assets/hero/hero-04.gif'
    },
    {
      name: 'UTV Honda Pioneer',
      category: 'UTV',
      size: 'Terrestre',
      sizeLabel: 'UTV',
      passengers: 4,
      location: 'Miami, FL',
      rates: '1 hora: $120',
      ratesEn: '1 hour: $120',
      price: '$120',
      priceLabel: '1 hora',
      notes: 'Experiencia terrestre disponible en Miami por reservación.',
      notesEn: 'Land adventure available in Miami by reservation.',
      mediaKey: 'adventure-004-utv-honda-pioneer',
      image: './assets/adventures/utv-honda-pioneer.png',
      imageTags: 'utv,miami,offroad,adventure',
      fallback: './assets/hero/hero-05.jpg'
    },
    {
      name: 'ATV Group Experience',
      category: 'ATV',
      size: 'Grupo',
      sizeLabel: 'Aventura grupal',
      passengers: 8,
      location: 'Miami, FL',
      rates: '1 hora: $120 por ATV',
      ratesEn: '1 hour: $120 per ATV',
      price: '$120',
      priceLabel: '1 hora · por ATV',
      notes: 'Experiencia para grupos disponible en Miami. El precio se calcula por cada ATV reservado.',
      notesEn: 'Group experience available in Miami. Pricing is calculated per reserved ATV.',
      mediaKey: 'adventure-005-atv-group-experience',
      image: 'https://resmark-production.s3.amazonaws.com/images/QeygN9/aa998b9b8f6e73b603e3a243d805461f5c0229db/original',
      imageTags: 'atv-tour,miami,adventure',
      fallback: './assets/hero/hero-03.gif'
    },
    {
      name: 'Jet Car Miami',
      category: 'Jet Car',
      size: 'Acuatico',
      sizeLabel: 'Jet Car',
      passengers: 2,
      location: 'Miami, FL',
      rates: '1 hora: $350 – $400',
      ratesEn: '1 hour: $350 – $400',
      price: '$350',
      priceLabel: '1 hora',
      notes: 'El precio final depende del modelo y la disponibilidad.',
      notesEn: 'Final price depends on the model and availability.',
      mediaKey: 'adventure-006-jet-car-miami',
      imageTags: 'jet-car,miami,water',
      fallback: './assets/hero/hero-03.gif'
    }
  ].map(withStaticThumbnail);
  const originalAdventures = new Map(sourceAdventures.map((adventure) => [yachtStorageKey(adventure), cloneVehicle(adventure)]));
  const adventures = sourceAdventures.map(cloneVehicle);
  const cloudCacheKey = 'prime-yacht-cloud-cache-v3';
  let cloudCatalogState = {};
  let cloudRefreshPromise = null;
  let lastCloudRefresh = 0;

  let activeFilter = 'Todos';
  let searchTerm = '';
  let visibleCount = 9;

  if(statBoats) statBoats.textContent = yachts.length;

  function escapeHTML(value){
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function knownCatalogKeys(){
    return new Set([
      ...sourceYachts.map(yachtStorageKey),
      ...sourceAdventures.map(yachtStorageKey)
    ]);
  }

  function cloudStateSignature(state){
    return JSON.stringify(Object.keys(state || {}).sort().map((key) => {
      const row = state[key] || {};
      return [key, row.deleted === true, row.updatedAt || '', row.changes || {}];
    }));
  }

  function applyCloudCatalogState(nextState){
    const knownKeys = knownCatalogKeys();
    const safeState = {};
    Object.entries(nextState || {}).forEach(([key, row]) => {
      if(!knownKeys.has(key) || !row || typeof row !== 'object') return;
      safeState[key] = {
        changes: catalogStore ? catalogStore.sanitizeChanges(row.changes) : {},
        deleted: row.deleted === true,
        updatedAt: String(row.updatedAt || '')
      };
    });

    const previousSignature = cloudStateSignature(cloudCatalogState);
    const nextSignature = cloudStateSignature(safeState);
    cloudCatalogState = safeState;
    if(previousSignature === nextSignature) return false;

    deletedYachtKeys.clear();
    Object.entries(safeState).forEach(([key, row]) => {
      if(row.deleted) deletedYachtKeys.add(key);
    });

    const nextYachts = sourceYachts.map((original, sourceIndex) => {
      const key = yachtStorageKey(original);
      if(deletedYachtKeys.has(key)) return null;
      return {
        vehicle: Object.assign(cloneVehicle(original), safeState[key] ? safeState[key].changes : {}),
        sourceIndex
      };
    }).filter(Boolean);
    nextYachts.sort((a, b) => {
      return compareYachtPrices(a.vehicle, b.vehicle) || a.sourceIndex - b.sourceIndex;
    });
    yachts.splice(0, yachts.length, ...nextYachts.map((item) => item.vehicle));

    const nextAdventures = sourceAdventures.map((original) => {
      const key = yachtStorageKey(original);
      if(deletedYachtKeys.has(key)) return null;
      return Object.assign(cloneVehicle(original), safeState[key] ? safeState[key].changes : {});
    }).filter(Boolean);
    adventures.splice(0, adventures.length, ...nextAdventures);

    visibleCount = Math.min(Math.max(visibleCount, 9), Math.max(yachts.length, 9));
    if(statBoats) statBoats.textContent = yachts.length;
    renderCatalog();
    renderAdventures();
    if(modal.classList.contains('is-open')) closeModal();
    return true;
  }

  async function refreshCatalogFromCloud(options = {}){
    if(!catalogStore) throw new Error('Supabase catalog store is unavailable.');
    if(document.body.classList.contains('fleet-editing')) return cloudCatalogState;
    if(cloudRefreshPromise) return cloudRefreshPromise;

    cloudRefreshPromise = catalogStore.load()
      .then((state) => {
        lastCloudRefresh = Date.now();
        applyCloudCatalogState(state);
        writeCloudCatalogCache(state);
        return state;
      })
      .finally(() => { cloudRefreshPromise = null; });
    return cloudRefreshPromise;
  }

  function cloudStateRows(state){
    return Object.entries(state || {}).map(([key, row]) => ({
      card_key: key,
      changes: row && row.changes ? row.changes : {},
      deleted: Boolean(row && row.deleted),
      updated_at: row && row.updatedAt ? row.updatedAt : ''
    }));
  }

  function readCloudCatalogCache(){
    if(!catalogStore) return null;
    try {
      const cached = JSON.parse(localStorage.getItem(cloudCacheKey) || 'null');
      if(!cached || !Array.isArray(cached.rows)) return null;
      return catalogStore.normalizeRows(cached.rows);
    } catch (_) { return null; }
  }

  function writeCloudCatalogCache(state){
    try {
      localStorage.setItem(cloudCacheKey, JSON.stringify({
        savedAt: new Date().toISOString(),
        rows: cloudStateRows(state)
      }));
    } catch (_) {}
  }

  function writeRemainingLegacyState(changes, deleted){
    try {
      if(Object.keys(changes).length) localStorage.setItem(legacyEditorStorageKey, JSON.stringify(changes));
      else localStorage.removeItem(legacyEditorStorageKey);
      if(deleted.length) localStorage.setItem(legacyDeletedStorageKey, JSON.stringify(deleted));
      else localStorage.removeItem(legacyDeletedStorageKey);
    } catch (_) {}
  }

  async function migrateLegacyCatalogState(options = {}){
    const legacyChanges = readLegacyEditorChanges();
    const legacyDeleted = new Set(readLegacyDeletedYachts());
    const knownKeys = knownCatalogKeys();
    const keys = new Set([...Object.keys(legacyChanges), ...legacyDeleted]);
    const remainingChanges = Object.create(null);
    const remainingDeleted = [];
    let migrated = 0;
    let conflicts = 0;
    let failed = 0;
    let unknown = 0;

    for(const key of keys) {
      if(!knownKeys.has(key)) {
        if(Object.prototype.hasOwnProperty.call(legacyChanges, key)) remainingChanges[key] = legacyChanges[key];
        if(legacyDeleted.has(key)) remainingDeleted.push(key);
        unknown += 1;
        continue;
      }
      const remoteRow = cloudCatalogState[key];
      if(remoteRow && !options.overwriteConflicts) {
        if(Object.prototype.hasOwnProperty.call(legacyChanges, key)) remainingChanges[key] = legacyChanges[key];
        if(legacyDeleted.has(key)) remainingDeleted.push(key);
        conflicts += 1;
        continue;
      }
      try {
        const hasLegacyChanges = Object.prototype.hasOwnProperty.call(legacyChanges, key);
        const changes = hasLegacyChanges ? legacyChanges[key] : (remoteRow ? remoteRow.changes : {});
        await catalogStore.save(key, changes, legacyDeleted.has(key), remoteRow ? remoteRow.updatedAt : null);
        migrated += 1;
      } catch (_) {
        if(Object.prototype.hasOwnProperty.call(legacyChanges, key)) remainingChanges[key] = legacyChanges[key];
        if(legacyDeleted.has(key)) remainingDeleted.push(key);
        failed += 1;
      }
    }

    writeRemainingLegacyState(remainingChanges, remainingDeleted);
    return { migrated, conflicts, failed, unknown };
  }

  function compactText(value, maxLength = 180){
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}...` : text;
  }

  function cleanNotes(value){
    return String(value || '')
      .replace(/Gratuidad\/tip segun nota del operador\.?/gi, 'Propina según las condiciones del operador.')
      .replace(/Fotos disponibles en el boton Ver mas fotos\.?/gi, 'Galería disponible en el botón “Ver más fotos”.')
      .replace(/Incluye capitan/gi, 'Incluye capitán')
      .replace(/segun reserva/gi, 'según la reserva')
      .replace(/catalogo/gi, 'catálogo')
      .replace(/Confirmar disponibilidad antes de reservar\.?/gi, 'Confirma la disponibilidad antes de reservar.')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function localizedNote(value, forceEnglish = false){
    const note = cleanNotes(value)
      .replace(/Galería disponible en el botón “Ver más fotos”\.?/gi, '')
      .replace(/Confirma la disponibilidad antes de reservar\.?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    if(!isEnglish() && !forceEnglish) return note;

    const exact = {
      'Vive una salida privada con estilo en Boca Chica, con amplias áreas exteriores, flybridge y espacios cómodos para disfrutar el mar Caribe en grupo.': 'Enjoy a stylish private cruise in Boca Chica, with spacious outdoor areas, a flybridge and comfortable spaces for sharing the Caribbean Sea with your group.',
      'Una opción versátil para navegar, relajarse o compartir una aventura de pesca y playa, con cockpit abierto y flybridge para disfrutar las vistas.': 'A versatile option for cruising, relaxing or enjoying a fishing and beach adventure, with an open cockpit and flybridge for taking in the views.',
      'Crucero deportivo ideal para parejas, familias o grupos pequeños que desean recorrer Boca Chica con comodidad y acceso fácil al agua.': 'A sporty cruiser ideal for couples, families or small groups who want to explore Boca Chica in comfort with easy access to the water.',
      'Disfruta una experiencia privada navegando por las aguas cristalinas de Boca Chica a bordo de este cómodo yate flybridge, ideal para compartir con familiares y amigos.': 'Enjoy a private cruise through Boca Chica’s crystal-clear waters aboard this comfortable flybridge yacht, ideal for family and friends.'
    };
    if(exact[note]) return exact[note];

    return note
      .replace(/Propina según las condiciones del operador\.?/gi, 'Gratuity applies according to the operator’s terms.')
      .replace(/Incluye capitán cuando se indica en el catálogo\.?/gi, 'Captain is included when stated in the listing.')
      .replace(/Extras indicados en la ficha original disponibles según reserva\.?/gi, 'Extras shown in the original listing are available upon reservation.')
      .replace(/Ficha actualizada desde el catálogo del cliente\.?/gi, 'Listing updated from the client catalog.')
      .replace(/Confirmar disponibilidad antes de reservar\.?/gi, 'Confirm availability before booking.')
      .replace(/Tarifas distintas para días laborables y fines de semana\.?/gi, 'Different weekday and weekend rates apply.')
      .replace(/10% de gratuidad requerida\.?/gi, 'A 10% gratuity is required.')
      .replace(/10% de gratuidad\.?/gi, 'A 10% gratuity applies.')
      .replace(/Propina no incluida\.?/gi, 'Gratuity is not included.')
      .replace(/Descuento de \$100 de lunes a jueves\.?/gi, 'Save $100 Monday through Thursday.')
      .replace(/Depósito reembolsable de \$300\.?/gi, 'A refundable $300 deposit is required.')
      .replace(/Calendario:\s*https?:\/\/\S+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function yachtLocationText(yacht){
    return isEnglish() ? (yacht.locationEn || localizedLocation(yacht.location)) : yacht.location;
  }

  function yachtRatesText(yacht){
    return isEnglish() ? (yacht.ratesEn || localizedRate(yacht.rates)) : yacht.rates;
  }

  function yachtNotesText(yacht){
    return isEnglish() ? (yacht.notesEn || localizedNote(yacht.notes)) : meaningfulCardNote(yacht);
  }

  function yachtIntro(yacht){
    const passengerLabel = yacht.passengers === 1 ? ui('1 pasajero', '1 passenger') : `${yacht.passengers} ${ui('pasajeros', 'passengers')}`;
    if(isEnglish()) return `${passengerLabel}. ${yachtLocationText(yacht)}. ${yachtRatesText(yacht)}`;
    return `${passengerLabel}. ${yacht.location}. ${compactText(yacht.rates || yacht.description || yacht.notes || '', 120)}`;
  }

  function baseHourlyPrice(vehicle){
    return vehicle && vehicle.category ? 250 : 300;
  }

  function cardPriceText(vehicle){
    if(isEnglish()) return vehicle.category
      ? `A private ${vehicle.category} experience tailored to your group, route and schedule.`
      : localizedRate(vehicle.rates || `Rates from $${baseHourlyPrice(vehicle)} USD per hour`);
    return compactText(vehicle.description || vehicle.rates || vehicle.notes || `Precios desde $${baseHourlyPrice(vehicle)} USD por hora`, 130);
  }

  function uniqueRateOptions(yacht){
    const options = String(yachtRatesText(yacht) || '')
      .split('|')
      .map((option) => option.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .filter((option, index, items) => items.findIndex((item) => item.toLowerCase() === option.toLowerCase()) === index);

    if(options.length > 1) options.shift();
    return compactText(options.join(' · '), 145);
  }

  function meaningfulCardNote(yacht){
    const note = cleanNotes(yacht.notes)
      .replace(/Galería disponible en el botón “Ver más fotos”\.?/gi, '')
      .replace(/Confirma la disponibilidad antes de reservar\.?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    return compactText(note, 105);
  }

  function yachtCardDetailsHTML(yacht){
    const table = priceTableHTML(yacht, false);
    const note = yachtNotesText(yacht);
    if(!table && !note) return '';

    return `<span class="cat-details">
      ${table}
      ${note ? `<span class="cat-detail-row cat-detail-note"><span class="cat-detail-label">${ui('Importante', 'Important')}</span><span>${escapeHTML(note)}</span></span>` : ''}
    </span>`;
  }

  function parsePriceRows(text){
    return String(text || '').split('|').map((option) => {
      const amount = option.match(/\$\s*[\d,.]+(?:\s*[–-]\s*\$?\s*[\d,.]+)?/);
      if(!amount) return null;
      return {
        label: option.replace(amount[0], '').replace(/[:·\s]+$/, '').trim() || ui('Tarifa', 'Rate'),
        value: amount[0].replace(/\s*-\s*/, ' – ')
      };
    }).filter(Boolean);
  }

  function vehiclePriceRows(yacht){
    return Array.isArray(yacht.priceTable) && yacht.priceTable.length
      ? yacht.priceTable.map((row) => ({ ...row }))
      : parsePriceRows(yachtRatesText(yacht));
  }

  function priceTableHTML(yacht, modalView = false){
    const rows = vehiclePriceRows(yacht);
    if(!rows.length) return '';
    const visibleRows = modalView ? rows : rows.slice(0, 4);
    const more = rows.length - visibleRows.length;
    return `<span class="price-table${modalView ? ' price-table-modal' : ''}">
      <span class="price-table-heading"><span>${ui('Tabla de precios', 'Price table')}</span>${rows.some((row) => row.estimated) ? `<em>${ui('Estimado', 'Estimated')}</em>` : ''}</span>
      ${visibleRows.map((row) => `<span class="price-table-row"><span>${escapeHTML(isEnglish() ? (row.labelEn || localizedRate(row.label)) : row.label)}</span><strong>${escapeHTML(row.value)}</strong></span>`).join('')}
      ${more > 0 ? `<span class="price-table-more">+${more} ${ui('tarifas en detalles', 'rates in details')}</span>` : ''}
    </span>`;
  }

  function modalExtraDescription(yacht){
    const name = String(yacht.name || '').toLowerCase();
    const location = String(yacht.location || '').toLowerCase();
    const seen = new Set();
    return String(yacht.description || '')
      .split(/\r?\n/)
      .map((line) => line.replace(/^[*•\-]+\s*/, '').trim())
      .filter((line) => {
        const normalized = line.toLowerCase();
        if(!normalized || normalized === name || normalized === location) return false;
        if(/photos?|pictures?|calendar|galer[ií]a|https?:|www\.|\.club\//i.test(line)) return false;
        if(/(?:guest|people|pasajer|max|capacity)/i.test(line)) return false;
        if(/(?:location|departure|pickup|pick up|marina).*:/i.test(line)) return false;
        if(/\$|\b(?:usd|price|pricing|rates?|precios?|tarifas?)\b/i.test(line)) return false;
        if(/(?:hours?|horas?|hrs?|\b\d+h\b).*\b\d{3,}\b|\b\d{3,}\b.*(?:hours?|horas?|hrs?|\b\d+h\b)/i.test(line)) return false;
        if(/^(?:de\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekday|weekend|mon|tue|wed|thu|fri|sat|sun|lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|entre semana|fin de semana)/i.test(line)) return false;
        if(seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      })
      .join(' · ');
  }

  function quotePriceText(vehicle){
    return vehicle.rates || vehicle.description || `Precios desde $${baseHourlyPrice(vehicle)} USD por hora. Para más info realizar su cotización.`;
  }

  function yachtImage(yacht){
    if(hasDirectImage(yacht.image)) return yacht.image;
    return yachtFallbackImages[yacht.size] || yachtFallbackImages.Mediano;
  }

  function slugify(value){
    return String(value || 'vehicle')
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 70) || 'vehicle';
  }

  function mediaKeyFor(vehicle, index, prefix = ''){
    if(vehicle.mediaKey) return vehicle.mediaKey;
    const number = String(index + 1).padStart(3, '0');
    return `${prefix}${number}-${slugify(vehicle.name)}`;
  }

  function isVideoMedia(src = ''){
    return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src);
  }

  function normalizeMedia(item){
    if(typeof item === 'string') {
      return { type: isVideoMedia(item) ? 'video' : 'image', src: item };
    }

    const src = item && item.src ? item.src : '';
    return {
      type: item && item.type ? item.type : (isVideoMedia(src) ? 'video' : 'image'),
      src,
      poster: item && item.poster ? item.poster : ''
    };
  }

  function galleryFor(vehicle, index, prefix = ''){
    const key = mediaKeyFor(vehicle, index, prefix);
    const localItems = Array.isArray(catalogMedia[key])
      ? catalogMedia[key].map(normalizeMedia).filter((item) => item.src && !isBingImageUrl(item.src))
      : [];
    if(localItems.length) return localItems;

    const fallback = vehicle.category ? adventureImage(vehicle) : (hasDirectImage(vehicle.image) ? vehicle.image : yachtImage(vehicle));
    return fallback ? [{ type: isVideoMedia(fallback) ? 'video' : 'image', src: fallback }] : [];
  }

  function imageFor(vehicle, index, prefix = ''){
    if(hasDirectImage(vehicle.coverImage)) return vehicle.coverImage;
    const gallery = galleryFor(vehicle, index, prefix);
    const localImage = gallery.find((item) => normalizeMedia(item).type === 'image');
    if(localImage) return normalizeMedia(localImage).src;
    return vehicle.category ? adventureImage(vehicle) : yachtImage(vehicle);
  }

  const validImageFits = new Set(['cover', 'contain']);
  const validImagePositions = new Set(['center center', 'center top', 'center bottom', 'left center', 'right center']);
  const validImageBackgrounds = new Set(['blur', 'cream', 'dark', 'white']);
  function vehicleImageFit(vehicle, view = 'card'){
    const value = view === 'detail' ? vehicle.detailImageFit : vehicle.imageFit;
    return validImageFits.has(value) ? value : (view === 'detail' ? 'contain' : 'cover');
  }
  function vehicleImagePosition(vehicle, view = 'card'){
    const value = view === 'detail' ? vehicle.detailImagePosition : vehicle.imagePosition;
    if(validImagePositions.has(value)) return value;
    if(view === 'detail' && validImagePositions.has(vehicle.imagePosition)) return vehicle.imagePosition;
    return 'center center';
  }
  function vehicleImageBackground(vehicle, view = 'card'){
    const value = view === 'detail' ? vehicle.detailImageBackground : vehicle.imageBackground;
    if(validImageBackgrounds.has(value)) return value;
    if(view === 'detail' && validImageBackgrounds.has(vehicle.imageBackground)) return vehicle.imageBackground;
    return 'blur';
  }
  function mediaContainerClass(vehicle, view = 'card'){ return `media-fit-${vehicleImageFit(vehicle, view)} media-bg-${vehicleImageBackground(vehicle, view)}`; }
  function mediaImageStyle(vehicle, view = 'card'){ return `object-fit:${vehicleImageFit(vehicle, view)};object-position:${vehicleImagePosition(vehicle, view)};` }
  function mediaContainerStyle(vehicle, image, view = 'card'){
    if(!image) return '';
    return `--media-image:url("${String(image).replace(/["\\]/g, '\\$&')}");--media-position:${vehicleImagePosition(vehicle, view)};`;
  }

  function applyMediaPresentation(container, image, vehicle, view = 'card'){
    if(!container) return;
    [...validImageBackgrounds].forEach((value) => container.classList.remove(`media-bg-${value}`));
    [...validImageFits].forEach((value) => container.classList.remove(`media-fit-${value}`));
    container.classList.add(`media-bg-${vehicleImageBackground(vehicle, view)}`, `media-fit-${vehicleImageFit(vehicle, view)}`);
    container.style.setProperty('--media-image', image ? `url("${String(image).replace(/["\\]/g, '\\$&')}")` : 'none');
    container.style.setProperty('--media-position', vehicleImagePosition(vehicle, view));
  }

  function mediaElementHTML(item, alt, className = '', vehicle = {}, view = 'card'){
    const media = normalizeMedia(item);
    const classAttr = className ? ` class="${escapeHTML(className)}"` : '';
    if(media.type === 'video') {
      const poster = media.poster ? ` poster="${escapeHTML(media.poster)}"` : '';
      return `<video${classAttr} src="${escapeHTML(media.src)}"${poster} muted playsinline controls preload="metadata"></video>`;
    }
    return `<img${classAttr} data-hide-on-error src="${escapeHTML(media.src)}" alt="${escapeHTML(alt)}" loading="lazy" style="${escapeHTML(mediaImageStyle(vehicle, view))}">`;
  }

  function isBingImageUrl(url){
    try {
      const hostname = new URL(String(url || ''), document.baseURI).hostname.toLowerCase();
      return hostname === 'bing.com' || hostname.endsWith('.bing.com') || hostname === 'bing.net' || hostname.endsWith('.bing.net');
    } catch (_) {
      return false;
    }
  }

  function hasDirectImage(url){
    return Boolean(url && !isBingImageUrl(url) && (/^https?:\/\//i.test(url) || /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url)));
  }

  function isUsablePhotoLink(yacht){
    if(yacht.photoLinkEnabled === false) return false;
    const url = String(yacht.photoLink || '');
    if(!/^https:\/\//i.test(url)) return false;
    return !/(?:bing\.com\/images|tse\d*\.mm\.bing\.net)/i.test(url);
  }

  function yachtMediaHTML(yacht, index){
    const image = imageFor(yacht, index);
    if(image) {
      return `<img data-hide-on-error src="${escapeHTML(image)}" alt="${escapeHTML(yacht.name)}" loading="lazy" style="${escapeHTML(mediaImageStyle(yacht))}">`;
    }

    return `
      <span class="cat-placeholder" aria-hidden="true">
        <span class="cat-placeholder-mark">${escapeHTML(yacht.feet || '')}'</span>
        <span class="cat-placeholder-text">${ui('Fotos disponibles en el enlace del bote', 'Photos available through the boat link')}</span>
      </span>
    `;
  }

  function photoLinkHTML(yacht, className = 'photo-link'){
    if(!isUsablePhotoLink(yacht)) return '';
    return `<a class="${className}" href="${escapeHTML(yacht.photoLink)}" target="_blank" rel="noopener noreferrer" aria-label="${ui('Ver más fotos de', 'View more photos of')} ${escapeHTML(yacht.name)}">${ui('Ver más fotos', 'View more photos')}</a>`;
  }

  function adventureImage(adventure){
    if(hasDirectImage(adventure.image)) return adventure.image;
    return fallbackImage(adventure);
  }

  function fallbackImage(yacht){
    if(yacht.fallback) return yacht.fallback;

    const index = yachts.indexOf(yacht) % 5 + 1;
    const extension = index === 5 ? 'jpg' : 'gif';
    return `./assets/hero/hero-0${index}.${extension}`;
  }

  function getFilteredYachts(){
    const sizeFiltered = activeFilter === 'Todos'
      ? yachts
      : yachts.filter((yacht) => yacht.size === activeFilter);

    const searchFiltered = !searchTerm ? sizeFiltered : sizeFiltered.filter((yacht) => {
      const searchable = [
        yacht.name,
        yacht.feet,
        yacht.size,
        yacht.sizeLabel,
        yacht.location,
        yacht.locationEn,
        yacht.passengers,
        yacht.rates,
        yacht.ratesEn,
        yacht.notes,
        yacht.notesEn
      ].join(' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      return searchable.includes(searchTerm);
    });
    return yachtsByStartingPrice(searchFiltered);
  }

  function renderFilters(){
    filterBar.innerHTML = filters.map((filter) => (
      `<button class="filter-btn${filter.key === activeFilter ? ' active' : ''}" type="button" data-filter="${filter.key}">${filter.key === 'Todos' ? ui('Todos', 'All') : filter.label.replace('pies', ui('pies', 'ft'))}</button>`
    )).join('');
  }

  function renderCatalog(){
    renderHeroStartingPrice();
    const filteredYachts = getFilteredYachts();
    const visibleYachts = filteredYachts.slice(0, visibleCount);

    catalogGrid.innerHTML = visibleYachts.length ? visibleYachts.map((yacht) => `
      <article class="cat-card" data-yacht-index="${yachts.indexOf(yacht)}">
        <button class="card-edit-btn" type="button" data-edit-yacht="${yachts.indexOf(yacht)}"><span aria-hidden="true">✎</span> ${ui('Editar tarjeta', 'Edit card')}</button>
        <div class="cat-open">
          <span class="cat-media ${mediaContainerClass(yacht)}" style="${escapeHTML(mediaContainerStyle(yacht, imageFor(yacht, yachts.indexOf(yacht))))}">
            ${yachtMediaHTML(yacht, yachts.indexOf(yacht))}
            <span class="cat-badge">${escapeHTML(isEnglish() ? `${yacht.feet || ''} ft` : yacht.sizeLabel)}</span>
            <span class="cat-pax">${escapeHTML(yacht.passengers)} ${ui('pasajeros', 'passengers')}</span>
          </span>
          <span class="cat-body">
            <span class="cat-kicker">${escapeHTML(yacht.size)} · ${escapeHTML(yacht.feet || '')}FT</span>
            <h3>${escapeHTML(yacht.name)}</h3>
            <span class="marina">${escapeHTML(yachtLocationText(yacht))}</span>
            ${yachtCardDetailsHTML(yacht)}
            <span class="cat-foot">
              <span class="price">${escapeHTML(yacht.price || `${ui('Desde', 'From')} $${baseHourlyPrice(yacht)}`)}<span>${escapeHTML(isEnglish() ? (yacht.priceLabelEn || localizedRate(yacht.priceLabel || 'USD per hour')) : (yacht.priceLabel || 'USD por hora'))}</span></span>
              <span class="cat-actions">
                ${photoLinkHTML(yacht, 'cta-btn cat-photo-link')}
              </span>
            </span>
          </span>
        </div>
      </article>
    `).join('') : `<div class="catalog-empty"><strong>${ui('No encontramos embarcaciones', 'No vessels found')}</strong><span>${ui('Prueba otro nombre, tamaño o ubicación.', 'Try another name, size or location.')}</span></div>`;

    loadMoreBtn.style.display = visibleCount >= filteredYachts.length ? 'none' : 'inline-flex';
    loadMoreBtn.textContent = `${ui('Ver Más Embarcaciones', 'View More Vessels')} (${filteredYachts.length - visibleYachts.length})`;
  }

  function openModal(yacht){
    const modalMedia = modal.querySelector('.modal-media');
    const collection = yacht.category ? adventures : yachts;
    const prefix = yacht.category ? 'adventure-' : '';
    const image = imageFor(yacht, collection.indexOf(yacht), prefix);
    modalMedia._displayVehicle = yacht;
    modalMedia.style.backgroundImage = '';
    applyMediaPresentation(modalMedia, image, yacht, 'detail');
    modalMedia.classList.toggle('no-photo', !image);
    modalMedia.dataset.placeholder = `${yacht.feet || ''}' ${yacht.name}`;
    modalMedia.innerHTML = image
      ? `<img class="modal-active-media" data-hide-on-error src="${escapeHTML(image)}" alt="${escapeHTML(yacht.name)}" style="${escapeHTML(mediaImageStyle(yacht, 'detail'))}">`
      : '';
    modal.querySelector('[data-modal-kicker]').textContent = isEnglish() ? `${yacht.feet || ''} ft | ${yacht.category || 'Yacht'}` : `${yacht.size} | ${yacht.sizeLabel}`;
    modal.querySelector('[data-modal-title]').textContent = yacht.name;
    modal.querySelector('[data-modal-passengers]').textContent = yacht.passengers === 1 ? ui('1 pasajero', '1 passenger') : `${yacht.passengers} ${ui('pasajeros', 'passengers')}`;
    modal.querySelector('[data-modal-location]').textContent = yachtLocationText(yacht);
    const modalRates = modal.querySelector('[data-modal-rates]');
    modalRates.innerHTML = priceTableHTML(yacht, true) || escapeHTML(yachtRatesText(yacht) || localizedRate(quotePriceText(yacht)));
    modal.querySelector('[data-modal-notes]').textContent = yachtNotesText(yacht) || ui('Confirma disponibilidad y condiciones al solicitar la cotización.', 'Confirm availability and final terms when requesting your quote.');
    modal.querySelector('[data-modal-summary]').textContent = yachtIntro(yacht);
    const description = modal.querySelector('[data-modal-description]');
    const photoLink = modal.querySelector('[data-modal-photo-link]');
    if(description) {
      const extraDescription = isEnglish() ? (yacht.descriptionEn || '') : modalExtraDescription(yacht);
      description.textContent = extraDescription;
      description.style.display = extraDescription ? 'block' : 'none';
    }
    if(photoLink) {
      photoLink.href = isUsablePhotoLink(yacht) ? yacht.photoLink : '#';
      photoLink.textContent = ui('Ver más fotos', 'View more photos');
      photoLink.style.display = isUsablePhotoLink(yacht) ? 'inline-flex' : 'none';
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function renderAdventures(){
    if(!adventuresGrid) return;

    adventuresGrid.innerHTML = adventures.map((adventure) => `
      <article class="adv-card" data-adventure-index="${adventures.indexOf(adventure)}">
        <button class="card-edit-btn" type="button" data-edit-adventure="${adventures.indexOf(adventure)}"><span aria-hidden="true">✎</span> ${ui('Editar tarjeta', 'Edit card')}</button>
        <button class="adv-open" type="button" aria-label="${ui('Ver detalles de', 'View details for')} ${escapeHTML(adventure.name)}">
          <span class="adv-media ${mediaContainerClass(adventure)}" style="${escapeHTML(mediaContainerStyle(adventure, imageFor(adventure, adventures.indexOf(adventure), 'adventure-') || fallbackImage(adventure)))}">
            <img data-hide-on-error src="${escapeHTML(imageFor(adventure, adventures.indexOf(adventure), 'adventure-') || fallbackImage(adventure))}" alt="${escapeHTML(adventure.name)}" loading="lazy" style="${escapeHTML(mediaImageStyle(adventure))}">
            <span class="cat-badge">${escapeHTML(adventure.sizeLabel)}</span>
            <span class="cat-pax">${escapeHTML(adventure.passengers === 1 ? ui('1 pasajero', '1 passenger') : `${adventure.passengers} ${ui('pasajeros', 'passengers')}`)}</span>
          </span>
          <span class="adv-body">
            <span class="tag">${escapeHTML(adventure.category)}</span>
            <h3>${escapeHTML(adventure.name)}</h3>
            <span class="meta">${escapeHTML(yachtLocationText(adventure))}</span>
            ${priceTableHTML(adventure)}
            <span class="adv-prices">
              <span class="adv-price">
                <span class="d">${escapeHTML(isEnglish()
                  ? (adventure.priceLabelEn || localizedRate(adventure.priceLabel || 'per hour'))
                  : (adventure.priceLabel || 'por hora'))}</span>
                <span class="v">${escapeHTML(localizedRate(adventure.price || `${ui('Desde', 'From')} $${baseHourlyPrice(adventure)}`))}</span>
              </span>
              <span class="adv-link">${ui('Ver detalles', 'View details')}</span>
            </span>
          </span>
        </button>
      </article>
    `).join('');
  }

  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function renderModalGalleryItem(modalMedia, nextIndex){
    const gallery = modalMedia._gallery || [];
    if(!gallery.length) return;

    const index = (nextIndex + gallery.length) % gallery.length;
    const item = gallery[index];
    modalMedia.dataset.galleryIndex = String(index);
    modalMedia.style.backgroundImage = '';
    applyMediaPresentation(modalMedia, item.type === 'image' ? item.src : item.poster, modalMedia._displayVehicle || {}, 'detail');
    modalMedia.classList.remove('no-photo');
    modalMedia.innerHTML = `
      ${mediaElementHTML(item, modalMedia._galleryTitle || 'Galeria', 'modal-active-media', modalMedia._displayVehicle || {}, 'detail')}
      ${gallery.length > 1 ? `
        <button class="gallery-nav gallery-prev" type="button" data-gallery-prev aria-label="Medio anterior">‹</button>
        <button class="gallery-nav gallery-next" type="button" data-gallery-next aria-label="Medio siguiente">›</button>
        <span class="gallery-status" data-gallery-status>${index + 1} / ${gallery.length}</span>
      ` : ''}
    `;
  }

  let editorAuthenticated = false;
  let editorSaveInProgress = false;
  let editorFormDirty = false;
  let editorPricingDirty = false;
  let editingYachtIndex = -1;
  let editingVehicles = yachts;

  function editorField(name){
    return fleetEditorForm ? fleetEditorForm.elements.namedItem(name) : null;
  }

  function editorPriceRows(yacht){
    if(Array.isArray(yacht.priceTable) && yacht.priceTable.length) {
      return yacht.priceTable.map((row) => ({ ...row, labelEn: row.labelEn || englishRate(row.label || '') }));
    }
    const spanishRows = parsePriceRows(yacht.rates);
    const englishRows = parsePriceRows(yacht.ratesEn);
    if(spanishRows.length) {
      return spanishRows.map((row, index) => ({
        ...row,
        labelEn: englishRows[index]?.label || englishRate(row.label || '')
      }));
    }
    if(englishRows.length) {
      return englishRows.map((row) => ({ ...row, labelEn: row.label || '' }));
    }
    return [{ label: 'Tarifa base', labelEn: 'Base rate', value: yacht.price || '' }];
  }

  function pricingRowHTML(row = {}){
    return `<div class="pricing-editor-row" data-pricing-row${row.estimated ? ' data-estimated="true"' : ''}>
      <input type="text" data-rate-label value="${escapeHTML(row.label || '')}" placeholder="${ui('Ej. 4 horas', 'E.g. 4 hours')}" aria-label="${ui('Duración o condición', 'Duration or condition')}" required>
      <input type="text" data-rate-label-en value="${escapeHTML(row.labelEn || englishRate(row.label || ''))}" placeholder="E.g. 4 hours" aria-label="English rate label" required>
      <input type="text" data-rate-value value="${escapeHTML(row.value || '')}" placeholder="$650" aria-label="${ui('Precio o rango', 'Price or range')}" required>
      <label class="pricing-estimated-toggle"><input type="checkbox" data-rate-estimated${row.estimated ? ' checked' : ''}><span>${ui('Estimada', 'Estimated')}</span></label>
      <button class="pricing-remove-row" type="button" data-pricing-remove aria-label="${ui('Eliminar tarifa', 'Remove rate')}">×</button>
    </div>`;
  }

  function renderPricingEditor(yacht){
    const container = document.getElementById('pricingEditorRows');
    if(!container) return;
    container.innerHTML = editorPriceRows(yacht).map(pricingRowHTML).join('');
  }

  function normalizeRateValue(value){
    const clean = String(value || '').trim().replace(/\s*-\s*/g, ' – ');
    if(!clean || clean.includes('$')) return clean;
    const range = clean.match(/^([\d,.]+)\s*[–-]\s*([\d,.]+)$/);
    if(range) return `$${range[1]} – $${range[2]}`;
    return /^[\d,.]+$/.test(clean) ? `$${clean}` : clean;
  }

  function readPricingEditorRows(){
    const container = document.getElementById('pricingEditorRows');
    if(!container) return [];
    return [...container.querySelectorAll('[data-pricing-row]')].map((row) => ({
      label: row.querySelector('[data-rate-label]').value.trim(),
      labelEn: row.querySelector('[data-rate-label-en]').value.trim(),
      value: normalizeRateValue(row.querySelector('[data-rate-value]').value),
      ...(row.querySelector('[data-rate-estimated]').checked ? { estimated: true } : {})
    })).filter((row) => row.label || row.value);
  }

  function rateValueNumber(value){
    const compact = String(value || '').trim();
    const currencyMatches = [...compact.matchAll(/\$\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k)?\b/gi)];
    const matches = currencyMatches.length
      ? currencyMatches
      : [...compact.matchAll(/^\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k)?(?:\s*[–-]\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k)?)?\s*$/gi)];
    const amounts = matches.flatMap((match) => {
      const values = [Number(match[1].replace(/,/g, '')) * (match[2] ? 1000 : 1)];
      if(match[3]) values.push(Number(match[3].replace(/,/g, '')) * (match[4] ? 1000 : 1));
      return values;
    }).filter(Number.isFinite);
    return amounts.length ? Math.min(...amounts) : null;
  }

  function formattedPrice(value){
    return `$${Math.round(value).toLocaleString('en-US')}`;
  }

  function renderHeroStartingPrice(){
    if(!heroStartingPrice) return;
    const minimum = yachts.reduce((lowest, yacht) => (
      Math.min(lowest, yachtStartingPrice(yacht))
    ), Number.POSITIVE_INFINITY);
    const callout = heroStartingPrice.closest('.hero-price-callout');
    const hasPrice = Number.isFinite(minimum);
    if(callout) callout.hidden = !hasPrice;
    if(hasPrice) heroStartingPrice.textContent = formattedPrice(minimum);
  }

  function syncPricingEditorFields(updateLabels = true){
    const pricingContainer = document.getElementById('pricingEditorRows');
    if(pricingContainer) {
      pricingContainer.querySelectorAll('[data-rate-value]').forEach((field) => {
        field.setCustomValidity(rateValueNumber(field.value) === null
          ? ui('Escribe un precio válido, por ejemplo $650 o $350 – $400.', 'Enter a valid price, for example $650 or $350 – $400.')
          : '');
      });
    }
    const rows = readPricingEditorRows();
    if(!rows.length) return rows;
    const rates = rows.map((row) => `${row.label}: ${row.value}`).join(' | ');
    const ratesField = editorField('rates');
    const ratesEnField = editorField('ratesEn');
    if(ratesField) ratesField.value = rates;
    if(ratesEnField) ratesEnField.value = rows.map((row) => `${row.labelEn || englishRate(row.label)}: ${row.value}`).join(' | ');
    const pricedRows = rows.map((row) => ({ row, amount: rateValueNumber(row.value) })).filter((item) => Number.isFinite(item.amount));
    if(pricedRows.length) {
      const minimum = Math.min(...pricedRows.map((item) => item.amount));
      editorField('price').value = formattedPrice(minimum);
      if(updateLabels) {
        const minimumRows = pricedRows.filter((item) => item.amount === minimum);
        const minimumIsEstimated = minimumRows.length > 0 && minimumRows.every((item) => item.row.estimated);
        editorField('priceLabel').value = minimumIsEstimated ? 'desde · tarifa estimada' : 'precio desde';
        editorField('priceLabelEn').value = minimumIsEstimated ? 'from · estimated rate' : 'rates from';
      }
    }
    return rows;
  }

  function updateEditorAccess(){
    if(!editorAccess) return;
    const active = document.body.classList.contains('fleet-editing');
    editorAccess.classList.toggle('is-active', active);
    editorAccess.setAttribute('aria-label', ui('Abrir modo edición', 'Open edit mode'));
    const label = editorAccess.querySelector('.editor-access-label');
    if(label) label.textContent = active ? ui('Edición activa', 'Editing active') : ui('Administrar', 'Manage');
    if(editorExitMode) {
      const title = editorExitMode.querySelector('strong');
      const subtitle = editorExitMode.querySelector('small');
      if(title) title.textContent = ui('Finalizar edición', 'Finish editing');
      if(subtitle) subtitle.textContent = ui('Guardar y cerrar sesión', 'Save and sign out');
    }
  }

  function setEditorMode(active){
    document.body.classList.toggle('fleet-editing', Boolean(active));
    updateEditorAccess();
    renderCatalog();
    renderAdventures();
  }

  function setEditorDialogState(element, open){
    if(!element) return;
    element.classList.toggle('is-open', open);
    element.setAttribute('aria-hidden', String(!open));
    const anyOpen = (editorLoginModal && editorLoginModal.classList.contains('is-open')) || (fleetEditor && fleetEditor.classList.contains('is-open'));
    document.body.classList.toggle('editor-dialog-open', anyOpen);
  }

  function openEditorLogin(){
    if(!editorLoginModal || !editorLoginForm) return;
    editorLoginForm.reset();
    const title = document.getElementById('editorLoginTitle');
    const description = document.getElementById('editorLoginDescription');
    const submit = document.getElementById('editorLoginSubmit');
    const hint = document.getElementById('editorLoginHint');
    const passwordLabel = editorLoginForm.querySelector('label[for="editorPassword"]');
    if(title) title.textContent = ui('Modo edición', 'Edit mode');
    if(description) description.textContent = ui('Ingresa la clave de administración para publicar cambios en todos los dispositivos.', 'Enter the admin key to publish changes on every device.');
    if(submit) submit.textContent = ui('Entrar', 'Sign in');
    if(hint) hint.textContent = ui('La clave se valida de forma segura con Supabase.', 'The key is securely validated by Supabase.');
    if(passwordLabel) passwordLabel.textContent = ui('Clave de acceso', 'Access key');
    setEditorLoginFeedback('');
    setEditorDialogState(editorLoginModal, true);
    const password = document.getElementById('editorPassword');
    if(password) window.setTimeout(() => password.focus(), 40);
  }

  function setEditorLoginFeedback(message, success = false){
    if(!editorLoginFeedback) return;
    editorLoginFeedback.textContent = message;
    editorLoginFeedback.classList.toggle('is-success', Boolean(success));
  }

  function editorErrorText(error){
    const message = String(error && error.message || '').toLowerCase();
    if(error && error.code === 'conflict') return ui('Otro dispositivo cambió esta tarjeta. Revisa el formulario y pulsa Guardar otra vez si deseas reemplazar la versión compartida.', 'Another device changed this card. Review the form and press Save again if you want to replace the shared version.');
    if(error && error.code === 'network') return ui('No hay conexión. Revisa internet e inténtalo de nuevo.', 'No connection. Check your internet and try again.');
    if(error && error.code === 'rate_limit') return ui('Demasiados intentos. Espera un momento e inténtalo otra vez.', 'Too many attempts. Wait a moment and try again.');
    if(error && error.code === 'forbidden') return ui('Esta cuenta no está autorizada para editar.', 'This account is not authorized to edit.');
    if(error && error.code === 'weak_password' || message.includes('password should be at least')) return ui('Usa una contraseña de al menos 8 caracteres.', 'Use a password with at least 8 characters.');
    if(message.includes('invalid login credentials')) return ui('Clave incorrecta.', 'Incorrect key.');
    return ui('No se pudo completar la operación. Inténtalo de nuevo.', 'The operation could not be completed. Try again.');
  }

  async function refreshConflictVersion(key){
    try {
      const latest = await catalogStore.load();
      if(latest[key]) cloudCatalogState[key] = latest[key];
      else delete cloudCatalogState[key];
      writeCloudCatalogCache(cloudCatalogState);
    } catch (_) {}
  }

  function setEditorBusy(busy){
    editorSaveInProgress = Boolean(busy);
    if(!fleetEditorForm) return;
    fleetEditorForm.querySelectorAll('button, input, select, textarea').forEach((control) => {
      if(editorSaveInProgress) {
        control.dataset.editorWasDisabled = control.disabled ? 'true' : 'false';
        control.disabled = true;
      } else {
        control.disabled = control.dataset.editorWasDisabled === 'true';
        delete control.dataset.editorWasDisabled;
      }
    });
  }

  function setEditorStatus(message, isError = false){
    const status = document.getElementById('editorSaveStatus');
    if(!status) return;
    status.textContent = message;
    status.classList.toggle('is-error', Boolean(isError));
  }

  function updateEditorPreview(yacht){
    if(!fleetEditorForm || !yacht) return;
    const previewName = document.getElementById('fleetEditorPreviewName');
    const previewMeta = document.getElementById('fleetEditorPreviewMeta');
    const previewImage = document.getElementById('fleetEditorImage');
    const previewFrame = document.getElementById('fleetEditorImageFrame');
    const name = editorField('name').value || yacht.name;
    const feet = editorField('feet').value || yacht.feet || '';
    const passengers = editorField('passengers').value || yacht.passengers || '';
    if(previewName) previewName.textContent = name;
    if(previewMeta) previewMeta.textContent = yacht.category
      ? `${yacht.category} · ${passengers} ${ui('pasajeros', 'passengers')}`
      : `${feet} FT · ${passengers} ${ui('pasajeros', 'passengers')}`;
    if(previewImage) {
      const draftImage = catalogStore
        ? catalogStore.sanitizeChanges({ image: editorField('image').value }).image
        : editorField('image').value;
      previewImage.src = draftImage || imageFor(yacht, editingYachtIndex) || fallbackImage(yacht);
      previewImage.alt = name;
      const draft = {
        ...yacht,
        imageFit: editorField('imageFit').value,
        imagePosition: editorField('imagePosition').value,
        imageBackground: editorField('imageBackground').value
      };
      previewImage.style.objectFit = vehicleImageFit(draft);
      previewImage.style.objectPosition = vehicleImagePosition(draft);
      applyMediaPresentation(previewFrame, previewImage.src, draft);
    }
  }

  function fillEditorForm(yacht){
    if(!fleetEditorForm || !yacht) return;
    const values = {
      name: yacht.name || '', feet: yacht.feet || '', passengers: yacht.passengers || '',
      price: yacht.price || '', image: yacht.coverImage || yacht.image || '', location: yacht.location || '',
      rates: yacht.rates || '', notes: yacht.notes || '', priceLabel: yacht.priceLabel || '',
      imageFit: vehicleImageFit(yacht), imagePosition: vehicleImagePosition(yacht), imageBackground: vehicleImageBackground(yacht),
      detailImageFit: vehicleImageFit(yacht, 'detail'), detailImagePosition: vehicleImagePosition(yacht, 'detail'), detailImageBackground: vehicleImageBackground(yacht, 'detail'),
      locationEn: yacht.locationEn || englishLocation(yacht.location),
      ratesEn: yacht.ratesEn || englishRate(yacht.rates),
      notesEn: yacht.notesEn || localizedNote(yacht.notes, true),
      priceLabelEn: yacht.priceLabelEn || englishRate(yacht.priceLabel || '')
    };
    Object.entries(values).forEach(([name, value]) => {
      const field = editorField(name);
      if(field) field.value = value;
    });
    const feetField = editorField('feet');
    if(feetField) {
      feetField.disabled = Boolean(yacht.category);
      feetField.required = !yacht.category;
    }
    editorField('photoLink').value = yacht.photoLink || '';
    editorField('showPhotoLink').checked = yacht.photoLinkEnabled !== false && isUsablePhotoLink({ ...yacht, photoLinkEnabled: true });
    const position = document.getElementById('fleetEditorPosition');
    const title = document.getElementById('fleetEditorTitle');
    if(title) title.textContent = yacht.category ? ui('Editar aventura', 'Edit adventure') : ui('Editar embarcación', 'Edit vessel');
    if(position) position.textContent = `${ui('Tarjeta', 'Card')} ${editingYachtIndex + 1} ${ui('de', 'of')} ${editingVehicles.length}`;
    renderPricingEditor(yacht);
    setEditorStatus('');
    editorFormDirty = false;
    editorPricingDirty = false;
    updateEditorPreview(yacht);
    fleetEditorForm.scrollTop = 0;
  }

  function openFleetEditor(yacht, collection = yachts){
    if(!editorAuthenticated || !fleetEditor || !fleetEditorForm) return;
    editingVehicles = collection;
    editingYachtIndex = editingVehicles.indexOf(yacht);
    if(editingYachtIndex < 0) return;
    fillEditorForm(yacht);
    setEditorDialogState(fleetEditor, true);
  }

  function closeFleetEditor(){
    if(editorFormDirty && !window.confirm(ui('Hay cambios sin guardar. ¿Cerrar y descartarlos?', 'There are unsaved changes. Close and discard them?'))) return false;
    setEditorDialogState(fleetEditor, false);
    editingYachtIndex = -1;
    editingVehicles = yachts;
    editorFormDirty = false;
    return true;
  }

  async function finishEditingSession(){
    if(editorSaveInProgress) return;
    if(fleetEditor && fleetEditor.classList.contains('is-open') && editingYachtIndex >= 0) {
      if(!await saveEditorForm(false)) return;
    }
    closeFleetEditor();
    editorAuthenticated = false;
    if(catalogStore) await catalogStore.signOut();
    setEditorMode(false);
    void refreshCatalogFromCloud({ force: true }).catch(() => {});
  }

  async function saveEditorForm(showMessage = true){
    if(!fleetEditorForm || editingYachtIndex < 0 || editorSaveInProgress) return false;
    if(!editorFormDirty) {
      if(showMessage) setEditorStatus(ui('No hay cambios pendientes', 'No pending changes'));
      return true;
    }
    const priceTable = syncPricingEditorFields(editorPricingDirty);
    if(!fleetEditorForm.checkValidity()) {
      fleetEditorForm.reportValidity();
      return false;
    }
    const yacht = editingVehicles[editingYachtIndex];
    const key = yachtStorageKey(yacht);
    const draftChanges = {
      name: editorField('name').value.trim(),
      feet: yacht.category ? (yacht.feet || 0) : Number(editorField('feet').value),
      passengers: Number(editorField('passengers').value),
      price: editorField('price').value.trim(),
      image: editorField('image').value.trim(),
      coverImage: editorField('image').value.trim(),
      imageFit: editorField('imageFit').value,
      imagePosition: editorField('imagePosition').value,
      imageBackground: editorField('imageBackground').value,
      detailImageFit: editorField('detailImageFit').value,
      detailImagePosition: editorField('detailImagePosition').value,
      detailImageBackground: editorField('detailImageBackground').value,
      location: editorField('location').value.trim(),
      rates: editorField('rates').value.trim(),
      notes: editorField('notes').value.trim(),
      priceLabel: editorField('priceLabel').value.trim(),
      locationEn: editorField('locationEn').value.trim() || englishLocation(editorField('location').value),
      ratesEn: editorField('ratesEn').value.trim() || englishRate(editorField('rates').value),
      notesEn: editorField('notesEn').value.trim() || localizedNote(editorField('notes').value, true),
      priceLabelEn: editorField('priceLabelEn').value.trim() || englishRate(editorField('priceLabel').value),
      priceTable,
      photoLink: editorField('photoLink').value.trim(),
      photoLinkEnabled: editorField('showPhotoLink').checked
    };
    const changes = catalogStore ? catalogStore.sanitizeChanges(draftChanges) : draftChanges;

    setEditorBusy(true);
    setEditorStatus(ui('Guardando en todos los dispositivos…', 'Saving on every device…'));
    try {
      const expectedUpdatedAt = cloudCatalogState[key] ? cloudCatalogState[key].updatedAt : null;
      const row = await catalogStore.save(key, changes, false, expectedUpdatedAt);
      cloudCatalogState[key] = row;
      deletedYachtKeys.delete(key);
      Object.assign(yacht, row.changes);
      writeCloudCatalogCache(cloudCatalogState);
      editorFormDirty = false;
      editorPricingDirty = false;
      renderCatalog();
      renderAdventures();
      updateEditorPreview(yacht);
      setEditorStatus(showMessage
        ? ui('Guardado en todos los dispositivos', 'Saved on every device')
        : ui('Sincronizado', 'Synced'));
      return true;
    } catch (error) {
      if(error && error.code === 'conflict') await refreshConflictVersion(key);
      setEditorStatus(editorErrorText(error), true);
      return false;
    } finally {
      setEditorBusy(false);
    }
  }

  async function moveEditor(direction){
    if(!editingVehicles.length) return;
    if(!await saveEditorForm(false)) return;
    editingYachtIndex = (editingYachtIndex + direction + editingVehicles.length) % editingVehicles.length;
    fillEditorForm(editingVehicles[editingYachtIndex]);
  }

  async function deleteEditorYacht(){
    if(editingYachtIndex < 0 || !editingVehicles[editingYachtIndex] || editorSaveInProgress) return;
    const collection = editingVehicles;
    const collectionIndex = editingYachtIndex;
    const yacht = editingVehicles[editingYachtIndex];
    const confirmed = window.confirm(ui(
      `¿Eliminar “${yacht.name}” del catálogo? La tarjeta se ocultará en todos los dispositivos.`,
      `Delete “${yacht.name}” from the catalog? The card will be hidden on every device.`
    ));
    if(!confirmed) return;

    const key = yachtStorageKey(yacht);
    setEditorBusy(true);
    setEditorStatus(ui('Eliminando en todos los dispositivos…', 'Removing on every device…'));
    try {
      const existing = cloudCatalogState[key];
      const row = await catalogStore.save(key, existing ? existing.changes : {}, true, existing ? existing.updatedAt : null);
      cloudCatalogState[key] = row;
      deletedYachtKeys.add(key);
      writeCloudCatalogCache(cloudCatalogState);
      editorFormDirty = false;
      collection.splice(collectionIndex, 1);
      if(collection === yachts && statBoats) statBoats.textContent = yachts.length;
      visibleCount = Math.min(Math.max(visibleCount, 9), Math.max(yachts.length, 9));
      renderCatalog();
      renderAdventures();

      if(!collection.length) {
        closeFleetEditor();
        return;
      }
      editingVehicles = collection;
      editingYachtIndex = Math.min(collectionIndex, collection.length - 1);
      fillEditorForm(collection[editingYachtIndex]);
      setEditorStatus(ui('Tarjeta eliminada en todos los dispositivos', 'Card removed on every device'));
    } catch (error) {
      if(error && error.code === 'conflict') {
        await refreshConflictVersion(key);
        setEditorStatus(ui(
          'Otro dispositivo cambió esta tarjeta. Pulsa Eliminar otra vez si aún deseas ocultarla.',
          'Another device changed this card. Press Delete again if you still want to hide it.'
        ), true);
      } else {
        setEditorStatus(editorErrorText(error), true);
      }
    } finally {
      setEditorBusy(false);
    }
  }

  async function restoreEditorYacht(){
    if(editingYachtIndex < 0 || !editingVehicles[editingYachtIndex] || editorSaveInProgress) return;
    const yacht = editingVehicles[editingYachtIndex];
    if(!window.confirm(ui('¿Restaurar la información original de esta tarjeta en todos los dispositivos?', 'Restore this card’s original information on every device?'))) return;
    const key = yachtStorageKey(yacht);
    const original = (editingVehicles === adventures ? originalAdventures : originalYachts).get(key);
    if(!original) return;

    setEditorBusy(true);
    setEditorStatus(ui('Restaurando tarjeta…', 'Restoring card…'));
    try {
      const existing = cloudCatalogState[key];
      const row = await catalogStore.save(key, {}, false, existing ? existing.updatedAt : null);
      cloudCatalogState[key] = row;
      Object.keys(yacht).forEach((field) => { delete yacht[field]; });
      Object.assign(yacht, cloneVehicle(original));
      deletedYachtKeys.delete(key);
      writeCloudCatalogCache(cloudCatalogState);
      renderCatalog();
      renderAdventures();
      fillEditorForm(yacht);
      setEditorStatus(ui('Tarjeta restaurada en todos los dispositivos', 'Card restored on every device'));
    } catch (error) {
      if(error && error.code === 'conflict') {
        await refreshConflictVersion(key);
        setEditorStatus(ui(
          'Otro dispositivo cambió esta tarjeta. Pulsa Restaurar tarjeta otra vez si aún deseas recuperar la versión original.',
          'Another device changed this card. Press Restore card again if you still want the original version.'
        ), true);
      } else {
        setEditorStatus(editorErrorText(error), true);
      }
    } finally {
      setEditorBusy(false);
    }
  }

  async function activateEditorSession(){
    await refreshCatalogFromCloud({ force: true });
    let migration = await migrateLegacyCatalogState();
    let migrated = migration.migrated;
    if(migration.conflicts) {
      const overwrite = window.confirm(ui(
        `Hay ${migration.conflicts} cambio(s) antiguo(s) guardado(s) en este dispositivo y ya existe una versión compartida. ¿Publicar los cambios de este dispositivo y reemplazar la versión compartida?`,
        `There are ${migration.conflicts} older local change(s) and a shared version already exists. Publish this device’s changes and replace the shared version?`
      ));
      if(overwrite) {
        migration = await migrateLegacyCatalogState({ overwriteConflicts: true });
        migrated += migration.migrated;
      }
    }
    if(migrated) await refreshCatalogFromCloud({ force: true });
    if(migration.failed) {
      window.alert(ui(
        `${migration.failed} cambio(s) local(es) no pudieron publicarse y permanecen guardados en este dispositivo.`,
        `${migration.failed} local change(s) could not be published and remain saved on this device.`
      ));
    }
    setEditorDialogState(editorLoginModal, false);
    setEditorMode(true);
  }

  if(editorAccess) {
    editorAccess.addEventListener('click', () => {
      if(!editorAuthenticated) {
        openEditorLogin();
        return;
      }
      setEditorMode(true);
    });
  }

  if(editorExitMode) editorExitMode.addEventListener('click', () => { void finishEditingSession(); });

  if(editorLoginForm) {
    editorLoginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if(!editorLoginForm.checkValidity()) {
        editorLoginForm.reportValidity();
        return;
      }
      if(!catalogStore) {
        setEditorLoginFeedback(ui('La conexión segura no está disponible. Recarga la página.', 'The secure connection is unavailable. Reload the page.'));
        return;
      }
      const password = document.getElementById('editorPassword');
      editorLoginForm.querySelectorAll('button').forEach((button) => { button.disabled = true; });
      setEditorLoginFeedback(ui('Verificando acceso seguro…', 'Verifying secure access…'));
      try {
        await catalogStore.signIn(password ? password.value : '');
        editorAuthenticated = true;
        if(password) password.value = '';
        await activateEditorSession();
      } catch (error) {
        editorAuthenticated = false;
        await catalogStore.signOut();
        setEditorLoginFeedback(editorErrorText(error));
        if(password) { password.select(); password.focus(); }
      } finally {
        editorLoginForm.querySelectorAll('button').forEach((button) => { button.disabled = false; });
      }
    });
    editorLoginModal.addEventListener('click', (event) => {
      if(event.target === editorLoginModal || event.target.closest('[data-editor-login-close]')) setEditorDialogState(editorLoginModal, false);
    });
  }

  if(fleetEditorForm) {
    fleetEditorForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await saveEditorForm(true);
    });
    fleetEditorForm.addEventListener('input', (event) => {
      if(editingYachtIndex >= 0) {
        editorFormDirty = true;
        if(event.target.matches('[data-rate-label], [data-rate-label-en], [data-rate-value], [data-rate-estimated]')) {
          editorPricingDirty = true;
          syncPricingEditorFields(true);
        }
        updateEditorPreview(editingVehicles[editingYachtIndex]);
      }
    });
    fleetEditorForm.addEventListener('click', (event) => {
      if(event.target.closest('[data-pricing-add]')) {
        const container = document.getElementById('pricingEditorRows');
        if(container) {
          if(container.querySelectorAll('[data-pricing-row]').length >= 20) {
            setEditorStatus(ui('El tarifario admite hasta 20 filas.', 'The price table supports up to 20 rows.'), true);
            return;
          }
          container.insertAdjacentHTML('beforeend', pricingRowHTML({ label: '', value: '' }));
          const newRow = container.lastElementChild;
          if(newRow) newRow.querySelector('[data-rate-label]').focus();
          setEditorStatus('');
          editorFormDirty = true;
          editorPricingDirty = true;
        }
      }
      const removeRate = event.target.closest('[data-pricing-remove]');
      if(removeRate) {
        const rows = document.querySelectorAll('#pricingEditorRows [data-pricing-row]');
        if(rows.length > 1) removeRate.closest('[data-pricing-row]').remove();
        else {
          const row = removeRate.closest('[data-pricing-row]');
          row.querySelector('[data-rate-label]').value = '';
          row.querySelector('[data-rate-label-en]').value = '';
          row.querySelector('[data-rate-value]').value = '';
        }
        syncPricingEditorFields();
        editorFormDirty = true;
        editorPricingDirty = true;
      }
      if(event.target.closest('[data-fleet-editor-close]')) closeFleetEditor();
      if(event.target.closest('[data-editor-previous]')) void moveEditor(-1);
      if(event.target.closest('[data-editor-next]')) void moveEditor(1);
      if(event.target.closest('[data-editor-delete]')) void deleteEditorYacht();
      if(event.target.closest('[data-editor-logout]')) {
        void finishEditingSession();
      }
      if(event.target.closest('[data-editor-reset]') && editingYachtIndex >= 0) {
        void restoreEditorYacht();
      }
    });
    fleetEditor.addEventListener('click', (event) => {
      if(event.target === fleetEditor && !editorSaveInProgress) closeFleetEditor();
    });
  }

  filterBar.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if(!button) return;

    activeFilter = button.dataset.filter;
    visibleCount = 9;
    renderFilters();
    renderCatalog();
  });

  catalogGrid.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit-yacht]');
    if(editButton) {
      event.preventDefault();
      event.stopPropagation();
      openFleetEditor(yachts[Number(editButton.dataset.editYacht)]);
      return;
    }
    if(event.target.closest('a')) return;
    const card = event.target.closest('[data-yacht-index]');
    if(!card) return;

    openModal(yachts[Number(card.dataset.yachtIndex)]);
  });

  if(adventuresGrid) {
    adventuresGrid.addEventListener('click', (event) => {
      const editButton = event.target.closest('[data-edit-adventure]');
      if(editButton) {
        event.preventDefault();
        event.stopPropagation();
        openFleetEditor(adventures[Number(editButton.dataset.editAdventure)], adventures);
        return;
      }
      const card = event.target.closest('[data-adventure-index]');
      if(!card) return;

      openModal(adventures[Number(card.dataset.adventureIndex)]);
    });
  }

  loadMoreBtn.addEventListener('click', () => {
    visibleCount += 6;
    renderCatalog();
  });

  modal.addEventListener('click', (event) => {
    const modalMedia = modal.querySelector('.modal-media');
    if(event.target.closest('[data-gallery-prev]')) {
      event.stopPropagation();
      renderModalGalleryItem(modalMedia, Number(modalMedia.dataset.galleryIndex || 0) - 1);
      return;
    }
    if(event.target.closest('[data-gallery-next]')) {
      event.stopPropagation();
      renderModalGalleryItem(modalMedia, Number(modalMedia.dataset.galleryIndex || 0) + 1);
      return;
    }
    if(event.target.matches('[data-modal-close]') || event.target === modal) closeModal();
  });

  function applyCatalogSearch(){
    if(catalogSearch) {
      searchTerm = catalogSearch.value
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      visibleCount = 9;
      if(searchTerm) {
        activeFilter = 'Todos';
        renderFilters();
      }
      renderCatalog();
    }
  }

  if(catalogSearch && catalogSearchBtn) {
    catalogSearchBtn.addEventListener('click', applyCatalogSearch);
    catalogSearch.addEventListener('keydown', (event) => {
      if(event.key === 'Enter') {
        event.preventDefault();
        applyCatalogSearch();
      }
    });
    catalogSearch.addEventListener('input', applyCatalogSearch);
    catalogSearch.addEventListener('search', applyCatalogSearch);
  }

  document.addEventListener('keydown', (event) => {
    if(event.key !== 'Escape') return;
    if(editorSaveInProgress) return;
    if(fleetEditor && fleetEditor.classList.contains('is-open')) closeFleetEditor();
    else if(editorLoginModal && editorLoginModal.classList.contains('is-open')) setEditorDialogState(editorLoginModal, false);
    else if(modal.classList.contains('is-open')) closeModal();
  });

  document.addEventListener('prime:languagechange', () => {
    renderFilters();
    renderCatalog();
    renderAdventures();
    updateEditorAccess();
    if(modal.classList.contains('is-open')) closeModal();
  });

  document.addEventListener('error', (event) => {
    const target = event.target;
    if(target && target.matches && target.matches('img[data-hide-on-error]')) target.style.display = 'none';
  }, true);

  function requestCloudRefresh(force = false){
    if(!catalogStore) return;
    if(!force && Date.now() - lastCloudRefresh < 15000) return;
    void refreshCatalogFromCloud({ force }).catch(() => {});
  }

  window.addEventListener('focus', () => requestCloudRefresh());
  window.addEventListener('online', () => requestCloudRefresh(true));
  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState === 'visible') requestCloudRefresh();
  });
  window.setInterval(() => {
    if(document.visibilityState === 'visible') requestCloudRefresh();
  }, 120000);

  const cachedCloudCatalog = readCloudCatalogCache();
  if(cachedCloudCatalog) applyCloudCatalogState(cachedCloudCatalog);
  renderFilters();
  renderCatalog();
  renderAdventures();
  updateEditorAccess();
  requestCloudRefresh(true);
})();
