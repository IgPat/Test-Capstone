// ===== Thin fetch wrapper for the SMS REST API =====
const API_BASE = window.location.origin.includes('localhost')
  ? 'http://localhost:5000/api'
  : '/api';

async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = localStorage.getItem('sms_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (res.status === 401 && auth) {
    localStorage.removeItem('sms_token');
    localStorage.removeItem('sms_user');
    if (!location.pathname.endsWith('login.html')) {
      location.href = '/login.html';
    }
  }

  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

const api = {
  get: (path) => apiRequest(path),
  post: (path, body, opts = {}) => apiRequest(path, { method: 'POST', body, ...opts }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body }),
  del: (path) => apiRequest(path, { method: 'DELETE' }),
};
