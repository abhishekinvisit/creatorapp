import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, Bookmark, Globe, BarChart2, IndianRupee } from "lucide-react";

const InstagramIcon = ({ size = 16, className = "", strokeWidth = 2, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
const YoutubeIcon = ({ size = 16, className = "", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M23.5 6.2a3.01 3.01 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3.01 3.01 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3.01 3.01 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3.01 3.01 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5V8.5l6.25 3.5-6.25 3.5z"/>
  </svg>
);
const LinkedinIcon = ({ size = 16, className = "", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
  </svg>
);
const TiktokIcon = ({ size = 16, className = "", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/>
  </svg>
);

import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { ReelCard } from "@/components/ReelCard";
import { AudienceInsightsModal } from "@/components/AudienceInsightsModal";
import { ServicePricingModal } from "@/components/ServicePricingModal";
import { creatorsApi, messagesApi } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

function formatFollowers(n) {
  if (!n) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function CreatorProfileBrandView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUserId, isCreatorSaved, saveCreator, unsaveCreator } = useApp();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    setLoading(true);
    creatorsApi.get(id)
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleSave = () => {
    if (isCreatorSaved(id)) {
      unsaveCreator(id);
      toast.success("Removed from saved creators");
    } else {
      saveCreator(id);
      toast.success(`${profile?.full_name || "Creator"} saved!`);
    }
  };

  const handleMessage = async () => {
    try {
      const thread = await messagesApi.openWith(id);
      navigate(`/chat/${thread.id}`);
    } catch (_) {
      toast.error("Failed to open chat");
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-[#F9F9F8] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E5E5E5] border-t-[#E25238] rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-full bg-[#F9F9F8] flex items-center justify-center">
        <p className="text-[#525252] font-medium">Creator not found.</p>
      </div>
    );
  }

  const c = profile;
  const instagramUrl = c.instagram_url || `https://instagram.com/${(c.handle || "").replace("@", "")}`;
  const openInstagram = () => window.open(instagramUrl, "_blank", "noopener,noreferrer");

  const reels = (c.reels || []).map((r) => ({
    id: r.id,
    brand: r.brand,
    title: r.title,
    instagramUrl: r.instagram_url,
    thumbnail: r.thumbnail,
  }));

  let workedWith = [];
  if (Array.isArray(c.worked_with)) workedWith = c.worked_with;
  else if (typeof c.worked_with === "string") {
    try { workedWith = JSON.parse(c.worked_with); } catch (_) {}
  }

  const ai = c.audience_insights;
  const hasInsights = ai && (
    (ai.gender_male > 0) || (ai.gender_female > 0) ||
    (ai.age_18_24 > 0) || (ai.age_25_34 > 0) ||
    (ai.top_cities?.length > 0) || (ai.top_states?.length > 0)
  );

  return (
    <div data-testid="creator-profile-brand" className="min-h-full bg-[#F9F9F8] flex flex-col pb-2">
      <TopBar title="Creator Profile" showMore />

      {/* HEADER */}
      <div className="px-5">
        {/* Avatar + identity */}
        <div className="flex items-center gap-4">
          {c.avatar_url ? (
            <img
              src={c.avatar_url}
              alt={c.full_name}
              className="w-[72px] h-[72px] rounded-[22px] object-cover ring-4 ring-white shadow-md flex-shrink-0"
            />
          ) : (
            <div className="w-[72px] h-[72px] rounded-[22px] bg-gradient-to-br from-[#E25238] to-[#F59E0B] flex items-center justify-center ring-4 ring-white shadow-md flex-shrink-0">
              <span className="text-white font-black text-2xl">{(c.full_name || "C")[0]}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-black text-xl text-[#0A0A0A] tracking-tight leading-tight">
              {c.full_name || "Creator"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm text-[#525252] font-medium truncate">{c.handle || ""}</p>
              {instagramUrl && (
                <button
                  data-testid="ig-link"
                  onClick={openInstagram}
                  aria-label="Open Instagram"
                  className="w-5 h-5 rounded-[6px] bg-gradient-to-tr from-[#E25238] via-[#F59E0B] to-[#E25238] flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform"
                >
                  <InstagramIcon size={10} className="text-white" strokeWidth={2.6} />
                </button>
              )}
            </div>
            {c.location && (
              <div data-testid="profile-location" className="flex items-center gap-1 mt-1 text-xs text-[#525252] font-medium">
                <MapPin size={11} className="text-[#E25238]" />
                <span>{c.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#EBEBEB]">
          <div data-testid="stat-followers">
            <p className="font-display font-black text-base text-[#0A0A0A] leading-none">
              {formatFollowers(c.followers_count)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-3 h-3 rounded-[3px] bg-gradient-to-tr from-[#E25238] via-[#F59E0B] to-[#E25238] flex items-center justify-center">
                <InstagramIcon size={7} className="text-white" strokeWidth={2.8} />
              </div>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#525252]">Followers</p>
            </div>
          </div>
          <div className="w-px h-7 bg-[#E5E5E5]" />
          <div data-testid="stat-collaborations">
            <p className="font-display font-black text-base text-[#0A0A0A] leading-none">
              {c.collaborations_count || 0}
            </p>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#525252] mt-1">Collaborations</p>
          </div>
        </div>

        {c.bio && (
          <p className="text-sm font-medium text-[#0A0A0A] mt-4 leading-relaxed">{c.bio}</p>
        )}

        {/* Audience Insights + My Rates row */}
        {(hasInsights || (c.pricing && (c.pricing.ig_reel || c.pricing.ig_post || c.pricing.ig_story || c.pricing.reel_story_package || c.pricing.ugc_video || c.pricing.event_appearance || (c.pricing.custom_services?.length > 0)))) && (
          <div className="flex gap-3 mt-4">
            {hasInsights && (
              <button
                onClick={() => setShowInsights(true)}
                className="flex-1 flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E5E5] rounded-2xl hover:border-[#E25238] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#E25238] flex items-center justify-center flex-shrink-0">
                  <BarChart2 size={16} className="text-white" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-bold text-[#0A0A0A] leading-tight">Audience Insights</p>
                  <p className="text-xs text-[#525252] font-medium leading-tight">View demographics</p>
                </div>
              </button>
            )}

            {c.pricing && (c.pricing.ig_reel || c.pricing.ig_post || c.pricing.ig_story || c.pricing.reel_story_package || c.pricing.ugc_video || c.pricing.event_appearance || (c.pricing.custom_services?.length > 0)) && (
              <button
                onClick={() => setShowPricing(true)}
                className="flex-1 flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E5E5] rounded-2xl hover:border-[#E25238] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#E25238] flex items-center justify-center flex-shrink-0">
                  <IndianRupee size={16} className="text-white" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-bold text-[#0A0A0A] leading-tight">My Rates</p>
                  <p className="text-xs text-[#525252] font-medium leading-tight">Service Pricing</p>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Social links */}
        {(c.instagram_url || c.youtube_url || c.linkedin_url || c.tiktok_url || c.website_url) && (
          <div className="mt-4">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#525252] mb-2">Social Links</p>
            <div className="flex items-center gap-2 flex-wrap">
              {c.instagram_url && (
                <a
                  href={c.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-tr from-[#E25238] via-[#F59E0B] to-[#E25238] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  <InstagramIcon size={13} /> Instagram
                </a>
              )}
              {c.youtube_url && (
                <a
                  href={c.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#FF0000] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  <YoutubeIcon size={13} /> YouTube
                </a>
              )}
              {c.linkedin_url && (
                <a
                  href={c.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#0A66C2] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  <LinkedinIcon size={13} /> LinkedIn
                </a>
              )}
              {c.tiktok_url && (
                <a
                  href={c.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#0A0A0A] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  <TiktokIcon size={13} /> TikTok
                </a>
              )}
              {c.website_url && (
                <a
                  href={c.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-[#E5E5E5] text-[#0A0A0A] text-xs font-bold hover:border-[#0A0A0A] transition-colors"
                >
                  <Globe size={13} /> Website
                </a>
              )}
            </div>
          </div>
        )}

        {(c.categories?.length > 0) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {c.categories.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-bold uppercase tracking-[0.15em]"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {(c.languages?.length > 0) && (
          <div className="mt-4">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#525252] mb-2">Content Languages</p>
            <div className="flex flex-wrap gap-2">
              {c.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-3 py-1.5 rounded-full bg-[#E25238]/10 border border-[#E25238]/20 text-[10px] font-bold uppercase tracking-[0.15em] text-[#E25238]"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {workedWith.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#525252]">Worked With</p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#525252]">
                {workedWith.length} brand{workedWith.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-start gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
              {workedWith.map((b, i) => {
                const logoSrc = b.logo || b.customLogo || "";
                const isValidLogo = logoSrc && (logoSrc.startsWith("data:") || logoSrc.startsWith("http"));
                const displayName = b.name || b.brand_name || "";
                const item = (
                  <div key={b.id || i} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-14">
                    <BrandLogo name={displayName || "B"} size={48} src={isValidLogo ? logoSrc : undefined} />
                    <p className="text-[9px] font-bold text-center text-[#525252] leading-tight truncate w-full">
                      {displayName}
                    </p>
                  </div>
                );
                return b.link ? (
                  <a key={b.id || i} href={b.link.startsWith("http") ? b.link : `https://${b.link}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                    {item}
                  </a>
                ) : item;
              })}
            </div>
          </div>
        )}
      </div>

      {/* PORTFOLIO */}
      <div className="mt-8">
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
          <div data-testid="reels-grid" className="px-5 grid grid-cols-2 gap-3">
            {reels.map((r, i) => (
              <ReelCard key={r.id} reel={r} testId={`reel-${r.id}`} delay={i * 70} />
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-[#525252] font-medium">No reels added yet.</p>
          </div>
        )}
      </div>

      {/* Floating actions */}
      <div className="sticky bottom-0 left-0 right-0 z-20 mt-6">
        <div className="px-5 py-4 bg-gradient-to-t from-[#F9F9F8] via-[#F9F9F8]/95 to-transparent flex gap-3">
          <button
            data-testid="save-btn"
            onClick={handleToggleSave}
            className={`flex-1 py-4 rounded-full border-2 font-bold flex items-center justify-center gap-2 transition-colors ${
              isCreatorSaved(id)
                ? "bg-[#E25238] border-[#E25238] text-white"
                : "border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white"
            }`}
          >
            <Bookmark size={16} fill={isCreatorSaved(id) ? "currentColor" : "none"} />
            {isCreatorSaved(id) ? "Saved" : "Save"}
          </button>
          <button
            data-testid="message-btn"
            onClick={handleMessage}
            className="flex-1 py-4 rounded-full bg-[#0A0A0A] text-white font-bold hover:bg-[#E25238] transition-colors"
          >
            Message
          </button>
        </div>
      </div>

      {/* Audience Insights Modal (read-only for brand view) */}
      {showInsights && hasInsights && (
        <AudienceInsightsModal
          open={true}
          onClose={() => setShowInsights(false)}
          isOwner={false}
          initialData={ai}
        />
      )}
      {/* Service Pricing Modal (read-only for brand view) */}
      {showPricing && c.pricing && (
        <ServicePricingModal
          open={showPricing}
          onClose={() => setShowPricing(false)}
          isOwner={false}
          initialData={c.pricing}
        />
      )}
    </div>
  );
}
