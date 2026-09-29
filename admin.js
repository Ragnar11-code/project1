// VoltPath Admin Logic

document.addEventListener('DOMContentLoaded', () => {
  const session = localStorage.getItem('voltpath_session');
  if (!session) { window.location.href = '../index.html'; return; }
  const user = JSON.parse(session);
  if (user.role !== 'admin') { window.location.href = 'dashboard.html'; return; }

  renderKPIs();
  renderStationSummary();
  renderRecentActivity();
  renderAdminStations();
  renderAllBookings();
  renderUsers();
  renderReports();
  renderRevenue();
});

function showAdmin(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('asec-' + id).classList.add('active');
  const titles = { overview:'Overview', stations:'Stations & Pricing', bookings:'All Bookings', users:'Users', reports:'Issue Reports', revenue:'Revenue' };
  document.getElementById('admin-title').textContent = titles[id] || id;
  document.querySelectorAll('.nav-item').forEach(n => { if (n.textContent.includes(titles[id] || id)) n.classList.add('active'); });
}

function adminLogout() {
  localStorage.removeItem('voltpath_session');
  window.location.href = '../index.html';
}

function renderKPIs() {
  const users = JSON.parse(localStorage.getItem('voltpath_users') || '[]');
  const kpis = [
    { label: 'Total Stations', value: STATIONS.length, icon: '⚡', color: 'blue' },
    { label: 'Available Now', value: STATIONS.filter(s => s.status === 'available').length, icon: '✅', color: 'green' },
    { label: 'Registered Users', value: users.length, icon: '👥', color: 'purple' },
    { label: 'Total Bookings', value: 47, icon: '📅', color: 'orange' },
    { label: 'Revenue Today', value: '₹12,450', icon: '💰', color: 'green' },
    { label: 'Issues Reported', value: 3, icon: '📣', color: 'red' },
    { label: 'kWh Delivered', value: '1,284', icon: '🔋', color: 'blue' },
    { label: 'Avg Rating', value: '4.3 ⭐', icon: '⭐', color: 'yellow' },
  ];
  document.getElementById('kpi-grid').innerHTML = kpis.map(k => `
    <div class="kpi-card ${k.color}">
      <div class="kpi-icon">${k.icon}</div>
      <div class="kpi-val">${k.value}</div>
      <div class="kpi-label">${k.label}</div>
    </div>
  `).join('');
}

function renderStationSummary() {
  document.getElementById('station-summary').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Station</th><th>Status</th><th>Free Slots</th><th>kWh Today</th></tr></thead>
      <tbody>${STATIONS.map(s => `
        <tr>
          <td>${s.name}</td>
          <td><span class="status-badge ${s.status === 'available' ? 'green' : s.status === 'busy' ? 'yellow' : 'red'}">${s.status}</span></td>
          <td>${s.available}/${s.totalSlots}</td>
          <td>${(Math.random() * 200 + 50).toFixed(0)}</td>
        </tr>
      `).join('')}</tbody>
    </table>`;
}

function renderRecentActivity() {
  const activities = [
    { icon: '📅', text: 'New booking at TATA Power – Koramangala', time: '2 min ago' },
    { icon: '👤', text: 'New user registered: rahul@example.com', time: '15 min ago' },
    { icon: '⭐', text: 'New 5-star review at Zeon – Whitefield', time: '1 hr ago' },
    { icon: '🔴', text: 'EESL – Electronic City went offline', time: '2 hrs ago' },
    { icon: '💰', text: 'Payment received ₹403 via UPI', time: '3 hrs ago' },
  ];
  document.getElementById('recent-activity').innerHTML = activities.map(a => `
    <div class="activity-item">
      <span class="activity-icon">${a.icon}</span>
      <div><div class="activity-text">${a.text}</div><div class="activity-time">${a.time}</div></div>
    </div>
  `).join('');
}

function renderAdminStations() {
  document.getElementById('admin-stations-grid').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Station Name</th><th>Network</th><th>AC Price (₹/kWh)</th><th>DC Price (₹/kWh)</th><th>Max kW</th><th>Slots</th><th>Status</th><th>Rating</th><th>Action</th></tr></thead>
      <tbody>${STATIONS.map(s => `
        <tr>
          <td><b>${s.name}</b><div style="font-size:11px;color:#6b7280">${s.address}</div></td>
          <td>${s.network}</td>
          <td><input type="number" value="${s.pricePerKwh}" style="width:70px;padding:5px;border:1.5px solid #e5e7eb;border-radius:6px;font-size:13px" onchange="updatePrice(${s.id},'ac',this.value)"></td>
          <td><input type="number" value="${s.fastPrice}" style="width:70px;padding:5px;border:1.5px solid #e5e7eb;border-radius:6px;font-size:13px" onchange="updatePrice(${s.id},'dc',this.value)"></td>
          <td>${s.maxPower} kW</td>
          <td>${s.totalSlots}</td>
          <td><select onchange="updateStatus(${s.id}, this.value)" style="padding:5px;border:1.5px solid #e5e7eb;border-radius:6px;font-size:12px">
            <option ${s.status==='available'?'selected':''}>available</option>
            <option ${s.status==='busy'?'selected':''}>busy</option>
            <option ${s.status==='offline'?'selected':''}>offline</option>
          </select></td>
          <td>⭐ ${s.rating} (${s.reviews})</td>
          <td><button class="btn-sm green" onclick="alert('Changes saved for ${s.name}!')">Save</button></td>
        </tr>
      `).join('')}</tbody>
    </table>
    <div style="margin-top:16px;padding:14px 16px;background:#eff6ff;border-radius:10px;font-size:13px;color:#1d4ed8;border:1px solid #bfdbfe">
      ℹ️ Edit prices directly in the table above and click Save to update each station's pricing.
    </div>
  `;
}

