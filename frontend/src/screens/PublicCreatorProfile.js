import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Globe, ExternalLink, BarChart2, IndianRupee } from "lucide-react";
import { creatorsApi } from "@/lib/api";
import { AudienceInsightsModal } from "@/components/AudienceInsightsModal";
import { ServicePricingModal } from "@/components/ServicePricingModal";

const InstagramIcon = ({ size = 16, className = "", strokeWidth = 2, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
const YoutubeIcon = ({ size = 16, className = "" }) => (
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatFollowers(n) {
  if (!n) return "0";
  const num = Number(n);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

function isValidImg(src) {
  return src && (src.startsWith("data:") || src.startsWith("http"));
}

export default function PublicCreatorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const pricing = profile?.pricing;
  const hasPricing = pricing && (
    pricing.ig_reel || pricing.ig_post || pricing.ig_story || pricing.reel_story_package || pricing.ugc_video || pricing.event_appearance || (pricing.custom_services?.length > 0)
  );

  useEffect(() => {
    const fetchProfile = UUID_RE.test(id)
      ? creatorsApi.get(id)
      : creatorsApi.getByHandle(id);

    fetchProfile
      .then((data) => setProfile(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-full bg-[#F9F9F8] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E5E5E5] border-t-[#E25238] rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-full bg-[#F9F9F8] flex flex-col items-center justify-center px-6 text-center">
        <p className="font-display font-bold text-xl text-[#0A0A0A] mb-2">Creator not found</p>
        <p className="text-sm text-[#525252] font-medium mb-6">This profile may have been removed or the link is incorrect.</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-[#0A0A0A] text-white rounded-full text-sm font-bold"
        >
          Go to Rytspot
        </button>
      </div>
    );
  }

  const workedWith = (() => {
    if (Array.isArray(profile.worked_with)) return profile.worked_with;
    if (typeof profile.worked_with === "string") {
      try { return JSON.parse(profile.worked_with); } catch (_) { return []; }
    }
    return [];
  })();

  const categories = profile.categories || [];
  const languages = profile.languages || [];
  const reels = profile.reels || [];
  const hasAvatar = isValidImg(profile.avatar_url);
  const ai = profile.audience_insights;
  const hasInsights = ai && (
    (ai.gender_male > 0) || (ai.gender_female > 0) ||
    (ai.age_18_24 > 0) || (ai.age_25_34 > 0) ||
    (ai.top_cities?.length > 0) || (ai.top_states?.length > 0)
  );

  const socialLinks = [
    profile.instagram_url && { label: "Instagram", url: profile.instagram_url, icon: <InstagramIcon size={14} /> },
    profile.youtube_url && { label: "YouTube", url: profile.youtube_url, icon: <YoutubeIcon size={14} /> },
    profile.website_url && { label: "Website", url: profile.website_url, icon: <ExternalLink size={14} /> },
  ].filter(Boolean);

  return (
    <div className="min-h-full bg-[#F9F9F8] pb-10">
      {/* Top bar */}
      <div className="sticky top-0 z-30 px-5 py-4 flex items-center justify-between bg-[#F9F9F8] border-b border-[#E5E5E5]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-[#0A0A0A]" />
        </button>
        <p className="text-xs font-bold text-[#525252] uppercase tracking-widest">Creator Profile</p>
        <div className="w-10" />
      </div>

      <div className="px-5 pt-2 pb-5">
        {/* Avatar + identity */}
        <div className="flex items-center gap-4">
          {hasAvatar ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="w-[72px] h-[72px] rounded-[22px] object-cover ring-2 ring-white shadow-md flex-shrink-0" />
          ) : (
            <div className="w-[72px] h-[72px] rounded-[22px] bg-gradient-to-br from-[#E25238] to-[#F59E0B] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-2xl">{(profile.full_name || "C")[0]}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-black text-xl text-[#0A0A0A] tracking-tight leading-tight">
              {profile.full_name || "Creator"}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm text-[#525252] font-medium truncate">{profile.handle || ""}</p>
              {profile.instagram_url && (
                <button
                  onClick={() => window.open(profile.instagram_url, "_blank", "noopener,noreferrer")}
                  aria-label="Open Instagram"
                  className="w-5 h-5 rounded-[6px] bg-gradient-to-tr from-[#E25238] via-[#F59E0B] to-[#E25238] flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform"
                >
                  <InstagramIcon size={10} className="text-white" strokeWidth={2.6} />
                </button>
              )}
            </div>
            {profile.location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-[#525252] font-medium">
                <MapPin size={11} className="text-[#E25238]" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#EBEBEB]">
          <div>
            <p className="font-display font-black text-lg text-[#0A0A0A] leading-none">{formatFollowers(profile.followers_count)}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-3 h-3 rounded-[3px] bg-gradient-to-tr from-[#E25238] via-[#F59E0B] to-[#E25238] flex items-center justify-center">
                <InstagramIcon size={7} className="text-white" strokeWidth={2.8} />
              </div>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#525252]">Followers</p>
            </div>
          </div>
          <div className="w-px h-7 bg-[#E5E5E5]" />
          <div>
            <p className="font-display font-black text-lg text-[#0A0A0A] leading-none">{profile.collaborations_count || 0}</p>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#525252] mt-1">Collabs</p>
          </div>
          {categories.length > 0 && (
            <>
              <div className="w-px h-7 bg-[#E5E5E5]" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#525252] mb-1">Niche</p>
                <p className="text-xs font-bold text-[#0A0A0A] truncate">{categories[0]}</p>
              </div>
            </>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm font-medium text-[#525252] mt-4 leading-relaxed">{profile.bio}</p>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((cat) => (
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
        {languages.length > 0 && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Globe size={12} className="text-[#525252] flex-shrink-0" />
            {languages.map((lang) => (
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
            onClick={() => navigate("/")}
            className="flex-1 py-2.5 rounded-full border-2 border-[#0A0A0A] font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-[#0A0A0A] hover:text-white transition-colors"
          >
            Join Rytspot
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-2.5 rounded-full bg-[#0A0A0A] text-white font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-[#E25238] transition-colors"
          >
            Message
          </button>
        </div>

        {/* Tools row */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {hasInsights && (
            <button
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
          )}
          {hasPricing && (
            <button
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
          )}
        </div>

        {/* Social links */}
        {(profile.youtube_url || profile.tiktok_url || profile.linkedin_url || profile.website_url) && (
          <div className="mt-4">
            <div className="flex items-center gap-2 flex-wrap">
              {profile.youtube_url && (
                <a
                  href={profile.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-bold uppercase tracking-[0.1em] text-[#525252] hover:border-[#E25238] hover:text-[#E25238] transition-colors"
                >
                  <YoutubeIcon size={11} /> YouTube
                </a>
              )}
              {profile.tiktok_url && (
                <a
                  href={profile.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-bold uppercase tracking-[0.1em] text-[#525252] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors"
                >
                  <TikTokIcon size={11} /> TikTok
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-bold uppercase tracking-[0.1em] text-[#525252] hover:border-[#0A66C2] hover:text-[#0A66C2] transition-colors"
                >
                  <LinkedInIcon size={11} /> LinkedIn
                </a>
              )}
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-bold uppercase tracking-[0.1em] text-[#525252] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors"
                >
                  <Globe size={11} /> Website
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* WORKED WITH */}
      {workedWith.length > 0 && (
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#525252]">Worked With</p>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#525252]">
              {workedWith.length} brand{workedWith.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-start gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
            {workedWith.map((b, i) => (
              <div key={b.id || i} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-14">
                {isValidImg(b.logo) ? (
                  <img src={b.logo} alt={b.name} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#0A0A0A] flex items-center justify-center">
                    <span className="text-white font-black text-sm">{(b.name || "B")[0]}</span>
                  </div>
                )}
                <p className="text-[9px] font-bold text-center text-[#525252] leading-tight truncate w-full">{b.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REELS */}
      <div className="mt-2">
        <div className="px-5 flex items-end justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#E25238]">Portfolio</p>
            <h3 className="font-display font-black text-2xl text-[#0A0A0A] tracking-tight leading-tight mt-1">
              Featured Reels
            </h3>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#525252]">
            {reels.length} reel{reels.length !== 1 ? "s" : ""}
          </span>
        </div>

        {reels.length > 0 ? (
          <div className="px-5 grid grid-cols-2 gap-3">
            {reels.map((r) => (
              <a
                key={r.id}
                href={r.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl overflow-hidden border border-[#E5E5E5] bg-white hover:opacity-80 transition-opacity"
              >
                <div className="aspect-[9/16] relative bg-[#0A0A0A]">
                  {r.thumbnail ? (
                    <img src={r.thumbnail} alt={r.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <InstagramIcon size={24} className="text-white/30" />
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-[10px] font-bold text-[#E25238] uppercase tracking-wide truncate">{r.brand}</p>
                  <p className="text-xs font-bold text-[#0A0A0A] truncate">{r.title}</p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-[#525252] font-medium">No reels added yet.</p>
          </div>
        )}
      </div>

      {showInsights && (
        <AudienceInsightsModal
          open={showInsights}
          onClose={() => setShowInsights(false)}
          isOwner={false}
          initialData={ai}
        />
      )}
      {showPricing && (
        <ServicePricingModal
          open={showPricing}
          onClose={() => setShowPricing(false)}
          isOwner={false}
          initialData={pricing}
        />
      )}
    </div>
  );
}
