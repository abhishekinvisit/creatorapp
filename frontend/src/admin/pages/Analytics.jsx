import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";

function BarChart({ data = [], keyX, keyY, color = "#E25238", height = 120 }) {
  if (!data.length) return <div className="flex items-center justify-center h-20 text-gray-600 text-xs">No data</div>;
  const max = Math.max(...data.map(d => d[keyY] || 0), 1);
  return (
    <div className="space-y-0">
      <div className="flex items-end gap-0.5" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end group cursor-pointer">
            <div className="relative w-full">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {d[keyX]}: {d[keyY]}
              </div>
            </div>
            <div className="w-full rounded-t transition-all"
              style={{ height: `${Math.max((d[keyY] / max) * 100, 3)}%`, backgroundColor: color, opacity: 0.6 + (i / data.length) * 0.4 }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-600">{data[0]?.[keyX]?.slice?.(-5) || ""}</span>
        <span className="text-xs text-gray-600">{data[data.length-1]?.[keyX]?.slice?.(-5) || ""}</span>
      </div>
    </div>
  );
}

function HorizBar({ label, value, max, color = "#E25238" }) {
  const pct = max ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-300 truncate max-w-[60%]">{label}</span>
        <span className="text-gray-500 font-mono">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.analytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-600">Loading analytics...</div>
  );
  if (!data) return null;

  const collab = data.collaborations;
  const convRate = collab.total ? ((collab.accepted / collab.total) * 100).toFixed(1) : 0;
  const maxCat = Math.max(...(data.top_creator_categories?.map(c => c.count) || [1]));
  const maxOppCat = Math.max(...(data.opportunities_by_category?.map(c => c.count) || [1]));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white font-display">Analytics</h1>
        <p className="text-gray-500 text-sm">Platform performance metrics</p>
      </div>

      {/* Registration chart */}
      <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
        <h2 className="text-sm font-semibold text-white mb-1">Daily Registrations (30 days)</h2>
        <p className="text-gray-500 text-xs mb-4">New users by day</p>
        <BarChart data={data.daily_registrations} keyX="day" keyY="total" height={120} />
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-[#E25238]" />
            Creators vs Brands breakdown
          </div>
        </div>
      </div>

      {/* Creator vs Brand split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <h2 className="text-sm font-semibold text-white mb-4">Creator Registrations</h2>
          <BarChart data={data.daily_registrations} keyX="day" keyY="creators" color="#3B82F6" height={80} />
        </div>
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <h2 className="text-sm font-semibold text-white mb-4">Brand Registrations</h2>
          <BarChart data={data.daily_registrations} keyX="day" keyY="brands" color="#A855F7" height={80} />
        </div>
      </div>

      {/* Collaboration stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Applications", value: collab.total, color: "text-white" },
          { label: "Pending", value: collab.pending, color: "text-yellow-400" },
          { label: "Accepted", value: collab.accepted, color: "text-emerald-400" },
          { label: "Rejected", value: collab.rejected, color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
            <p className={`text-2xl font-bold ${s.color} font-display`}>{s.value || 0}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-white">Conversion Rate</h2>
          <span className="text-2xl font-bold text-emerald-400">{convRate}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${convRate}%` }} />
        </div>
        <p className="text-xs text-gray-600 mt-2">Applications that were accepted</p>
      </div>

      {/* Messages */}
      <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
        <h2 className="text-sm font-semibold text-white mb-4">Daily Messages</h2>
        <BarChart data={data.daily_messages} keyX="day" keyY="count" color="#10B981" height={100} />
      </div>

      {/* Top categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <h2 className="text-sm font-semibold text-white mb-4">Top Creator Categories</h2>
          <div className="space-y-3">
            {(data.top_creator_categories || []).map(c => (
              <HorizBar key={c.category} label={c.category} value={c.count} max={maxCat} />
            ))}
            {!data.top_creator_categories?.length && <p className="text-gray-600 text-xs">No data</p>}
          </div>
        </div>
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <h2 className="text-sm font-semibold text-white mb-4">Opportunities by Category</h2>
          <div className="space-y-3">
            {(data.opportunities_by_category || []).map(c => (
              <HorizBar key={c.category} label={c.category} value={c.count} max={maxOppCat} color="#A855F7" />
            ))}
            {!data.opportunities_by_category?.length && <p className="text-gray-600 text-xs">No data</p>}
          </div>
        </div>
      </div>

      {/* Avg followers */}
      <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
        <h2 className="text-sm font-semibold text-white mb-1">Creator Insights</h2>
        <p className="text-gray-500 text-xs mb-3">Platform-wide creator statistics</p>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-white font-display">
            {Math.round(data.avg_creator_followers || 0).toLocaleString()}
          </span>
          <span className="text-gray-500 text-sm mb-1">avg followers per creator</span>
        </div>
      </div>
    </div>
  );
}
