import { useNavigate } from "react-router-dom";
import { Settings, BadgeCheck, Pencil, Briefcase, Share2, Instagram, MapPin } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useApp } from "@/context/AppContext";
import { REELS, BRANDS } from "@/data/mockData";
import { BrandLogo } from "@/components/BrandLogo";
import { WorkedWithItem } from "@/components/WorkedWithItem";
import { ReelCard } from "@/components/ReelCard";

export default function MyProfile() {
  const navigate = useNavigate();
  const { user, accountType, workedWith } = useApp();

  if (accountType === "brand") {
    const b = user.brand;
    return (
      <div data-testid="my-profile-brand" className="min-h-full bg-[#0A0A0A] text-white pb-6">
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
      </div>
    );
  }

  // ----- Creator profile (own view) -----
  const c = user.creator;
  const openInstagram = () => window.open(c.instagramUrl, "_blank", "noopener,noreferrer");

  return (
    <div data-testid="my-profile-creator" className="min-h-full bg-[#F9F9F8] pb-6">
      <TopBar
        title="Profile"
        dark={false}
        rightSlot={
          <button data-testid="open-settings" onClick={() => navigate("/settings")} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
            <Settings size={18} />
          </button>
        }
      />

      {/* HEADER */}
      <div className="px-5">
        <div className="flex items-start gap-4">
          <img
            src={c.avatar}
            alt={c.name}
            className="w-[88px] h-[88px] rounded-[28px] object-cover ring-4 ring-white shadow-md flex-shrink-0"
          />
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="font-display font-black text-2xl text-[#0A0A0A] tracking-tight leading-tight">
              {c.name}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm text-[#525252] font-medium truncate">{c.handle}</p>
              <button
                data-testid="ig-link"
                onClick={openInstagram}
                aria-label="Open Instagram"
                className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#E25238] via-[#F59E0B] to-[#E25238] flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform"
              >
                <Instagram size={12} className="text-white" strokeWidth={2.6} />
              </button>
            </div>
            {c.location && (
              <div data-testid="profile-location" className="flex items-center gap-1 mt-1.5 text-xs text-[#525252] font-medium">
                <MapPin size={12} className="text-[#E25238]" />
                <span>{c.location}</span>
              </div>
            )}

            {/* Stats row: Followers + Brand Collaborations */}
            <div className="flex items-center gap-5 mt-3">
              <div data-testid="stat-followers">
                <p className="font-display font-black text-base text-[#0A0A0A] leading-none">{c.followers}</p>
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#525252] mt-1">Followers</p>
              </div>
              <div className="w-px h-7 bg-[#E5E5E5]" />
              <div data-testid="stat-collaborations">
                <p className="font-display font-black text-base text-[#0A0A0A] leading-none">{c.collaborations}</p>
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#525252] mt-1">Collaborations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm font-medium text-[#0A0A0A] mt-5 leading-relaxed">{c.bio}</p>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mt-4">
          {c.category.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-bold uppercase tracking-[0.15em]"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Worked With – small horizontal logo row with names */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#525252]">Worked With</p>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#525252]">
              {workedWith.length} brands
            </span>
          </div>
          <div data-testid="worked-with" className="flex items-start gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
            {workedWith.map((b) => (
              <WorkedWithItem key={b.id} brand={b} />
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            data-testid="edit-profile-btn"
            onClick={() => navigate("/profile/edit")}
            className="flex-1 py-3 rounded-full border-2 border-[#0A0A0A] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0A0A0A] hover:text-white transition-colors"
          >
            <Pencil size={14} /> Edit Profile
          </button>
          <button
            data-testid="share-profile-btn"
            className="px-5 py-3 rounded-full bg-[#0A0A0A] text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      {/* PORTFOLIO – main focus */}
      <div className="mt-9">
        <div className="px-5 flex items-end justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#E25238]">Portfolio</p>
            <h3 className="font-display font-black text-2xl text-[#0A0A0A] tracking-tight leading-tight mt-1">
              Featured Reels
            </h3>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#525252]">
            {REELS.length} reels
          </span>
        </div>

        <div data-testid="reels-grid" className="px-5 grid grid-cols-2 gap-3">
          {REELS.map((r, i) => (
            <ReelCard key={r.id} reel={r} testId={`reel-${r.id}`} delay={i * 70} />
          ))}
        </div>
      </div>
    </div>
  );
}
