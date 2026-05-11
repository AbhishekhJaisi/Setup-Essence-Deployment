import { useEffect, useState } from "react";
import ApplicantsList from "../components/ApplicantList";
import EditEvent from "../components/EditEvent";

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function FillBar({ filled, total }) {
  const pct = total > 0 ? Math.round(((total - filled) / total) * 100) : 0;
  const color =
    pct >= 90 ? "bg-red-400" : pct >= 60 ? "bg-amber-400" : "bg-violet-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-white/30 tabular-nums whitespace-nowrap">
        {filled}/{total}
      </span>
    </div>
  );
}

const STATUS_COLORS = {
  Upcoming: "text-amber-400/80 bg-amber-400/10 border-amber-400/20",
  Ongoing: "text-emerald-400/80 bg-emerald-400/10 border-emerald-400/20",
  Completed: "text-white/30 bg-white/[0.04] border-white/10",
};

function DashboardEventCreator() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [applicants, setApplicants] = useState({});
  const [showApplicants, setShowApplicants] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const token = localStorage.getItem("token");

  const handleUpdate = async (editformdata) => {
    try {
      const res = await fetch(`${apiUrl}/api/events/${editingEvent.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          venueName: editformdata.venue,
          eventDate: editformdata.date,
          fullDescription: editformdata.description,
          city: editformdata.city,
        }),
      });
      const data = await res.json();
      setEventsList((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? data : e)),
      );
      setShowEditForm(false);
      setEditingEvent(null);
    } catch (err) {
      console.error(err);
    }
  };

  async function fetchApplicants(eventId) {
    try {
      const res = await fetch(
        `${apiUrl}/api/registrations/event/${eventId}/applicants`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      const list = Array.isArray(data.data.registrations)
        ? data.data.registrations
        : [];
      setApplicants((prev) => ({ ...prev, [eventId]: list }));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStatus(regId, status) {
    try {
      await fetch(`${apiUrl}/api/registrations/${regId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      setShowApplicants(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    async function fetchCreatorDetails() {
      try {
        const res = await fetch(`${apiUrl}/api/events/my-events`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        const now = new Date();
        setEventsList(
          data.data.filter((event) => new Date(event.eventDate) > now),
        );
      } catch (err) {
        console.error(err);
        setError("You have no events.");
      } finally {
        setLoading(false);
      }
    }
    fetchCreatorDetails();
  }, []);

  function showApplicantsFunc(id) {
    setShowApplicants(true);
    setSelectedEventId(id);
    fetchApplicants(id);
  }

  const activeEvents = eventsList.filter((e) => e.isActive);

  const STATS = [
    { label: "Events Created", value: eventsList.length, icon: "🗓" },
    { label: "Total Applications", value: 121, icon: "📋" },
    { label: "Active Events", value: activeEvents.length, icon: "⚡" },
    {
      label: "Revenue Generated",
      value: "₹21,000",
      icon: "💰",
      highlight: true,
    },
  ];

  const thClass =
    "text-left px-5 py-3 text-[9px] tracking-[0.12em] uppercase text-white/25 font-normal";
  const tdClass = "px-5 py-3.5 text-[12px] text-white/65";

  const EmptyRow = ({ cols, message }) => (
    <tr>
      <td colSpan={cols} className="py-14 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-white/[0.06] border-t-violet-500/60 animate-spin" />
          <span className="text-[12px] text-white/20 tracking-wide">
            {message}
          </span>
        </div>
      </td>
    </tr>
  );

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
            <div className="text-2xl">Dashboard</div>
            <h1 className="font-serif font-light text-[18px] text-[#f0ece3] leading-none"></h1>
            <p className="text-[10px] tracking-[0.1em] uppercase text-white/25 mt-0.5">
              Manage Events and Applications
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
            Your <span className="italic text-violet-400">command</span> centre
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
                <p className="text-[9px] tracking-[0.12em] uppercase text-white/25">
                  {s.label}
                </p>
                <span className="text-lg opacity-40">{s.icon}</span>
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
          {/* Upcoming Events */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[9px] tracking-[0.12em] uppercase ">
                Upcoming Events
              </span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <div className="bg-[#0e0e14] border border-white/[0.05] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-white/[0.06] bg-[#0e0e14]">
                      <th className={thClass}>Title</th>
                      <th className={thClass}>Date</th>
                      <th className={thClass}>Deadline</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass}></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {loading ? (
                      <EmptyRow cols={5} message="Loading events…" />
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-10 text-center text-[12px] "
                        >
                          {error}
                        </td>
                      </tr>
                    ) : eventsList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-10 text-center text-[12px] "
                        >
                          No upcoming events.
                        </td>
                      </tr>
                    ) : (
                      eventsList.map((event) => (
                        <tr
                          key={event.id}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td
                            className={`${tdClass} font-medium  max-w-[140px] truncate`}
                          >
                            {event.title}
                          </td>
                          <td className={tdClass}>{fmt(event.eventDate)}</td>
                          <td className={`${tdClass} `}>
                            {event.registrationDeadline
                              ? fmt(event.registrationDeadline)
                              : "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`text-[9px] tracking-[0.08em] uppercase px-2 py-1 rounded-full border ${STATUS_COLORS[event.eventStatus] ?? " bg-white/[0.04] border-white/10"}`}
                            >
                              {event.eventStatus}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => {
                                setEditingEvent(event);
                                setSelectedEventId(event.id);
                                setShowEditForm(true);
                              }}
                              className="text-[10px] tracking-[0.08em] uppercase text-violet-400/60 hover:text-violet-400 hover:bg-violet-500/10 border border-transparent hover:border-violet-500/20 px-2.5 py-1 rounded-lg transition-all"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Application Overview */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[9px] tracking-[0.12em] uppercase ">
                Application Overview
              </span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <div className="bg-[#0e0e14] border border-white/[0.05] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-white/[0.06] bg-[#0e0e14]">
                      <th className={thClass}>Title</th>
                      <th className={thClass}>Spots</th>
                      <th className={thClass}>Fill Rate</th>
                      <th className={thClass}></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {loading ? (
                      <EmptyRow cols={4} message="Loading…" />
                    ) : eventsList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-10 text-center text-[12px] "
                        >
                          No events to manage.
                        </td>
                      </tr>
                    ) : (
                      eventsList.map((event) => (
                        <tr
                          key={event.id}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td
                            className={`${tdClass} font-medium  max-w-[140px] truncate`}
                          >
                            {event.title}
                          </td>
                          <td className={`${tdClass} tabular-nums`}>
                            <span className="text-white">
                              {event.capacityRemaining}
                            </span>
                            <span className="text-white mx-1">/</span>
                            <span className="text-white">
                              {event.capacityTotal}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 min-w-[120px]">
                            <FillBar
                              filled={event.capacityRemaining}
                              total={event.capacityTotal}
                            />
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => showApplicantsFunc(event.id)}
                              className="text-[10px] tracking-[0.08em] uppercase text-violet-400/60 hover:text-violet-400 hover:bg-violet-500/10 border border-transparent hover:border-violet-500/20 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap"
                            >
                              View Apps
                            </button>
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

      <ApplicantsList
        showApplicants={showApplicants}
        setShowApplicants={setShowApplicants}
        applicants={applicants[selectedEventId] || []}
        handleStatus={handleStatus}
        eventsList={eventsList}
      />
      {showEditForm && editingEvent && (
        <EditEvent
          showEditForm={showEditForm}
          setShowEditForm={setShowEditForm}
          handleEventEdit={handleUpdate}
          event={editingEvent}
        />
      )}
    </div>
  );
}

export default DashboardEventCreator;
