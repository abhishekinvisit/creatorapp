import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { APPLICANTS } from "@/data/mockData";

const TABS = [
  { id: "all", label: "All" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "accepted", label: "Accepted" },
];

export default function ApplicantsList() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? APPLICANTS : APPLICANTS.filter((a) => a.status === tab);

  return (
    <div data-testid="applicants-list" className="min-h-full bg-[#0A0A0A] text-white pb-28">
      <TopBar title="Applicants" dark />

      <div className="px-5">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
          {TABS.map((t) => {
            const count = t.id === "all" ? APPLICANTS.length : APPLICANTS.filter((a) => a.status === t.id).length;
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

        <div className="space-y-3">
          {filtered.map((c, idx) => (
            <div
              key={c.id}
              data-testid={`applicant-${c.id}`}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 animate-fade-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <img src={c.avatar} alt={c.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-bold truncate">{c.name}</h4>
                <p className="text-xs text-neutral-400 font-medium">{c.followers} Followers</p>
                <p className="text-xs text-neutral-400 font-medium">{c.engagement} Engagement</p>
              </div>
              <button
                data-testid={`view-profile-${c.id}`}
                onClick={() => navigate(`/brand/creator/${c.id}`)}
                className="px-4 py-2 bg-[#E25238] rounded-full text-xs font-bold hover:bg-[#C9452D] transition-colors"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
