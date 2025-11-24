import { useState, useRef, useEffect } from "react";
import { useSidebar } from "./SidebarContext";
import { BsList, BsBell, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import ProfileCard from "./ProfileCard";
import { API_URL } from "../config/index";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../contexts/NotificationsContext";

export default function Header() {
  const { toggleSidebar, togglePin, sidebarPinned } = useSidebar();
  const { user } = useAuth();
  const {
    unreadCount,
    items,
    refreshList,
    loadMore,
    hasMore,
    markRead,
    markAllRead,
  } = useNotifications();

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileRef = useRef();
  const notifRef = useRef();
  const loaderRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loaderRef, loadMore]);

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggleProfile = () => {
    setShowProfile((v) => !v);
    setShowNotifications(false);
  };

  const toggleNotifications = async () => {
    const newState = !showNotifications;
    setShowNotifications(newState);
    if (newState) {
      await refreshList();
    }
  };

  const avatarSrc = user?.avatar ? `${API_URL}${user.avatar}` : "/user.png";

  return (
    <header className="header bg-white border-bottom no-print">
      <div className="container">
        <div className="d-flex align-items-center py-2">
          {/* HAMBURGER BUTTON FOR MOBILE */}
          <button className="btn d-lg-none" onClick={toggleSidebar}>
            <BsList size={24} />
          </button>

          {/* DESKTOP PIN/UNPIN ARROW */}
          <button
            className="btn d-none d-lg-inline-flex me-2"
            onClick={togglePin}
            aria-label={sidebarPinned ? "Unpin sidebar" : "Pin sidebar"}
            title={sidebarPinned ? "Unpin sidebar" : "Pin sidebar"}
          >
            {sidebarPinned ? (
              <BsChevronLeft size={18} />
            ) : (
              <BsChevronRight size={18} />
            )}
          </button>

          <div className="ms-auto position-relative d-flex align-items-center">
            <div className="me-3 d-none d-md-block">
              <span style={{ fontWeight: 500 }}>Welcome, </span>
              <span className="text-primary" style={{ fontWeight: 600 }}>
                {user?.first_name} {user?.last_name}
              </span>
            </div>

            {/* PROFILE */}
            <div className="position-relative me-3">
              <img
                src={avatarSrc}
                alt="Profile"
                className="rounded-circle shadow-sm bg-light"
                style={{
                  width: 32,
                  height: 32,
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onError={(e) => (e.currentTarget.src = "/user.png")}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={toggleProfile}
                crossOrigin="anonymous"
              />
              {showProfile && (
                <div
                  ref={profileRef}
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 8,
                    zIndex: 1000,
                  }}
                >
                  <ProfileCard onClose={() => setShowProfile(false)} />
                </div>
              )}
            </div>

            {/* NOTIFICATIONS */}
            <div className="position-relative">
              <BsBell
                size={22}
                style={{ cursor: "pointer" }}
                onClick={toggleNotifications}
              />

              {unreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "0.65rem" }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}

              {showNotifications && (
                <div
                  ref={notifRef}
                  className="dropdown-menu show"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: 14,
                    width: 300,
                    maxHeight: 400,
                    overflowY: "auto",
                    zIndex: 1000,
                  }}
                >
                  <div className="dropdown-header d-flex justify-content-between align-items-center">
                    <div className="heading">Notifications</div>
                    {unreadCount > 0 && (
                      <div className="action">
                        <small>
                          <a
                            href=""
                            onClick={async (e) => {
                              e.preventDefault();
                              await markAllRead();
                            }}
                          >
                            Mark all as read
                          </a>
                        </small>
                      </div>
                    )}
                  </div>

                  {items.length === 0 ? (
                    <div className="dropdown-item text-muted">
                      No notifications
                    </div>
                  ) : (
                    items.map((n) => (
                      <>
                        <div className="dropdown-divider" />
                        <div
                          key={n._id}
                          className={`dropdown-item ${
                            n.isRead ? "" : "fw-bold"
                          }`}
                          style={{ whiteSpace: "normal", cursor: "pointer" }}
                          onClick={async () => {
                            await markRead([n._id]);
                            if (n.link) window.location.href = n.link;
                          }}
                        >
                          <div>
                            <small>{n.content}</small>
                          </div>
                          <small className="text-muted">
                            {new Date(n.createdAt).toLocaleString()}
                          </small>
                        </div>
                      </>
                    ))
                  )}

                  {hasMore && (
                    <div
                      ref={loaderRef}
                      className="text-center py-2 text-muted small"
                    >
                      Loading...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
