import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginWithEmail } from "@/lib/auth";
import { Lock, Mail, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loginWithEmail(email, password);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex bg-[#FBF9F5] font-body text-[#524646] lg:min-h-[85vh]">
      {/* Left Branding Panel */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-[#007979]">
        <img
          src="/laptop.jpg"
          alt="Laptop"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#007979]/60" />
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="space-y-6 bg-white p-8 rounded-2xl border border-[#007979]/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#524646]">PORTAL LOGIN</h2>
                <p className="text-sm text-[#524646]/70 mt-1">
                  Enter your administrative email and password.
                </p>
              </div>
              <Link
                to="/"
                title="Back to website"
                className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#524646]/15 text-[#524646]/60 hover:text-[#007979] hover:border-[#007979]/40 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                <div>
                  <p className="font-bold">Authentication Failed</p>
                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-display text-xs font-bold text-[#524646] uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A492]" />
                  <input
                    type="email"
                    required
                    placeholder="admin@agency.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FBF9F5] border border-slate-300 focus:border-[#007979] text-[#524646] text-sm rounded-lg pl-10 pr-4 py-3 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-display text-xs font-bold text-[#524646] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A492]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#FBF9F5] border border-slate-300 focus:border-[#007979] text-[#524646] text-sm rounded-lg pl-10 pr-4 py-3 outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#EC5B38] hover:bg-[#E37434] text-white font-display text-base font-bold rounded-lg py-3 px-4 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span>SIGN IN TO PORTAL</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}