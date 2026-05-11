import { useState } from "react";

function ApplicationForm({
  HandleEventApplication,
  showApplyForm,
  setShowApplyForm,
}) {
  const [applyFormData, setApplyFormData] = useState({
    notes: "",
    numberOfGuests: "",
  });
  const [applyerrors, setApplyErrors] = useState({});
  const [applyformerror, setApplyFormError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!showApplyForm) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApplyFormData((prev) => ({ ...prev, [name]: value }));
    setApplyErrors((prev) => ({ ...prev, [name]: false }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const newErrors = {};
    Object.entries(applyFormData).forEach(([key, value]) => {
      if (!value) newErrors[key] = true;
    });
    if (Object.keys(newErrors).length > 0) {
      setApplyErrors(newErrors);
      setApplyFormError("Please fill all fields!");
      setLoading(false);
      return;
    }
    await HandleEventApplication(applyFormData);
    setLoading(false);
  }

  const inputClass = (field) =>
    `w-full bg-white/[0.04] border ${applyerrors[field] ? "border-red-500/50 bg-red-500/[0.04]" : "border-white/[0.08]"} rounded-[10px] px-3 py-2.5 text-[12px] text-[#e8e3d8] placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-violet-500/[0.05] focus:ring-2 focus:ring-violet-500/10 transition-all`;

  return (
    <div className="fixed inset-0 bg-[#0a0a0f]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#0e0e14] border border-white/[0.07] w-full max-w-md rounded-[20px] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <p className="text-[9px] tracking-[0.14em] uppercase text-amber-400/70 mb-1">
              Registration
            </p>
            <h2 className="font-serif font-light text-[20px] text-[#f0ece3]">
              Apply for event
            </h2>
          </div>
          <button
            onClick={() => setShowApplyForm(false)}
            className="w-8 h-8 rounded-[8px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/70 hover:bg-white/[0.08] transition-all"
          >
            <i className="ti ti-x text-[15px]" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <p className="text-[9px] tracking-[0.1em] uppercase text-white/25 mb-1.5">
              Note
            </p>
            <textarea
              name="notes"
              rows={3}
              placeholder="Add a note for the organiser…"
              value={applyFormData.notes}
              onChange={handleChange}
              className={`${inputClass("notes")} resize-none`}
            />
          </div>
          <div>
            <p className="text-[9px] tracking-[0.1em] uppercase text-white/25 mb-1.5">
              Number of guests
            </p>
            <input
              name="numberOfGuests"
              type="number"
              placeholder="0"
              value={applyFormData.numberOfGuests}
              onChange={handleChange}
              className={inputClass("numberOfGuests")}
            />
          </div>

          {applyformerror && (
            <div className="px-3 py-2.5 bg-red-500/[0.08] border border-red-500/20 rounded-[10px]">
              <p className="text-[11px] text-red-400/80">{applyformerror}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setShowApplyForm(false)}
              className="flex-1 py-2.5 rounded-[10px] bg-transparent border border-white/[0.10] text-white/40 hover:text-white/70 hover:bg-white/[0.05] text-[12px] transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2.5 rounded-[10px] bg-gradient-to-r from-violet-600 to-violet-400 text-white text-[12px] font-medium shadow-[0_2px_16px_rgba(124,90,245,0.3)] hover:shadow-[0_4px_20px_rgba(124,90,245,0.45)] hover:-translate-y-px active:scale-[0.98] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-3.5 h-3.5 rounded-full border border-white/30 border-t-white animate-spin" />
              )}
              {loading ? "Applying…" : "Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationForm;
