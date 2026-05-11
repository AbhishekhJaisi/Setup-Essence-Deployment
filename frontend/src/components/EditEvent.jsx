import { useState, useEffect } from "react";

function EditEvent({ event, handleEventEdit, showEditForm, setShowEditForm }) {
  const [editformdata, setEditFormData] = useState({
    venue: event?.venueName || "",
    date: event?.eventDate?.slice(0, 10) || "",
    description: event?.fullDescription || "",
    city: event?.city || "",
  });
  const [editerrors, setEditErrors] = useState({});
  const [editformerror, setEditFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown === 0) return;
    const t = setInterval(() => setCooldown((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  if (!showEditForm) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: false }));
  };

  function handleSubmit(e) {
    e.preventDefault();
    setEditFormError("");
    const newErrors = {};
    Object.entries(editformdata).forEach(([key, value]) => {
      if (!value) newErrors[key] = true;
    });
    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      setEditFormError("Please fill all fields!");
      return;
    }
    setLoading(true);
    setCooldown(5);
    handleEventEdit(editformdata);
    setLoading(false);
  }

  const inputClass = (field) =>
    `w-full bg-white/[0.04] border ${editerrors[field] ? "border-red-500/50 bg-red-500/[0.04]" : "border-white/[0.08]"} rounded-[10px] px-3 py-2.5 text-[12px] text-[#e8e3d8] placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-violet-500/[0.05] focus:ring-2 focus:ring-violet-500/10 transition-all`;

  return (
    <div className="fixed inset-0 bg-[#0a0a0f]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#0e0e14] border border-white/[0.07] w-full max-w-md rounded-[20px] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <p className="text-[9px] tracking-[0.14em] uppercase text-amber-400/70 mb-1">
              Event Management
            </p>
            <h2 className="font-serif font-light text-[20px] text-[#f0ece3]">
              Edit event
            </h2>
          </div>
          <button
            onClick={() => setShowEditForm(false)}
            className="w-8 h-8 rounded-[8px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/70 hover:bg-white/[0.08] transition-all"
          >
            <i className="ti ti-x text-[15px]" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 flex flex-col gap-4 overflow-y-auto max-h-[75vh]"
        >
          {/* Section label */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] tracking-[0.12em] uppercase text-white/25">
              Event details
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <p className="text-[9px] tracking-[0.1em] uppercase text-white/25 mb-1.5">
                Venue
              </p>
              <input
                name="venue"
                type="text"
                placeholder="Venue name"
                value={editformdata.venue}
                onChange={handleChange}
                className={inputClass("venue")}
              />
            </div>
            <div>
              <p className="text-[9px] tracking-[0.1em] uppercase text-white/25 mb-1.5">
                City
              </p>
              <input
                name="city"
                type="text"
                placeholder="City"
                value={editformdata.city}
                onChange={handleChange}
                className={inputClass("city")}
              />
            </div>
            <div>
              <p className="text-[9px] tracking-[0.1em] uppercase text-white/25 mb-1.5">
                Date
              </p>
              <input
                name="date"
                type="date"
                value={editformdata.date}
                onChange={handleChange}
                className={inputClass("date")}
              />
            </div>
            <div className="col-span-2">
              <p className="text-[9px] tracking-[0.1em] uppercase text-white/25 mb-1.5">
                Description
              </p>
              <textarea
                name="description"
                rows={3}
                placeholder="Event description"
                value={editformdata.description}
                onChange={handleChange}
                className={`${inputClass("description")} resize-none`}
              />
            </div>
          </div>

          {editformerror && (
            <div className="px-3 py-2.5 bg-red-500/[0.08] border border-red-500/20 rounded-[10px]">
              <p className="text-[11px] text-red-400/80">{editformerror}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              className="flex-1 py-2.5 rounded-[10px] bg-transparent border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/[0.05] text-[12px] transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="flex-1 py-2.5 rounded-[10px] bg-gradient-to-r from-violet-600 to-violet-400 text-white text-[12px] font-medium shadow-[0_2px_16px_rgba(124,90,245,0.3)] hover:shadow-[0_4px_20px_rgba(124,90,245,0.45)] hover:-translate-y-px active:scale-[0.98] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-3.5 h-3.5 rounded-full border border-white/30 border-t-white animate-spin" />
              )}
              {cooldown > 0
                ? `Wait ${cooldown}s`
                : loading
                  ? "Saving…"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEvent;
