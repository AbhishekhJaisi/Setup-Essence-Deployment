import { useEffect, useState } from "react";
import CreateEventForm from "../components/CreateEventForm";
import ApplicationForm from "../components/ApplicationForm";
import EditEvent from "../components/EditEvent";
import ApplicantsList from "../components/ApplicantList";
import { useNavigate } from "react-router-dom";

function EventsPage() {
  const [eventsList, setEventsList] = useState([]);
  const [appliedEvents, setAppliedEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [applicants, setApplicants] = useState({});
  const [showApplicants, setShowApplicants] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const itemsPerPage = 6;
  const apiUrl = import.meta.env.VITE_API_URL;
  const isCreator = role === "creator";
  const isUser = role === "user";
  const navigate = useNavigate();

  const toggleCard = (id) => setExpandedId((prev) => (prev === id ? null : id));

  function formatDateTime(datetime) {
    return new Date(datetime).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    navigate;
  });

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

  async function HandleDelete(id) {
    try {
      const res = await fetch(`${apiUrl}/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setEventsList((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchApplicants(eventId) {
    try {
      const res = await fetch(
        `${apiUrl}/api/registrations/event/${eventId}/applicants`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      const list = Array.isArray(data?.data?.registrations)
        ? data.data.registrations
        : [];
      setApplicants((prev) => ({ ...prev, [eventId]: list }));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    async function checkApplications() {
      try {
        const res = await fetch(`${apiUrl}/api/registrations/my-applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAppliedEvents(data.data.map((item) => item.eventId));
      } catch (err) {
        console.log(err);
      }
    }
    checkApplications();
  }, []);

  async function fetchEvents() {
    try {
      setLoadingEvents(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("title", searchQuery);
      params.append("page", currentPage);
      params.append("limit", itemsPerPage);
      const res = await fetch(`${apiUrl}/api/events/view-events?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEventsList(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(fetchEvents, 400);
    return () => clearTimeout(t);
  }, [searchQuery, currentPage]);

  useEffect(() => {
    if (!eventsList.length) return;
    const userId = Number(localStorage.getItem("userId"));
    eventsList.forEach((event) => {
      if (event.userId === userId && !applicants[event.id])
        fetchApplicants(event.id);
    });
  }, [eventsList]);

  async function HandleEventCreation(formData) {
    try {
      const dataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        dataToSend.append(key === "image" ? "fileUpload" : key, value);
      });
      const res = await fetch(`${apiUrl}/api/events/createEvents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend,
      });
      const data = await res.json();
      if (res.ok) {
        setEventsList((prev) => [...prev, data]);
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function HandleEventApplication(applyFormData) {
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
      if (res.ok) {
        const userId = Number(localStorage.getItem("userId"));
        setApplicants((prev) => {
          const existing = prev[selectedEventId] || [];
          if (existing.some((a) => a.userId === userId)) return prev;
          return { ...prev, [selectedEventId]: [...existing, { userId }] };
        });
        setAppliedEvents((prev) => [...prev, selectedEventId]);
        setShowApplyForm(false);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdate(editformdata) {
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
  }

  const visibleEvents = eventsList.filter((e) => e.isVisible);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const selectedEvents = visibleEvents.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const totalPages = Math.ceil(visibleEvents.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#111118] text-[#e8e3d8] relative overflow-x-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-[700px] h-[500px] rounded-full bg-violet-600/10 blur-[140px] -translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-amber-500/[0.06] blur-[120px] translate-x-1/4 translate-y-1/4" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] backdrop-blur-2xl bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center gap-3">
          {/* Logo */}
          <div>
            <div className="text-2xl">Events</div>
            <h1 className="font-serif font-light text-[18px] text-[#f0ece3] leading-none"></h1>
            <p className="text-[10px] tracking-[0.1em] uppercase text-white/25 mt-0.5">
              {isCreator ? "Creator Dashboard" : "Discover Events"}
            </p>
          </div>

          {/* Search */}
          <div className="ml-auto relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm select-none">
              ⌕
            </span>
            <input
              type="text"
              placeholder="Search events…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/[0.05] border border-white/[0.09] rounded-full pl-8 pr-4 py-2 text-[12px] text-[#e8e3d8] placeholder-white/25 outline-none focus:border-violet-500/50 focus:bg-violet-500/[0.06] focus:ring-2 focus:ring-violet-500/10 transition-all w-52"
            />
          </div>

          {/* Create button */}
          {isCreator && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-violet-400 text-white text-[12px] font-medium px-4 py-2 rounded-full shadow-[0_2px_16px_rgba(124,90,245,0.4)] hover:shadow-[0_4px_24px_rgba(124,90,245,0.55)] hover:-translate-y-px active:scale-95 transition-all flex-shrink-0"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                strokeLinecap="round"
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-6 relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-px bg-amber-400/50" />
          <span className="text-[9px] tracking-[0.14em] uppercase text-amber-400/70">
            Curated Experiences
          </span>
        </div>
        <h2 className="font-serif font-light text-5xl text-[#f0ece3] mb-4 leading-tight">
          {isCreator ? (
            <>
              Manage your <span className="italic text-violet-400">events</span>
            </>
          ) : (
            <>
              Discover what's{" "}
              <span className="italic text-violet-400">happening</span>
            </>
          )}
        </h2>
        <div className="flex items-stretch gap-6 pt-5 border-t border-white/[0.07]">
          {[
            { num: visibleEvents.length, label: "Live Events" },
            { num: appliedEvents.length, label: "Registered" },
            { num: totalPages || 1, label: "Pages" },
          ].map(({ num, label }, i) => (
            <div key={label} className="flex items-stretch gap-6">
              {i !== 0 && <div className="w-px bg-white/[0.07]" />}
              <div>
                <span className="block font-serif text-[28px] font-light text-[#f0ece3] leading-none">
                  {num}
                </span>
                <span className="block text-[9px] tracking-[0.1em] uppercase text-white/30 mt-1">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-6 relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[9px] tracking-[0.12em] uppercase text-white/25">
            All Events — Page {currentPage}
          </span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {loadingEvents || selectedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-14 h-14 rounded-full border border-white/[0.06] border-t-violet-500/60 animate-spin mb-5" />
            <p className="font-serif font-light text-xl text-white/20 tracking-wide">
              {loadingEvents ? "Curating your experience…" : "No events found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1  md:grid-cols-2  lg:grid-cols-3 gap-2 bg-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden">
            {selectedEvents.map((event) => {
              const userId = localStorage.getItem("userId");
              const isApplied = appliedEvents.includes(event.id);
              const isDeadlinePassed = !event.deadlinePassed;
              const isBookingOpen = event.bookingOpensFrom;
              const BookingStartDate = event.bookingOpenDate;
              const isOwner = event.userId?.toString() === userId;
              const isExpanded = expandedId === event.id;

              let applyLabel = "Apply Now";
              let applyStyle =
                "bg-gradient-to-r from-violet-600 to-violet-400 text-white shadow-[0_2px_14px_rgba(124,90,245,0.35)] hover:shadow-[0_4px_20px_rgba(124,90,245,0.5)] hover:-translate-y-px";
              if (isApplied) {
                applyLabel = "✓ Registered";
                applyStyle =
                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25";
              } else if (!isBookingOpen) {
                applyLabel = `Opens ${new Date(BookingStartDate).toLocaleString("en-IN", { day: "numeric", month: "short" })}`;
                applyStyle =
                  "bg-white/[0.05] text-white/25 border border-white/[0.08] cursor-not-allowed";
              } else if (!isDeadlinePassed) {
                applyLabel = "Closed";
                applyStyle =
                  "bg-white/[0.05] text-white/25 border border-white/[0.08] cursor-not-allowed";
              }

              return (
                <div
                  key={event.id}
                  className="bg-[#0e0e14] rounded-2xl shadow shadow-purple-900 hover:bg-[#12121a] transition-colors flex flex-col group"
                >
                  {/* Image */}
                  <div
                    className="relative h-48 overflow-hidden cursor-pointer"
                    onClick={() => toggleCard(event.id)}
                  >
                    <img
                      src={`${apiUrl}/${event.fileUpload}`}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14]/90 via-[#0e0e14]/20 to-transparent" />
                    <span className="absolute top-3 left-3 bg-violet-600/80 backdrop-blur-sm text-white text-[9px] tracking-[0.1em] uppercase font-medium px-2.5 py-1 rounded-full">
                      {event.category}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-[#0a0a0f]/65 backdrop-blur-sm text-white/70 text-[10px] px-2.5 py-1 rounded-full border border-white/10">
                      📍 {event.city}
                    </span>
                    {isOwner && (
                      <span className="absolute top-3 right-3 bg-amber-500/15 border border-amber-500/25 text-amber-400/90 text-[8px] tracking-[0.1em] uppercase px-2 py-1 rounded-full backdrop-blur-sm">
                        Your Event
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-serif font-light text-[18px] text-[#f0ece3] leading-snug mb-3 group-hover:text-violet-300 transition-colors">
                      {event.title}
                    </h3>

                    {/* Meta grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 py-3 border-t border-b border-white/[0.06] mb-3">
                      {[
                        {
                          label: "Date",
                          value: new Date(event.eventDate).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          ),
                        },
                        {
                          label: "Time",
                          value: `${event.eventTimeStart} – ${event.eventTimeEnd}`,
                        },
                        { label: "Capacity", value: event.capacityTotal },
                        { label: "Spots Left", value: event.capacityRemaining },
                        { label: "Price", value: `$${event.priceAmount}` },
                        {
                          label: "Deadline",
                          value: formatDateTime(event.registrationDeadline),
                        },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[8px] tracking-[0.1em] uppercase text-white/25 mb-0.5">
                            {label}
                          </p>
                          <p className="text-[11px] text-white/70">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Expanded */}
                    {isExpanded && (
                      <div className="mb-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                        <p className="text-[12px] leading-relaxed text-white/45 mb-2.5">
                          {event.fullDescription}
                        </p>
                        {isOwner && (
                          <button
                            onClick={() => {
                              setShowApplicants(true);
                              setSelectedEventId(event.id);
                            }}
                            className="w-full border border-violet-500/30 text-violet-400/80 hover:bg-violet-500/10 hover:border-violet-500/60 rounded-lg py-1.5 text-[11px] tracking-[0.06em] uppercase transition-all"
                          >
                            View Applicants
                          </button>
                        )}
                      </div>
                    )}

                    {/* Toggle */}
                    <button
                      onClick={() => toggleCard(event.id)}
                      className="text-[10px] text-white/25 hover:text-white/55 py-1.5 mb-3 transition-colors text-left tracking-wide"
                    >
                      {isExpanded ? "↑ Show less" : "↓ Show more"}
                    </button>

                    {/* Actions */}
                    <div className="mt-auto flex gap-2">
                      {isUser && (
                        <button
                          onClick={() => {
                            setShowApplyForm(true);
                            setSelectedEventId(event.id);
                          }}
                          disabled={
                            isApplied || !isBookingOpen || !isDeadlinePassed
                          }
                          className={`flex-1 py-2.5 rounded-xl text-[12px] font-medium transition-all active:scale-[0.98] ${applyStyle}`}
                        >
                          {applyLabel}
                        </button>
                      )}

                      {isCreator && isOwner && (
                        <>
                          <button
                            onClick={() => {
                              setEditingEvent(event);
                              setSelectedEventId(event.id);
                              setShowEditForm(true);
                            }}
                            className="px-3 py-2.5 border border-white/10 text-white/45 hover:text-white/80 hover:bg-white/[0.06] rounded-xl text-[11px] uppercase tracking-[0.06em] transition-all active:scale-95"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => HandleDelete(event.id)}
                            className="px-3 py-2.5 border border-red-500/15 text-red-400/60 hover:text-red-400/90 hover:bg-red-500/[0.08] rounded-xl text-[11px] uppercase tracking-[0.06em] transition-all active:scale-95"
                          >
                            Del
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-6 pb-10 flex items-center justify-center gap-4 relative z-10">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-full text-[12px] text-white/45 hover:bg-white/[0.08] hover:text-white/80 hover:border-white/15 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Prev
          </button>
          <span className="font-serif text-[16px] text-white/35 min-w-[60px] text-center">
            <span className="text-[#f0ece3]">{currentPage}</span> / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-full text-[12px] text-white/45 hover:bg-white/[0.08] hover:text-white/80 hover:border-white/15 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          >
            Next
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Modals */}
      <ApplicationForm
        showApplyForm={showApplyForm}
        setShowApplyForm={setShowApplyForm}
        HandleEventApplication={HandleEventApplication}
      />
      <CreateEventForm
        showForm={showForm}
        setShowForm={setShowForm}
        HandleEventCreation={HandleEventCreation}
      />
      {showEditForm && editingEvent && (
        <EditEvent
          showEditForm={showEditForm}
          setShowEditForm={setShowEditForm}
          handleEventEdit={handleUpdate}
          event={editingEvent}
        />
      )}
      <ApplicantsList
        showApplicants={showApplicants}
        setShowApplicants={setShowApplicants}
        applicants={applicants[selectedEventId] || []}
        handleStatus={handleStatus}
        eventsList={eventsList}
      />
    </div>
  );
}

export default EventsPage;
