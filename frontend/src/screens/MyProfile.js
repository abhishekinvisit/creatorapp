import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Settings, BadgeCheck, Pencil, Briefcase, Share2, MapPin, Globe, ChevronRight, Plus, Tag, ExternalLink, Users, Bookmark, BarChart2, IndianRupee } from "lucide-react";
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
import { AudienceInsightsModal } from "@/components/AudienceInsightsModal";
import { ServicePricingModal } from "@/components/ServicePricingModal";

async function shareProfile(url, name) {
  if (navigator.share) {
    try { await navigator.share({ title: `${name} on Rytspot`, url }); return; } catch (_) {}
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
  const [showInsights, setShowInsights] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    if (accountType !== "creator") return;
    reelsApi.list().then(setReels).catch(() => setReels([]));
  }, [accountType]);

  // ─── Brand Profile ────────────────────────────────────────────────────────
  if (accountType === "brand") {
    const b = user.brand;
    const activePostCount = activePosts.filter((p) => p.status === "active").length;
    const totalApplicants = activePosts.reduce((sum, p) => sum + (p.applicants || 0), 0);
    const previewPosts = activePosts.filter((p) => p.status === "active").slice(0, 2);

    return (
      <div data-testid="my-profile-brand" className="min-h-full bg-[#0A0A0A] text-white pb-8">
        <div className="sticky top-0 z-30 bg-[#0A0A0A] px-5 py-4 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg tracking-tight">Profile</h2>
          <button
            data-testid="open-settings"
            onClick={() => navigate("/settings")}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="px-5 pt-2 pb-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="ring-2 ring-white/10 rounded-[24px] shadow-xl flex-shrink-0">
              {b.logo && (b.logo.startsWith("data:") || b.logo.startsWith("http")) ? (
                <img src={b.logo} alt={b.name} className="w-20 h-20 rounded-[24px] object-cover" />
              ) : (
                <BrandLogo name={b.name} size={80} dark />
              )}
            </div>
            <div className="flex-1 flex justify-end gap-2">
              <button
                data-testid="edit-profile-btn"
                onClick={() => navigate("/profile/edit")}
                className="h-9 px-4 rounded-full border border-white/20 font-bold text-xs text-white hover:border-white/40 transition-colors flex items-center gap-1.5"
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                data-testid="post-new-btn"
                onClick={() => navigate("/brand/post")}
                className="h-9 px-4 rounded-full bg-[#E25238] font-bold text-xs text-white hover:bg-[#C9452D] transition-colors flex items-center gap-1.5 shadow-lg shadow-[#E25238]/20"
              >
                <Plus size={12} /> Post New
              </button>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-display font-black text-2xl tracking-tight">{b.name}</h2>
              <BadgeCheck size={20} className="text-[#E25238] flex-shrink-0" fill="#E25238" stroke="white" />
            </div>
            {b.handle && (
              <p className="text-sm text-neutral-500 font-medium">@{b.handle.replace(/^@/, "")}</p>
            )}
            {b.location && (
              <div className="flex items-center gap-1 mt-1.5">
                <MapPin size={11} className="text-neutral-500" />
                <span className="text-xs text-neutral-500 font-medium">{b.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 mb-6">
          <div className="grid grid-cols-3 divide-x divide-white/10 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-3 py-4 text-center">
              <p className="font-display font-black text-xl">{activePostCount}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-500 mt-0.5">Posts</p>
            </div>
            <div className="px-3 py-4 text-center">
              <p className="font-display font-black text-xl">{totalApplicants}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-500 mt-0.5">Applicants</p>
            </div>
            <button onClick={() => navigate("/brand/saved-creators")} className="px-3 py-4 text-center hover:bg-white/5 transition-colors">
              <p className="font-display font-black text-xl text-[#E25238]">{savedCreatorsCount}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-500 mt-0.5">Saved</p>
            </button>
          </div>
        </div>

        {(b.bio || b.categories?.length > 0) && (
          <div className="px-5 mb-6">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-3">About</p>
            {b.bio && (
              <p className="text-sm font-medium text-neutral-300 leading-relaxed mb-3">{b.bio}</p>
            )}
            {b.categories?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {b.categories.map((cat) => (
                  <span key={cat} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    <Tag size={9} className="text-[#E25238]" /> {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {(b.instagramUrl || b.websiteUrl) && (
          <div className="px-5 mb-6">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-3">Links</p>
            <div className="space-y-2">
              {b.instagramUrl && (
                <button
                  onClick={() => window.open(b.instagramUrl, "_blank", "noopener,noreferrer")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#E25238]/40 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#E25238]/15 flex items-center justify-center flex-shrink-0">
                    <InstagramIcon size={14} className="text-[#E25238]" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-neutral-300 text-left truncate">
                    {b.instagramUrl.replace(/https?:\/\/(www\.)?instagram\.com\/?/, "@").replace(/\/$/, "") || "Instagram"}
                  </span>
                  <ExternalLink size={12} className="text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                </button>
              )}
              {b.websiteUrl && (
                <button
                  onClick={() => window.open(b.websiteUrl, "_blank", "noopener,noreferrer")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Globe size={14} className="text-neutral-300" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-neutral-300 text-left truncate">
                    {b.websiteUrl.replace(/^https?:\/\//, "") || "Website"}
                  </span>
                  <ExternalLink size={12} className="text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500">Active Opportunities</p>
            <button
              onClick={() => navigate("/brand/posts")}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#E25238]"
            >
              See all <ChevronRight size={11} />
            </button>
          </div>
          {previewPosts.length === 0 ? (
            <button
              onClick={() => navigate("/brand/post")}
              className="w-full py-6 rounded-2xl border border-dashed border-white/20 flex flex-col items-center gap-2 hover:border-[#E25238]/40 transition-colors"
            >
              <Plus size={20} className="text-neutral-600" />
              <span className="text-xs font-bold text-neutral-600">Post your first opportunity</span>
            </button>
          ) : (
            <div className="space-y-2">
              {previewPosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => navigate(`/brand/post/${post.id}`)}
                  className="w-full text-left px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white truncate">{post.title || "Untitled"}</p>
                    <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                      {post.applicants || 0} applicants · ₹{post.payout || 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[9px] font-bold uppercase tracking-wider text-[#22C55E]">
                      Live
                    </span>
                    <ChevronRight size={14} className="text-neutral-600" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-5">
          <button
            onClick={() => navigate("/brand/saved-creators")}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#E25238]/30 transition-colors group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#E25238]/15 flex items-center justify-center flex-shrink-0">
              <Bookmark size={18} className="text-[#E25238]" fill="#E25238" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-sm text-white">Saved Creators</p>
              <p className="text-xs text-neutral-500 font-medium">
                {savedCreatorsCount > 0 ? `${savedCreatorsCount} creators saved` : "Your shortlist is empty"}
              </p>
            </div>
            <ChevronRight size={18} className="text-neutral-600 group-hover:text-neutral-400 transition-colors" />
          </button>
        </div>
      </div>
    );
  }

  // ─── Creator Profile ──────────────────────────────────────────────────────
  const c = user.creator;

  return (
    <div data-testid="my-profile-creator" className="min-h-full bg-[#F9F9F8] pb-8">
      <TopBar
        title="Profile"
        dark={false}
        rightSlot={
          <button data-testid="open-settings" onClick={() => navigate("/settings")} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
            <Settings size={18} />
          </button>
        }
      />

      {/* ── Hero: avatar + name + actions ── */}
      <div className="px-5 pt-2 pb-5">
        <div className="flex items-center gap-4">
          <img
            src={c.avatar}
            alt={c.name}
            className="w-[72px] h-[72px] rounded-[22px] object-cover ring-2 ring-white shadow-md flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-black text-xl text-[#0A0A0A] tracking-tight leading-tight truncate">
              {c.name}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm text-[#525252] font-medium truncate">{c.handle}</p>
              <button
                data-testid="ig-link"
                onClick={() => window.open(c.instagramUrl, "_blank", "noopener,noreferrer")}
                aria-label="Open Instagram"
                className="w-5 h-5 rounded-[6px] bg-gradient-to-tr from-[#833ab4] via-[#e1306c] to-[#f77737] flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform"
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

        {/* Stats strip */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#EBEBEB]">
          <div data-testid="stat-followers">
            <p className="font-display font-black text-lg text-[#0A0A0A] leading-none">{c.followers}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-3 h-3 rounded-[3px] bg-gradient-to-tr from-[#833ab4] via-[#e1306c] to-[#f77737] flex items-center justify-center">
                <InstagramIcon size={7} className="text-white" strokeWidth={2.8} />
              </div>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#525252]">Followers</p>
            </div>
          </div>
          <div className="w-px h-7 bg-[#E5E5E5]" />
          <div data-testid="stat-collaborations">
            <p className="font-display font-black text-lg text-[#0A0A0A] leading-none">{c.collaborations}</p>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#525252] mt-1">Collabs</p>
          </div>
        </div>

        {/* Bio */}
        {c.bio && (
          <p className="text-sm font-medium text-[#525252] mt-4 leading-relaxed">{c.bio}</p>
        )}

        {/* Categories */}
        {c.category?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {c.category.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-bold uppercase tracking-[0.15em] text-[#0A0A0A]"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Languages */}
        {c.language?.length > 0 && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Globe size={12} className="text-[#525252] flex-shrink-0" />
            {c.language.map((lang) => (
              <span
                key={lang}
                className="px-2.5 py-1 rounded-full bg-[#F3F3F3] border border-[#E5E5E5] text-[10px] font-bold uppercase tracking-[0.12em] text-[#525252]"
              >
                {lang}
              </span>
            ))}
          </div>
        )}

        {/* Action row */}
        <div className="flex gap-2 mt-5">
          <button
            data-testid="edit-profile-btn"
            onClick={() => navigate("/profile/edit")}
            className="flex-1 py-2.5 rounded-full border-2 border-[#0A0A0A] font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-[#0A0A0A] hover:text-white transition-colors"
          >
            <Pencil size={13} /> Edit Profile
          </button>
          <button
            data-testid="share-profile-btn"
            onClick={() => {
              const handle = (c.handle || "").replace(/^@/, "");
              const profileId = handle || currentUserId;
              if (!profileId) return;
              shareProfile(`${window.location.origin}/creator/${profileId}`, c.name);
            }}
            className="px-5 py-2.5 rounded-full bg-[#0A0A0A] text-white font-bold text-sm flex items-center justify-center gap-1.5"
          >
            <Share2 size={13} /> Share
          </button>
        </div>

        {/* Tools row */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            data-testid="audience-insights-btn"
            onClick={() => setShowInsights(true)}
            className="flex items-center gap-2.5 px-3.5 py-3 bg-white border border-[#E5E5E5] rounded-2xl hover:border-[#E25238]/40 hover:bg-[#E25238]/5 transition-colors"
          >
            <div className="w-7 h-7 rounded-xl bg-[#E25238] flex items-center justify-center flex-shrink-0">
              <BarChart2 size={14} className="text-white" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-[#0A0A0A] leading-tight">Audience</p>
              <p className="text-[10px] text-[#525252] font-medium leading-tight">Insights</p>
            </div>
          </button>
          <button
            data-testid="service-pricing-btn"
            onClick={() => setShowPricing(true)}
            className="flex items-center gap-2.5 px-3.5 py-3 bg-white border border-[#E5E5E5] rounded-2xl hover:border-[#E25238]/40 hover:bg-[#E25238]/5 transition-colors"
          >
            <div className="w-7 h-7 rounded-xl bg-[#E25238] flex items-center justify-center flex-shrink-0">
              <IndianRupee size={14} className="text-white" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-[#0A0A0A] leading-tight">My Rates</p>
              <p className="text-[10px] text-[#525252] font-medium leading-tight">Service Pricing</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Worked With ── */}
      {workedWith.length > 0 && (
        <div className="px-5 mb-6">
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
      )}

      {/* ── Social links ── */}
      {(c.youtubeUrl || c.tiktokUrl || c.linkedinUrl || c.websiteUrl) && (
        <div className="px-5 mb-6">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#525252] mb-2">Links</p>
          <div className="flex items-center gap-2 flex-wrap">
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
        </div>
      )}

      {/* ── Featured Reels ── */}
      <div>
        <div className="px-5 flex items-end justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#E25238]">Portfolio</p>
            <h3 className="font-display font-black text-2xl text-[#0A0A0A] tracking-tight leading-tight mt-0.5">
              Featured Reels
            </h3>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#525252]">
            {reels.length} reels
          </span>
        </div>

        <div data-testid="reels-grid" className="px-5 grid grid-cols-2 gap-3">
          {reels.length === 0 ? (
            <div className="col-span-2 py-10 text-center">
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

      {/* ── Modals ── */}
      {showInsights && (
        <AudienceInsightsModal
          open={showInsights}
          onClose={() => setShowInsights(false)}
          isOwner={true}
        />
      )}
      {showPricing && (
        <ServicePricingModal
          open={showPricing}
          onClose={() => setShowPricing(false)}
          isOwner={true}
        />
      )}
    </div>
  );
}
