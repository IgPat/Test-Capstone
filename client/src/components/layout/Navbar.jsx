import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { fmtDate } from "../../utils/formatters";
import { Bell, LogOut, School, CheckCheck } from "lucide-react";

export default function Navbar() {
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
    <header className="navbar">
      <Link to={dashboardPath} className="brand">
        <School
          className="w-5 h-5 text-primary"
          style={{ color: "var(--primary)" }}
        />
        <span>School Management System</span>
      </Link>

      <div className="navbar-right">
        <div className="bell-container">
          <button
            className="bell-btn"
            onClick={toggleNotifications}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          {showNotif && (
            <div className="notif-panel">
              <div
                className="flex-between"
                style={{ padding: "6px 8px", marginBottom: "8px" }}
              >
                <strong style={{ fontSize: ".9rem" }}>Notifications</strong>
                {unreadCount > 0 && (
                  <button
                    className="btn-link"
                    onClick={handleMarkAllRead}
                    style={{
                      fontSize: ".78rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              {loadingNotif ? (
                <div className="loading">Loading notifications…</div>
              ) : notifications.length === 0 ? (
                <div className="empty-state">No notifications yet.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`notif-item ${n.isRead ? "" : "unread"}`}
                  >
                    <div>{n.message}</div>
                    <div
                      className="muted"
                      style={{ fontSize: ".74rem", marginTop: "4px" }}
                    >
                      {fmtDate(n.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <span className="user-chip">
          {user?.name} ·{" "}
          <strong style={{ textTransform: "capitalize" }}>{user?.role}</strong>
        </span>

        <button className="btn-secondary" onClick={handleLogout}>
          <LogOut size={16} /> Log out
        </button>
      </div>
    </header>
  );
}
