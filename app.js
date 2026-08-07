
(function(){
  const translations = {
    es: {},
    en: {
      'language.label': 'Select language',
      'nav.destinations': 'Destinations', 'nav.deals': 'Deals', 'nav.contact': 'Contact', 'nav.book': 'Book Now',
      'hero.eyebrow': 'Miami, FL & Dominican Republic',
      'hero.title': 'Experience luxury on the <em>sea</em>, without borders',
      'hero.lead': 'Prime Yacht Rental offers an exclusive fleet of yachts, boats, jet skis and ATVs in Miami and the Dominican Republic. Private charters, captain included, and five-star service for every occasion.',
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
  const modal = document.getElementById('yachtModal');
  const editorAccess = document.getElementById('editorAccess');
  const editorExitMode = document.getElementById('editorExitMode');
  const editorLoginModal = document.getElementById('editorLoginModal');
  const editorLoginForm = document.getElementById('editorLoginForm');
  const editorLoginFeedback = document.getElementById('editorLoginFeedback');
  const fleetEditor = document.getElementById('fleetEditor');
  const fleetEditorForm = document.getElementById('fleetEditorForm');

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
      .replace(/Lun-Jue/gi, 'Mon–Thu')
      .replace(/lunes a jueves/gi, 'Monday through Thursday')
      .replace(/D[ií]as laborables/gi, 'Weekdays')
      .replace(/Fin de semana/gi, 'Weekend')
      .replace(/Vie\/Dom/gi, 'Fri/Sun')
      .replace(/S[aá]b/gi, 'Sat')
      .replace(/Dep[oó]sito requerido/gi, 'Required deposit')
      .replace(/Tarifas de fin de semana disponibles en la ficha/gi, 'Weekend rates available in the listing')
      .replace(/Precio desde/gi, 'Rates from')
      .replace(/Tarifas sujetas a horario y disponibilidad/gi, 'Rates subject to schedule and availability')
      .replace(/Cotizar/gi, 'Request quote');
  }
  function localizedRate(value){ return isEnglish() ? englishRate(value) : value; }

  const imageBase = 'https://loremflickr.com/900/650/';
  function shuffled(items){
    const copy = [...items];
    for(let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  const editorStorageKey = 'prime-yacht-editor-v1';
  const editorDeletedStorageKey = 'prime-yacht-deleted-v1';
  function yachtStorageKey(yacht){ return yacht.mediaKey || yacht.name; }
  function readEditorChanges(){
    try { return JSON.parse(localStorage.getItem(editorStorageKey) || '{}'); } catch (_) { return {}; }
  }
  function readDeletedYachts(){
    try {
      const deleted = JSON.parse(localStorage.getItem(editorDeletedStorageKey) || '[]');
      return Array.isArray(deleted) ? deleted : [];
    } catch (_) { return []; }
  }
  const savedEditorChanges = readEditorChanges();
  const deletedYachtKeys = new Set(readDeletedYachts());
  const sourceYachts = Array.isArray(window.PRIME_YACHTS) ? window.PRIME_YACHTS.map((yacht) => ({ ...yacht })) : [];
  const originalYachts = new Map(sourceYachts.map((yacht) => [yachtStorageKey(yacht), { ...yacht }]));
  sourceYachts.forEach((yacht) => Object.assign(yacht, savedEditorChanges[yachtStorageKey(yacht)] || {}));
  const yachts = sourceYachts.length ? shuffled(sourceYachts.filter((yacht) => !deletedYachtKeys.has(yachtStorageKey(yacht)))) : [];
  const catalogMedia = window.PRIME_MEDIA || {};

  const filters = [
    { key: 'Todos', label: 'Todos' },
    { key: 'Pequeno', label: '26-38 pies' },
    { key: 'Mediano', label: '40-58 pies' },
    { key: 'Grande', label: '60-88 pies' },
    { key: 'Premium', label: '90+ pies' }
  ];

  const adventures = [
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
  ];
  const originalAdventures = new Map(adventures.map((adventure) => [yachtStorageKey(adventure), { ...adventure }]));
  adventures.forEach((adventure) => Object.assign(adventure, savedEditorChanges[yachtStorageKey(adventure)] || {}));
  for(let index = adventures.length - 1; index >= 0; index -= 1) {
    if(deletedYachtKeys.has(yachtStorageKey(adventures[index]))) adventures.splice(index, 1);
  }

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
        if(/(?:hours?|horas?|hrs?|\b\d+h\b).*\$|\$.*(?:hours?|horas?|hrs?|\b\d+h\b)/i.test(line)) return false;
        if(/^(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekday|weekend|mon|tue|wed|thu|fri|sat|sun)/i.test(line)) return false;
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

    const index = yachts.indexOf(yacht) + 1;
    const tags = {
      Pequeno: 'boat,yacht',
      Mediano: 'motor-yacht,boat',
      Grande: 'luxury-yacht,miami',
      Premium: 'superyacht,luxury-yacht'
    };

    return `${imageBase}${tags[yacht.size] || 'yacht,boat'}?lock=${index}`;
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
      ? catalogMedia[key].map(normalizeMedia).filter((item) => item.src)
      : [];
    if(localItems.length) return localItems;

    const fallback = vehicle.category ? adventureImage(vehicle) : (hasDirectImage(vehicle.image) ? vehicle.image : yachtImage(vehicle));
    return fallback ? [{ type: isVideoMedia(fallback) ? 'video' : 'image', src: fallback }] : [];
  }

  function imageFor(vehicle, index, prefix = ''){
    if(vehicle.coverImage) return vehicle.coverImage;
    const gallery = galleryFor(vehicle, index, prefix);
    const localImage = gallery.find((item) => normalizeMedia(item).type === 'image');
    if(localImage) return normalizeMedia(localImage).src;
    return vehicle.category ? adventureImage(vehicle) : yachtImage(vehicle);
  }

  function mediaElementHTML(item, alt, className = ''){
    const media = normalizeMedia(item);
    const classAttr = className ? ` class="${escapeHTML(className)}"` : '';
    if(media.type === 'video') {
      const poster = media.poster ? ` poster="${escapeHTML(media.poster)}"` : '';
      return `<video${classAttr} src="${escapeHTML(media.src)}"${poster} muted playsinline controls preload="metadata"></video>`;
    }
    return `<img${classAttr} src="${escapeHTML(media.src)}" alt="${escapeHTML(alt)}" loading="lazy" onerror="this.style.display='none'">`;
  }

  function hasDirectImage(url){
    return Boolean(url && (/^https?:\/\//i.test(url) || /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url)));
  }

  function isUsablePhotoLink(yacht){
    if(yacht.photoLinkEnabled === false) return false;
    const url = String(yacht.photoLink || '');
    if(!/^https?:\/\//i.test(url)) return false;
    return !/(?:bing\.com\/images|tse\d*\.mm\.bing\.net)/i.test(url);
  }

  function yachtMediaHTML(yacht, index){
    const image = imageFor(yacht, index);
    if(image) {
      return `<img src="${escapeHTML(image)}" alt="${escapeHTML(yacht.name)}" loading="lazy" onerror="this.style.display='none'">`;
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
    if(adventure.image) return adventure.image;
    const index = adventures.indexOf(adventure) + 101;
    return `${imageBase}${adventure.imageTags}?lock=${index}`;
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

    if(!searchTerm) return sizeFiltered;

    return sizeFiltered.filter((yacht) => {
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
  }

  function renderFilters(){
    filterBar.innerHTML = filters.map((filter) => (
      `<button class="filter-btn${filter.key === activeFilter ? ' active' : ''}" type="button" data-filter="${filter.key}">${filter.key === 'Todos' ? ui('Todos', 'All') : filter.label.replace('pies', ui('pies', 'ft'))}</button>`
    )).join('');
  }

  function renderCatalog(){
    const filteredYachts = getFilteredYachts();
    const visibleYachts = filteredYachts.slice(0, visibleCount);

    catalogGrid.innerHTML = visibleYachts.length ? visibleYachts.map((yacht) => `
      <article class="cat-card" data-yacht-index="${yachts.indexOf(yacht)}">
        <button class="card-edit-btn" type="button" data-edit-yacht="${yachts.indexOf(yacht)}"><span aria-hidden="true">✎</span> ${ui('Editar tarjeta', 'Edit card')}</button>
        <div class="cat-open">
          <span class="cat-media">
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
    modalMedia.style.backgroundImage = image ? `url('${image}')` : '';
    modalMedia.classList.toggle('no-photo', !image);
    modalMedia.dataset.placeholder = `${yacht.feet || ''}' ${yacht.name}`;
    modalMedia.innerHTML = image
      ? `<img class="modal-active-media" src="${escapeHTML(image)}" alt="${escapeHTML(yacht.name)}" onerror="this.style.display='none'">`
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
        <button class="adv-open" type="button" aria-label="${ui('Ver detalles de', 'View details for')} ${adventure.name}">
          <span class="adv-media" style="background-image:url('${imageFor(adventure, adventures.indexOf(adventure), 'adventure-') || fallbackImage(adventure)}')">
            <img src="${escapeHTML(imageFor(adventure, adventures.indexOf(adventure), 'adventure-') || fallbackImage(adventure))}" alt="${escapeHTML(adventure.name)}" loading="lazy" onerror="this.style.display='none'">
            <span class="cat-badge">${adventure.sizeLabel}</span>
            <span class="cat-pax">${adventure.passengers === 1 ? ui('1 pasajero', '1 passenger') : `${adventure.passengers} ${ui('pasajeros', 'passengers')}`}</span>
          </span>
          <span class="adv-body">
            <span class="tag">${adventure.category}</span>
            <h3>${adventure.name}</h3>
            <span class="meta">${localizedLocation(adventure.location)}</span>
            ${priceTableHTML(adventure)}
            <span class="adv-prices">
              <span class="adv-price">
                <span class="d">${escapeHTML(localizedRate(adventure.priceLabel || ui('por hora', 'per hour')))}</span>
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
    modalMedia.style.backgroundImage = item.type === 'image' ? `url('${item.src}')` : '';
    modalMedia.classList.remove('no-photo');
    modalMedia.innerHTML = `
      ${mediaElementHTML(item, modalMedia._galleryTitle || 'Galeria', 'modal-active-media')}
      ${gallery.length > 1 ? `
        <button class="gallery-nav gallery-prev" type="button" data-gallery-prev aria-label="Medio anterior">‹</button>
        <button class="gallery-nav gallery-next" type="button" data-gallery-next aria-label="Medio siguiente">›</button>
        <span class="gallery-status" data-gallery-status>${index + 1} / ${gallery.length}</span>
      ` : ''}
    `;
  }

  let editorAuthenticated = false;
  let editingYachtIndex = -1;
  let editingVehicles = yachts;
  try { editorAuthenticated = sessionStorage.getItem('prime-editor-session') === 'active'; } catch (_) {}

  function editorField(name){
    return fleetEditorForm ? fleetEditorForm.elements.namedItem(name) : null;
  }

  function editorPriceRows(yacht){
    const rows = Array.isArray(yacht.priceTable) && yacht.priceTable.length
      ? yacht.priceTable
      : parsePriceRows(yacht.rates);
    if(rows.length) return rows.map((row) => ({ ...row, labelEn: row.labelEn || englishRate(row.label || '') }));
    return [{ label: 'Tarifa base', labelEn: 'Base rate', value: yacht.price || '' }];
  }

  function pricingRowHTML(row = {}){
    return `<div class="pricing-editor-row" data-pricing-row${row.estimated ? ' data-estimated="true"' : ''}>
      <input type="text" data-rate-label value="${escapeHTML(row.label || '')}" placeholder="${ui('Ej. 4 horas', 'E.g. 4 hours')}" aria-label="${ui('Duración o condición', 'Duration or condition')}" required>
      <input type="text" data-rate-label-en value="${escapeHTML(row.labelEn || englishRate(row.label || ''))}" placeholder="E.g. 4 hours" aria-label="English rate label" required>
      <input type="text" data-rate-value value="${escapeHTML(row.value || '')}" placeholder="$650" aria-label="${ui('Precio o rango', 'Price or range')}" required>
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
      ...(row.dataset.estimated === 'true' ? { estimated: true } : {})
    })).filter((row) => row.label || row.value);
  }

  function rateValueNumber(value){
    const compact = String(value || '');
    const thousands = compact.match(/\$?\s*(\d+(?:\.\d+)?)\s*k\b/i);
    if(thousands) return Math.round(Number(thousands[1]) * 1000);
    const match = compact.match(/\$?\s*([\d,.]+)/);
    if(!match) return null;
    return Number(match[1].replace(/,/g, ''));
  }

  function formattedPrice(value){
    return `$${Math.round(value).toLocaleString('en-US')}`;
  }

  function syncPricingEditorFields(){
    const rows = readPricingEditorRows();
    if(!rows.length) return rows;
    const rates = rows.map((row) => `${row.label}: ${row.value}`).join(' | ');
    const ratesField = editorField('rates');
    const ratesEnField = editorField('ratesEn');
    if(ratesField) ratesField.value = rates;
    if(ratesEnField) ratesEnField.value = rows.map((row) => `${row.labelEn || englishRate(row.label)}: ${row.value}`).join(' | ');
    const amounts = rows.map((row) => rateValueNumber(row.value)).filter(Number.isFinite);
    if(amounts.length) {
      editorField('price').value = formattedPrice(Math.min(...amounts));
      editorField('priceLabel').value = rows.some((row) => row.estimated) ? 'desde · tarifa estimada' : 'precio desde';
      editorField('priceLabelEn').value = rows.some((row) => row.estimated) ? 'from · estimated rate' : 'rates from';
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
    if(editorLoginFeedback) editorLoginFeedback.textContent = '';
    setEditorDialogState(editorLoginModal, true);
    const password = document.getElementById('editorPassword');
    if(password) window.setTimeout(() => password.focus(), 40);
  }

  function updateEditorPreview(yacht){
    if(!fleetEditorForm || !yacht) return;
    const previewName = document.getElementById('fleetEditorPreviewName');
    const previewMeta = document.getElementById('fleetEditorPreviewMeta');
    const previewImage = document.getElementById('fleetEditorImage');
    const name = editorField('name').value || yacht.name;
    const feet = editorField('feet').value || yacht.feet || '';
    const passengers = editorField('passengers').value || yacht.passengers || '';
    if(previewName) previewName.textContent = name;
    if(previewMeta) previewMeta.textContent = yacht.category
      ? `${yacht.category} · ${passengers} ${ui('pasajeros', 'passengers')}`
      : `${feet} FT · ${passengers} ${ui('pasajeros', 'passengers')}`;
    if(previewImage) {
      previewImage.src = editorField('image').value || imageFor(yacht, editingYachtIndex) || fallbackImage(yacht);
      previewImage.alt = name;
    }
  }

  function fillEditorForm(yacht){
    if(!fleetEditorForm || !yacht) return;
    const values = {
      name: yacht.name || '', feet: yacht.feet || '', passengers: yacht.passengers || '',
      price: yacht.price || '', image: yacht.image || '', location: yacht.location || '',
      rates: yacht.rates || '', notes: yacht.notes || '', priceLabel: yacht.priceLabel || '',
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
    const status = document.getElementById('editorSaveStatus');
    if(status) status.textContent = '';
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
    setEditorDialogState(fleetEditor, false);
    editingYachtIndex = -1;
    editingVehicles = yachts;
  }

  function finishEditingSession(){
    if(fleetEditor && fleetEditor.classList.contains('is-open') && editingYachtIndex >= 0) {
      if(!saveEditorForm(false)) return;
    }
    closeFleetEditor();
    editorAuthenticated = false;
    try { sessionStorage.removeItem('prime-editor-session'); } catch (_) {}
    setEditorMode(false);
  }

  function saveEditorForm(showMessage = true){
    if(!fleetEditorForm || editingYachtIndex < 0) return false;
    const priceTable = syncPricingEditorFields();
    if(!fleetEditorForm.checkValidity()) {
      fleetEditorForm.reportValidity();
      return false;
    }
    const yacht = editingVehicles[editingYachtIndex];
    const changes = {
      name: editorField('name').value.trim(),
      feet: yacht.category ? (yacht.feet || 0) : Number(editorField('feet').value),
      passengers: Number(editorField('passengers').value),
      price: editorField('price').value.trim(),
      image: editorField('image').value.trim(),
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
    Object.assign(yacht, changes);
    const allChanges = readEditorChanges();
    allChanges[yachtStorageKey(yacht)] = changes;
    try { localStorage.setItem(editorStorageKey, JSON.stringify(allChanges)); } catch (_) {}
    renderCatalog();
    renderAdventures();
    updateEditorPreview(yacht);
    if(showMessage) {
      const status = document.getElementById('editorSaveStatus');
      if(status) status.textContent = ui('Cambios guardados', 'Changes saved');
    }
    return true;
  }

  function moveEditor(direction){
    if(!editingVehicles.length) return;
    if(!saveEditorForm(false)) return;
    editingYachtIndex = (editingYachtIndex + direction + editingVehicles.length) % editingVehicles.length;
    fillEditorForm(editingVehicles[editingYachtIndex]);
  }

  function deleteEditorYacht(){
    if(editingYachtIndex < 0 || !editingVehicles[editingYachtIndex]) return;
    const yacht = editingVehicles[editingYachtIndex];
    const confirmed = window.confirm(ui(
      `¿Eliminar “${yacht.name}” del catálogo? Esta acción ocultará la tarjeta en este dispositivo.`,
      `Delete “${yacht.name}” from the catalog? This will hide the card on this device.`
    ));
    if(!confirmed) return;

    const key = yachtStorageKey(yacht);
    deletedYachtKeys.add(key);
    try { localStorage.setItem(editorDeletedStorageKey, JSON.stringify([...deletedYachtKeys])); } catch (_) {}
    const allChanges = readEditorChanges();
    delete allChanges[key];
    try { localStorage.setItem(editorStorageKey, JSON.stringify(allChanges)); } catch (_) {}

    editingVehicles.splice(editingYachtIndex, 1);
    if(editingVehicles === yachts && statBoats) statBoats.textContent = yachts.length;
    visibleCount = Math.min(Math.max(visibleCount, 9), Math.max(yachts.length, 9));
    renderCatalog();
    renderAdventures();

    if(!editingVehicles.length) {
      closeFleetEditor();
      return;
    }
    editingYachtIndex = Math.min(editingYachtIndex, editingVehicles.length - 1);
    fillEditorForm(editingVehicles[editingYachtIndex]);
    const status = document.getElementById('editorSaveStatus');
    if(status) status.textContent = ui('Tarjeta eliminada', 'Card deleted');
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

  if(editorExitMode) editorExitMode.addEventListener('click', finishEditingSession);

  if(editorLoginForm) {
    editorLoginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const password = document.getElementById('editorPassword');
      if(password && password.value === '123456') {
        editorAuthenticated = true;
        try { sessionStorage.setItem('prime-editor-session', 'active'); } catch (_) {}
        setEditorDialogState(editorLoginModal, false);
        setEditorMode(true);
      } else if(editorLoginFeedback) {
        editorLoginFeedback.textContent = 'Clave incorrecta. Inténtalo de nuevo.';
        if(password) { password.select(); password.focus(); }
      }
    });
    editorLoginModal.addEventListener('click', (event) => {
      if(event.target === editorLoginModal || event.target.closest('[data-editor-login-close]')) setEditorDialogState(editorLoginModal, false);
    });
  }

  if(fleetEditorForm) {
    fleetEditorForm.addEventListener('submit', (event) => {
      event.preventDefault();
      saveEditorForm(true);
    });
    fleetEditorForm.addEventListener('input', () => {
      if(editingYachtIndex >= 0) {
        syncPricingEditorFields();
        updateEditorPreview(editingVehicles[editingYachtIndex]);
      }
    });
    fleetEditorForm.addEventListener('click', (event) => {
      if(event.target.closest('[data-pricing-add]')) {
        const container = document.getElementById('pricingEditorRows');
        if(container) {
          container.insertAdjacentHTML('beforeend', pricingRowHTML({ label: '', value: '' }));
          const newRow = container.lastElementChild;
          if(newRow) newRow.querySelector('[data-rate-label]').focus();
        }
      }
      const removeRate = event.target.closest('[data-pricing-remove]');
      if(removeRate) {
        const rows = document.querySelectorAll('#pricingEditorRows [data-pricing-row]');
        if(rows.length > 1) removeRate.closest('[data-pricing-row]').remove();
        else {
          const row = removeRate.closest('[data-pricing-row]');
          row.querySelector('[data-rate-label]').value = '';
          row.querySelector('[data-rate-value]').value = '';
        }
        syncPricingEditorFields();
      }
      if(event.target.closest('[data-fleet-editor-close]')) closeFleetEditor();
      if(event.target.closest('[data-editor-previous]')) moveEditor(-1);
      if(event.target.closest('[data-editor-next]')) moveEditor(1);
      if(event.target.closest('[data-editor-delete]')) deleteEditorYacht();
      if(event.target.closest('[data-editor-logout]')) {
        finishEditingSession();
      }
      if(event.target.closest('[data-editor-reset]') && editingYachtIndex >= 0) {
        const yacht = editingVehicles[editingYachtIndex];
        if(!window.confirm(ui('¿Restaurar la información original de esta tarjeta?', 'Restore this card’s original information?'))) return;
        const key = yachtStorageKey(yacht);
        const original = (editingVehicles === adventures ? originalAdventures : originalYachts).get(key);
        ['locationEn','ratesEn','notesEn','priceLabelEn','photoLinkEnabled'].forEach((field) => delete yacht[field]);
        delete yacht.priceTable;
        if(original) Object.assign(yacht, { ...original });
        const allChanges = readEditorChanges();
        delete allChanges[key];
        try { localStorage.setItem(editorStorageKey, JSON.stringify(allChanges)); } catch (_) {}
        renderCatalog();
        renderAdventures();
        fillEditorForm(yacht);
        const status = document.getElementById('editorSaveStatus');
        if(status) status.textContent = ui('Tarjeta restaurada', 'Card restored');
      }
    });
    fleetEditor.addEventListener('click', (event) => {
      if(event.target === fleetEditor) closeFleetEditor();
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

  renderFilters();
  renderCatalog();
  renderAdventures();
  updateEditorAccess();
})();
