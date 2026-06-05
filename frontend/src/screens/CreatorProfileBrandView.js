import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, Bookmark } from "lucide-react";

const InstagramIcon = ({ size = 16, className = "", strokeWidth = 2, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { ReelCard } from "@/components/ReelCard";
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

        {workedWith.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#525252]">Worked With</p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#525252]">
                {workedWith.length} brand{workedWith.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-start gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
              {workedWith.map((b, i) => (
                <div key={b.id || i} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-14">
                  <BrandLogo name={b.name || b.brand_name || "B"} size={48} />
                  <p className="text-[9px] font-bold text-center text-[#525252] leading-tight truncate w-full text-center">
                    {b.name || b.brand_name || ""}
                  </p>
                </div>
              ))}
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
    </div>
  );
}
