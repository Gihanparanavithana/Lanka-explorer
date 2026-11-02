// ===== 1. MOBILE MENU (Week 02) =====
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      const isOpen = nav.classList.contains('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
  }
});

// ===== 2. LOAD DATA =====
async function loadDestinations() {
  const response = await fetch('data/destinations.json');
  if (!response.ok) throw new Error('Could not load destinations (status ' + response.status + ')');
  return await response.json();
}

// ===== 3. HELPER FUNCTIONS =====
function formatFee(fee) { return fee === 0 ? 'Free' : 'USD ' + fee; }
function getPriceLabel(fee) {
  if (fee === 0) return 'Free';
  if (fee <= 15) return 'Budget';
  if (fee <= 30) return 'Mid-range';
  return 'Premium';
}
function getCategoryClass(category) {
  switch (category) {
    case 'Heritage': return 'badge-heritage';
    case 'Beach': return 'badge-beach';
    case 'Nature': return 'badge-nature';
    case 'Wildlife': return 'badge-wildlife';
    default: return 'badge-other';
  }
}
function createCard(place) {
  const card = document.createElement('article');
  card.className = 'card card-enter';
  card.innerHTML = `
    <img src="${place.image}" alt="${place.name}">
    <h3>${place.name}</h3>
    <p class="meta"><span class="badge ${getCategoryClass(place.category)}">${place.category}</span> ${place.district} District</p>
    <p>${place.description}</p>
    <p class="fee">Entry: ${formatFee(place.entryFeeUSD)}${place.entryFeeUSD > 0 ? ` · ${getPriceLabel(place.entryFeeUSD)}` : ''}</p>
    <a href="details.html?id=${place.id}">View details</a>`;
  return card;
}


// ===== 3b. LOADING AND ERROR HELPERS (Week 04) =====
function showLoading(element, text) {
  if (!element) return;
  element.innerHTML = `<div class="loading"><span class="spinner" aria-hidden="true"></span><span>${text}</span></div>`;
}

function showError(element, text) {
  if (!element) return;
  element.innerHTML = `<p class="error">${text}</p>`;
}

// ===== 4. HOME PAGE =====
async function initHomePage() {
  const section = document.querySelector('#featured');
  if (!section) return;
  try {
    const destinations = await loadDestinations();
    section.querySelectorAll('.card, .no-results').forEach(el => el.remove());
    destinations.filter(place => place.featured === true).forEach(place => section.appendChild(createCard(place)));
  } catch (error) {
    section.insertAdjacentHTML('beforeend', '<p class="error">Featured destinations could not be loaded.</p>');
    console.error(error);
  }
}

// ===== 5. DESTINATIONS PAGE =====
async function initDestinationsPage() {
  const list = document.querySelector('#destination-list');
  if (!list) return;
  const searchInput = document.querySelector('#search');
  const categorySelect = document.querySelector('#category');
  const sortSelect = document.querySelector('#sort');
  const resultCount = document.querySelector('#result-count');
  let allDestinations = [];
  showLoading(list, 'Loading destinations...');
  try { allDestinations = await loadDestinations(); }
  catch (error) {
    showError(list, 'Sorry, destinations could not be loaded. Please try again later.');
    console.error(error); return;
  }
  showAllDestinationsMap(allDestinations);
  function updateList() {
    const text = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    const results = allDestinations.filter(place =>
      (place.name.toLowerCase().includes(text) || place.district.toLowerCase().includes(text) || place.description.toLowerCase().includes(text)) &&
      (category === 'all' || place.category === category));
    if (sortSelect.value === 'name') results.sort((a,b) => a.name.localeCompare(b.name));
    else if (sortSelect.value === 'fee-low') results.sort((a,b) => a.entryFeeUSD-b.entryFeeUSD);
    else if (sortSelect.value === 'fee-high') results.sort((a,b) => b.entryFeeUSD-a.entryFeeUSD);
    list.innerHTML = '';
    if (!results.length) list.innerHTML = '<p class="no-results">No destinations match your search.</p>';
    else results.forEach(place => list.appendChild(createCard(place)));
    resultCount.textContent = `Showing ${results.length} of ${allDestinations.length} destinations`;
  }
  searchInput.addEventListener('input', updateList);
  categorySelect.addEventListener('change', updateList);
  sortSelect.addEventListener('change', updateList);
  updateList();
}


