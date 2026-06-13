import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";

export default function Verification() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.verifications()
      .then(r => setVerifications(r.verifications))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white font-display">Verification</h1>
        <p className="text-gray-500 text-sm">Badge verification history and management</p>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <span className="text-sm font-medium text-white">Verification Records</span>
          <span className="ml-2 text-xs text-gray-500">({verifications.length})</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-600">Loading...</div>
        ) : verifications.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-600">No verification records</div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Verified By</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {verifications.map(v => (
                <tr key={v.id} className="hover:bg-gray-800/30">
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-sm text-white font-medium">{v.display_name || v.phone_number || "—"}</p>
                      <p className="text-xs text-gray-500">@{v.handle || "—"}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                      v.account_type === "creator"
                        ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                        : "bg-purple-500/15 text-purple-400 border-purple-500/30"
                    }`}>{v.account_type}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-xs">
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400">{v.verified_by_name || "—"}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {new Date(v.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    {v.is_verified
                      ? <span className="text-[#E25238] font-bold">✓ Active</span>
                      : <span className="text-gray-600">Removed</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* How to verify */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-white mb-3">How to Verify Users</h2>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
          <li>Go to <strong className="text-white">Users</strong>, <strong className="text-white">Creators</strong>, or <strong className="text-white">Brands</strong></li>
          <li>Click on a user to open their detail panel</li>
          <li>Click <strong className="text-white">Verify User</strong> to grant the verification badge</li>
          <li>Click <strong className="text-white">Remove Verification</strong> to revoke it</li>
        </ol>
      </div>
    </div>
  );
}
