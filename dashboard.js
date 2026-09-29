// VoltPath Dashboard Logic

let currentUser = null;
let map = null;
let selectedRating = 0;
let calDate = new Date(2026, 3); // April 2026

// INIT
document.addEventListener('DOMContentLoaded', () => {
  const session = localStorage.getItem('voltpath_session');
  if (!session) { window.location.href = '../index.html'; return; }
  currentUser = JSON.parse(session);
  if (currentUser.role === 'admin') { window.location.href = 'admin.html'; return; }

  document.getElementById('user-avatar').textContent = currentUser.name ? currentUser.name[0].toUpperCase() : 'U';

  initMap();
  renderStations();
  populateBookingSelects();
  renderWaitTimes();
  updateBattery();
  renderPricingTable();
  calcCost();
  renderDeals();
  renderCompareSelects();
  renderHistory();
  renderCalendar();
  renderGreenDashboard();
  renderVehicleProfiles();
  renderPaymentMethods();
  renderHomeGuide();
  renderReferral();
  renderAlerts();
  renderOffPeak();
  populateReportStations();
});

// NAVIGATION
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('sec-' + id).classList.add('active');
  const titles = {
    map: 'Live Map', stations: 'Find Stations', booking: 'Book Slot',
    battery: 'Battery Estimator', cost: 'Cost Calculator', compare: 'Compare Stations',
    route: 'Route Planner', history: 'Charging History', calendar: 'Booking Calendar',
    green: 'Green Score', profile: 'Vehicle Profiles', payment: 'Payments & QR',
    support: 'Live Support', home: 'Home Charger', referral: 'Referral Rewards',
    alerts: 'Notifications'
  };
  document.getElementById('page-title').textContent = titles[id] || id;
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.textContent.includes(titles[id] || id)) n.classList.add('active');
  });
  if (id === 'map' && map) { setTimeout(() => map.invalidateSize(), 200); }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function logout() {
  localStorage.removeItem('voltpath_session');
  window.location.href = '../index.html';
}

// 1. MAP
function initMap() {
  map = L.map('map-container').setView([12.9716, 77.5946], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
  STATIONS.forEach(s => {
    const color = s.status === 'available' ? '🟢' : s.status === 'busy' ? '🟡' : '🔴';
    const icon = L.divIcon({ html: `<div class="map-marker ${s.status}">${color}</div>`, className: '' });
    L.marker([s.lat, s.lng], { icon })
      .addTo(map)
      .bindPopup(`<b>${s.name}</b><br>${s.network}<br>₹${s.pricePerKwh}/kWh<br>${s.available}/${s.totalSlots} available<br>⭐ ${s.rating}`);
  });
}

function gpsLocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 14);
      L.marker([pos.coords.latitude, pos.coords.longitude])
        .addTo(map).bindPopup('📍 You are here').openPopup();
      showSection('map');
    }, () => alert('Location access denied.'));
  }
}

// 2. STATIONS
function getStatusColor(s) {
  if (s.status === 'available') return 'green';
  if (s.status === 'busy') return 'yellow';
  return 'red';
}

function renderStations() {
  const grid = document.getElementById('stations-grid');
  const network = document.getElementById('filter-network').value;
  const sort = document.getElementById('filter-sort').value;
  let list = [...STATIONS];
  if (network) list = list.filter(s => s.network === network);
  if (sort === 'cost') list.sort((a, b) => a.pricePerKwh - b.pricePerKwh);
  if (sort === 'speed') list.sort((a, b) => b.maxPower - a.maxPower);

  grid.innerHTML = list.map(s => `
    <div class="station-card">
      <div class="station-top">
        <div>
          <div class="station-name">${s.name}</div>
          <div class="station-network">${s.network} · ${s.address}</div>
        </div>
        <div class="status-badge ${getStatusColor(s)}">${s.status.toUpperCase()}</div>
      </div>
      <div class="station-stats">
        <div class="stat"><div class="stat-val">₹${s.pricePerKwh}</div><div class="stat-label">per kWh (AC)</div></div>
        <div class="stat"><div class="stat-val">₹${s.fastPrice}</div><div class="stat-label">per kWh (DC)</div></div>
        <div class="stat"><div class="stat-val">${s.maxPower} kW</div><div class="stat-label">Max Power</div></div>
        <div class="stat"><div class="stat-val">${s.available}/${s.totalSlots}</div><div class="stat-label">Available</div></div>
        <div class="stat"><div class="stat-val">⭐ ${s.rating}</div><div class="stat-label">${s.reviews} reviews</div></div>
        <div class="stat"><div class="stat-val">${s.waitMin} min</div><div class="stat-label">Wait Time</div></div>
      </div>
      <div class="connector-tags">${s.connectors.map(c => `<span class="tag">${c}</span>`).join('')}</div>
      <div class="amenity-tags">${s.amenities.map(a => `<span class="tag amenity">${a}</span>`).join('')}</div>
      <div class="station-actions">
        <button class="btn-sm green" onclick="openBookingFor('${s.name}')">📅 Book</button>
        <button class="btn-sm" onclick="openRatingModal('${s.name}')">⭐ Rate</button>
        <button class="btn-sm" onclick="showSection('compare')">🔄 Compare</button>
      </div>
    </div>
  `).join('');
}

