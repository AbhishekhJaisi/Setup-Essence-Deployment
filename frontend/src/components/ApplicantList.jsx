function ApplicantsList({
  applicants,
  showApplicants,
  setShowApplicants,
  handleStatus,
}) {
  if (!showApplicants) return null;

  const STATUS_STYLES = {
    approved: "text-emerald-400/80 bg-emerald-400/10 border-emerald-400/20",
    rejected: "text-red-400/80    bg-red-400/10    border-red-400/20",
    pending: "text-white/35      bg-white/[0.05]  border-white/10",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => setShowApplicants(false)}
    >
      {/* Glow */}
      <div className="absolute w-[400px] h-[280px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />

      <div
        className="relative w-full max-w-md bg-[#0e0e14] border border-white/[0.07] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-px bg-amber-400/50" />
              <span className="text-[9px] tracking-[0.14em] uppercase text-amber-400/70">
                Review
              </span>
            </div>
            <p className="font-serif font-light text-[20px] text-[#f0ece3] leading-none">
              Applicants
            </p>
          </div>
          <span className="text-[10px] tracking-[0.08em] uppercase text-white/25">
            {applicants.length} total
          </span>
        </div>

        {/* List */}
        <ul className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
          {applicants.length === 0 ? (
            <li className="flex flex-col items-center justify-center py-12 gap-2">
              <span className="text-2xl opacity-20">👥</span>
              <p className="text-[12px] text-white/20">No applicants yet</p>
            </li>
          ) : (
            applicants.map((app) => (
              <li
                key={app.id}
                className="flex items-center gap-3 px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-amber-400/20 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] text-white/50 font-medium">
                    {app.User?.username?.[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>

                {/* Name */}
                <span className="flex-1 text-[13px] text-[#f0ece3]/75 font-medium truncate">
                  {app.User?.username}
                </span>

                {/* Status chip */}
                <span
                  className={`text-[9px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${STATUS_STYLES[app.status] ?? STATUS_STYLES.pending}`}
                >
                  {app.status}
                </span>

                {/* Actions */}
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleStatus(app.id, "approved")}
                    className="text-[10px] tracking-[0.06em] uppercase px-2.5 py-1 rounded-lg border border-emerald-500/20 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => handleStatus(app.id, "rejected")}
                    className="text-[10px] tracking-[0.06em] uppercase px-2.5 py-1 rounded-lg border border-red-500/15 text-red-400/60 hover:text-red-400/90 hover:bg-red-500/[0.08] hover:border-red-500/30 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.06] flex justify-end">
          <button
            onClick={() => setShowApplicants(false)}
            className="text-[11px] tracking-[0.06em] uppercase px-4 py-2 border border-white/[0.08] text-white/35 hover:text-white/65 hover:bg-white/[0.05] rounded-xl transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicantsList;
