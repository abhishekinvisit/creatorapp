import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { useNavigate } from "react-router-dom";

function StatCard({ label, value, sub, color = "orange", icon }) {
  const colors = {
    orange: "from-[#E25238]/20 to-[#F59E0B]/10 border-[#E25238]/30",
    blue:   "from-blue-500/20 to-blue-400/10 border-blue-500/30",
    green:  "from-emerald-500/20 to-emerald-400/10 border-emerald-500/30",
    purple: "from-purple-500/20 to-purple-400/10 border-purple-500/30",
    gray:   "from-gray-700/40 to-gray-800/20 border-gray-700/40",
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-white mt-1 font-display">{value?.toLocaleString() ?? "—"}</p>
          {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
        </div>
        {icon && <span className="text-2xl opacity-60">{icon}</span>}
      </div>
    </div>
  );
}

function MiniBar({ data = [], keyX = "day", keyY = "count", color = "#E25238", height = 48 }) {
  if (!data.length) return <div className="h-12 flex items-center justify-center text-gray-600 text-xs">No data</div>;
  const max = Math.max(...data.map(d => d[keyY] || 0), 1);
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 rounded-t-sm transition-all" title={`${d[keyX]}: ${d[keyY]}`}
          style={{ height: `${Math.max((d[keyY] / max) * 100, 4)}%`, backgroundColor: color, opacity: 0.7 + (i / data.length) * 0.3 }} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    adminApi.stats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Loading dashboard...</div>
    </div>
  );
  if (error) return (
    <div className="p-8 text-red-400">{error}</div>
  );
  if (!stats) return null;

  const { users, verification, content, growth, top_creators, top_brands } = stats;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview and key metrics</p>
      </div>

      {/* User stats */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">User Analytics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard label="Total Users" value={users.total} icon="👥" color="orange" />
          <StatCard label="Creators" value={users.creators} icon="✦" color="blue" />
          <StatCard label="Brands" value={users.brands} icon="◈" color="purple" />
          <StatCard label="New Today" value={users.new_today} sub="registrations" icon="🔥" color="green" />
          <StatCard label="This Week" value={users.new_week} sub="new users" color="gray" />
          <StatCard label="This Month" value={users.new_month} sub="new users" color="gray" />
          <StatCard label="Suspended" value={users.suspended} icon="⛔" color="gray" />
          <StatCard label="Verified Creators" value={verification.verified_creators} icon="✓" color="green" />
        </div>
      </div>

      {/* Growth chart */}
      <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">User Growth (30 days)</h2>
            <p className="text-gray-500 text-xs mt-0.5">Daily registrations trend</p>
          </div>
          <span className="text-xs text-gray-600">{growth.length} days</span>
        </div>
        <MiniBar data={growth} keyX="day" keyY="count" height={80} />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-600">{growth[0]?.day?.slice(5) || ""}</span>
          <span className="text-xs text-gray-600">{growth[growth.length - 1]?.day?.slice(5) || ""}</span>
        </div>
      </div>

      {/* Content + Collab stats */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Platform Activity</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard label="Opportunities" value={content.total_opportunities} icon="💼" color="blue" />
          <StatCard label="Applications" value={content.total_applications} icon="📋" color="purple" />
          <StatCard label="Messages Sent" value={content.total_messages} icon="💬" color="green" />
          <StatCard label="Conversations" value={content.total_threads} icon="🗨️" color="gray" />
          <StatCard label="Blogs" value={content.total_blogs} sub={`${content.published_blogs} published`} icon="✎" color="orange" />
        </div>
      </div>

      {/* Top creators + brands */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Creators */}
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Top Creators</h2>
            <button onClick={() => navigate("/admin/creators")}
              className="text-xs text-[#E25238] hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {top_creators.length === 0 && <p className="text-gray-600 text-xs">No creators yet</p>}
            {top_creators.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-gray-600 text-xs w-4">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden">
                  {c.avatar ? <img src={c.avatar} alt="" className="w-full h-full object-cover" /> : (c.name?.[0] || "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-white font-medium truncate">{c.name || c.handle || "Creator"}</span>
                    {c.verified && <span className="text-[#E25238] text-xs">✓</span>}
                  </div>
                  <span className="text-xs text-gray-500">@{c.handle || "—"}</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">{c.followers?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Brands */}
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Top Brands</h2>
            <button onClick={() => navigate("/admin/brands")}
              className="text-xs text-[#E25238] hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {top_brands.length === 0 && <p className="text-gray-600 text-xs">No brands yet</p>}
            {top_brands.map((b, i) => (
              <div key={b.id} className="flex items-center gap-3">
                <span className="text-gray-600 text-xs w-4">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden">
                  {b.logo ? <img src={b.logo} alt="" className="w-full h-full object-cover" /> : (b.name?.[0] || "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-white font-medium truncate">{b.name || b.handle || "Brand"}</span>
                    {b.verified && <span className="text-[#E25238] text-xs">✓</span>}
                  </div>
                  <span className="text-xs text-gray-500">@{b.handle || "—"}</span>
                </div>
                <span className="text-xs text-gray-400">{b.opportunities} opps</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
