const WHATSAPP_NUMBER = "8098917023";

const images = {
  jetski: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=1200&q=80",
  offroad: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  boat: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80",
  yacht: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80",
  mega: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=1200&q=80",
  rd: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80"
};

const categories = [
  { id: "all", label: "Todos" },
  { id: "jetski", label: "Jet Ski" },
  { id: "offroad", label: "ATV / UTV" },
  { id: "boat", label: "Botes" },
  { id: "yacht", label: "Yates" },
  { id: "mega", label: "Mega Yates" },
  { id: "rd", label: "Republica Dominicana" }
];

const fleet = [
  {
    name: "Jet Ski",
    category: "jetski",
    pax: 2,
    location: "Miami, FL",
    rates: [["30 mins", "$80"], ["1 hora", "$150"]],
    includes: ["18+", "Disponible 7 dias", "Adrenalina"]
  },
  {
    name: "ATV - UTV",
    category: "offroad",
    pax: 4,
    location: "Miami, FL",
    rates: [["ATV 1 hora", "$120"], ["UTV 1 hora", "$250"]],
    includes: ["18+", "Disponible 7 dias", "Off-road"]
  },
  {
    name: "26' Sea Ray Sundeck",
    category: "boat",
    pax: 11,
    location: "River Landing, Miami, FL",
    rates: [["2 horas", "$350"], ["4 horas", "$600"], ["8 horas", "$1200"]],
    includes: ["Capitan", "Gasolina", "Hielo y agua", "Cooler", "Water toys"]
  },
  {
    name: "26' Sea Ray Mareblu II",
    category: "boat",
    pax: 12,
    location: "River Landing, Miami, FL",
    rates: [["2 horas", "$480"], ["4 horas", "$730"], ["8 horas", "$1300"]],
    includes: ["Capitan", "Gasolina", "Hielo y agua", "Water toys"]
  },
  {
    name: "Mastercraft X26",
    category: "boat",
    pax: 13,
    location: "Rickenbacker Key Biscayne",
    rates: [["2 horas", "$500"], ["4 horas", "$800"], ["8 horas", "$1525"]],
    includes: ["Capitan", "Gasolina", "Hielo y agua", "Water toys"]
  },
  {
    name: "33' De Antonio",
    category: "boat",
    pax: 12,
    location: "Isla del Mar Condominium",
    rates: [["4 horas", "$1325"], ["6 horas", "$1950"], ["8 horas", "$2425"]],
    includes: ["Capitan", "Gasolina", "Hielo y agua", "Cooler", "Water toys"]
  },
  {
    name: "34' Sundancer Sunshine",
    category: "yacht",
    pax: 13,
    location: "Isla del Mar Condominium",
    rates: [["4 horas", "$925"], ["6 horas", "$1350"], ["8 horas", "$1625"]],
    includes: ["Capitan", "Gasolina", "Agua y hielo", "Cooler", "Water toys"]
  },
  {
    name: "37' Cruiser Miami",
    category: "yacht",
    pax: 13,
    location: "2215 NW 14th St, Miami, FL",
    rates: [["3 horas", "$725"], ["4 horas", "$925"], ["6 horas", "$1200"]],
    includes: ["Capitan", "Gasolina", "Agua y hielo", "Cooler", "Water toys"]
  },
  {
    name: "37' Monterrey II",
    category: "yacht",
    pax: 13,
    location: "Miami, FL",
    rates: [["2 horas", "$575"], ["4 horas", "$875"], ["6 horas", "$1250"]],
    includes: ["Capitan", "Gasolina", "Agua y hielo", "Cooler", "Water toys"]
  },
  {
    name: "38' Evolve Miss Kate",
    category: "yacht",
    pax: 13,
    location: "River Landing, Miami, FL",
    rates: [["4 horas", "$1200"], ["6 horas", "$1500"]],
    includes: ["Capitan", "Musica", "A/C", "Party lights", "Water mat"]
  },
  {
    name: "40' Fjord",
    category: "yacht",
    pax: 13,
    location: "2060 NW 13 St, Miami, FL",
    rates: [["4 horas", "$1350"], ["6 horas", "$1850"], ["8 horas", "$2400"]],
    includes: ["Capitan y stew", "Gasolina", "Agua y hielo", "Water toys"]
  },
  {
    name: "45' Sundancer Blue",
    category: "yacht",
    pax: 13,
    location: "River Landing, Miami, FL",
    rates: [["4 horas", "$850"], ["6 horas", "$1000"]],
    includes: ["Capitan", "A/C", "Party lights", "Snorkeling", "Shower"]
  },
  {
    name: "48' Impulsive",
    category: "yacht",
    pax: 13,
    location: "Miami River",
    rates: [["4 horas", "$1150"], ["6 horas", "$1750"], ["8 horas", "$2300"]],
    includes: ["Capitan y stew", "Gasolina", "Agua y hielo", "Cooler", "Water toys"]
  },
  {
    name: "50' Sundancer Infinity One",
    category: "yacht",
    pax: 13,
    location: "River Landing, Miami, FL",
    rates: [["4 horas", "$850"], ["6 horas", "$1000"]],
    includes: ["Capitan", "Musica", "A/C", "Snorkeling", "Water mat"]
  },
  {
    name: "52' Fuel Sea Ray",
    category: "yacht",
    pax: 13,
    location: "Miami River",
    rates: [["4 horas", "$1250"], ["6 horas", "$2050"], ["8 horas", "$2500"]],
    includes: ["Capitan y stew", "Cooler", "Water toys", "Free jetski"]
  },
  {
    name: "53' Azimut",
    category: "yacht",
    pax: 13,
    location: "2215 NW 14th St, Miami, FL",
    rates: [["4 horas", "$1650"], ["6 horas", "$2150"], ["8 horas", "$2700"]],
    includes: ["Capitan y stew", "Gasolina", "Agua y hielo", "Cooler", "Water toys"]
  },
  {
    name: "60' Azimut Susi",
    category: "mega",
    pax: 13,
    location: "Miami River",
    rates: [["4 horas", "$1800"], ["6 horas", "$2625"], ["8 horas", "$3700"]],
    includes: ["Capitan", "Gasolina", "Hielo y agua", "Cooler", "Water toys"]
  },
  {
    name: "68' Galeon 2022",
    category: "mega",
    pax: 13,
    location: "Marina Palms",
    rates: [["4 horas", "$4000"], ["6 horas", "$5525"], ["8 horas", "$7700"]],
    includes: ["4 beds", "3 baths", "Capitan + stew", "Sound system", "Water toys"]
  },
  {
    name: "75' Prestige 2015",
    category: "mega",
    pax: 13,
    location: "Cox Landing",
    rates: [["4 horas", "$4750"], ["6 horas", "$5700"], ["8 horas", "$7200"]],
    includes: ["Capitan + stew", "Jetski", "Floating carpet", "Paddle board"]
  },
  {
    name: "90' Jacuzzi Sunseeker",
    category: "mega",
    pax: 13,
    location: "Miami, FL",
    rates: [["4 horas", "$3200"], ["6 horas", "$4600"], ["8 horas", "$6300"]],
    includes: ["Jacuzzi", "Capitan y mate", "Gasolina", "Cooler", "Water toys"]
  },
  {
    name: "120' Azimut 2012",
    category: "mega",
    pax: 13,
    location: "Miami Beach Marina",
    rates: [["4 horas", "$10400"], ["6 horas", "$14000"], ["8 horas", "$17500"]],
    includes: ["5 beds", "Jacuzzi", "Water slide", "Jetski", "Paddle boards"]
  },
  {
    name: "Caribbean Day Charter",
    category: "rd",
    pax: 12,
    location: "Republica Dominicana",
    rates: [["Medio dia", "Consultar"], ["Dia completo", "Consultar"]],
    includes: ["Plan privado", "Ruta caribena", "Cooler", "Musica", "A medida"]
  },
  {
    name: "Punta Cana Water Escape",
    category: "rd",
    pax: 10,
    location: "Republica Dominicana",
    rates: [["2 horas", "Consultar"], ["4 horas", "Consultar"]],
    includes: ["Costa Caribe", "Grupo privado", "Fotos", "Reserva directa"]
  }
];

