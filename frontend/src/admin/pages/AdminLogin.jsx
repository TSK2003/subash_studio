import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Aperture,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useAdminAuth, getStoredCredentials } from "../context/AdminAuthContext";
import { useToast } from "../context/ToastContext";
import PremiumPageBackground from "../../components/PremiumPageBackground";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAdminAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const from = location.state?.from?.pathname || "/admin/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      await login(email, password, rememberMe);
      addToast("Welcome back to SUBASH STUDIO Admin Portal!", "success");
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || "Invalid email or password. Please try again.");
    }
  };

  const handleFillDemo = () => {
    const credentials = getStoredCredentials();
    const active = credentials[0] || { email: "admin@subashstudio.com", password: "subash@2026" };
    setEmail(active.email || "admin@subashstudio.com");
    setPassword(active.password || "subash@2026");
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#C9A669] selection:text-white relative overflow-hidden font-body">
      <PremiumPageBackground variant="login" />
      {/* Subtle Background Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#C9A669]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#9C7B3D]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Center Container */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-[#E7E0D2] relative z-10">
        
        {/* Left Side: Brand Visual & Heritage */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#24221F] to-[#171614] text-[#F8F6F2] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#33312C]">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg border border-[#E4D3A6]/40 overflow-hidden">
                <img
                  src="/images/admin/logo.png"
                  alt="SUBASH STUDIO Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl tracking-widest uppercase">
                  SUBASH STUDIO
                </h1>
                <p className="text-[10px] text-[#C9A669] uppercase font-semibold tracking-widest2">
                  Atelier & Management
                </p>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#322F2A] text-[#E4D3A6] text-xs border border-[#48443D]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A669]" />
                <span>Protected Studio Portal</span>
              </div>
              <h2 className="text-2xl font-display font-semibold leading-snug text-[#F8F6F2]">
                Fine Photography &amp; Film Studio Operations.
              </h2>
              <p className="text-xs text-[#A8A196] leading-relaxed">
                Centralized management for client shoots, wedding enquiries, high-res gallery curation, and studio branch schedules.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-[#33312C] text-xs text-[#7A746B] flex items-center justify-between">
            <span>Kalladaikurichi • Tirunelveli</span>
            <span>Est. 2008</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 bg-[#FCFAF7] p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest2 text-[#9C7B3D]">
                Sign In
              </span>
              <h3 className="text-2xl font-display font-bold text-[#2B2B2B] mt-1">
                Studio Admin Login
              </h3>
              <p className="text-xs text-[#6F6A62] mt-1">
                Enter your credentials to access the business dashboard.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 font-medium"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F6A62]">
                  Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E867B]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@subashstudio.com"
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E7E0D2] rounded-xl text-sm text-[#2B2B2B] placeholder:text-[#AAA398] focus:outline-none focus:border-[#C9A669] transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F6A62]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "Default admin credentials: admin@subashstudio.com / subash@2026. You can update your password in Settings → Security & Password."
                      )
                    }
                    className="text-xs text-[#9C7B3D] hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E867B]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-3 bg-white border border-[#E7E0D2] rounded-xl text-sm text-[#2B2B2B] placeholder:text-[#AAA398] focus:outline-none focus:border-[#C9A669] transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E867B] hover:text-[#2B2B2B]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6F6A62] select-none font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E7E0D2] text-[#9C7B3D] focus:ring-[#C9A669]"
                  />
                  <span>Remember my session</span>
                </label>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-xs text-[#9C7B3D] hover:text-[#7A5F28] font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fill Demo Login</span>
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-6 bg-[#2B2B2B] hover:bg-[#1C1B19] active:scale-[0.99] text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Studio Admin</span>
                    <ArrowRight className="w-4 h-4 text-[#E4D3A6]" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <a
                href="/"
                className="text-xs text-[#8E867B] hover:text-[#2B2B2B] hover:underline transition-colors"
              >
                ← Return to Public Website
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
