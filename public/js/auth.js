// ===== Session helpers shared by every page =====
function getCurrentUser() {
  const raw = localStorage.getItem('sms_user');
  return raw ? JSON.parse(raw) : null;
}

function setSession(token, user) {
  localStorage.setItem('sms_token', token);
  localStorage.setItem('sms_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('sms_token');
  localStorage.removeItem('sms_user');
}

// Call at the top of every protected page.
// requiredRole: "admin" | "student" | null (any logged-in role)
function requireAuth(requiredRole) {
  const user = getCurrentUser();
  if (!user) {
    location.href = '/login.html';
    return null;
  }
  if (requiredRole && user.role !== requiredRole) {
    location.href = user.role === 'admin' ? '/admin/dashboard.html' : '/student/dashboard.html';
    return null;
  }
  return user;
}

function logout() {
  clearSession();
  location.href = '/login.html';
}

function fmtMoney(n) {
  return '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 });
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