// ===== 5b. API: WEATHER (Open-Meteo) =====
function describeWeather(code) {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Mixed conditions';
}

async function showWeather(place) {
  const box = document.querySelector('#weather');
  if (!box) return;
  showLoading(box, 'Loading weather...');
  const url = 'https://api.open-meteo.com/v1/forecast'
    + `?latitude=${place.lat}&longitude=${place.lng}`
    + '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
    + '&timezone=Asia%2FColombo&forecast_days=3';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API error (status ' + response.status + ')');
    const data = await response.json();
    const current = data.current;
    const daily = data.daily;
    let forecastHtml = '';
    for (let i = 0; i < daily.time.length; i++) {
      const dayName = new Date(daily.time[i]).toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short'
      });
      forecastHtml += `<div class="forecast-day">
        <strong>${dayName}</strong>
        <p>${describeWeather(daily.weather_code[i])}</p>
        <p>${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°C</p>
        <p>Rain: ${daily.precipitation_probability_max[i]}%</p>
      </div>`;
    }
    box.innerHTML = `<div class="weather-now">
      <p class="temp">${Math.round(current.temperature_2m)}°C</p>
      <p>${describeWeather(current.weather_code)}</p>
      <p>Humidity ${current.relative_humidity_2m}% · Wind ${current.wind_speed_10m} km/h</p>
    </div><div class="forecast">${forecastHtml}</div>`;
  } catch (error) {
    showError(box, 'Weather is unavailable right now. Please try again later.');
    console.error(error);
  }
}

// ===== 5c. API: CURRENCY (Frankfurter) =====
let usdToLkrRate = null;

async function getUsdToLkrRate() {
  if (usdToLkrRate !== null) return usdToLkrRate;
  const response = await fetch('https://api.frankfurter.dev/v2/rate/usd/lkr');
  if (!response.ok) throw new Error('Currency API error (status ' + response.status + ')');
  const data = await response.json();
  usdToLkrRate = data.rate;
  return usdToLkrRate;
}

function formatLkr(amount) {
  return 'Rs. ' + Math.round(amount).toLocaleString('en-LK');
}

async function showFeeInLkr(place) {
  const feeBox = document.querySelector('#fee-lkr');
  if (!feeBox || Number(place.entryFeeUSD) === 0) return;
  try {
    const rate = await getUsdToLkrRate();
    feeBox.textContent = ` ≈ ${formatLkr(Number(place.entryFeeUSD) * rate)}`;
  } catch (error) {
    feeBox.textContent = '';
    console.error(error);
  }
}

