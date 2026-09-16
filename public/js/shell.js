// ===== Renders the navbar + sidebar shell into #app-shell =====
// Each protected page includes: <div id="app-shell"></div><div id="page-content" class="page-content"></div>
// and calls renderShell('admin'|'student') after requireAuth().

const ADMIN_LINKS = [
  { href: '/admin/dashboard.html', label: 'Dashboard' },
  { href: '/admin/students.html', label: 'Students' },
  { href: '/admin/classes.html', label: 'Classes' },
  { href: '/admin/attendance.html', label: 'Attendance' },
  { href: '/admin/grades.html', label: 'Grades' },
  { href: '/admin/invoices.html', label: 'Fees & Invoices' },
  { href: '/admin/announcements.html', label: 'Announcements' },
];

const STUDENT_LINKS = [
  { href: '/student/dashboard.html', label: 'Dashboard' },
  { href: '/student/profile.html', label: 'My Profile' },
  { href: '/student/attendance.html', label: 'My Attendance' },
  { href: '/student/grades.html', label: 'My Grades' },
  { href: '/student/invoices.html', label: 'My Fees' },
  { href: '/student/announcements.html', label: 'Announcements' },
];

function renderShell(role) {
  const user = getCurrentUser();
  const links = role === 'admin' ? ADMIN_LINKS : STUDENT_LINKS;
  const current = location.pathname;

  const linksHtml = links.map(
    (l) => `<a href="${l.href}" class="${current.endsWith(l.href) ? 'active' : ''}">${l.label}</a>`
  ).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <header class="navbar">
      <a href="${role === 'admin' ? '/admin/dashboard.html' : '/student/dashboard.html'}" class="brand">🏫 School Management System</a>
      <div class="navbar-right">
        <span class="bell" id="notif-bell">🔔<span class="badge hidden" id="notif-count"></span></span>
        <span class="user-chip">${escapeHtml(user.name)} · ${user.role}</span>
        <button class="btn-secondary" id="logout-btn">Log out</button>
      </div>
    </header>
    <div class="app-shell">
      <nav class="sidebar">${linksHtml}</nav>
      <div class="main-area">
        <div id="page-mount" class="page-content"></div>
      </div>
    </div>
    <div class="notif-panel hidden" id="notif-panel"></div>
  `);

  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('notif-bell').addEventListener('click', toggleNotifPanel);
  loadNotifBadge();
}

async function loadNotifBadge() {
  try {
    const { unreadCount } = await api.get('/notifications');
    const badge = document.getElementById('notif-count');
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.classList.remove('hidden');
    }
  } catch (e) { /* ignore */ }
}

async function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  const isHidden = panel.classList.contains('hidden');
  if (!isHidden) { panel.classList.add('hidden'); return; }

  panel.innerHTML = '<div class="loading">Loading…</div>';
  panel.classList.remove('hidden');

  try {
    const { notifications } = await api.get('/notifications');
    if (!notifications.length) {
      panel.innerHTML = '<div class="empty-state">No notifications yet.</div>';
      return;
    }
    panel.innerHTML = `
      <div class="flex-between" style="padding:6px 8px;">
        <strong style="font-size:.85rem;">Notifications</strong>
        <button class="btn-link" id="mark-all-read" style="font-size:.78rem;">Mark all read</button>
      </div>
      ${notifications.map((n) => `
        <div class="notif-item ${n.isRead ? '' : 'unread'}">
          <div>${escapeHtml(n.message)}</div>
          <div class="muted" style="font-size:.72rem;">${fmtDate(n.createdAt)}</div>
        </div>
      `).join('')}
    `;
    document.getElementById('mark-all-read').addEventListener('click', async () => {
      await api.put('/notifications/read-all');
      document.getElementById('notif-count').classList.add('hidden');
      toggleNotifPanel();
    });
  } catch (e) {
    panel.innerHTML = '<div class="empty-state">Could not load notifications.</div>';
  }
}
