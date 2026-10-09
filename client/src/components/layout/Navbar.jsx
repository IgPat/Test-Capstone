import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { fmtDate, fmtTimeAgo } from "../../utils/formatters";
import { Bell, LogOut, GraduationCap, CheckCheck, Menu, X, Check, Inbox, BellOff } from "lucide-react";
import "../../pages/auth/RebuiltPages.css";

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotificationBadge();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setShowNotif(false);
      }
    }
    if (showNotif) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNotif]);

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
      setUnreadCount(res.unreadCount || 0);
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

  const handleMarkSingleRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
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

  const filteredNotifs =
    activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

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
        <div className="rebuilt-notif-container" ref={notifRef}>
          <button
            className={`rebuilt-notif-btn ${showNotif ? "active" : ""}`}
            onClick={toggleNotifications}
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={showNotif}
            aria-haspopup="true"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="rebuilt-notif-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
            )}
          </button>

          {showNotif && (
            <>
              <div
                className="rebuilt-notif-backdrop"
                onClick={() => setShowNotif(false)}
                aria-hidden="true"
              />
              <div
                className="rebuilt-notif-panel"
                role="dialog"
                aria-label="Notifications Feed"
              >
                <div className="rebuilt-notif-header">
                  <div className="rebuilt-notif-header-title">
                    <strong>Notifications</strong>
                    {unreadCount > 0 && (
                      <span className="rebuilt-notif-unread-pill">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      className="rebuilt-notif-mark-all"
                      onClick={handleMarkAllRead}
                      title="Mark all notifications as read"
                    >
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="rebuilt-notif-tabs" role="tablist">
                  <button
                    className={`rebuilt-notif-tab ${activeTab === "all" ? "active" : ""}`}
                    onClick={() => setActiveTab("all")}
                    role="tab"
                    aria-selected={activeTab === "all"}
                  >
                    <span>All</span>
                    <span className="rebuilt-notif-tab-count">
                      {notifications.length}
                    </span>
                  </button>
                  <button
                    className={`rebuilt-notif-tab ${activeTab === "unread" ? "active" : ""}`}
                    onClick={() => setActiveTab("unread")}
                    role="tab"
                    aria-selected={activeTab === "unread"}
                  >
                    <span>Unread</span>
                    {unreadCount > 0 && (
                      <span className="rebuilt-notif-tab-count unread">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                <div className="rebuilt-notif-body">
                  {loadingNotif ? (
                    <div className="rebuilt-notif-loading">
                      <div className="rebuilt-notif-skeleton" />
                      <div className="rebuilt-notif-skeleton short" />
                      <div className="rebuilt-notif-skeleton" />
                    </div>
                  ) : filteredNotifs.length === 0 ? (
                    <div className="rebuilt-notif-empty">
                      {activeTab === "unread" ? (
                        <>
                          <Inbox size={32} className="rebuilt-notif-empty-icon" />
                          <p className="rebuilt-notif-empty-title">All caught up!</p>
                          <p className="rebuilt-notif-empty-desc">
                            You have no unread notifications right now.
                          </p>
                        </>
                      ) : (
                        <>
                          <BellOff size={32} className="rebuilt-notif-empty-icon" />
                          <p className="rebuilt-notif-empty-title">No notifications</p>
                          <p className="rebuilt-notif-empty-desc">
                            When announcements or updates arrive, they will appear here.
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="rebuilt-notif-list">
                      {filteredNotifs.map((n) => (
                        <div
                          key={n._id}
                          className={`rebuilt-notif-item ${n.isRead ? "read" : "unread"}`}
                          onClick={(e) => !n.isRead && handleMarkSingleRead(n._id, e)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="rebuilt-notif-item-status">
                            {!n.isRead && <span className="rebuilt-notif-dot" />}
                          </div>
                          <div className="rebuilt-notif-item-content">
                            <div className="rebuilt-notif-msg">{n.message}</div>
                            <div className="rebuilt-notif-time">
                              {fmtTimeAgo(n.createdAt)}
                            </div>
                          </div>
                          {!n.isRead && (
                            <button
                              className="rebuilt-notif-item-read-btn"
                              onClick={(e) => handleMarkSingleRead(n._id, e)}
                              title="Mark as read"
                              aria-label="Mark as read"
                            >
                              <Check size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
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


