import { useEffect, useState } from "react";
import ApplicationForm from "../components/ApplicationForm";

function DashboardUser() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [totalEvents, setTotalEvents] = useState(0);
  const [eventsList, setEventsList] = useState([]);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [applicants, setApplicants] = useState({});
  const [activity, setActivity] = useState([]);
  const [appliedEvents, setAppliedEvents] = useState([]);
  const [registrations, setRegistrations] = useState(0);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = Number(localStorage.getItem("userId"));

  if (role !== "user") return null;

  function formatDateTime(datetime) {
    if (!datetime) return "—";
    const d = new Date(datetime);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  useEffect(() => {
    async function checkApplications() {
      try {
        const res = await fetch(`${apiUrl}/api/registrations/my-applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const now = new Date();
        const filtered = (data?.data || []).filter((event) => {
          const d = new Date(event.Event?.eventDate);
          return !isNaN(d) && d > now;
        });
        setRegistrations(filtered.length);
        setActivity(filtered);
        setAppliedEvents(filtered.map((item) => item.eventId));
      } catch (err) {
        console.log(err);
      }
    }
    checkApplications();
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(`${apiUrl}/api/events/view-events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTotalEvents(data.data.length);
        setEventsList(data.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchEvents();
  }, []);

  async function handleEventApplication(applyFormData) {
    try {
      const res = await fetch(
        `${apiUrl}/api/registrations/apply/${selectedEventId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(applyFormData),
        },
      );
      if (!res.ok) return;
      setApplicants((prev) => {
        const existing = prev[selectedEventId] || [];
        if (existing.some((a) => a.userId === userId)) return prev;
        return { ...prev, [selectedEventId]: [...existing, { userId }] };
      });
      setAppliedEvents((prev) => [...prev, selectedEventId]);
      setShowApplyForm(false);
    } catch (err) {
      console.error(err);
    }
  }

  const STATS = [
    { label: "Active events", value: totalEvents, icon: "ti-calendar-event" },
    { label: "Your applications", value: registrations, icon: "ti-file-text" },
    { label: "Spots available", value: 0, icon: "ti-armchair" },
    {
      label: "Registrations",
      value: registrations,
      icon: "ti-check",
      highlight: true,
    },
  ];

  function statusStyle(status) {
    switch (status) {
      case "approved":
        return "text-emerald-400/80 bg-emerald-400/[0.08] border border-emerald-400/20";
      case "rejected":
        return "text-red-400/70    bg-red-400/[0.08]     border border-red-400/15";
      case "pending":
        return "text-amber-400/80  bg-amber-400/[0.08]   border border-amber-400/20";
      default:
        return "text-white/30       bg-white/[0.04]       border border-white/10";
    }
  }

  const thClass =
    "text-left px-5 py-3 text-[9px] tracking-[0.12em] uppercase font-normal";
  const tdClass = "px-5 py-3.5 text-[12px] text-white/65";

  return (
    <div className="min-h-screen bg-[#111118]  text-[#e8e3d8] relative overflow-x-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-[700px] h-[500px] rounded-full bg-violet-600/10 blur-[140px] -translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-amber-500/[0.06] blur-[120px] translate-x-1/4 translate-y-1/4" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] backdrop-blur-2xl bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center gap-3">
          <div>
            <h1 className="font-serif font-light text-[22px] text-[#f0ece3] leading-none">
              Dashboard
            </h1>
            <p className="text-[10px] tracking-[0.1em] uppercase text-white/25 mt-1">
              Track your activity and registrations
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
        {/* Hero */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-px bg-amber-400/50" />
            <span className="text-[9px] tracking-[0.14em] uppercase text-amber-400/70">
              Overview
            </span>
          </div>
          <h2 className="font-serif font-light text-4xl text-[#f0ece3] leading-tight">
            Your <span className="italic text-violet-400">activity</span> at a
            glance
          </h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-[#0e0e14] hover:bg-[#12121a] transition-colors px-6 py-5"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-[9px] tracking-[0.12em] uppercase">
                  {s.label}
                </p>
                <i
                  className={`ti ${s.icon} text-[16px] text-white/15`}
                  aria-hidden="true"
                />
              </div>
              <p
                className={`font-serif font-light text-3xl leading-none ${s.highlight ? "text-emerald-400" : "text-[#f0ece3]"}`}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tables row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Upcoming events */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[9px] tracking-[0.12em] uppercase ">
                Upcoming Events
              </span>
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[9px] tracking-[0.08em] uppercase text-violet-400/60 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                {totalEvents} active
              </span>
            </div>
            <div className="bg-[#0e0e14] border border-white/[0.05] rounded-2xl overflow-hidden">
              {eventsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <div className="w-7 h-7 rounded-full border border-white/[0.06] border-t-violet-500/60 animate-spin" />
                  <span className="text-[12px]">No upcoming events</span>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04] max-h-[360px] overflow-y-auto">
                  {eventsList.map((item) => {
                    const isApplied = appliedEvents.includes(item.id);
                    const isDeadlinePassed = item.deadlinePassed;
                    const isBookingOpen = item.bookingOpensFrom;
                    const disabled =
                      isApplied || isDeadlinePassed || !isBookingOpen;

                    let label = "Apply";
                    let btnStyle =
                      "bg-violet-500/15 border-violet-500/25 text-violet-400 hover:bg-violet-500/25";
                    if (isApplied) {
                      label = "✓ Applied";
                      btnStyle =
                        "bg-emerald-500/10 border-emerald-500/20 text-emerald-400/80 cursor-not-allowed";
                    } else if (isDeadlinePassed) {
                      label = "Closed";
                      btnStyle =
                        "bg-white/[0.04] border-white/10 text-white/25 cursor-not-allowed";
                    } else if (!isBookingOpen) {
                      label = "Not open";
                      btnStyle =
                        "bg-white/[0.04] border-white/10 text-white/25 cursor-not-allowed";
                    }

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isApplied ? "bg-emerald-400" : isDeadlinePassed ? "bg-red-400/50" : "bg-violet-500/70"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px]  truncate">{item.title}</p>
                          <p className="text-[10px] text-white/60 mt-0.5">
                            {item.city} {item.capacityRemaining ?? "?"} spots
                            left
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (disabled) return;
                            setSelectedEventId(item.id);
                            setShowApplyForm(true);
                          }}
                          disabled={disabled}
                          className={`text-[10px] px-3 py-1.5 rounded-[8px] border transition-all active:scale-95 flex-shrink-0 ${btnStyle}`}
                        >
                          {label}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Activity table */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[9px] tracking-[0.12em] uppercase">
                Your Activity
              </span>
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[9px] tracking-[0.08em] uppercase bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full">
                Recent
              </span>
            </div>
            <div className="bg-[#0e0e14] border border-white/[0.05] rounded-2xl overflow-hidden">
              <div className="max-h-[360px] overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-white/[0.06] bg-[#0e0e14]">
                      <th className={thClass}>Event</th>
                      <th className={thClass}>Date</th>
                      <th className="px-5 py-3 text-[9px] tracking-[0.12em] uppercase font-normal text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {activity.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-14 text-center text-[12px]"
                        >
                          No activity yet
                        </td>
                      </tr>
                    ) : (
                      activity.map((reg) => (
                        <tr
                          key={reg.id}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td
                            className={`${tdClass} font-medium  max-w-[160px] truncate`}
                          >
                            {reg.Event?.title}
                          </td>
                          <td className={`${tdClass} text-[11px]`}>
                            {formatDateTime(reg.createdAt)}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span
                              className={`inline-block text-[9px] tracking-[0.06em] uppercase px-2.5 py-1 rounded-full capitalize ${statusStyle(reg.status)}`}
                            >
                              {reg.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>

      <ApplicationForm
        showApplyForm={showApplyForm}
        setShowApplyForm={setShowApplyForm}
        HandleEventApplication={handleEventApplication}
      />
    </div>
  );
}

export default DashboardUser;
