
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

  if(!catalogGrid || !filterBar || !loadMoreBtn || !modal) return;

  const imageBase = 'https://loremflickr.com/900/650/';
  function shuffled(items){
    const copy = [...items];
    for(let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  const yachts = Array.isArray(window.PRIME_YACHTS) && window.PRIME_YACHTS.length
    ? shuffled(window.PRIME_YACHTS)
    : [];
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
      location: 'Miami Beach y Biscayne Bay',
      rates: 'Disponible por hora o como extra para charters privados.',
      price: 'Cotizar',
      priceLabel: 'por hora',
      notes: 'Ideal para recorridos rapidos, fotos en la bahia y grupos que quieren agregar adrenalina al dia de yate.',
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
      location: 'Miami y River Landing',
      rates: 'Renta flexible segun disponibilidad, horario y zona de salida.',
      price: 'Cotizar',
      priceLabel: 'segun ruta',
      notes: 'Opcion mas potente para quienes buscan velocidad, maniobra y una experiencia mas deportiva.',
      image: './assets/catalog-fallbacks/jetski.png',
      imageTags: 'luxury-jet-ski,ocean',
      fallback: './assets/hero/hero-03.gif'
    },
    {
      name: 'ATV Honda Rancher',
      category: 'ATV',
      size: 'Terrestre',
      sizeLabel: 'ATV',
      passengers: 1,
      location: 'Republica Dominicana',
      rates: 'Disponible para tours privados y experiencias de grupo.',
      price: 'Cotizar',
      priceLabel: 'por tour',
      notes: 'Perfecto para rutas de playa, caminos abiertos y aventuras fuera del agua con guia.',
      imageTags: 'atv,beach,adventure',
      fallback: './assets/hero/hero-04.gif'
    },
    {
      name: 'UTV Honda Pioneer',
      category: 'UTV',
      size: 'Terrestre',
      sizeLabel: 'UTV',
      passengers: 4,
      location: 'Republica Dominicana',
      rates: 'Disponible por reserva para familias, parejas y grupos.',
      price: 'Cotizar',
      priceLabel: 'por tour',
      notes: 'Mas comodo para compartir la ruta en grupo, con espacio adicional y manejo estable.',
      image: './assets/adventures/utv-honda-pioneer.png',
      imageTags: 'utv,offroad,adventure',
      fallback: './assets/hero/hero-05.jpg'
    },
    {
      name: 'ATV Group Experience',
      category: 'ATV',
      size: 'Grupo',
      sizeLabel: 'Aventura grupal',
      passengers: 8,
      location: 'Boca Chica, La Romana y Punta Cana',
      rates: 'Experiencia armada a medida segun cantidad de vehiculos y duracion.',
      price: 'Cotizar',
      priceLabel: 'grupo privado',
      notes: 'Pensado para cumpleaños, viajes corporativos y grupos que quieren una actividad terrestre completa.',
      image: 'https://resmark-production.s3.amazonaws.com/images/QeygN9/aa998b9b8f6e73b603e3a243d805461f5c0229db/original',
      imageTags: 'atv-tour,tropical,adventure',
      fallback: './assets/hero/hero-03.gif'
    }
  ];

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

  function yachtIntro(yacht){
    const passengerLabel = yacht.passengers === 1 ? '1 pasajero' : `${yacht.passengers} pasajeros`;
    return `${passengerLabel}. ${yacht.location}. ${compactText(yacht.rates || yacht.description || yacht.notes || '', 120)}`;
  }

  function baseHourlyPrice(vehicle){
    return vehicle && vehicle.category ? 250 : 300;
  }

  function cardPriceText(vehicle){
    return compactText(vehicle.description || vehicle.rates || vehicle.notes || `Precios desde $${baseHourlyPrice(vehicle)} USD por hora`, 130);
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
        <span class="cat-placeholder-text">Fotos disponibles en el link del bote</span>
      </span>
    `;
  }

  function photoLinkHTML(yacht, className = 'photo-link'){
    if(!isUsablePhotoLink(yacht)) return '';
    return `<a class="${className}" href="${escapeHTML(yacht.photoLink)}" target="_blank" rel="noopener noreferrer" aria-label="Ver más fotos de ${escapeHTML(yacht.name)}">Ver más fotos</a>`;
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
        yacht.passengers,
        yacht.rates
      ].join(' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      return searchable.includes(searchTerm);
    });
  }

  function renderFilters(){
    filterBar.innerHTML = filters.map((filter) => (
      `<button class="filter-btn${filter.key === activeFilter ? ' active' : ''}" type="button" data-filter="${filter.key}">${filter.label}</button>`
    )).join('');
  }

  function renderCatalog(){
    const filteredYachts = getFilteredYachts();
    const visibleYachts = filteredYachts.slice(0, visibleCount);

    catalogGrid.innerHTML = visibleYachts.length ? visibleYachts.map((yacht) => `
      <article class="cat-card" data-yacht-index="${yachts.indexOf(yacht)}">
        <div class="cat-open">
          <span class="cat-media">
            ${yachtMediaHTML(yacht, yachts.indexOf(yacht))}
            <span class="cat-badge">${escapeHTML(yacht.sizeLabel)}</span>
            <span class="cat-pax">${escapeHTML(yacht.passengers)} pasajeros</span>
          </span>
          <span class="cat-body">
            <span class="cat-kicker">${escapeHTML(yacht.size)} · ${escapeHTML(yacht.feet || '')}FT</span>
            <h3>${escapeHTML(yacht.name)}</h3>
            <span class="marina">${escapeHTML(yacht.location)}</span>
            <span class="incl">${escapeHTML(cardPriceText(yacht))}</span>
            <span class="cat-foot">
              <span class="price">${escapeHTML(yacht.price || `Desde $${baseHourlyPrice(yacht)}`)}<span>${escapeHTML(yacht.priceLabel || 'USD por hora')}</span></span>
              <span class="cat-actions">
                ${photoLinkHTML(yacht, 'cta-btn cat-photo-link')}
              </span>
            </span>
          </span>
        </div>
      </article>
    `).join('') : `<div class="catalog-empty"><strong>No encontramos embarcaciones</strong><span>Prueba otro nombre, tamaño o ubicación.</span></div>`;

    loadMoreBtn.style.display = visibleCount >= filteredYachts.length ? 'none' : 'inline-flex';
    loadMoreBtn.textContent = `Ver Mas Embarcaciones (${filteredYachts.length - visibleYachts.length})`;
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
    modal.querySelector('[data-modal-kicker]').textContent = `${yacht.size} | ${yacht.sizeLabel}`;
    modal.querySelector('[data-modal-title]').textContent = yacht.name;
    modal.querySelector('[data-modal-passengers]').textContent = yacht.passengers === 1 ? '1 pasajero' : `${yacht.passengers} pasajeros`;
    modal.querySelector('[data-modal-location]').textContent = yacht.location;
    modal.querySelector('[data-modal-rates]').textContent = quotePriceText(yacht);
    modal.querySelector('[data-modal-notes]').textContent = cleanNotes(yacht.notes) || 'Confirma disponibilidad y condiciones al solicitar la cotización.';
    modal.querySelector('[data-modal-summary]').textContent = yachtIntro(yacht);
    const description = modal.querySelector('[data-modal-description]');
    const photoLink = modal.querySelector('[data-modal-photo-link]');
    if(description) description.textContent = yacht.description || quotePriceText(yacht);
    if(photoLink) {
      photoLink.href = isUsablePhotoLink(yacht) ? yacht.photoLink : '#';
      photoLink.textContent = 'Ver más fotos';
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
        <button class="adv-open" type="button" aria-label="Ver detalles de ${adventure.name}">
          <span class="adv-media" style="background-image:url('${imageFor(adventure, adventures.indexOf(adventure), 'adventure-') || fallbackImage(adventure)}')">
            <img src="${escapeHTML(imageFor(adventure, adventures.indexOf(adventure), 'adventure-') || fallbackImage(adventure))}" alt="${escapeHTML(adventure.name)}" loading="lazy" onerror="this.style.display='none'">
            <span class="cat-badge">${adventure.sizeLabel}</span>
            <span class="cat-pax">${adventure.passengers === 1 ? '1 pasajero' : `${adventure.passengers} pasajeros`}</span>
          </span>
          <span class="adv-body">
            <span class="tag">${adventure.category}</span>
            <h3>${adventure.name}</h3>
            <span class="meta">${adventure.location}</span>
            <span class="adv-desc">${escapeHTML(cardPriceText(adventure))}</span>
            <span class="adv-prices">
              <span class="adv-price">
                <span class="d">${escapeHTML(adventure.priceLabel || 'por hora')}</span>
                <span class="v">${escapeHTML(adventure.price || `Desde $${baseHourlyPrice(adventure)}`)}</span>
              </span>
              <span class="adv-link">Ver detalles</span>
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

  filterBar.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if(!button) return;

    activeFilter = button.dataset.filter;
    visibleCount = 9;
    renderFilters();
    renderCatalog();
  });

  catalogGrid.addEventListener('click', (event) => {
    if(event.target.closest('a')) return;
    const card = event.target.closest('[data-yacht-index]');
    if(!card) return;

    openModal(yachts[Number(card.dataset.yachtIndex)]);
  });

  if(adventuresGrid) {
    adventuresGrid.addEventListener('click', (event) => {
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
    if(event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  renderFilters();
  renderCatalog();
  renderAdventures();
})();
