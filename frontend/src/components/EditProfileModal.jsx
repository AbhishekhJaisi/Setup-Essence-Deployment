import { useState } from "react";

function EditProfileModal({
  handleEditProfile,
  showEditForm,
  setShowEditForm,
}) {
  const [editProfileFormData, setEditProfileFormData] = useState({
    phone_number: "",
    country: "",
  });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditProfileFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!showEditForm) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editProfileFormData.phone_number.length !== 10) {
      setFormError("Phone number must be exactly 10 digits");
      return;
    }
    setLoading(true);
    await handleEditProfile(editProfileFormData);
    setLoading(false);
  };

  const fields = [
    {
      name: "phone_number",
      label: "Phone Number",
      placeholder: "10-digit number",
      type: "number",
    },
    {
      name: "country",
      label: "Country",
      placeholder: "Your country",
      type: "text",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowEditForm(false);
      }}
    >
      {/* Ambient glow behind modal */}
      <div className="absolute w-[400px] h-[300px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0e0e14] border border-white/[0.07] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-px bg-amber-400/50" />
              <span className="text-[9px] tracking-[0.14em] uppercase text-amber-400/70">
                Account
              </span>
            </div>
            <h2 className="font-serif font-light text-[22px] text-[#f0ece3] leading-none">
              Edit <span className="italic text-violet-400">profile</span>
            </h2>
            <p className="text-[11px] text-white/25 mt-1">
              Update your personal information
            </p>
          </div>
          <button
            onClick={() => setShowEditForm(false)}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {fields.map(({ name, label, placeholder, type }) => (
            <div key={name}>
              <label className="block text-[9px] tracking-[0.12em] uppercase text-white/30 mb-1.5">
                {label}
              </label>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                onChange={handleChange}
                value={editProfileFormData[name]}
                className="w-full bg-white/[0.04] border border-white/[0.09] rounded-[9px] px-3.5 py-2.5 text-[13px] text-[#e8e3d8] placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-violet-500/[0.06] focus:ring-2 focus:ring-violet-500/10 transition-all"
              />
            </div>
          ))}

          {formError && (
            <p className="text-[11px] text-red-400/80 text-center">
              {formError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              className="flex-1 py-2.5 text-[12px] text-white/40 border border-white/[0.08] hover:bg-white/[0.05] hover:text-white/65 rounded-xl transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-[12px] font-medium text-white bg-gradient-to-r from-violet-600 to-violet-400 shadow-[0_2px_16px_rgba(124,90,245,0.4)] hover:shadow-[0_4px_24px_rgba(124,90,245,0.55)] hover:-translate-y-px active:scale-[0.98] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
