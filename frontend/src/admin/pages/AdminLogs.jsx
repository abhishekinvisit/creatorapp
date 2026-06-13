import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";

const ACTION_ICONS = {
  verified_user: "✓",
  removed_verification: "✗",
  suspended_user: "⛔",
  unsuspended_user: "✓",
  deleted_user: "🗑",
  created_admin: "👤",
  created_blog: "✎",
  updated_blog: "✎",
  deleted_blog: "🗑",
};

const ACTION_COLORS = {
  verified_user: "text-emerald-400",
  removed_verification: "text-yellow-400",
  suspended_user: "text-red-400",
  unsuspended_user: "text-emerald-400",
  deleted_user: "text-red-400",
  created_admin: "text-blue-400",
  created_blog: "text-purple-400",
  updated_blog: "text-blue-400",
  deleted_blog: "text-red-400",
};

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 100;

  useEffect(() => {
    setLoading(true);
    adminApi.logs({ limit: LIMIT, offset })
      .then(r => { setLogs(r.logs); setTotal(r.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [offset]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white font-display">Admin Logs</h1>
        <p className="text-gray-500 text-sm">Complete audit trail of admin actions</p>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-white">Audit Trail</span>
            <span className="ml-2 text-xs text-gray-500">{total} total actions</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-600">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-600">No admin actions recorded yet</div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {logs.map(log => (
              <div key={log.id} className="px-5 py-3 flex items-start gap-4 hover:bg-gray-800/30 transition-colors">
                <div className={`w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-sm flex-shrink-0 ${ACTION_COLORS[log.action] || "text-gray-400"}`}>
                  {ACTION_ICONS[log.action] || "·"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-white font-medium">{log.admin_name || "Admin"}</span>
                    <span className={`text-sm ${ACTION_COLORS[log.action] || "text-gray-400"}`}>
                      {log.action?.replace(/_/g, " ")}
                    </span>
                    {log.target_id && (
                      <span className="text-xs text-gray-600 font-mono truncate max-w-[120px]">
                        #{log.target_id.slice(0, 8)}
                      </span>
                    )}
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="flex gap-3 mt-0.5 flex-wrap">
                      {Object.entries(log.details).map(([k, v]) => v && (
                        <span key={k} className="text-xs text-gray-500">{k}: <span className="text-gray-400">{String(v).slice(0, 40)}</span></span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="border-t border-gray-800 px-5 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">Showing {offset + 1}–{Math.min(offset + LIMIT, total)} of {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setOffset(o => Math.max(0, o - LIMIT))} disabled={offset === 0}
              className="px-3 py-1 text-xs bg-gray-800 rounded-lg text-gray-400 hover:text-white disabled:opacity-40">
              ← Prev
            </button>
            <button onClick={() => setOffset(o => o + LIMIT)} disabled={offset + LIMIT >= total}
              className="px-3 py-1 text-xs bg-gray-800 rounded-lg text-gray-400 hover:text-white disabled:opacity-40">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