function smartMatch() {
  const best = STATIONS.filter(s => s.status === 'available')
    .sort((a, b) => (a.pricePerKwh + (100 - a.maxPower / 2) + a.waitMin) - (b.pricePerKwh + (100 - b.maxPower / 2) + b.waitMin))[0];
  const el = document.getElementById('smart-match-result');
  el.style.display = 'block';
  el.innerHTML = `🤖 <b>Best Match:</b> ${best.name} — ₹${best.pricePerKwh}/kWh · ${best.maxPower} kW · ${best.available} slots free · ⭐${best.rating}`;
}

// 3. BOOKING
function populateBookingSelects() {
  ['book-station', 'cost-station', 'cmp-1', 'cmp-2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = STATIONS.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  });
  const today = new Date().toISOString().split('T')[0];
  const dateEl = document.getElementById('book-date');
  if (dateEl) dateEl.value = today;
}

function openBookingFor(name) {
  showSection('booking');
  const sel = document.getElementById('book-station');
  Array.from(sel.options).forEach(o => { if (o.text === name) sel.value = o.value; });
}

function bookSlot() {
  const station = document.getElementById('book-station');
  const date = document.getElementById('book-date').value;
  const time = document.getElementById('book-time').value;
  const connector = document.getElementById('book-connector').value;
  const stationName = station.options[station.selectedIndex].text;
  const confirm = document.getElementById('booking-confirm');
  confirm.style.display = 'block';
  confirm.innerHTML = `✅ Slot booked at <b>${stationName}</b> on <b>${date}</b> at <b>${time}</b> · Connector: ${connector}`;
  renderWaitTimes();
}

function renderWaitTimes() {
  document.getElementById('wait-grid').innerHTML = STATIONS.map(s => `
    <div class="wait-card">
      <div class="wait-station">${s.name}</div>
      <div class="wait-time ${s.waitMin > 20 ? 'high' : s.waitMin > 0 ? 'medium' : 'low'}">
        ${s.waitMin === 0 ? 'No Wait' : s.waitMin + ' min'}
      </div>
      <div class="wait-sub">${s.available}/${s.totalSlots} slots free</div>
    </div>
  `).join('');
}

// 4. BATTERY
function updateBattery() {
  const model = parseFloat(document.getElementById('batt-model').value);
  const current = parseInt(document.getElementById('batt-current').value);
  const target = parseInt(document.getElementById('batt-target').value);
  const distance = parseFloat(document.getElementById('batt-distance').value) || 0;
  document.getElementById('batt-current-val').textContent = current + '%';
  document.getElementById('batt-target-val').textContent = target + '%';

  const needed = ((target - current) / 100) * model;
  const range = (model * 0.9).toFixed(0);
  const timeAC = needed > 0 ? (needed / 7.4 * 60).toFixed(0) : 0;
  const timeDC = needed > 0 ? (needed / 50 * 60).toFixed(0) : 0;
  const enoughForTrip = (current / 100) * model * (range / model) >= distance;

  document.getElementById('batt-result').innerHTML = `
    <div class="result-grid">
      <div><b>Energy Required:</b> ${Math.max(0, needed).toFixed(1)} kWh</div>
      <div><b>AC Charging Time:</b> ~${timeAC} min</div>
      <div><b>DC Fast Charge:</b> ~${timeDC} min</div>
      <div><b>Full Range:</b> ~${range} km</div>
      ${distance ? `<div><b>Enough for Trip:</b> ${enoughForTrip ? '✅ Yes' : '❌ Charge needed'}</div>` : ''}
    </div>
  `;
}

// 5. COST
function renderPricingTable() {
  const table = document.getElementById('pricing-table');
  table.innerHTML = `
    <table class="data-table"><thead><tr><th>Station</th><th>AC (₹/kWh)</th><th>DC Fast (₹/kWh)</th><th>Max kW</th><th>Network</th></tr></thead>
    <tbody>${STATIONS.map(s => `<tr>
      <td>${s.name}</td>
      <td>₹${s.pricePerKwh}</td>
      <td>₹${s.fastPrice}</td>
      <td>${s.maxPower} kW</td>
      <td>${s.network}</td>
    </tr>`).join('')}</tbody></table>
  `;
}

function calcCost() {
  const sid = parseInt(document.getElementById('cost-station').value);
  const kwh = parseFloat(document.getElementById('cost-kwh').value) || 0;
  const station = STATIONS.find(s => s.id === sid);
  if (!station || !kwh) { document.getElementById('cost-result').innerHTML = ''; return; }
  const acCost = (kwh * station.pricePerKwh).toFixed(2);
  const dcCost = (kwh * station.fastPrice).toFixed(2);
  document.getElementById('cost-result').innerHTML = `
    <div class="result-grid">
      <div><b>AC Charging (${kwh} kWh):</b> ₹${acCost}</div>
      <div><b>DC Fast Charging (${kwh} kWh):</b> ₹${dcCost}</div>
      <div><b>Estimated AC Time:</b> ~${(kwh / 7.4 * 60).toFixed(0)} min</div>
      <div><b>Estimated DC Time:</b> ~${(kwh / station.maxPower * 60).toFixed(0)} min</div>
    </div>
  `;
}

function renderDeals() {
  const sorted = [...STATIONS].sort((a, b) => a.pricePerKwh - b.pricePerKwh);
  document.getElementById('deal-grid').innerHTML = sorted.map((s, i) => `
    <div class="deal-card ${i === 0 ? 'best' : ''}">
      ${i === 0 ? '<div class="best-badge">🏆 Best Deal</div>' : ''}
      <div class="deal-name">${s.name}</div>
      <div class="deal-price">₹${s.pricePerKwh}/kWh</div>
      <div class="deal-network">${s.network}</div>
    </div>
  `).join('');
}

// 6. COMPARE
function renderCompareSelects() {
  renderCompare();
}

function renderCompare() {
  const id1 = parseInt(document.getElementById('cmp-1').value);
  const id2 = parseInt(document.getElementById('cmp-2').value);
  const s1 = STATIONS.find(s => s.id === id1) || STATIONS[0];
  const s2 = STATIONS.find(s => s.id === id2) || STATIONS[1];
  const rows = [
    ['Network', s1.network, s2.network],
    ['Price (AC)', `₹${s1.pricePerKwh}/kWh`, `₹${s2.pricePerKwh}/kWh`],
    ['Price (DC)', `₹${s1.fastPrice}/kWh`, `₹${s2.fastPrice}/kWh`],
    ['Max Power', `${s1.maxPower} kW`, `${s2.maxPower} kW`],
    ['Availability', `${s1.available}/${s1.totalSlots}`, `${s2.available}/${s2.totalSlots}`],
    ['Wait Time', `${s1.waitMin} min`, `${s2.waitMin} min`],
    ['Rating', `⭐ ${s1.rating} (${s1.reviews})`, `⭐ ${s2.rating} (${s2.reviews})`],
    ['Connectors', s1.connectors.join(', '), s2.connectors.join(', ')],
    ['Status', s1.status.toUpperCase(), s2.status.toUpperCase()],
  ];
  document.getElementById('compare-table').innerHTML = `
    <table class="compare-tbl">
      <thead><tr><th>Metric</th><th>${s1.name}</th><th>${s2.name}</th></tr></thead>
      <tbody>${rows.map(r => `<tr><td class="metric">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody>
    </table>`;
}

// 7. ROUTE PLANNER
function planRoute() {
  const from = document.getElementById('route-from').value || 'Bengaluru';
  const to = document.getElementById('route-to').value || 'Destination';
  const battery = parseInt(document.getElementById('route-battery').value) || 50;
  const range = parseInt(document.getElementById('route-range').value) || 300;
  const availKm = (battery / 100) * range;
  const stops = Math.ceil(300 / availKm);

  document.getElementById('route-result').innerHTML = `
    <div class="route-card">
      <div class="route-header">🗺️ ${from} → ${to}</div>
      <div class="route-steps">
        <div class="route-step">📍 Start: ${from} (Battery: ${battery}%)</div>
        ${stops > 1 ? `<div class="route-step">⚡ Charging Stop 1: ${STATIONS[0].name} (~${Math.round(availKm * 0.9)} km)</div>` : ''}
        ${stops > 2 ? `<div class="route-step">⚡ Charging Stop 2: ${STATIONS[3].name}</div>` : ''}
        <div class="route-step">🏁 Arrive: ${to}</div>
      </div>
      <div class="route-summary">
        Estimated ${stops > 1 ? stops - 1 + ' charging stop(s)' : 'no charging stop needed'} · 
        Range on current battery: ~${availKm.toFixed(0)} km
      </div>
    </div>
  `;
}

function renderOffPeak() {
  document.getElementById('offpeak-grid').innerHTML = STATIONS.map(s => `
    <div class="offpeak-card">
      <div class="offpeak-name">${s.name}</div>
      <div class="offpeak-hours">🌙 ${s.offPeakHours}</div>
      <div class="offpeak-price">₹${Math.round(s.pricePerKwh * 0.8)}/kWh off-peak</div>
    </div>
  `).join('');
}

// 8. HISTORY
function renderHistory() {
  document.getElementById('history-body').innerHTML = HISTORY_DATA.map(h => `
    <tr>
      <td>${h.date}</td>
      <td>${h.station}</td>
      <td>${h.duration}</td>
      <td>${h.kwh} kWh</td>
      <td>₹${h.cost}</td>
      <td>${'⭐'.repeat(h.rating)}</td>
    </tr>
  `).join('');
  const totalKwh = HISTORY_DATA.reduce((a, b) => a + b.kwh, 0).toFixed(1);
  const totalCost = HISTORY_DATA.reduce((a, b) => a + b.cost, 0);
  document.getElementById('history-stats').innerHTML = `
    <div class="stat-chip">⚡ ${totalKwh} kWh total</div>
    <div class="stat-chip">💸 ₹${totalCost} spent</div>
    <div class="stat-chip">🔢 ${HISTORY_DATA.length} sessions</div>
    <div class="stat-chip">♻️ ${(totalKwh * 0.82).toFixed(1)} kg CO₂ saved</div>
  `;
}

// 9. CALENDAR
function renderCalendar() {
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  document.getElementById('cal-title').textContent = calDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const bookedDates = BOOKINGS.map(b => b.date);

  let html = '<div class="cal-days-header"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div><div class="cal-days">';
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const hasBooking = bookedDates.includes(dateStr);
    const isToday = dateStr === '2026-04-13';
    html += `<div class="cal-day ${hasBooking ? 'booked' : ''} ${isToday ? 'today' : ''}" onclick="showBookingsFor('${dateStr}')">${d}${hasBooking ? '<span class="cal-dot"></span>' : ''}</div>`;
  }
  html += '</div>';
  document.getElementById('calendar-grid').innerHTML = html;
}

function prevMonth() { calDate.setMonth(calDate.getMonth() - 1); renderCalendar(); }
function nextMonth() { calDate.setMonth(calDate.getMonth() + 1); renderCalendar(); }

function showBookingsFor(date) {
  const bookings = BOOKINGS.filter(b => b.date === date);
  const el = document.getElementById('booking-events');
  if (!bookings.length) { el.innerHTML = `<p style="color:#6b7280;margin-top:12px;">No bookings on ${date}</p>`; return; }
  el.innerHTML = `<div style="margin-top:16px"><h4>Bookings on ${date}:</h4>${bookings.map(b =>
    `<div class="booking-event-item">📅 ${b.time} – ${b.station} · ${b.connector} <span class="status-badge green">UPCOMING</span></div>`
  ).join('')}</div>`;
}

// 10. GREEN SCORE
function renderGreenDashboard() {
  const totalKwh = HISTORY_DATA.reduce((a, b) => a + b.kwh, 0);
  const co2Saved = (totalKwh * 0.82).toFixed(1);
  const score = Math.min(100, Math.round(totalKwh * 0.8));
  document.getElementById('green-dashboard').innerHTML = `
    <div class="green-score-circle">
      <div class="score-num">${score}</div>
      <div class="score-label">Green Score</div>
    </div>
    <div class="green-stats">
      <div class="green-stat"><div class="green-val">${co2Saved} kg</div><div class="green-label">CO₂ Avoided</div></div>
      <div class="green-stat"><div class="green-val">${totalKwh.toFixed(1)} kWh</div><div class="green-label">Clean Energy Used</div></div>
      <div class="green-stat"><div class="green-val">${(totalKwh / 6.5).toFixed(0)}</div><div class="green-label">Trees Equivalent</div></div>
      <div class="green-stat"><div class="green-val">₹${(totalKwh * 8).toFixed(0)}</div><div class="green-label">Fuel Cost Saved</div></div>
    </div>
    <div class="green-tip">🌱 Charge during off-peak hours to further reduce grid load and earn bonus green points!</div>
  `;
}

// 11. VEHICLE PROFILES
function renderVehicleProfiles() {
  const vehicles = JSON.parse(localStorage.getItem('voltpath_vehicles') || '[]');
  if (currentUser && currentUser.vehicle && !vehicles.find(v => v.model === currentUser.vehicle)) {
    vehicles.push({ model: currentUser.vehicle, nickname: 'My EV', primary: true });
  }
  document.getElementById('vehicle-grid').innerHTML = vehicles.length ? vehicles.map(v => `
    <div class="vehicle-card">
      <div class="vehicle-icon">🚗</div>
      <div class="vehicle-name">${v.nickname || v.model}</div>
      <div class="vehicle-model">${v.model}</div>
      ${v.primary ? '<span class="tag green">Primary</span>' : ''}
    </div>
  `).join('') : '<p style="color:#6b7280">No vehicles added yet.</p>';
}

function addVehicle() {
  const model = prompt('Enter EV Model name:');
  if (!model) return;
  const nickname = prompt('Nickname (optional):') || model;
  const vehicles = JSON.parse(localStorage.getItem('voltpath_vehicles') || '[]');
  vehicles.push({ model, nickname, primary: vehicles.length === 0 });
  localStorage.setItem('voltpath_vehicles', JSON.stringify(vehicles));
  renderVehicleProfiles();
}

// 12. PAYMENTS
function renderPaymentMethods() {
  document.getElementById('payment-methods').innerHTML = `
    <div class="payment-grid">
      <div class="payment-card active"><div class="pay-icon">📱</div><div>UPI</div><div class="pay-sub">GPay, PhonePe, BHIM</div></div>
      <div class="payment-card"><div class="pay-icon">💳</div><div>Credit/Debit Card</div><div class="pay-sub">Visa, Mastercard, RuPay</div></div>
      <div class="payment-card"><div class="pay-icon">👛</div><div>Wallet</div><div class="pay-sub">Paytm, Amazon Pay</div></div>
      <div class="payment-card"><div class="pay-icon">🏦</div><div>Net Banking</div><div class="pay-sub">All major banks</div></div>
    </div>
    <div class="wallet-balance">VoltPath Wallet Balance: <b>₹${(currentUser.credits || 0) + 250}</b> &nbsp; <button class="btn-sm green">Add Money</button></div>
  `;
}

function simulateQR() {
  const station = STATIONS[Math.floor(Math.random() * STATIONS.length)];
  alert(`✅ QR Scanned!\nStation: ${station.name}\nConnector: ${station.connectors[0]}\nRate: ₹${station.pricePerKwh}/kWh\n\nCharging session started!`);
}

// 13. SUPPORT
function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  const msgs = document.getElementById('chat-messages');
  msgs.innerHTML += `<div class="chat-msg user">${msg}</div>`;
  input.value = '';
  setTimeout(() => {
    const replies = [
      "Thanks for reaching out! Our team will assist you shortly.",
      "I can help with that. Could you provide more details?",
      "Your booking is confirmed. Is there anything else?",
      "For technical issues, please try restarting the app. We're also escalating this.",
      "You can raise a station issue from the 'Report Issue' section below."
    ];
    msgs.innerHTML += `<div class="chat-msg agent">${replies[Math.floor(Math.random() * replies.length)]}</div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }, 1000);
  msgs.scrollTop = msgs.scrollHeight;
}

