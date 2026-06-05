import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Settings, BadgeCheck, Pencil, Briefcase, Share2, MapPin, Globe } from "lucide-react";
import { toast } from "sonner";

const InstagramIcon = ({ size = 16, className = "", strokeWidth = 2, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
import { TopBar } from "@/components/TopBar";
import { useApp } from "@/context/AppContext";
import { BrandLogo } from "@/components/BrandLogo";
import { WorkedWithItem } from "@/components/WorkedWithItem";
import { ReelCard } from "@/components/ReelCard";
import { reelsApi } from "@/lib/api";

async function shareProfile(url, name) {
  if (navigator.share) {
    try { await navigator.share({ title: `${name} on OllCollab`, url }); return; } catch (_) {}
  }
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Profile link copied!");
  } catch (_) {
    toast.error("Could not copy link");
  }
}

export default function MyProfile() {
  const navigate = useNavigate();
  const { user, accountType, workedWith, currentUserId } = useApp();
  const [reels, setReels] = useState([]);

  useEffect(() => {
    if (accountType !== "creator") return;
    reelsApi.list().then(setReels).catch(() => setReels([]));
  }, [accountType]);

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
        {/* Avatar + identity */}
        <div className="flex items-center gap-4">
          <img
            src={c.avatar}
            alt={c.name}
            className="w-[72px] h-[72px] rounded-[22px] object-cover ring-4 ring-white shadow-md flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-black text-xl text-[#0A0A0A] tracking-tight leading-tight">
              {c.name}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm text-[#525252] font-medium truncate">{c.handle}</p>
              <button
                data-testid="ig-link"
                onClick={openInstagram}
                aria-label="Open Instagram"
                className="w-5 h-5 rounded-[6px] bg-gradient-to-tr from-[#E25238] via-[#F59E0B] to-[#E25238] flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform"
              >
                <InstagramIcon size={10} className="text-white" strokeWidth={2.6} />
              </button>
            </div>
            {c.location && (
              <div data-testid="profile-location" className="flex items-center gap-1 mt-1 text-xs text-[#525252] font-medium">
                <MapPin size={11} className="text-[#E25238]" />
                <span>{c.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats row — full width, outside the avatar flex */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#EBEBEB]">
          <div data-testid="stat-followers">
            <p className="font-display font-black text-base text-[#0A0A0A] leading-none">{c.followers}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-3 h-3 rounded-[3px] bg-gradient-to-tr from-[#E25238] via-[#F59E0B] to-[#E25238] flex items-center justify-center">
                <InstagramIcon size={7} className="text-white" strokeWidth={2.8} />
              </div>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#525252]">Followers</p>
            </div>
          </div>
          <div className="w-px h-7 bg-[#E5E5E5]" />
          <div data-testid="stat-collaborations">
            <p className="font-display font-black text-base text-[#0A0A0A] leading-none">{c.collaborations}</p>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#525252] mt-1">Collaborations</p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm font-medium text-[#0A0A0A] mt-4 leading-relaxed">{c.bio}</p>

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

        {/* Languages */}
        {c.language && c.language.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Globe size={12} className="text-[#525252] flex-shrink-0" />
            {c.language.map((lang) => (
              <span
                key={lang}
                className="px-3 py-1 rounded-full bg-[#F9F9F8] border border-[#E5E5E5] text-[10px] font-bold uppercase tracking-[0.12em] text-[#525252]"
              >
                {lang}
              </span>
            ))}
          </div>
        )}

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
            onClick={() => shareProfile(`${window.location.origin}/brand/creator/${currentUserId}`, c.name)}
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
            {reels.length} reels
          </span>
        </div>

        <div data-testid="reels-grid" className="px-5 grid grid-cols-2 gap-3">
          {reels.length === 0 ? (
            <div className="col-span-2 py-8 text-center">
              <p className="text-sm font-medium text-[#525252]">No reels yet.</p>
              <p className="text-xs text-[#525252] mt-1">Add featured reels from Edit Profile.</p>
            </div>
          ) : (
            reels.map((r, i) => (
              <ReelCard
                key={r.id}
                reel={{ ...r, instagramUrl: r.instagram_url || r.instagramUrl }}
                testId={`reel-${r.id}`}
                delay={i * 70}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
