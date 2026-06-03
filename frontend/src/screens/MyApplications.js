import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/context/AppContext";

const TABS = ["Applied", "Viewed", "Accepted", "Rejected"];

const statusBadge = {
  applied: { bg: "bg-[#F3F3F3]", text: "text-[#0A0A0A]", label: "Applied" },
  viewed: { bg: "bg-[#F59E0B]/15", text: "text-[#B45309]", label: "Viewed" },
  accepted: { bg: "bg-[#22C55E]/15", text: "text-[#15803D]", label: "Accepted" },
  rejected: { bg: "bg-[#EF4444]/15", text: "text-[#B91C1C]", label: "Rejected" },
};

export default function MyApplications() {
  const navigate = useNavigate();
  const { applications } = useApp();
  const [tab, setTab] = useState("Applied");

  const filtered = applications.filter((a) =>
    tab === "Applied" ? a.status === "applied" : a.status === tab.toLowerCase()
  );

  return (
    <div data-testid="my-applications" className="min-h-full bg-[#F9F9F8] pb-24">
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

        <div className="space-y-3 mt-3">
          {filtered.map((a, idx) => {
            const badge = statusBadge[a.status];
            return (
              <button
                key={a.id}
                data-testid={`app-row-${a.id}`}
                onClick={() => navigate(`/application/${a.id}`)}
                className="w-full text-left bg-white rounded-2xl border border-[#E5E5E5] p-4 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all animate-fade-up"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <BrandLogo name={a.brandName} size={48} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-[#0A0A0A] truncate">{a.brandName}</h3>
                  <p className="text-xs text-[#525252] font-medium">Applied on {a.appliedOn}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                  {badge.label}
                </span>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="font-display font-bold text-lg text-[#0A0A0A]">No applications yet</p>
              <p className="text-sm text-[#525252] mt-1">Start applying to opportunities.</p>
              <button
                data-testid="goto-home"
                onClick={() => navigate("/home")}
                className="mt-5 px-6 py-3 bg-[#0A0A0A] text-white rounded-full font-bold text-sm"
              >
                Browse Opportunities
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