// ===== 5d. API: MAPS (Leaflet + OpenStreetMap) =====
function addBaseLayer(map) {
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

function showMap(place) {
  const mapBox = document.querySelector('#map');
  if (!mapBox) return;
  if (typeof L === 'undefined') {
    mapBox.textContent = 'The map could not be loaded.';
    return;
  }
  mapBox.textContent = '';
  const map = L.map('map').setView([place.lat, place.lng], 13);
  addBaseLayer(map);
  L.marker([place.lat, place.lng]).addTo(map)
    .bindPopup(`<strong>${place.name}</strong><br>${place.district} District`)
    .openPopup();
}

function showAllDestinationsMap(destinations) {
  const mapBox = document.querySelector('#all-map');
  if (!mapBox) return;
  if (typeof L === 'undefined') {
    mapBox.textContent = 'The map could not be loaded.';
    return;
  }
  const map = L.map('all-map');
  addBaseLayer(map);
  const points = [];
  for (const place of destinations) {
    L.marker([place.lat, place.lng]).addTo(map).bindPopup(
      `<strong>${place.name}</strong><br>${place.category}<br><a href="details.html?id=${place.id}">View details</a>`
    );
    points.push([place.lat, place.lng]);
  }
  if (points.length) map.fitBounds(points, { padding: [30, 30] });
}

// ===== 6. DETAILS PAGE =====
async function initDetailsPage() {
  const container = document.querySelector('#destination');
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  showLoading(container, 'Loading destination...');
  try {
    const destinations = await loadDestinations();
    const place = destinations.find(p => p.id === id);
    if (!place) {
      container.innerHTML = '<h1>Destination not found</h1><p><a href="destinations.html">Back to all destinations</a></p>';
      return;
    }
    document.title = `${place.name} | Lanka Explorer`;
    container.innerHTML = `<img src="${place.image}" alt="${place.name}"><h1>${place.name}</h1>
      <p class="meta"><span class="badge ${getCategoryClass(place.category)}">${place.category}</span> ${place.district} District</p>
      <p>${place.description}</p><h2>Quick Facts</h2><ul>
      <li><strong>Best time to visit:</strong> ${place.bestTime}</li>
      <li><strong>Entry fee:</strong> ${formatFee(place.entryFeeUSD)}<span id="fee-lkr"></span>${place.entryFeeUSD > 0 ? ` (${getPriceLabel(place.entryFeeUSD)})` : ''} </li>
      <li><strong>Coordinates:</strong> ${place.lat}, ${place.lng}</li></ul>`;
    showWeather(place);
    showFeeInLkr(place);
    showMap(place);
    setupTripButton(place);
  } catch (error) {
    showError(container, 'Sorry, this destination could not be loaded.');
    console.error(error);
  }
}


// ===== 5e. MY TRIP STORAGE (localStorage) =====
const TRIP_KEY = 'lankaExplorerTrip';
const TRAVELLERS_KEY = 'lankaExplorerTravellers';
function getTrip() {
  try { return JSON.parse(localStorage.getItem(TRIP_KEY)) || []; }
  catch (error) { console.error(error); return []; }
}
function saveTrip(trip) {
  localStorage.setItem(TRIP_KEY, JSON.stringify(trip));
  updateTripCount();
}
function isInTrip(id) { return getTrip().includes(id); }
function addToTrip(id) {
  const trip = getTrip();
  if (!trip.includes(id)) { trip.push(id); saveTrip(trip); }
}
function removeFromTrip(id) { saveTrip(getTrip().filter(tripId => tripId !== id)); }
function updateTripCount() {
  const link = document.querySelector('nav a[href="trip.html"]');
  if (link) link.textContent = getTrip().length ? `My Trip (${getTrip().length})` : 'My Trip';
}
function setupTripButton(place) {
  const button = document.querySelector('#add-to-trip');
  if (!button) return;
  function refreshButton() {
    const added = isInTrip(place.id);
    button.textContent = added ? '✓ In My Trip (click to remove)' : 'Add to My Trip';
    button.classList.toggle('added', added);
  }
  button.addEventListener('click', () => {
    isInTrip(place.id) ? removeFromTrip(place.id) : addToTrip(place.id);
    refreshButton();
  });
  refreshButton();
}

// ===== 6b. MY TRIP PAGE =====
async function initTripPage() {
  const body = document.querySelector('#trip-table tbody');
  if (!body) return;
  const summary = document.querySelector('#trip-summary');
  const travellerInput = document.querySelector('#travellers');
  const totalUsd = document.querySelector('#total-usd');
  const totalLkr = document.querySelector('#total-lkr');
  const clearButton = document.querySelector('#clear-trip');
  showLoading(summary, 'Loading your trip...');
  let destinations;
  try { destinations = await loadDestinations(); }
  catch (error) { showError(summary, 'Sorry, your trip could not be loaded.'); console.error(error); return; }
  let rate = null;
  try { rate = await getUsdToLkrRate(); } catch (error) { console.error(error); }
  travellerInput.value = localStorage.getItem(TRAVELLERS_KEY) || '1';
  function renderTrip() {
    const places = destinations.filter(place => getTrip().includes(place.id));
    const travellers = Math.min(20, Math.max(1, Number(travellerInput.value) || 1));
    body.innerHTML = '';
    if (!places.length) body.innerHTML = '<tr><td colspan="5" class="no-results">Your trip is empty. <a href="destinations.html">Browse destinations</a> to add some.</td></tr>';
    let perPerson = 0;
    places.forEach(place => {
      perPerson += Number(place.entryFeeUSD) || 0;
      const row = document.createElement('tr');
      row.innerHTML = `<td><a href="details.html?id=${place.id}">${place.name}</a></td><td><span class="badge ${getCategoryClass(place.category)}">${place.category}</span></td><td>${formatFee(place.entryFeeUSD)}</td><td>${rate ? formatLkr(place.entryFeeUSD * rate) : '–'}</td><td><button type="button" class="remove-btn" data-id="${place.id}">Remove</button></td>`;
      body.appendChild(row);
    });
    totalUsd.textContent = 'USD ' + (perPerson * travellers).toLocaleString('en-US');
    totalLkr.textContent = rate ? formatLkr(perPerson * travellers * rate) : 'Unavailable';
    summary.textContent = `${places.length} destination(s) for ${travellers} traveller(s).` + (rate ? ` Exchange rate: 1 USD = Rs. ${rate.toFixed(2)}.` : ' Currency conversion unavailable; totals shown in USD.');
    clearButton.hidden = !places.length;
  }
  body.addEventListener('click', event => {
    const button = event.target.closest('.remove-btn');
    if (button) { removeFromTrip(Number(button.dataset.id)); renderTrip(); }
  });
  travellerInput.addEventListener('input', () => {
    localStorage.setItem(TRAVELLERS_KEY, travellerInput.value); renderTrip();
  });
  clearButton.addEventListener('click', () => {
    if (confirm('Remove every destination from your trip?')) { saveTrip([]); renderTrip(); }
  });
  renderTrip();
}

// ===== 1b. DARK MODE =====
const THEME_KEY = 'lankaExplorerTheme';
function initTheme() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;
  function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    toggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  }
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  toggle.addEventListener('click', () => {
    const next = document.body.classList.contains('dark') ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next); applyTheme(next);
  });
}

