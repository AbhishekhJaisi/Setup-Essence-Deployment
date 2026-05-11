import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import NotificationModal from "./NotificationModal";
import { socket } from "../socket";
import LogOut from "./LogOut";

function NavBar() {
  const [showNotification, setShowNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showlogoutform, setShowLogoutForm] = useState(false);
  const [unreadcount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = import.meta.env.VITE_API_URL;

  const userData = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const user =
    userData && userData !== "undefined" ? JSON.parse(userData) : null;

  const initials = user?.name?.charAt(0).toUpperCase() ?? "?";

  const handleNotificationClick = async (id) => {
    let alreadyRead = false;
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          alreadyRead = n.isRead;
          return { ...n, isRead: true };
        }
        return n;
      }),
    );
    if (!alreadyRead) setUnreadCount((prev) => Math.max(prev - 1, 0));
    try {
      const res = await fetch(`${apiUrl}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("Failed to update notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      const res = await fetch(`${apiUrl}/api/notifications/mark-all-read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("Failed to mark all as read");
    }
  };

  useEffect(() => {
    socket.connect();
    const userId = localStorage.getItem("userId");
    socket.on("connect", () => {
      if (userId) socket.emit("join", userId);
    });
    socket.on("notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
    return () => {
      socket.off("connect");
      socket.off("notification");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    async function getNotification() {
      try {
        const res = await fetch(`${apiUrl}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setNotifications(data.data);
      } catch (err) {
        console.log(err);
      }
    }
    getNotification();
  }, []);

  useEffect(() => {
    async function NotifCount() {
      try {
        const res = await fetch(`${apiUrl}/api/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUnreadCount(data.data.unreadCount);
      } catch (error) {
        console.log(error);
      }
    }
    NotifCount();
  }, []);

  const NavItems = [
    { item: "Dashboard", path: "/dashboard", icon: "ti-layout-dashboard" },
    { item: "Events", path: "/events", icon: "ti-calendar-event" },
    { item: "Profile", path: "/profile", icon: "ti-user" },
  ];

  return (
    <>
      <nav className="bg-[#0e0e14] border border-white/[0.07] px-4 h-[60px] flex items-center gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-serif font-light text-[18px] text-[#f0ece3]">
            Club Management
          </span>
        </div>

        <div className="w-px h-5 bg-white/[0.08] flex-shrink-0 mx-1" />

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-1">
          {NavItems.map(({ item, path, icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={item}
                to={path}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                  isActive
                    ? "bg-violet-500/15 text-violet-400 border border-violet-500/25"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.05]"
                }`}
              >
                <i className={`ti ${icon} text-[14px]`} aria-hidden="true" />
                {item}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Bell */}
          <button
            aria-label="Notifications"
            onClick={() => setShowNotification(true)}
            className="relative w-[34px] h-[34px] rounded-[10px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/45 hover:text-white/75 hover:bg-white/[0.07] transition-all"
          >
            <i className="ti ti-bell text-[16px]" aria-hidden="true" />
            {unreadcount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-amber-400 border-2 border-[#0e0e14] flex items-center justify-center text-[9px] font-semibold text-amber-900 px-1">
                {unreadcount}
              </span>
            )}
          </button>

          {/* User pill */}
          {user && (
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all"
            >
              <div className="w-[26px] h-[26px] rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[11px] font-medium text-violet-400 select-none">
                {initials}
              </div>
              <span className="text-[12px] text-white/55 hidden sm:block">
                {user.name}
              </span>
              <i
                className="ti ti-chevron-down text-[12px] text-white/25"
                aria-hidden="true"
              />
            </button>
          )}

          {/* Log out */}
          <button
            onClick={() => setShowLogoutForm(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/[0.08] border border-red-500/20 text-red-400/75 hover:text-red-400/95 hover:bg-red-500/[0.14] text-[12px] font-medium transition-all active:scale-95"
          >
            <i className="ti ti-logout text-[13px]" aria-hidden="true" />
            Log out
          </button>
        </div>
      </nav>

      <NotificationModal
        setShowNotification={setShowNotification}
        showNotification={showNotification}
        handleNotification={() => setShowNotification(true)}
        notifications={notifications}
        handleNotificationClick={handleNotificationClick}
        unreadCount={unreadcount}
        handleMarkAllAsRead={handleMarkAllAsRead}
      />

      {showlogoutform && (
        <LogOut
          setShowLogoutForm={setShowLogoutForm}
          showlogoutform={showlogoutform}
        />
      )}
    </>
  );
}

export default NavBar;
