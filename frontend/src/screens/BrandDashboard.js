import { useNavigate } from "react-router-dom";
import { Plus, ChevronRight, Bell, Menu } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function BrandDashboard() {
  const navigate = useNavigate();
  const { user, activePosts } = useApp();
  const stats = user.brand.stats;

  return (
    <div data-testid="brand-dashboard" className="min-h-full bg-[#0A0A0A] text-white pb-6">
      <div className="sticky top-0 z-30 bg-[#0A0A0A] px-5 py-4 flex items-center justify-between">
        <button data-testid="brand-menu" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <Menu size={20} />
        </button>
        <h2 className="font-display font-bold text-lg">Dashboard</h2>
        <button data-testid="brand-bell" onClick={() => navigate("/notifications")} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <Bell size={18} />
        </button>
      </div>

      <div className="px-5">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#E25238] mb-2">Welcome back</p>
        <h1 className="font-display font-black text-3xl tracking-tight leading-tight mb-6">
          {user.brand.name}
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { label: "Active Posts", value: stats.activePosts },
            { label: "Total Applicants", value: stats.totalApplicants },
            { label: "Profile Views", value: stats.profileViews },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="font-display font-black text-3xl">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Active posts */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-lg">Your Active Posts</h3>
          <button data-testid="see-all-posts" className="text-xs font-bold text-[#E25238] uppercase tracking-wider">See All</button>
        </div>
        <div className="space-y-3 mb-6">
          {activePosts.map((p, idx) => (
            <button
              key={p.id}
              data-testid={`post-${p.id}`}
              onClick={() => navigate(`/brand/post/${p.id}`)}
              className="w-full text-left bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/10 transition-all animate-fade-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-bold truncate">{p.title}</h4>
                <p className="text-xs text-neutral-400 font-medium mt-0.5">{p.needed} Creators Needed</p>
              </div>
              <div className="text-right">
                <p className="font-display font-black text-xl text-[#E25238]">{p.applicants}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Applicants</p>
              </div>
              <ChevronRight size={18} className="text-neutral-500" />
            </button>
          ))}
        </div>

        <button
          data-testid="new-post-btn"
          onClick={() => navigate("/brand/post")}
          className="w-full bg-[#E25238] text-white rounded-full py-4 font-bold flex items-center justify-center gap-2 hover:bg-[#C9452D] transition-colors"
        >
          <Plus size={20} strokeWidth={2.6} />
          Post New Opportunity
        </button>
      </div>

    </div>
  );
}