let activeCategory = "all";
let query = "";

const filtersEl = document.getElementById("filters");
const gridEl = document.getElementById("fleetGrid");
const countEl = document.getElementById("resultCount");
const searchInput = document.getElementById("searchInput");
const clearFilters = document.getElementById("clearFilters");
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function waLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function categoryLabel(id) {
  return categories.find((cat) => cat.id === id)?.label || id;
}

function fromPrice(item) {
  const firstRate = item.rates?.[0]?.[1] || "Consultar";
  return firstRate;
}

function cardImage(item) {
  return images[item.category] || images.yacht;
}

function normalized(value) {
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getFilteredFleet() {
  const needle = normalized(query);
  return fleet.filter((item) => {
    const categoryMatch = activeCategory === "all" || item.category === activeCategory;
    const haystack = normalized([
      item.name,
      item.location,
      categoryLabel(item.category),
      item.includes.join(" ")
    ].join(" "));
    return categoryMatch && haystack.includes(needle);
  });
}

function renderFilters() {
  filtersEl.innerHTML = categories.map((cat) => `
    <button class="chip ${cat.id === activeCategory ? "active" : ""}" type="button" data-category="${cat.id}">
      ${escapeHTML(cat.label)}
    </button>
  `).join("");

  filtersEl.querySelectorAll(".chip").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      render();
    });
  });
}

