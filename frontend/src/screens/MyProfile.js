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

const YoutubeIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);
const LinkedInIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
  </svg>
);
const TikTokIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.16 8.16 0 0 0 4.76 1.51V6.8a4.85 4.85 0 0 1-1-.11z"/>
  </svg>
);

export default function MyProfile() {
  const navigate = useNavigate();
  const { user, accountType, workedWith, currentUserId, activePosts, savedCreatorsCount } = useApp();
  const [reels, setReels] = useState([]);

  useEffect(() => {
    if (accountType !== "creator") return;
    reelsApi.list().then(setReels).catch(() => setReels([]));
  }, [accountType]);

  if (accountType === "brand") {
    const b = user.brand;
    const activePostCount = activePosts.filter((p) => p.status === "active").length;
    const totalApplicants = activePosts.reduce((sum, p) => sum + (p.applicants || 0), 0);
    return (
      <div data-testid="my-profile-brand" className="min-h-full bg-[#0A0A0A] text-white pb-6">
        <TopBar title="Profile" dark rightSlot={
          <button data-testid="open-settings" onClick={() => navigate("/settings")} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Settings size={18} />
          </button>
        } />
        <div className="px-5 text-center">
          <div className="flex justify-center mb-4">
            {b.logo ? (
              <img src={b.logo} alt={b.name} className="w-24 h-24 rounded-[28px] object-cover ring-4 ring-white/10 shadow-lg" />
            ) : (
              <BrandLogo name={b.name} size={96} dark />
            )}
          </div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="font-display font-black text-2xl tracking-tight">{b.name}</h2>
            <BadgeCheck size={20} className="text-[#E25238]" fill="#E25238" stroke="white" />
          </div>
          {b.handle && <p className="text-sm text-neutral-400 font-medium">{b.handle}</p>}
          {b.bio && <p className="text-sm font-medium mt-3 max-w-xs mx-auto">{b.bio}</p>}

          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <p className="font-display font-black text-2xl">{activePostCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">Active Posts</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <p className="font-display font-black text-2xl">{totalApplicants}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">Applicants</p>
            </div>
            <button
              onClick={() => navigate("/brand/saved-creators")}
              className="bg-white/5 border border-white/10 rounded-2xl p-3 text-left hover:bg-white/10 transition-colors"
            >
              <p className="font-display font-black text-2xl text-[#E25238]">{savedCreatorsCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">Saved</p>
            </button>
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

        {/* Social links row */}
        {(c.youtubeUrl || c.tiktokUrl || c.linkedinUrl || c.websiteUrl) && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {c.youtubeUrl && (
              <button
                onClick={() => window.open(c.youtubeUrl, "_blank", "noopener,noreferrer")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-bold uppercase tracking-[0.1em] text-[#525252] hover:border-[#E25238] hover:text-[#E25238] transition-colors"
              >
                <YoutubeIcon size={11} /> YouTube
              </button>
            )}
            {c.tiktokUrl && (
              <button
                onClick={() => window.open(c.tiktokUrl, "_blank", "noopener,noreferrer")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-bold uppercase tracking-[0.1em] text-[#525252] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors"
              >
                <TikTokIcon size={11} /> TikTok
              </button>
            )}
            {c.linkedinUrl && (
              <button
                onClick={() => window.open(c.linkedinUrl, "_blank", "noopener,noreferrer")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-bold uppercase tracking-[0.1em] text-[#525252] hover:border-[#0A7DBF] hover:text-[#0A7DBF] transition-colors"
              >
                <LinkedInIcon size={11} /> LinkedIn
              </button>
            )}
            {c.websiteUrl && (
              <button
                onClick={() => window.open(c.websiteUrl, "_blank", "noopener,noreferrer")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-bold uppercase tracking-[0.1em] text-[#525252] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors"
              >
                <Globe size={11} /> Website
              </button>
            )}
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
