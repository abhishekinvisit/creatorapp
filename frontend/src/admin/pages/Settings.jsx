import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { useAdmin } from "../AdminContext";

export default function Settings() {
  const { admin } = useAdmin();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", role: "admin" });
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (admin?.role === "super_admin") {
      adminApi.admins()
        .then(r => setAdmins(r.admins))
        .catch(console.error);
    }
  }, [admin]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name || !form.password) { setError("Name and password required"); return; }
    setCreating(true); setError("");
    try {
      const newAdmin = await adminApi.createAdmin(form);
      setAdmins(a => [newAdmin, ...a]);
      setForm({ name: "", phone: "", email: "", password: "", role: "admin" });
      setMsg("Admin created successfully!");
    } catch (e) { setError(e.message); }
    finally { setCreating(false); setTimeout(() => setMsg(""), 3000); }
  }

  const F = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white font-display">Settings</h1>
        <p className="text-gray-500 text-sm">Admin panel configuration</p>
      </div>

      {/* Current admin info */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Your Account</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            ["Name", admin?.name],
            ["Role", admin?.role?.replace("_", " ")],
            ["Phone", admin?.phone || "—"],
            ["Email", admin?.email || "—"],
          ].map(([l, v]) => (
            <div key={l}>
              <p className="text-xs text-gray-600 uppercase tracking-wider">{l}</p>
              <p className="text-sm text-white mt-0.5 capitalize">{v || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create admin — super admin only */}
      {admin?.role === "super_admin" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Create New Admin</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Name *</label>
                <input value={form.name} onChange={F("name")} placeholder="Admin name"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm mt-1 focus:outline-none focus:border-[#E25238]" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Role</label>
                <select value={form.role} onChange={F("role")}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm mt-1 focus:outline-none">
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Phone</label>
                <input value={form.phone} onChange={F("phone")} placeholder="+91 XXXXX XXXXX"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm mt-1 focus:outline-none focus:border-[#E25238]" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Email</label>
                <input value={form.email} onChange={F("email")} type="email" placeholder="admin@email.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm mt-1 focus:outline-none focus:border-[#E25238]" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500">Password *</label>
                <input value={form.password} onChange={F("password")} type="password" placeholder="Strong password"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm mt-1 focus:outline-none focus:border-[#E25238]" />
              </div>
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            {msg && <div className="text-emerald-400 text-sm">{msg}</div>}
            <button type="submit" disabled={creating}
              className="bg-[#E25238] hover:bg-[#c94530] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              {creating ? "Creating..." : "Create Admin"}
            </button>
          </form>
        </div>
      )}

      {/* Admins list */}
      {admin?.role === "super_admin" && admins.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <span className="text-sm font-semibold text-white">All Admins</span>
          </div>
          <div className="divide-y divide-gray-800/50">
            {admins.map(a => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E25238] flex items-center justify-center text-sm font-bold">
                    {a.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.phone || a.email || "—"}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  a.role === "super_admin"
                    ? "bg-[#E25238]/15 text-[#E25238] border-[#E25238]/30"
                    : "bg-gray-700/40 text-gray-400 border-gray-700/40"
                }`}>{a.role?.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create first super admin tip */}
      {admin?.role !== "super_admin" && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5">
          <h3 className="text-yellow-400 font-medium text-sm mb-1">Limited Access</h3>
          <p className="text-yellow-500/70 text-xs">You have admin access. Contact a Super Admin to manage other admin accounts.</p>
        </div>
      )}

      {/* Setup tip */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5">
        <h3 className="text-blue-400 font-medium text-sm mb-2">First-Time Setup</h3>
        <p className="text-blue-400/70 text-xs mb-3">To create your first super admin account, run this command in your backend:</p>
        <code className="block bg-gray-900 rounded-lg p-3 text-xs text-green-400 font-mono whitespace-pre overflow-x-auto">
{`curl -X POST /api/admin/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"phone":"YOUR_PHONE","password":"YOUR_PASS"}'`}
        </code>
        <p className="text-blue-400/70 text-xs mt-2">Or use the bootstrap script: <code className="text-blue-300">python3 backend/bootstrap_admin.py</code></p>
      </div>
    </div>
  );
}
