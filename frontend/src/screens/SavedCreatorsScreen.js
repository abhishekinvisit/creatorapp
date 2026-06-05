import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, MapPin, Users } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { savedCreatorsApi } from "@/lib/api";
import { useApp } from "@/context/AppContext";

function formatFollowers(n) {
  if (!n) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function SavedCreatorsScreen() {
  const navigate = useNavigate();
  const { unsaveCreator } = useApp();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    savedCreatorsApi.list()
      .then(setCreators)
      .catch(() => setCreators([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (creatorId) => {
    await unsaveCreator(creatorId);
    setCreators((prev) => prev.filter((c) => c.creator_id !== creatorId));
  };

  return (
    <div data-testid="saved-creators-screen" className="min-h-full bg-[#0A0A0A] text-white pb-6">
      <TopBar title="Saved Creators" dark />

      <div className="px-5">
        {loading ? (
          <div className="pt-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-white/10 border-t-[#E25238] rounded-full animate-spin" />
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Bookmark size={28} className="text-neutral-500" />
            </div>
            <p className="font-display font-bold text-xl text-white">No saved creators yet</p>
            <p className="text-sm text-neutral-400 mt-2 font-medium max-w-[220px] mx-auto">
              Save creators from Discover to build your shortlist.
            </p>
            <button
              onClick={() => navigate("/brand/discover")}
              className="mt-6 px-6 py-3 bg-[#E25238] text-white rounded-full font-bold text-sm hover:bg-[#C9452D] transition-colors"
            >
              Discover Creators
            </button>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-4">
              {creators.length} saved
            </p>
            <div className="space-y-3">
              {creators.map((c, idx) => (
                <div
                  key={c.creator_id}
                  data-testid={`saved-${c.creator_id}`}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 animate-fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <button
                    onClick={() => navigate(`/brand/creator/${c.creator_id}`)}
                    className="flex items-center gap-4 flex-1 min-w-0 text-left"
                  >
                    {c.avatar ? (
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E25238] to-[#F59E0B] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-black text-xl">
                          {(c.name || "C")[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold truncate">{c.name}</h4>
                      <p className="text-xs text-neutral-400 font-medium truncate">{c.handle}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        {c.followers > 0 && (
                          <span className="flex items-center gap-1 text-neutral-400">
                            <Users size={10} className="text-[#E25238]" />
                            <span className="font-bold text-neutral-300">{formatFollowers(c.followers)}</span>
                          </span>
                        )}
                        {c.location && (
                          <span className="flex items-center gap-1 text-neutral-400">
                            <MapPin size={10} className="text-[#E25238]" />
                            {c.location}
                          </span>
                        )}
                      </div>
                      {c.categories?.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          {c.categories.slice(0, 3).map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold uppercase tracking-wider text-neutral-400"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                  <button
                    data-testid={`unsave-${c.creator_id}`}
                    onClick={() => handleUnsave(c.creator_id)}
                    className="w-10 h-10 rounded-full bg-[#E25238]/10 text-[#E25238] flex items-center justify-center flex-shrink-0 hover:bg-[#E25238] hover:text-white transition-colors"
                    title="Remove from saved"
                  >
                    <Bookmark size={15} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