function populateReportStations() {
  const sel = document.getElementById('report-station');
  if (sel) sel.innerHTML = STATIONS.map(s => `<option>${s.name}</option>`).join('');
}

function submitReport() {
  const el = document.getElementById('report-confirm');
  el.style.display = 'block';
  el.textContent = '✅ Issue reported successfully! Our team will investigate within 24 hours.';
  document.getElementById('report-detail').value = '';
}

// 14. HOME CHARGER
function renderHomeGuide() {
  document.getElementById('guide-grid').innerHTML = `
    <div class="guide-cards">${HOME_GUIDE.map(g => `
      <div class="guide-card">
        <div class="guide-icon">${g.icon}</div>
        <div class="guide-title">${g.title}</div>
        <div class="guide-row"><span>Power:</span> <b>${g.power}</b></div>
        <div class="guide-row"><span>Cost:</span> <b>${g.cost}</b></div>
        <div class="guide-row"><span>Charge Time:</span> <b>${g.time}</b></div>
        <div class="guide-note">${g.note}</div>
      </div>
    `).join('')}</div>
    <h3 style="margin-top:24px;font-size:15px;margin-bottom:12px;">Certified Installers</h3>
    <table class="data-table">
      <thead><tr><th>Company</th><th>Coverage</th><th>Rating</th><th>Contact</th></tr></thead>
      <tbody>${INSTALLERS.map(i => `<tr><td>${i.name}</td><td>${i.area}</td><td>${i.rating}</td><td>${i.contact}</td></tr>`).join('')}</tbody>
    </table>
  `;
}

