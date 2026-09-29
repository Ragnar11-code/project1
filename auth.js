// VoltPath Auth Logic

const ADMIN = { email: 'Admin@gmail.com', password: 'Admin123', name: 'Admin', role: 'admin' };

function getUsers() {
  return JSON.parse(localStorage.getItem('voltpath_users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('voltpath_users', JSON.stringify(users));
}
function setSession(user) {
  localStorage.setItem('voltpath_session', JSON.stringify(user));
}

function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');

  if (!email || !password) {
    showError(errEl, 'Please enter email and password.');
    return;
  }

  // Admin check
  if (email === ADMIN.email && password === ADMIN.password) {
    setSession({ ...ADMIN });
    window.location.href = 'pages/admin.html';
    return;
  }

  // User check
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    setSession(user);
    window.location.href = 'pages/dashboard.html';
  } else {
    showError(errEl, 'Invalid email or password. Please register first.');
  }
}

function handleRegister() {
  const fname = document.getElementById('reg-fname').value.trim();
  const lname = document.getElementById('reg-lname').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const vehicle = document.getElementById('reg-vehicle').value;
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  const errEl = document.getElementById('reg-error');
  const sucEl = document.getElementById('reg-success');

  errEl.style.display = 'none';
  sucEl.style.display = 'none';

  if (!fname || !lname || !email || !phone || !vehicle || !password) {
    showError(errEl, 'Please fill in all fields.'); return;
  }
  if (password.length < 6) {
    showError(errEl, 'Password must be at least 6 characters.'); return;
  }
  if (password !== confirm) {
    showError(errEl, 'Passwords do not match.'); return;
  }
  if (email === ADMIN.email) {
    showError(errEl, 'This email is reserved.'); return;
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    showError(errEl, 'An account with this email already exists.'); return;
  }

  const newUser = {
    id: Date.now(),
    name: fname + ' ' + lname,
    email, phone, vehicle, password,
    role: 'user',
    greenScore: 0,
    credits: 0,
    joinDate: new Date().toLocaleDateString('en-IN')
  };
  users.push(newUser);
  saveUsers(users);

  sucEl.textContent = '✅ Account created! Redirecting to login...';
  sucEl.style.display = 'block';
  setTimeout(() => { window.location.href = '../index.html'; }, 1800);
}

function showError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}

// Guard: redirect logged-in users away from auth pages
(function() {
  const session = localStorage.getItem('voltpath_session');
  if (session && window.location.pathname.includes('register')) return; // allow on register
  // On index.html if already logged in, redirect
  if (session && (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/'))) {
    const user = JSON.parse(session);
    window.location.href = user.role === 'admin' ? 'pages/admin.html' : 'pages/dashboard.html';
  }
})();
