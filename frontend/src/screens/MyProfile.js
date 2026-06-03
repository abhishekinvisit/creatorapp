import { useNavigate } from "react-router-dom";
import { Settings, BadgeCheck, Instagram, Youtube, Globe, Pencil, Briefcase } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";
import { PORTFOLIO, BRANDS } from "@/data/mockData";
import { BrandLogo } from "@/components/BrandLogo";

export default function MyProfile() {
  const navigate = useNavigate();
  const { user, accountType } = useApp();
  const dark = accountType === "brand";

  if (accountType === "brand") {
    const b = user.brand;
    return (
      <div data-testid="my-profile-brand" className="min-h-full bg-[#0A0A0A] text-white pb-28">
        <TopBar title="Profile" dark rightSlot={
          <button data-testid="open-settings" onClick={() => navigate("/settings")} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Settings size={18} />
          </button>
        } />
        <div className="px-5 text-center">
          <div className="flex justify-center mb-4">
            <BrandLogo name={b.name} size={96} dark />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="font-display font-black text-2xl tracking-tight">{b.name}</h2>
            <BadgeCheck size={20} className="text-[#E25238]" fill="#E25238" stroke="white" />
          </div>
          <p className="text-sm text-neutral-400 font-medium">{b.handle}</p>
          <p className="text-sm font-medium mt-3 max-w-xs mx-auto">{b.bio}</p>

          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: "Active Posts", value: b.stats.activePosts },
              { label: "Applicants", value: b.stats.totalApplicants },
              { label: "Profile Views", value: b.stats.profileViews },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-3">
                <p className="font-display font-black text-2xl">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button data-testid="edit-profile-btn" onClick={() => navigate("/profile/edit")} className="flex-1 py-3 rounded-full border-2 border-white font-bold text-sm flex items-center justify-center gap-2">
              <Pencil size={14} /> Edit Profile
            </button>
            <button data-testid="post-new-btn" onClick={() => navigate("/brand/post")} className="flex-1 py-3 rounded-full bg-[#E25238] font-bold text-sm flex items-center justify-center gap-2">
              <Briefcase size={14} /> Post New
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Creator profile
  const c = user.creator;
  return (
    <div data-testid="my-profile-creator" className="min-h-full bg-[#F9F9F8] pb-28">
      <TopBar title="Profile" dark={false} rightSlot={
        <button data-testid="open-settings" onClick={() => navigate("/settings")} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
          <Settings size={18} />
        </button>
      } />

      <div className="px-5">
        <div className="flex items-start gap-4 mb-4">
          <img src={c.avatar} alt={c.name} className="w-20 h-20 rounded-3xl object-cover" />
          <div className="flex-1 pt-1">
            <h2 className="font-display font-black text-xl text-[#0A0A0A] tracking-tight">{c.name}</h2>
            <p className="text-sm text-[#525252] font-medium">{c.handle}</p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="font-bold">{c.followers} <span className="font-medium text-[#525252]">Followers</span></span>
              <span className="font-bold">{c.engagement} <span className="font-medium text-[#525252]">Eng.</span></span>
            </div>
          </div>
        </div>

        <p className="text-sm font-medium text-[#0A0A0A] mb-4 leading-relaxed">{c.bio}</p>

        <div className="flex flex-wrap gap-2 mb-5">
          {c.category.map((cat) => (
            <span key={cat} className="px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-xs font-bold uppercase tracking-wider">{cat}</span>
          ))}
        </div>

        <div className="flex gap-3 mb-7">
          <button data-testid="edit-profile-btn" onClick={() => navigate("/profile/edit")} className="flex-1 py-3 rounded-full border-2 border-[#0A0A0A] font-bold text-sm flex items-center justify-center gap-2">
            <Pencil size={14} /> Edit Profile
          </button>
          <button data-testid="share-profile-btn" className="flex-1 py-3 rounded-full bg-[#0A0A0A] text-white font-bold text-sm">Share Profile</button>
        </div>

        <div className="mb-7">
          <h3 className="font-display font-bold text-base text-[#0A0A0A] mb-3">Portfolio</h3>
          <div className="grid grid-cols-3 gap-2">
            {PORTFOLIO.map((p, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden">
                <img src={p} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-7">
          <h3 className="font-display font-bold text-base text-[#0A0A0A] mb-3">Past Collaborations</h3>
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {BRANDS.slice(0, 5).map((b) => (
              <div key={b.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                <BrandLogo name={b.name} size={48} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#525252]">{b.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-7">
          <h3 className="font-display font-bold text-base text-[#0A0A0A] mb-3">Social Links</h3>
          <div className="flex gap-3">
            {[Instagram, Youtube, Globe].map((Icon, i) => (
              <div key={i} className="w-12 h-12 rounded-2xl bg-white border border-[#E5E5E5] flex items-center justify-center">
                <Icon size={18} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