// 15. REFERRAL
function renderReferral() {
  const code = 'VOLT' + (currentUser.name || 'USER').toUpperCase().substring(0, 4) + Math.floor(Math.random() * 1000);
  document.getElementById('referral-box').innerHTML = `
    <div class="referral-card">
      <div class="referral-icon">🎁</div>
      <h3>Invite Friends, Earn ₹100</h3>
      <p>For every friend who joins VoltPath using your code, you both get ₹100 wallet credit.</p>
      <div class="referral-code-box">
        <span id="ref-code">${code}</span>
        <button class="btn-sm green" onclick="copyCode('${code}')">Copy</button>
      </div>
      <div class="referral-stats">
        <div><b>0</b><div>Referrals</div></div>
        <div><b>₹0</b><div>Earned</div></div>
      </div>
    </div>
  `;
}

function copyCode(code) {
  navigator.clipboard.writeText(code).then(() => alert('Referral code copied!')).catch(() => alert('Code: ' + code));
}

// 16. ALERTS
function renderAlerts() {
  document.getElementById('alerts-list').innerHTML = ALERTS.map(a => `
    <div class="alert-item ${a.type}">
      <span class="alert-icon">${a.icon}</span>
      <div class="alert-content">
        <div class="alert-text">${a.text}</div>
        <div class="alert-time">${a.time}</div>
      </div>
    </div>
  `).join('') + `
    <div style="margin-top:20px">
      <h3 style="font-size:15px;margin-bottom:12px">Set Slot Alert</h3>
      <div class="form-card" style="max-width:400px">
        <div class="form-group"><label>Station to Watch</label>
          <select>${STATIONS.map(s => `<option>${s.name}</option>`).join('')}</select>
        </div>
        <button class="btn-primary" onclick="alert('✅ Alert set! You\'ll be notified when a slot opens.')">Set Alert</button>
      </div>
    </div>
  `;
}

// RATINGS MODAL
function openRatingModal(name) {
  document.getElementById('rating-modal').style.display = 'flex';
  document.getElementById('rating-modal').setAttribute('data-station', name);
}
function closeModal() { document.getElementById('rating-modal').style.display = 'none'; }
function setRating(n) {
  selectedRating = n;
  const stars = document.querySelectorAll('#star-input span');
  stars.forEach((s, i) => s.textContent = i < n ? '⭐' : '☆');
}
function submitRating() {
  if (!selectedRating) { alert('Please select a rating.'); return; }
  closeModal();
  alert(`✅ Thanks for your ${selectedRating}-star rating!`);
}
