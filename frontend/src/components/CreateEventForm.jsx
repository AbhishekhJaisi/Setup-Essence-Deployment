import { useState, useEffect } from "react";

function CreateEventForm({ HandleEventCreation, showForm, setShowForm }) {
  const [formData, setFormData] = useState({
    organizer: "",
    hostEmail: "",
    hostPhone: "",
    title: "",
    eventDate: "",
    eventTimeStart: "",
    eventTimeEnd: "",
    venueName: "",
    city: "",
    capacityTotal: "",
    fileUpload: "",
    fullDescription: "",
    priceAmount: "",
    registrationDeadline: "",
    bookingOpenDate: "",
    visibleFrom: "",
  });
  const [errors, setErrors] = useState({});
  const [formerror, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown === 0) return;
    const t = setInterval(() => setCooldown((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  if (!showForm) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (cooldown > 0) return;
    setFormError("");
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (!value) newErrors[key] = true;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormError("Please fill all fields!");
      return;
    }
    const selectedDate = new Date(formData.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setFormError("Date cannot be in the past");
      return;
    }
    if (formData.hostPhone.length !== 10) {
      setFormError("Phone number must be 10 digits");
      return;
    }
    setCooldown(5);
    setLoading(true);
    HandleEventCreation(formData);
    setLoading(false);
  }

  const inp = (field) =>
    `w-full bg-white/[0.04] border ${errors[field] ? "border-red-500/50 bg-red-500/[0.04]" : "border-white/[0.08]"} rounded-[10px] px-3 py-2.5 text-[12px] text-[#e8e3d8] placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-violet-500/[0.05] focus:ring-2 focus:ring-violet-500/10 transition-all`;

  const SectionLabel = ({ label }) => (
    <div className="flex items-center gap-3 mt-2">
      <span className="text-[9px] tracking-[0.12em] uppercase text-white/25">
        {label}
      </span>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );

  const Label = ({ children }) => (
    <p className="text-[9px] tracking-[0.1em] uppercase text-white/25 mb-1.5">
      {children}
    </p>
  );

  return (
    <div className="fixed inset-0 bg-[#0a0a0f]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#0e0e14] border border-white/[0.07] w-full max-w-2xl rounded-[20px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-[9px] tracking-[0.14em] uppercase text-amber-400/70 mb-1">
              Creator
            </p>
            <h2 className="font-serif font-light text-[20px] text-[#f0ece3]">
              Create new event
            </h2>
          </div>
          <button
            onClick={() => setShowForm(false)}
            className="w-8 h-8 rounded-[8px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/70 hover:bg-white/[0.08] transition-all"
          >
            <i className="ti ti-x text-[15px]" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 overflow-y-auto flex-1 flex flex-col gap-5"
        >
          {/* Host info */}
          <SectionLabel label="Host information" />
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Organizer</Label>
              <input
                name="organizer"
                type="text"
                placeholder="Organizer name"
                value={formData.organizer}
                onChange={handleChange}
                className={inp("organizer")}
              />
            </div>
            <div>
              <Label>Email address</Label>
              <input
                name="hostEmail"
                type="email"
                placeholder="host@email.com"
                value={formData.hostEmail}
                onChange={handleChange}
                className={inp("hostEmail")}
              />
            </div>
            <div>
              <Label>Phone number</Label>
              <input
                name="hostPhone"
                type="text"
                inputMode="numeric"
                placeholder="10-digit number"
                value={formData.hostPhone}
                onChange={handleChange}
                className={inp("hostPhone")}
              />
            </div>
          </div>

          {/* Event details */}
          <SectionLabel label="Event details" />
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label>Event title</Label>
              <input
                name="title"
                type="text"
                placeholder="Event title"
                value={formData.title}
                onChange={handleChange}
                className={inp("title")}
              />
            </div>
            <div>
              <Label>Category</Label>
              <select
                name="category"
                onChange={handleChange}
                value={formData.category}
                className={`${inp("category")} appearance-none`}
              >
                {[
                  "Social",
                  "Networking",
                  "Tech",
                  "Meet",
                  "Research",
                  "Entertainment",
                  "Finance",
                ].map((c) => (
                  <option key={c} value={c} style={{ background: "#0e0e14" }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-3">
              <Label>Event image</Label>
              <input
                name="fileUpload"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className={`${inp("fileUpload")} file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:bg-violet-500/15 file:text-violet-400 hover:file:bg-violet-500/25 cursor-pointer`}
              />
            </div>
            <div>
              <Label>Date</Label>
              <input
                name="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={handleChange}
                className={inp("eventDate")}
              />
            </div>
            <div>
              <Label>Start time</Label>
              <input
                name="eventTimeStart"
                type="time"
                value={formData.eventTimeStart}
                onChange={handleChange}
                className={inp("eventTimeStart")}
              />
            </div>
            <div>
              <Label>End time</Label>
              <input
                name="eventTimeEnd"
                type="time"
                value={formData.eventTimeEnd}
                onChange={handleChange}
                className={inp("eventTimeEnd")}
              />
            </div>
            <div>
              <Label>Price (₹)</Label>
              <input
                name="priceAmount"
                type="number"
                placeholder="0"
                value={formData.priceAmount}
                onChange={handleChange}
                className={inp("priceAmount")}
              />
            </div>
            <div>
              <Label>Registration deadline</Label>
              <input
                name="registrationDeadline"
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={handleChange}
                className={inp("registrationDeadline")}
              />
            </div>
            <div>
              <Label>Booking opens</Label>
              <input
                name="bookingOpenDate"
                type="date"
                value={formData.bookingOpenDate}
                onChange={handleChange}
                className={inp("bookingOpenDate")}
              />
            </div>
            <div>
              <Label>Listing date</Label>
              <input
                name="visibleFrom"
                type="date"
                value={formData.visibleFrom}
                onChange={handleChange}
                className={inp("visibleFrom")}
              />
            </div>
          </div>

          {/* Venue */}
          <SectionLabel label="Venue" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Venue name</Label>
              <input
                name="venueName"
                placeholder="Venue name"
                value={formData.venueName}
                onChange={handleChange}
                className={inp("venueName")}
              />
            </div>
            <div>
              <Label>City</Label>
              <input
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className={inp("city")}
              />
            </div>
            <div>
              <Label>Total capacity</Label>
              <input
                name="capacityTotal"
                type="number"
                placeholder="0"
                value={formData.capacityTotal}
                onChange={handleChange}
                className={inp("capacityTotal")}
              />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <textarea
                name="fullDescription"
                rows={3}
                placeholder="Describe your event…"
                value={formData.fullDescription}
                onChange={handleChange}
                className={`${inp("fullDescription")} resize-none`}
              />
            </div>
          </div>

          {formerror && (
            <div className="px-3 py-2.5 bg-red-500/[0.08] border border-red-500/20 rounded-[10px]">
              <p className="text-[11px] text-red-400/80">{formerror}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-2 pt-2 border-t border-white/[0.06] flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowForm(false)}
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
                  ? "Creating…"
                  : "Create event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEventForm;
