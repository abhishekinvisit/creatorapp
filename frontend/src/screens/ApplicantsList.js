import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { useApp } from "@/context/AppContext";
import { applicationsApi, opportunitiesApi } from "@/lib/api";
import { toast } from "sonner";

const TABS = [
  { id: "all", label: "All" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "accepted", label: "Accepted" },
];

const STATUS_ACTIONS = [
  { label: "Shortlist ⭐", value: "shortlisted", cls: "bg-[#F59E0B] text-white" },
  { label: "Accept ✓", value: "accepted", cls: "bg-[#22C55E] text-white" },
  { label: "Reject ✗", value: "rejected", cls: "bg-[#EF4444] text-white" },
];

export default function ApplicantsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activePosts } = useApp();
  const [tab, setTab] = useState("all");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  // Determine which opportunity to load
  const opportunityId = location.state?.opportunityId || activePosts[0]?.id;

  useEffect(() => {
    if (!opportunityId) { setLoading(false); return; }
    // Only load if it looks like a real UUID
    if (!opportunityId.toString().includes("-")) { setLoading(false); return; }
    applicationsApi.forOpportunity(opportunityId)
      .then((data) => setApplicants(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [opportunityId]);

  const handleStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      await applicationsApi.updateStatus(appId, status);
      setApplicants((prev) =>
        prev.map((a) => a.id === appId ? { ...a, status } : a)
      );
      toast.success(`Applicant ${status}`);
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = tab === "all" ? applicants : applicants.filter((a) => a.status === tab);

  return (
    <div data-testid="applicants-list" className="min-h-full bg-[#0A0A0A] text-white pb-6">
      <TopBar title="Applicants" dark />

      <div className="px-5">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
          {TABS.map((t) => {
            const count = t.id === "all" ? applicants.length : applicants.filter((a) => a.status === t.id).length;
            return (
              <button
                key={t.id}
                data-testid={`applicants-tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                  tab === t.id ? "bg-[#E25238] text-white" : "bg-white/5 text-neutral-300 border border-white/10"
                }`}
              >
                {t.label} ({count})
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="pt-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-white/10 border-t-[#E25238] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <p className="font-bold text-white">No applicants yet</p>
            <p className="text-sm mt-1">
              {applicants.length === 0
                ? "Applicants will appear here once creators apply."
                : "No applicants in this category."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c, idx) => (
              <div
                key={c.id}
                data-testid={`applicant-${c.id}`}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-fade-up"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {(c.creator_name || "C").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold truncate">{c.creator_name || "Creator"}</h4>
                    {c.creator_handle && <p className="text-xs text-neutral-400">@{c.creator_handle}</p>}
                    <p className="text-xs text-neutral-400 font-medium">
                      {c.creator_followers ? `${c.creator_followers.toLocaleString()} followers` : ""}
                      {c.creator_location ? ` · ${c.creator_location}` : ""}
                    </p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    c.status === "accepted" ? "bg-[#22C55E]/20 text-[#22C55E]"
                    : c.status === "shortlisted" ? "bg-[#F59E0B]/20 text-[#F59E0B]"
                    : c.status === "rejected" ? "bg-[#EF4444]/20 text-[#EF4444]"
                    : "bg-white/10 text-neutral-300"
                  }`}>
                    {c.status?.charAt(0).toUpperCase() + c.status?.slice(1) || "Applied"}
                  </span>
                </div>

                {c.note && (
                  <p className="text-xs text-neutral-400 bg-white/5 rounded-xl px-4 py-3 mb-3 italic">"{c.note}"</p>
                )}

                <div className="flex gap-2">
                  <button
                    data-testid={`view-profile-${c.id}`}
                    onClick={() => navigate(`/brand/creator/${c.creator_id}`)}
                    className="flex-1 px-4 py-2 border border-white/10 rounded-full text-xs font-bold hover:border-[#E25238] hover:text-[#E25238] transition-colors"
                  >
                    View Profile
                  </button>
                  {STATUS_ACTIONS.filter((a) => a.value !== c.status).slice(0, 2).map((action) => (
                    <button
                      key={action.value}
                      onClick={() => handleStatus(c.id, action.value)}
                      disabled={updating === c.id}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-colors disabled:opacity-60 ${action.cls}`}
                    >
                      {updating === c.id ? "..." : action.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
