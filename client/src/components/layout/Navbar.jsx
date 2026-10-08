import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { fmtDate } from "../../utils/formatters";
import { Bell, LogOut, GraduationCap, CheckCheck, Menu, X } from "lucide-react";
import "../../pages/auth/RebuiltPages.css";

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);

  useEffect(() => {
    fetchNotificationBadge();
  }, []);

  const fetchNotificationBadge = async () => {
    try {
      const res = await api.get("/notifications");
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      /* ignore */
    }
  };

  const toggleNotifications = async () => {
    if (showNotif) {
      setShowNotif(false);
      return;
    }
    setShowNotif(true);
    setLoadingNotif(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.notifications || []);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoadingNotif(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      /* ignore */
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashboardPath =
    user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard";

  return (
    <header className="rebuilt-navbar">
      <div className="rebuilt-navbar-left">
        <button
          className="rebuilt-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link to={dashboardPath} className="rebuilt-navbar-brand">
          <span className="rebuilt-navbar-brand-mark">
            <GraduationCap size={20} />
          </span>
          <span>
            EduCore<span className="period">.</span>
          </span>
        </Link>
      </div>

      <div className="rebuilt-navbar-right">
        <div className="rebuilt-notif-container">
          <button
            className="rebuilt-notif-btn"
            onClick={toggleNotifications}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="rebuilt-notif-badge">{unreadCount}</span>}
          </button>

          {showNotif && (
            <div className="rebuilt-notif-panel">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #edf0eb",
                }}
              >
                <strong style={{ fontSize: "13px", color: "var(--portal-ink)" }}>
                  Notifications
                </strong>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      border: 0,
                      background: "transparent",
                      color: "var(--portal-green)",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>

              {loadingNotif ? (
                <div style={{ fontSize: "12px", color: "var(--portal-muted)", padding: "12px 0" }}>
                  Loading notifications…
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ fontSize: "12px", color: "var(--portal-muted)", padding: "12px 0" }}>
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`rebuilt-notif-item ${n.isRead ? "" : "unread"}`}
                  >
                    <div>{n.message}</div>
                    <div style={{ fontSize: "10px", color: "#8fa095", marginTop: "3px" }}>
                      {fmtDate(n.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <span className="rebuilt-user-chip">
          {user?.name} · <strong>{user?.role}</strong>
        </span>

        <button className="rebuilt-logout-btn" onClick={handleLogout}>
          <LogOut size={15} /> Log out
        </button>
      </div>
    </header>
  );
}

