import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, MapPin, Users, MessageCircle, ExternalLink, SlidersHorizontal } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { savedCreatorsApi, messagesApi } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

function formatFollowers(n) {
  if (!n) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.floor(n / 1000)}K`;
  return String(n);
}

const InstagramIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const SORT_OPTIONS = ["Recent", "Followers", "Name"];

export default function SavedCreatorsScreen() {
  const navigate = useNavigate();
  const { unsaveCreator } = useApp();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("Recent");
  const [messaging, setMessaging] = useState(null);

  useEffect(() => {
    savedCreatorsApi.list()
      .then(setCreators)
      .catch(() => setCreators([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (creatorId) => {
    await unsaveCreator(creatorId);
    setCreators((prev) => prev.filter((c) => c.creator_id !== creatorId));
    toast.success("Removed from saved");
  };

  const handleMessage = async (creatorId) => {
    setMessaging(creatorId);
    try {
      const thread = await messagesApi.openWith(creatorId);
      navigate(`/chat/${thread.id}`);
    } catch (_) {
      navigate("/messages");
    } finally {
      setMessaging(null);
    }
  };

  const sorted = [...creators].sort((a, b) => {
    if (sort === "Followers") return (b.followers || 0) - (a.followers || 0);
    if (sort === "Name") return (a.name || "").localeCompare(b.name || "");
    return 0; // Recent — keep server order
  });

  return (
    <div data-testid="saved-creators-screen" className="min-h-full bg-[#0A0A0A] text-white pb-6">
      <TopBar title="Saved Creators" dark />

      <div className="px-5">
        {loading ? (
          <div className="pt-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-white/10 border-t-[#E25238] rounded-full animate-spin" />
          </div>
        ) : creators.length === 0 ? (
          <div className="pt-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
              <Bookmark size={32} className="text-neutral-600" />
            </div>
            <p className="font-display font-bold text-xl text-white">No saved creators yet</p>
            <p className="text-sm text-neutral-400 mt-2 font-medium max-w-[230px]">
              Save creators from Discover to build your talent shortlist.
            </p>
            <button
              onClick={() => navigate("/brand/discover")}
              className="mt-6 px-6 py-3.5 bg-[#E25238] text-white rounded-full font-bold text-sm hover:bg-[#C9452D] transition-colors"
            >
              Discover Creators
            </button>
          </div>
        ) : (
          <>
            {/* Count + Sort strip */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400">
                {creators.length} saved
              </p>
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal size={12} className="text-neutral-500" />
                <div className="flex gap-1">
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSort(s)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                        sort === s
                          ? "bg-[#E25238] text-white"
                          : "bg-white/5 text-neutral-400 border border-white/10 hover:border-white/20"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {sorted.map((c, idx) => (
                <div
                  key={c.creator_id}
                  data-testid={`saved-${c.creator_id}`}
                  className="bg-white/5 border border-white/10 rounded-3xl p-4 animate-fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Top row: avatar + identity */}
                  <div className="flex items-start gap-3 mb-3">
                    {c.avatar ? (
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 ring-2 ring-white/10"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E25238] to-[#F59E0B] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-black text-2xl">
                          {(c.name || "C")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold text-white truncate">{c.name || "Creator"}</h4>
                      {c.handle && (
                        <p className="text-xs text-neutral-400 font-medium truncate">@{c.handle.replace(/^@/, "")}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {c.followers > 0 && (
                          <span className="flex items-center gap-1 text-xs">
                            <Users size={10} className="text-[#E25238]" />
                            <span className="font-bold text-neutral-200">{formatFollowers(c.followers)}</span>
                            <span className="text-neutral-500 font-medium">followers</span>
                          </span>
                        )}
                        {c.location && (
                          <span className="flex items-center gap-1 text-xs text-neutral-500">
                            <MapPin size={10} className="text-[#E25238]" />
                            {c.location}
                          </span>
                        )}
                        {c.collaborations_count > 0 && (
                          <span className="text-xs text-neutral-500 font-medium">
                            {c.collaborations_count} collabs
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Remove button */}
                    <button
                      data-testid={`unsave-${c.creator_id}`}
                      onClick={() => handleUnsave(c.creator_id)}
                      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-colors flex-shrink-0"
                      title="Remove from saved"
                    >
                      <Bookmark size={14} fill="currentColor" />
                    </button>
                  </div>

                  {/* Categories */}
                  {c.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {c.categories.slice(0, 4).map((cat) => (
                        <span
                          key={cat}
                          className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-neutral-400"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Social link indicator */}
                  {c.instagram_url && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="w-5 h-5 rounded-md bg-[#E25238]/15 flex items-center justify-center">
                        <InstagramIcon size={11} />
                      </div>
                      <span className="text-[11px] text-neutral-500 font-medium truncate">
                        {c.instagram_url.replace(/https?:\/\/(www\.)?instagram\.com\/?/, "@").replace(/\/$/, "") || "Instagram"}
                      </span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      data-testid={`view-profile-${c.creator_id}`}
                      onClick={() => navigate(`/brand/creator/${c.creator_id}`)}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/15 text-xs font-bold text-neutral-300 hover:border-[#E25238] hover:text-[#E25238] transition-colors"
                    >
                      <ExternalLink size={12} /> View Profile
                    </button>
                    <button
                      data-testid={`message-${c.creator_id}`}
                      onClick={() => handleMessage(c.creator_id)}
                      disabled={messaging === c.creator_id}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#E25238]/10 border border-[#E25238]/20 text-xs font-bold text-[#E25238] hover:bg-[#E25238] hover:text-white transition-colors disabled:opacity-60"
                    >
                      <MessageCircle size={12} />
                      {messaging === c.creator_id ? "Opening…" : "Message"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
