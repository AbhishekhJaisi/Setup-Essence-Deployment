import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditProfileModal from "../components/EditProfileModal";
import DeleteAccModal from "../components/DeleteAccModal";

function ProfilePage() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [showAccDelForm, setShowAccDelForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  async function handleEditProfile(updatedData) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/auth/profile/update`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) setUserData((prev) => ({ ...prev, ...updatedData }));
      setShowEditForm(false);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleAccountDelete() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/auth/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/api/auth/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setUserData(data.data.user);
        console.log(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUser();
  }, []);

  const initials = userData.username
    ? userData.username
        .split("_")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const fields = [
    { label: "Username", value: userData.username, icon: "ti-user" },
    { label: "Phone", value: userData.phone_number, icon: "ti-phone" },
    { label: "Email", value: userData.email, icon: "ti-mail" },
    { label: "Country", value: userData.country, icon: "ti-map-pin" },
  ];

  return (
    <div className="min-h-screen bg-[#111118] text-[#e8e3d8] relative overflow-x-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-[700px] h-[500px] rounded-full bg-violet-600/10 blur-[140px] -translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-amber-500/[0.06] blur-[120px] translate-x-1/4 translate-y-1/4" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] backdrop-blur-2xl bg-[#0a0a0f]/80">
        <div className="max-w-3xl mx-auto px-6 h-[68px] flex items-center gap-3">
          <div className="w-8 h-8 rounded-[8px] bg-gradient-to-br from-violet-500 to-amber-400 flex items-center justify-center text-white font-semibold text-base flex-shrink-0 select-none">
            E
          </div>
          <div>
            <h1 className="font-serif font-light text-[18px]  leading-none">
              Eventful
            </h1>
            <p className="text-[9px] tracking-[0.1em] uppercase  mt-0.5">
              Your Profile
            </p>
          </div>
          <button
            onClick={() => setShowEditForm(true)}
            className="ml-auto flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-violet-400 text-white text-[12px] font-medium px-4 py-2 rounded-full shadow-[0_2px_16px_rgba(124,90,245,0.4)] hover:shadow-[0_4px_24px_rgba(124,90,245,0.55)] hover:-translate-y-px active:scale-95 transition-all"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              strokeLinecap="round"
            >
              <path d="M15.232 5.232l3.536 3.536M16.732 3.732a2.5 2.5 0 013.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit profile
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 pt-10 pb-12 relative z-10">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-px bg-amber-400/50" />
          <span className="text-[9px] tracking-[0.14em] uppercase ">
            Account Overview
          </span>
        </div>
        <h2 className="font-serif font-light text-4xl  mb-8 leading-tight">
          Welcome back,{" "}
          <span className="italic text-violet-400">
            {userData.username || "—"}
          </span>
        </h2>

        {/* Hero card */}
        <div className="bg-[#0e0e14] border border-white/[0.06] rounded-2xl overflow-hidden mb-5">
          {/* Avatar row */}
          <div className="p-6 flex items-center gap-5 border-b border-white/[0.06]">
            <div className="relative w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center font-serif font-light text-2xl text-violet-400 flex-shrink-0 select-none">
              {initials}
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0e0e14]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif font-light text-xl  truncate">
                {userData.username || "—"}
              </p>
              <p className="text-[12px]  font-mono mt-1 truncate">
                {userData.email || "—"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-[0.08em] uppercase bg-violet-500/12 text-violet-400 border border-violet-500/25 px-3 py-1.5 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {userData.role || "User"}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
            {[
              { label: "Events Created", value: 0 },
              { label: "Registered", value: 0 },
              {
                label: "Member Since",
                value: userData.createdAt
                  ? new Date(userData.createdAt).getFullYear()
                  : "—",
              },
            ].map(({ label, value }) => (
              <div key={label} className="px-5 py-4">
                <p className="text-[9px] tracking-[0.1em] uppercase  mb-1">
                  {label}
                </p>
                <p className="font-serif font-light text-[26px] text-[#f0ece3] leading-none">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Fields section label */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[9px] tracking-[0.12em] uppercase ">
            Account Details
          </span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Fields */}
        <div className="bg-[#0e0e14] border border-white/[0.06] rounded-2xl overflow-hidden mb-5">
          {fields.map(({ label, value, icon }, i) => (
            <div
              key={label}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors ${
                i < fields.length - 1 ? "border-b border-white/[0.05]" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-[8px] bg-white/[0.04] border border-white/[0.07] flex items-center justify-center flex-shrink-0">
                {/* swap for actual SVG icons or an icon font */}
                <span className=" text-xs">⊙</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] tracking-[0.1em] uppercase mb-0.5">
                  {label}
                </p>
                <p className="text-[13px] text-white/75 truncate">
                  {value || <span className="text-white/50">Not set</span>}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Danger zone */}
        <div className="bg-[#0e0e14] border border-white/[0.06] rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-white/90 mb-0.5">Delete Account</p>
            <p className="text-[11px] text-white/50">
              Permanently delete your account and all data
            </p>
          </div>
          <button
            onClick={() => setShowAccDelForm(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-red-500/[0.08] border border-red-500/20 text-red-400/70 hover:text-red-400/90 hover:bg-red-500/[0.12] text-[11px] tracking-[0.06em] uppercase transition-all active:scale-95"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <EditProfileModal
        showEditForm={showEditForm}
        setShowEditForm={setShowEditForm}
        handleEditProfile={handleEditProfile}
      />
      <DeleteAccModal
        setShowAccDelForm={setShowAccDelForm}
        showAccDelForm={showAccDelForm}
        handleAccountDelete={handleAccountDelete}
        handleShowDeleteForm={() => setShowAccDelForm(true)}
      />
    </div>
  );
}

export default ProfilePage;
