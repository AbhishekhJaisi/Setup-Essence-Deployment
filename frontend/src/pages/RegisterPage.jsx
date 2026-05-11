import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const Navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [cnfmpassword, setCnfmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [register, setRegister] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const HandleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !formData.email ||
      !formData.password ||
      !cnfmpassword ||
      !formData.username ||
      !formData.role
    ) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }
    if (formData.password !== cnfmpassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must have 8 chars, 1 capital, 1 number, 1 symbol");
      setLoading(false);
      return;
    }

    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }
      setRegister(data.message + ", Redirecting to login...");
      setTimeout(() => Navigate("/"), 1000);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
    setFormData("");
  };

  const fields = [
    {
      label: "Username",
      type: "text",
      placeholder: "Enter your username",
      key: "username",
    },
    {
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
      key: "email",
    },
    {
      label: "Password",
      type: "password",
      placeholder: "Create a password",
      key: "password",
    },
  ];

  return (
    <div className="min-h-screen bg-[#111118] text-[#e8e3d8] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-[700px] h-[500px] rounded-full bg-violet-600/10 blur-[140px] -translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-amber-500/[0.06] blur-[120px] translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-px bg-amber-400/50" />
          <span className="text-[9px] tracking-[0.14em] uppercase text-amber-400/70">
            Club Management
          </span>
        </div>

        {/* Logo + Heading */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-3"></div>
          <h1 className="font-serif font-light text-[32px]  leading-tight mb-2">
            Create your <span className="italic text-violet-400">account</span>
          </h1>
          <p className="text-[12px] text-white/60">
            Fill in the details below to get started
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0e0e14] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-4">
          {/* Text fields */}
          {fields.map(({ label, type, placeholder, key }) => (
            <div key={key}>
              <p className="text-[9px] tracking-[0.1em] uppercase mb-1.5">
                {label}
              </p>
              <input
                type={type}
                placeholder={placeholder}
                value={formData[key]}
                onChange={(e) =>
                  setFormData({ ...formData, [key]: e.target.value })
                }
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3 py-2.5 text-[12px]  placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-violet-500/[0.05] focus:ring-2 focus:ring-violet-500/10 transition-all"
              />
            </div>
          ))}

          {/* Confirm password */}
          <div>
            <p className="text-[9px] tracking-[0.1em] uppercase mb-1.5">
              Confirm Password
            </p>
            <input
              type="password"
              placeholder="Repeat your password"
              value={cnfmpassword}
              onChange={(e) => setCnfmPassword(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[10px] px-3 py-2.5 text-[12px] text-[#e8e3d8] placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-violet-500/[0.05] focus:ring-2 focus:ring-violet-500/10 transition-all"
            />
          </div>

          {/* Role selector */}
          <div>
            <p className="text-[9px] tracking-[0.1em] uppercase mb-2">
              Register as
            </p>
            <div className="flex gap-2">
              {[
                { value: "user", label: "User" },
                { value: "creator", label: "Event Manager" },
              ].map(({ value, label }) => {
                const active = formData.role === value;
                return (
                  <label
                    key={value}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-[10px] cursor-pointer transition-all text-[12px] font-medium border ${
                      active
                        ? "bg-violet-500/15 border-violet-500/30 text-violet-400"
                        : "bg-white/[0.03] border-white/[0.08] text-white/35 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        active
                          ? "border-violet-500 bg-violet-500"
                          : "border-white/20"
                      }`}
                    >
                      {active && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={active}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="sr-only"
                    />
                    {label}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/[0.08] border border-red-500/20 rounded-[10px]">
              <span className="text-[11px] text-red-400/80">{error}</span>
            </div>
          )}
          {register && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-[10px]">
              <span className="text-[11px] text-emerald-400/80">
                {register}
              </span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            onClick={HandleSubmit}
            className="w-full py-3 rounded-[10px] bg-gradient-to-r from-violet-600 to-violet-400 text-white text-[13px] font-medium shadow-[0_2px_16px_rgba(124,90,245,0.35)] hover:shadow-[0_4px_24px_rgba(124,90,245,0.55)] hover:-translate-y-px active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Signing up…" : "Sign up"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-white/25 mt-5">
          Already have an account?{" "}
          <button
            onClick={() => Navigate("/")}
            className="text-violet-400 font-medium hover:text-violet-300 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
