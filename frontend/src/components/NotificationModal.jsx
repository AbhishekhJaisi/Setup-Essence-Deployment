function NotificationModal({
  setShowNotification,
  showNotification,
  notifications = [],
  setNotifications,
  setUnreadCount,
  handleNotificationClick,
  unreadCount,
  handleMarkAllAsRead,
}) {
  if (!showNotification) return null;

  const TYPE_STYLES = {
    System: "text-emerald-400/80 bg-emerald-400/10 border-emerald-400/20",
    Event: "text-violet-400/80  bg-violet-400/10  border-violet-400/20",
    Alert: "text-amber-400/80   bg-amber-400/10   border-amber-400/20",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => setShowNotification(false)}
    >
      {/* Glow */}
      <div className="absolute w-[360px] h-[260px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />

      <div
        className="relative w-full max-w-sm bg-[#0e0e14] border border-white/[0.07] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-px bg-amber-400/50" />
              <span className="text-[9px] tracking-[0.14em] uppercase text-amber-400/70">
                Inbox
              </span>
            </div>
            <p className="font-serif font-light text-[20px] text-[#f0ece3] leading-none">
              Notifications
            </p>
            <p className="text-[10px] text-white/25 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <span className="text-2xl opacity-20">🔔</span>
              <p className="text-[12px] text-white/20">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif.id)}
                className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors hover:bg-white/[0.03] ${
                  !notif.isRead ? "bg-violet-500/[0.04]" : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-amber-400/20 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] text-white/50 font-medium">
                    {(notif.data?.eventTitle || "U")[0].toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[12px] font-medium text-[#f0ece3]/80 truncate">
                      {notif.data?.eventTitle || "Notification"}
                    </p>
                    <span className="text-[10px] text-white/25 whitespace-nowrap flex-shrink-0">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    {notif.message}
                  </p>
                  {notif.type && (
                    <span
                      className={`inline-block mt-1.5 text-[9px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full border font-medium ${TYPE_STYLES[notif.type] ?? "text-white/30 bg-white/[0.04] border-white/10"}`}
                    >
                      {notif.type}
                    </span>
                  )}
                </div>

                {/* Unread dot */}
                {!notif.isRead && (
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.06] flex justify-center">
          <button
            onClick={handleMarkAllAsRead}
            className="text-[10px] tracking-[0.08em] uppercase text-violet-400/60 hover:text-violet-400 transition-colors"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationModal;
