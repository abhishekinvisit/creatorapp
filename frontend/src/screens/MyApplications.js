import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/context/AppContext";
import { applicationsApi, messagesApi } from "@/lib/api";

const TABS = ["Applied", "Shortlisted", "Accepted", "Rejected"];

const statusBadge = {
  applied:     { bg: "bg-[#F3F3F3]",        text: "text-[#0A0A0A]",   label: "Applied" },
  shortlisted: { bg: "bg-[#F59E0B]/15",     text: "text-[#B45309]",   label: "Shortlisted" },
  viewed:      { bg: "bg-[#F59E0B]/15",     text: "text-[#B45309]",   label: "Viewed" },
  accepted:    { bg: "bg-[#22C55E]/15",     text: "text-[#15803D]",   label: "Accepted" },
  rejected:    { bg: "bg-[#EF4444]/15",     text: "text-[#B91C1C]",   label: "Rejected" },
};

function formatDate(isoStr) {
  if (!isoStr) return "";
  try {
    return new Date(isoStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch (_) {
    return isoStr;
  }
}

export default function MyApplications() {
  const navigate = useNavigate();
  const { applications, setApplications } = useApp();
  const [tab, setTab] = useState("Applied");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsApi.myApplications()
      .then((data) => {
        // API is the source of truth — always replace with server data
        const mapped = data.map((a) => ({
          id: a.id,
          opportunityId: a.opportunity_id,
          brandName: a.brand_name || "Brand",
          brandId: a.brand_id,
          brandLogo: a.brand_logo || "",
          opportunityTitle: a.opportunity_title,
          appliedOn: formatDate(a.applied_at),
          status: a.status || "applied",
          note: a.note || "",
        }));
        setApplications(mapped);
      })
      .catch(() => {
        // API failed — local state already has optimistic entries; keep them
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = applications.filter((a) => {
    const s = (a.status || "applied").toLowerCase();
    if (tab === "Applied") return s === "applied";
    if (tab === "Shortlisted") return s === "shortlisted" || s === "viewed";
    return tab.toLowerCase() === s;
  });

  const handleMessage = async (a) => {
    try {
      if (a.brandId) {
        const thread = await messagesApi.openWith(a.brandId);
        navigate(`/chat/${thread.id}`);
      } else {
        navigate("/messages");
      }
    } catch (_) {
      navigate("/messages");
    }
  };

  return (
    <div data-testid="my-applications" className="min-h-full bg-[#F9F9F8] pb-6">
      <TopBar title="My Applications" showBack={false} />

      <div className="px-5">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-2">
          {TABS.map((t) => (
            <button
              key={t}
              data-testid={`apps-tab-${t.toLowerCase()}`}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                tab === t ? "bg-[#0A0A0A] text-white" : "bg-white text-[#525252] border border-[#E5E5E5]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="pt-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#E5E5E5] border-t-[#E25238] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 mt-3">
            {filtered.map((a, idx) => {
              const badge = statusBadge[a.status] || statusBadge.applied;
              const isAccepted = a.status === "accepted";
              return (
                <div
                  key={a.id}
                  data-testid={`app-row-${a.id}`}
                  className="bg-white rounded-2xl border border-[#E5E5E5] p-4 flex items-center gap-4 animate-fade-up"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <button
                    onClick={() => navigate(`/application/${a.id}`)}
                    className="flex items-center gap-4 flex-1 min-w-0 text-left"
                  >
                    <BrandLogo name={a.brandName} size={48} src={a.brandLogo || undefined} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-[#0A0A0A] truncate">{a.brandName}</h3>
                      {a.opportunityTitle && (
                        <p className="text-xs text-[#525252] font-medium truncate">{a.opportunityTitle}</p>
                      )}
                      <p className="text-xs text-[#525252] font-medium">Applied {a.appliedOn}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </button>
                  {isAccepted && (
                    <button
                      data-testid={`row-message-${a.id}`}
                      onClick={() => handleMessage(a)}
                      aria-label={`Message ${a.brandName}`}
                      className="w-10 h-10 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center hover:bg-[#E25238] transition-colors flex-shrink-0"
                    >
                      <MessageCircle size={16} />
                    </button>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="font-display font-bold text-lg text-[#0A0A0A]">No {tab.toLowerCase()} applications</p>
                <p className="text-sm text-[#525252] mt-1">
                  {tab === "Applied" ? "Start applying to opportunities." : "Check other tabs."}
                </p>
                {tab === "Applied" && (
                  <button
                    data-testid="goto-home"
                    onClick={() => navigate("/home")}
                    className="mt-5 px-6 py-3 bg-[#0A0A0A] text-white rounded-full font-bold text-sm"
                  >
                    Browse Opportunities
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