function renderFleet() {
  const filtered = getFilteredFleet();
  countEl.textContent = `${filtered.length} ${filtered.length === 1 ? "experiencia" : "experiencias"}`;

  if (!filtered.length) {
    gridEl.innerHTML = `<div class="empty-state">No encontramos resultados. Prueba con otro nombre, destino o categoria.</div>`;
    return;
  }

  gridEl.innerHTML = filtered.map((item) => {
    const message = `Hola Iron Shark. Me interesa reservar ${item.name} en ${item.location}. ¿Me confirmas disponibilidad y precio?`;
    const rates = item.rates.map(([label, price]) => `<li><span>${escapeHTML(label)}</span><b>${escapeHTML(price)}</b></li>`).join("");
    const includes = item.includes.map((include) => `<li>${escapeHTML(include)}</li>`).join("");

    return `
      <article class="fleet-card">
        <div class="fleet-photo">
          <img src="${cardImage(item)}" alt="${escapeHTML(item.name)}" loading="lazy">
          <span class="fleet-badge">${escapeHTML(categoryLabel(item.category))}</span>
          <span class="fleet-pax">${escapeHTML(item.pax)} pax</span>
        </div>
        <div class="fleet-body">
          <h3>${escapeHTML(item.name)}</h3>
          <p class="fleet-location">${escapeHTML(item.location)}</p>
          <div class="fleet-price">
            <span>Desde</span>
            <strong>${escapeHTML(fromPrice(item))}</strong>
          </div>
          <ul class="rate-list">${rates}</ul>
          <ul class="includes">${includes}</ul>
        </div>
        <a class="btn btn-light" href="${waLink(message)}" target="_blank" rel="noopener">Reservar</a>
      </article>
    `;
  }).join("");
}

function render() {
  renderFilters();
  renderFleet();
}

function setGeneralLinks() {
  const message = "Hola Iron Shark. Quiero cotizar una experiencia en Miami o Republica Dominicana.";
  ["headerWa", "heroWa", "contactWa", "floatWa"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = waLink(message);
  });
}

function setupMenu() {
  function setOpen(open) {
    menuBtn.classList.toggle("open", open);
    nav.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Cerrar menu" : "Abrir menu");
  }

  menuBtn.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
}

searchInput.addEventListener("input", (event) => {
  query = event.target.value;
  renderFleet();
});

clearFilters.addEventListener("click", () => {
  activeCategory = "all";
  query = "";
  searchInput.value = "";
  render();
});

setGeneralLinks();
setupMenu();
render();
