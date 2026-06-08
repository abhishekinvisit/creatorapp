import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Users, Star, Link2, ExternalLink, BarChart2 } from "lucide-react";
import { creatorsApi } from "@/lib/api";
import { AudienceInsightsModal } from "@/components/AudienceInsightsModal";

const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
const YoutubeIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
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

      <div className="px-5">
        {/* Hero */}
        <div className="flex items-center gap-4 mt-6 mb-5">
          {hasAvatar ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="w-24 h-24 rounded-3xl object-cover ring-2 ring-[#E5E5E5] flex-shrink-0" />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-[#0A0A0A] flex items-center justify-center flex-shrink-0">
              <span className="font-display font-black text-white text-3xl">
                {(profile.full_name || "?").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-black text-2xl text-[#0A0A0A] tracking-tight leading-tight">
              {profile.full_name || "Creator"}
            </h1>
            {profile.handle && (
              <p className="text-sm font-bold text-[#525252]">@{profile.handle}</p>
            )}
            {profile.location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={12} className="text-[#E25238]" />
                <span className="text-xs font-medium text-[#525252]">{profile.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-3 text-center">
            <p className="font-display font-black text-xl text-[#0A0A0A]">{formatFollowers(profile.followers_count)}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#525252] mt-0.5 flex items-center justify-center gap-1">
              <Users size={10} /> Followers
            </p>
          </div>
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-3 text-center">
            <p className="font-display font-black text-xl text-[#0A0A0A]">{profile.collaborations_count || 0}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#525252] mt-0.5 flex items-center justify-center gap-1">
              <Star size={10} /> Collabs
            </p>
          </div>
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-3 text-center">
            <p className="font-display font-black text-xl text-[#0A0A0A]">{reels.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#525252] mt-0.5">Reels</p>
          </div>
        </div>

        {/* Audience Insights button */}
        {hasInsights && (
          <button
            onClick={() => setShowInsights(true)}
            className="w-full mb-4 flex items-center gap-3 px-4 py-3.5 bg-[#E25238]/8 border border-[#E25238]/20 rounded-2xl hover:bg-[#E25238]/15 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-[#E25238] flex items-center justify-center flex-shrink-0">
              <BarChart2 size={16} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-[#0A0A0A]">Audience Insights</p>
              <p className="text-xs text-[#525252] font-medium">View demographics & reach data</p>
            </div>
          </button>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 mb-4">
            <p className="text-sm font-medium text-[#0A0A0A] leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Categories & Languages */}
        {(categories.length > 0 || languages.length > 0) && (
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 mb-4 space-y-3">
            {categories.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E25238] mb-2">Niches</p>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((c) => (
                    <span key={c} className="px-3 py-1.5 bg-[#F3F3F3] text-[#0A0A0A] text-xs font-bold rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E25238] mb-2">Languages</p>
                <div className="flex flex-wrap gap-1.5">
                  {languages.map((l) => (
                    <span key={l} className="px-3 py-1.5 bg-[#F3F3F3] text-[#0A0A0A] text-xs font-bold rounded-full">{l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Social links */}
        {socialLinks.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E25238] mb-2">Socials</p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.url.startsWith("http") ? s.url : `https://${s.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-2xl text-sm font-bold text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A] transition-all"
                >
                  {s.icon} {s.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Worked With */}
        {workedWith.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E25238] mb-2">Worked With</p>
            <div className="flex flex-wrap gap-2">
              {workedWith.map((b, i) => (
                <div key={b.id || i} className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E5E5] rounded-2xl">
                  {isValidImg(b.logo) ? (
                    <img src={b.logo} alt={b.name} className="w-6 h-6 rounded-lg object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] flex items-center justify-center">
                      <span className="text-white text-[9px] font-black">{(b.name || "?").charAt(0)}</span>
                    </div>
                  )}
                  <span className="text-xs font-bold text-[#0A0A0A]">{b.name}</span>
                  {b.link && (
                    <a href={b.link.startsWith("http") ? b.link : `https://${b.link}`} target="_blank" rel="noopener noreferrer">
                      <Link2 size={11} className="text-[#525252] hover:text-[#E25238]" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reels */}
        {reels.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E25238] mb-2">Featured Reels</p>
            <div className="grid grid-cols-2 gap-3">
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
          </div>
        )}

        {/* CTA */}
        <div className="mt-6 text-center">
          <p className="text-xs font-medium text-[#525252] mb-3">Want to collaborate with creators like {profile.full_name?.split(" ")[0] || "this creator"}?</p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3.5 bg-[#E25238] text-white rounded-full font-bold text-sm hover:bg-[#C9452D] transition-colors"
          >
            Join Rytspot
          </button>
        </div>
      </div>

      {showInsights && (
        <AudienceInsightsModal
          open={showInsights}
          onClose={() => setShowInsights(false)}
          isOwner={false}
          initialData={ai}
        />
      )}
    </div>
  );
}