function updatePrice(id, type, val) { console.log(`Station ${id} ${type} price → ₹${val}`); }
function updateStatus(id, status) { console.log(`Station ${id} status → ${status}`); }

function renderAllBookings() {
  const mockBookings = [
    { user: 'Arjun Sharma', station: 'TATA Power – Koramangala', date: '2026-04-14', time: '10:00 AM', connector: 'CCS2', status: 'upcoming' },
    { user: 'Priya Mehta', station: 'Zeon – Whitefield', date: '2026-04-15', time: '02:00 PM', connector: 'Type 2 AC', status: 'upcoming' },
    { user: 'Ravi Kumar', station: 'BPCL EV – MG Road', date: '2026-04-12', time: '09:00 AM', connector: 'CCS2', status: 'completed' },
    { user: 'Sneha Joshi', station: 'Jio-BP – Hebbal', date: '2026-04-11', time: '06:00 PM', connector: 'Type 2 AC', status: 'completed' },
    { user: 'Admin Test', station: 'Ather Grid – Indiranagar', date: '2026-04-10', time: '11:00 AM', connector: 'Type 2 AC', status: 'cancelled' },
  ];
  document.getElementById('all-bookings-body').innerHTML = mockBookings.map(b => `
    <tr>
      <td>${b.user}</td>
      <td>${b.station}</td>
      <td>${b.date}</td>
      <td>${b.time}</td>
      <td>${b.connector}</td>
      <td><span class="status-badge ${b.status === 'upcoming' ? 'green' : b.status === 'completed' ? 'blue' : 'red'}">${b.status}</span></td>
    </tr>
  `).join('');
}

function renderUsers() {
  const users = JSON.parse(localStorage.getItem('voltpath_users') || '[]');
  if (!users.length) {
    document.getElementById('users-table-wrap').innerHTML = '<div style="padding:20px;color:#6b7280">No users registered yet. Register from the app to see users here.</div>';
    return;
  }
  document.getElementById('users-table-wrap').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Vehicle</th><th>Joined</th></tr></thead>
      <tbody>${users.map(u => `<tr>
        <td>${u.name}</td><td>${u.email}</td><td>${u.phone}</td>
        <td>${u.vehicle}</td><td>${u.joinDate || '—'}</td>
      </tr>`).join('')}</tbody>
    </table>
  `;
}

function renderReports() {
  const reports = [
    { station: 'EESL – Electronic City', type: 'Broken Connector', detail: 'CCS2 connector not working', time: '2 hrs ago', status: 'open' },
    { station: 'Ather Grid – Indiranagar', type: 'Payment Issue', detail: 'UPI payment failed twice', time: '5 hrs ago', status: 'in-progress' },
    { station: 'BPCL EV – MG Road', type: 'Slow Charging', detail: 'Only getting 5kW instead of 60kW', time: '1 day ago', status: 'resolved' },
  ];
  document.getElementById('reports-list').innerHTML = reports.map(r => `
    <div class="report-card">
      <div class="report-header">
        <div><b>${r.station}</b> — ${r.type}</div>
        <span class="status-badge ${r.status === 'open' ? 'red' : r.status === 'in-progress' ? 'yellow' : 'green'}">${r.status}</span>
      </div>
      <div class="report-detail">${r.detail}</div>
      <div class="report-time">${r.time}</div>
      ${r.status !== 'resolved' ? `<button class="btn-sm green" style="margin-top:8px" onclick="this.parentElement.querySelector('.status-badge').textContent='resolved';this.parentElement.querySelector('.status-badge').className='status-badge green';this.remove()">Mark Resolved</button>` : ''}
    </div>
  `).join('');
}

function renderRevenue() {
  const revenues = STATIONS.map(s => ({
    name: s.name,
    network: s.network,
    sessions: Math.floor(Math.random() * 50 + 10),
    kwh: (Math.random() * 500 + 100).toFixed(1),
    revenue: (Math.random() * 8000 + 1000).toFixed(0),
  }));
  const total = revenues.reduce((a, b) => a + parseFloat(b.revenue), 0).toFixed(0);
  document.getElementById('revenue-content').innerHTML = `
    <div class="kpi-card green" style="max-width:200px;margin-bottom:20px">
      <div class="kpi-icon">💰</div>
      <div class="kpi-val">₹${parseInt(total).toLocaleString('en-IN')}</div>
      <div class="kpi-label">Total Revenue (MTD)</div>
    </div>
    <table class="data-table">
      <thead><tr><th>Station</th><th>Network</th><th>Sessions</th><th>kWh Delivered</th><th>Revenue</th></tr></thead>
      <tbody>${revenues.map(r => `<tr>
        <td>${r.name}</td>
        <td>${r.network}</td>
        <td>${r.sessions}</td>
        <td>${r.kwh} kWh</td>
        <td><b>₹${parseInt(r.revenue).toLocaleString('en-IN')}</b></td>
      </tr>`).join('')}</tbody>
    </table>
  `;
}