// ===== 7. ENQUIRY FORM =====
function initEnquiryForm() {
  const form = document.querySelector('#enquiry-form');
  if (!form) return;
  const message = document.querySelector('#form-message');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.querySelector('#name').value.trim();
    const email = document.querySelector('#email').value.trim();
    const date = document.querySelector('#date').value;
    const people = Number(document.querySelector('#people').value);
    const interests = form.querySelectorAll('input[name="interest"]:checked');
    const userMessage = document.querySelector('#message').value.trim();
    const errors = [];
    if (name.length < 3) errors.push('Please enter your full name (at least 3 characters).');
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) errors.push('Please enter a valid email address.');
    if (date) { const today = new Date(); today.setHours(0,0,0,0); if (new Date(date) < today) errors.push('The travel date cannot be in the past.'); }
    if (people < 1 || people > 20) errors.push('Number of travellers must be between 1 and 20.');
    if (!interests.length) errors.push('Please choose at least one interest.');
    if (userMessage.length > 500) errors.push('Your message must be no longer than 500 characters.');
    if (errors.length) {
      message.className = 'form-error';
      message.innerHTML = '<ul>' + errors.map(e => `<li>${e}</li>`).join('') + '</ul>';
    } else {
      message.className = 'form-success';
      message.textContent = `Thank you, ${name}! We will contact you at ${email} within 24 hours.`;
      form.reset();
    }
  });
}

// ===== 8. SCROLL REVEAL ANIMATIONS =====
function initScrollReveal() {
  const targets = document.querySelectorAll('main section, .card, #destination, #trip-table, #enquiry-form');
  targets.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 70}ms`);
  });
  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach(el => observer.observe(el));
}

// ===== 9. START THE APP =====
initHomePage();
initDestinationsPage();
initDetailsPage();
initEnquiryForm();
initTripPage();
initTheme();
updateTripCount();
initScrollReveal();
