import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import { useNavigate, useSearchParams } from "react-router-dom";

function Badge({ children, color = "gray" }) {
  const cls = {
    green:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    red:    "bg-red-500/15 text-red-400 border-red-500/30",
    blue:   "bg-blue-500/15 text-blue-400 border-blue-500/30",
    orange: "bg-[#E25238]/15 text-[#E25238] border-[#E25238]/30",
    gray:   "bg-gray-700/40 text-gray-400 border-gray-700/40",
  }[color];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>{children}</span>;
}

export default function Users({ accountType: fixedType }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState(fixedType || "");
  const [filterVerified, setFilterVerified] = useState("");
  const [filterSuspended, setFilterSuspended] = useState("");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const navigate = useNavigate();
  const LIMIT = 50;

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = { limit: LIMIT, offset };
    if (search) params.q = search;
    if (filterType) params.account_type = filterType;
    if (filterVerified !== "") params.is_verified = filterVerified === "true";
    if (filterSuspended !== "") params.is_suspended = filterSuspended === "true";
    adminApi.users(params)
      .then(r => { setUsers(r.users); setTotal(r.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, filterType, filterVerified, filterSuspended, offset]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function openUser(id) {
    try {
      const data = await adminApi.getUser(id);
      setSelected(data);
    } catch (e) { alert(e.message); }
  }

  async function handleSuspend(userId, isSuspended) {
    setActionLoading(true);
    try {
      await adminApi.suspendUser(userId, { is_suspended: !isSuspended });
      setActionMsg(!isSuspended ? "User suspended" : "User unsuspended");
      fetchUsers();
      if (selected?.user?.id === userId) {
        const updated = await adminApi.getUser(userId);
        setSelected(updated);
      }
    } catch (e) { alert(e.message); }
    finally { setActionLoading(false); setTimeout(() => setActionMsg(""), 2000); }
  }

  async function handleVerify(userId, isVerified) {
    setActionLoading(true);
    try {
      if (isVerified) await adminApi.unverifyUser(userId);
      else await adminApi.verifyUser(userId, { note: "Admin verified" });
      setActionMsg(isVerified ? "Verification removed" : "User verified");
      fetchUsers();
      if (selected?.user?.id === userId) {
        const updated = await adminApi.getUser(userId);
        setSelected(updated);
      }
    } catch (e) { alert(e.message); }
    finally { setActionLoading(false); setTimeout(() => setActionMsg(""), 2000); }
  }

  async function handleDelete(userId) {
    if (!confirm("Permanently delete this user? This cannot be undone.")) return;
    setActionLoading(true);
    try {
      await adminApi.deleteUser(userId);
      setUsers(u => u.filter(x => x.id !== userId));
      setSelected(null);
      setActionMsg("User deleted");
    } catch (e) { alert(e.message); }
    finally { setActionLoading(false); setTimeout(() => setActionMsg(""), 2000); }
  }

  const title = fixedType === "creator" ? "Creators" : fixedType === "brand" ? "Brands" : "Users";

  return (
    <div className="flex h-full">
      {/* List */}
      <div className={`flex flex-col ${selected ? "w-1/2 border-r border-gray-800" : "w-full"}`}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white font-display">{title}</h1>
              <p className="text-gray-500 text-sm">{total.toLocaleString()} total</p>
            </div>
            {actionMsg && <span className="text-emerald-400 text-sm">{actionMsg}</span>}
          </div>

          {/* Search + filters */}
          <div className="space-y-2">
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setOffset(0); }}
              placeholder="Search by name, phone, email, handle..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#E25238]"
            />
            <div className="flex gap-2 flex-wrap">
              {!fixedType && (
                <select value={filterType} onChange={e => { setFilterType(e.target.value); setOffset(0); }}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none">
                  <option value="">All Types</option>
                  <option value="creator">Creator</option>
                  <option value="brand">Brand</option>
                </select>
              )}
              <select value={filterVerified} onChange={e => { setFilterVerified(e.target.value); setOffset(0); }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none">
                <option value="">All Verification</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
              <select value={filterSuspended} onChange={e => { setFilterSuspended(e.target.value); setOffset(0); }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none">
                <option value="">All Status</option>
                <option value="false">Active</option>
                <option value="true">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-600">Loading...</div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-600">No users found</div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-900/95 border-b border-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {users.map(u => (
                  <tr key={u.id}
                    onClick={() => openUser(u.id)}
                    className={`cursor-pointer hover:bg-gray-800/40 transition-colors ${selected?.user?.id === u.id ? "bg-gray-800/60" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0">
                          {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : (u.display_name?.[0] || u.phone_number?.[0] || "?")}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-white font-medium truncate">{u.display_name || "—"}</span>
                            {u.is_verified && <span className="text-[#E25238] text-xs">✓</span>}
                          </div>
                          <span className="text-xs text-gray-500">{u.phone_number || u.email || "—"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge color={u.account_type === "creator" ? "blue" : "purple"}>
                        {u.account_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {u.is_suspended
                        ? <Badge color="red">Suspended</Badge>
                        : <Badge color="green">Active</Badge>
                      }
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-800 px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">Showing {offset + 1}–{Math.min(offset + LIMIT, total)} of {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setOffset(o => Math.max(0, o - LIMIT))} disabled={offset === 0}
              className="px-3 py-1 text-xs bg-gray-800 rounded-lg text-gray-400 hover:text-white disabled:opacity-40 transition-colors">
              ← Prev
            </button>
            <button onClick={() => setOffset(o => o + LIMIT)} disabled={offset + LIMIT >= total}
              className="px-3 py-1 text-xs bg-gray-800 rounded-lg text-gray-400 hover:text-white disabled:opacity-40 transition-colors">
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-1/2 flex flex-col overflow-y-auto">
          <div className="p-5 border-b border-gray-800 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold overflow-hidden">
                {selected.creator_profile?.avatar_url
                  ? <img src={selected.creator_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  : (selected.user?.account_type === "creator"
                    ? selected.creator_profile?.full_name?.[0]
                    : selected.brand_profile?.brand_name?.[0]) || "?"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    {selected.creator_profile?.full_name || selected.brand_profile?.brand_name || "—"}
                  </h2>
                  {(selected.creator_profile?.is_verified || selected.brand_profile?.is_verified) &&
                    <span className="text-[#E25238] text-sm">✓</span>}
                </div>
                <p className="text-gray-500 text-xs">
                  @{selected.creator_profile?.handle || selected.brand_profile?.handle || "—"} ·{" "}
                  {selected.user?.account_type}
                </p>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-lg px-2">×</button>
          </div>

          <div className="p-5 space-y-4 flex-1">
            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Phone" value={selected.user?.phone_number} />
              <InfoRow label="Email" value={selected.user?.email || selected.creator_profile?.email || selected.brand_profile?.official_email} />
              <InfoRow label="Joined" value={new Date(selected.user?.created_at).toLocaleDateString()} />
              <InfoRow label="Onboarding" value={selected.user?.onboarding_complete ? "Complete" : "Pending"} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {selected.user?.account_type === "creator" && (
                <MiniStat label="Followers" value={selected.creator_profile?.followers_count?.toLocaleString() || "0"} />
              )}
              <MiniStat label="Applications" value={selected.stats?.applications} />
              <MiniStat label="Messages" value={selected.stats?.messages} />
              {selected.user?.account_type === "brand" && (
                <MiniStat label="Opportunities" value={selected.stats?.opportunities} />
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {selected.user?.is_suspended && <Badge color="red">Suspended</Badge>}
              {(selected.creator_profile?.is_verified || selected.brand_profile?.is_verified) && <Badge color="orange">Verified</Badge>}
              {selected.user?.onboarding_complete && <Badge color="green">Onboarded</Badge>}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-800 pt-4">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Actions</h3>
              <div className="flex flex-wrap gap-2">
                <ActionBtn
                  onClick={() => handleVerify(selected.user.id, selected.creator_profile?.is_verified || selected.brand_profile?.is_verified)}
                  loading={actionLoading} color="orange">
                  {(selected.creator_profile?.is_verified || selected.brand_profile?.is_verified) ? "Remove Verification" : "Verify User"}
                </ActionBtn>
                <ActionBtn
                  onClick={() => handleSuspend(selected.user.id, selected.user.is_suspended)}
                  loading={actionLoading} color={selected.user.is_suspended ? "green" : "yellow"}>
                  {selected.user.is_suspended ? "Unsuspend" : "Suspend"}
                </ActionBtn>
                <ActionBtn onClick={() => handleDelete(selected.user.id)} loading={actionLoading} color="red">
                  Delete User
                </ActionBtn>
              </div>
            </div>

            {/* Activity log */}
            {selected.activity_logs?.length > 0 && (
              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Activity History</h3>
                <div className="space-y-2">
                  {selected.activity_logs.map(l => (
                    <div key={l.id} className="text-xs text-gray-500 flex gap-2">
                      <span className="text-gray-600">{new Date(l.timestamp).toLocaleDateString()}</span>
                      <span>{l.action?.replace(/_/g, " ")}</span>
                      <span className="text-gray-600">by {l.admin_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-600 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-gray-300 truncate mt-0.5">{value || "—"}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-gray-800/60 rounded-xl p-3 text-center">
      <p className="text-lg font-bold text-white">{value ?? 0}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function ActionBtn({ children, onClick, loading, color }) {
  const cls = {
    orange: "bg-[#E25238]/15 text-[#E25238] hover:bg-[#E25238]/25 border-[#E25238]/30",
    red:    "bg-red-500/15 text-red-400 hover:bg-red-500/25 border-red-500/30",
    green:  "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30",
    yellow: "bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 border-yellow-500/30",
  }[color];
  return (
    <button onClick={onClick} disabled={loading}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${cls}`}>
      {children}
    </button>
  );
}
