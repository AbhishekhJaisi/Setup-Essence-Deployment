import { useNavigate } from "react-router-dom";
import { useState } from "react";

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorlogin, setErrorLogin] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const apiUrl = import.meta.env.VITE_API_URL;

  const HandleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorLogin("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      localStorage.setItem("username", data.data.user.username);
      localStorage.setItem("userId", data.data.user.id);
      localStorage.setItem("role", data.data.user.role);
      localStorage.setItem("token", data.data.token);
      if (!data.success) {
        setErrorLogin(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }
      if (data.success) navigate("/dashboard");
    } catch (error) {
      console.log(error);
      setErrorLogin("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
    setFormData({ email: "", password: "" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-0 w-[600px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-amber-500/[0.06] blur-[100px] translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Card */}
      <div className="relative z-10 flex rounded-2xl overflow-hidden border border-white/[0.07] shadow-[0_32px_80px_rgba(0,0,0,0.7)] w-full max-w-2xl">
        {/* Left panel */}
        <div className="hidden md:flex w-56 flex-shrink-0 flex-col justify-between p-7 bg-gradient-to-b from-[#12102a] via-[#0d0b1e] to-[#0a0a0f] border-r border-white/5 relative overflow-hidden">
          <div className="absolute -top-14 -left-14 w-44 h-44 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-amber-400/[0.06] blur-3xl pointer-events-none" />

          {/* Logo mark */}
          <div className="relative z-10 w-9 h-9 rounded-[9px] bg-gradient-to-br from-violet-500 to-amber-400 flex items-center justify-center text-white font-semibold text-lg select-none">
            E
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-4 h-px bg-amber-400/50" />
              <span className="text-[9px] tracking-[0.16em] uppercase text-amber-400/70">
                Platform
              </span>
            </div>
            <h2 className="font-serif font-light text-2xl leading-snug text-[#f0ece3] mb-2.5">
              Club <span className="italic text-violet-400">Management</span>{" "}
              Suite
            </h2>
            <p className="text-[11px] leading-relaxed text-white/25">
              Your all-in-one workspace for events, members, and experiences.
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {[
                "Create & manage events",
                "Track registrations",
                "Manage applicants",
                "Real-time updates",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <div className="mt-[5px] w-1 h-1 rounded-full bg-violet-500/60 flex-shrink-0" />
                  <span className="text-[10px] text-white/30 leading-relaxed">
                    {f}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <span className="relative z-10 text-[8px] tracking-[0.1em] uppercase text-white/10">
            © 2025 Eventful
          </span>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-[#0e0e14] px-9 py-10 flex flex-col justify-center">
          <p className="text-[9px] tracking-[0.14em] uppercase text-white/20 mb-1">
            Account access
          </p>
          <h1 className="font-serif font-light text-[34px] leading-tight text-[#f0ece3] mb-1">
            Welcome <span className="italic text-violet-400/85">back</span>
          </h1>
          <p className="text-[11px] text-white/25 mb-6">
            Sign in to continue to your dashboard
          </p>

          <div className="h-px bg-white/[0.06] mb-6" />

          <form onSubmit={HandleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-[9px] tracking-[0.12em] uppercase text-white/30 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-white/[0.04] border border-white/[0.09] rounded-[9px] px-3.5 py-2.5 text-[13px] text-[#e8e3d8] placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-violet-500/[0.06] focus:ring-2 focus:ring-violet-500/10 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[9px] tracking-[0.12em] uppercase text-white/30 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full bg-white/[0.04] border border-white/[0.09] rounded-[9px] px-3.5 py-2.5 text-[13px] text-[#e8e3d8] placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-violet-500/[0.06] focus:ring-2 focus:ring-violet-500/10 transition-all"
              />
              <button
                type="button"
                onClick={() => navigate("/forgotpassword")}
                className="mt-1.5 ml-auto block text-[10px] text-white/20 hover:text-white/50 transition-colors bg-transparent border-none cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Error */}
            <p className="text-xs text-red-400/80 text-center min-h-[16px] -mt-1">
              {errorlogin}
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[9px] text-[13px] font-medium text-white bg-gradient-to-r from-violet-600 to-violet-400 shadow-[0_2px_20px_rgba(124,90,245,0.4)] hover:shadow-[0_4px_28px_rgba(124,90,245,0.55)] hover:-translate-y-px active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-1.5">
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
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] text-white/20">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-violet-400/80 hover:text-violet-400 transition-colors bg-transparent border-none cursor-pointer"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
