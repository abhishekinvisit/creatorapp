import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "./AdminContext";

export default function AdminLogin() {
  const { login } = useAdmin();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: "", email: "", password: "" });
  const [useEmail, setUseEmail] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const creds = { password: form.password };
      if (useEmail) creds.email = form.email;
      else creds.phone = form.phone;
      await login(creds);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E25238] to-[#F59E0B] mb-4">
            <div className="w-6 h-6 rounded-full border-2 border-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Rytspot Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to manage your platform</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex rounded-lg overflow-hidden border border-gray-700 mb-2">
              <button type="button"
                onClick={() => setUseEmail(false)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${!useEmail ? "bg-[#E25238] text-white" : "text-gray-400 hover:text-white"}`}>
                Phone
              </button>
              <button type="button"
                onClick={() => setUseEmail(true)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${useEmail ? "bg-[#E25238] text-white" : "text-gray-400 hover:text-white"}`}>
                Email
              </button>
            </div>

            {!useEmail ? (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E25238] text-sm"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@rytspot.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E25238] text-sm"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#E25238] text-sm"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E25238] hover:bg-[#c94530] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 mt-2">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        <p className="text-center text-gray-600 text-xs mt-4">
          Rytspot Admin Panel — Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
