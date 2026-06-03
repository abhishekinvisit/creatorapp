import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Wallet, Calendar, Users, BadgeCheck, Bookmark } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { CATEGORIES } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export default function HomeFeed() {
  const navigate = useNavigate();
  const { opportunities, isSaved, toggleSave } = useApp();
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = opportunities.filter((o) => {
    const matchCat = activeCat === "All" || o.category === activeCat;
    const matchSearch = !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.brandName.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div data-testid="home-feed" className="min-h-full bg-[#F9F9F8] pb-6">
      <TopBar
        title=""
        showBack={false}
        showMenu
        showBell
        rightSlot={
          <div className="hidden" />
        }
      />
      {/* Brand wordmark + tagline */}
      <div className="-mt-12 px-5 pb-3 flex flex-col items-center pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[10px] bg-gradient-to-br from-[#E25238] to-[#F59E0B] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full border-2 border-white" />
          </div>
          <h1 className="font-display font-black text-2xl tracking-[-0.04em] text-[#0A0A0A]">
            OLLCOLLAB
          </h1>
        </div>
      </div>

      <div className="px-5 pb-4 pt-2">
        {/* Search */}
        <div className="bg-white rounded-2xl border border-[#E5E5E5] flex items-center px-4 py-3.5 mb-4">
          <Search size={18} className="text-[#525252]" />
          <input
            data-testid="home-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opportunities..."
            className="flex-1 outline-none px-3 text-sm font-medium bg-transparent"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              data-testid={`cat-${cat.toLowerCase()}`}
              onClick={() => setActiveCat(cat)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                activeCat === cat
                  ? "bg-[#0A0A0A] text-white"
                  : "bg-white text-[#525252] border border-[#E5E5E5] hover:border-[#0A0A0A]"
              }`}
            >
              {cat}
            </button>
          ))}
          <button className="ml-1 w-10 h-10 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center flex-shrink-0">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Opportunity cards (compact) */}
      <div className="px-5 space-y-3">
        {filtered.map((op, idx) => {
          const saved = isSaved(op.id);
          return (
          <div
            key={op.id}
            className="relative animate-fade-up"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <button
              data-testid={`opportunity-${op.id}`}
              onClick={() => navigate(`/opportunity/${op.id}`)}
              className="w-full text-left bg-white rounded-3xl overflow-hidden border border-[#E5E5E5] hover:-translate-y-0.5 hover:shadow-lg transition-all flex"
            >
              {/* Left thumbnail */}
              <div className="relative w-28 flex-shrink-0">
                <img src={op.cover} alt={op.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur text-[9px] font-bold uppercase tracking-wider">
                  {op.category}
                </div>
              </div>

              {/* Right body */}
              <div className="flex-1 min-w-0 p-3.5 pr-12">
                <div className="flex items-center gap-2 mb-1.5">
                  <BrandLogo name={op.brandName} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="font-display font-bold text-sm text-[#0A0A0A] truncate">{op.brandName}</h3>
                      {op.verified && <BadgeCheck size={12} className="text-[#E25238] flex-shrink-0" fill="#E25238" stroke="white" />}
                    </div>
                    <p className="text-[10px] text-[#525252] font-medium truncate">{op.brandCategory}</p>
                  </div>
                </div>

                <p className="text-xs font-medium text-[#0A0A0A] leading-snug line-clamp-2 mb-2">
                  {op.pitch}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-[#525252] flex-wrap">
                  <span className="flex items-center gap-1">
                    <Wallet size={11} className="text-[#E25238]" />
                    <span className="font-bold text-[#0A0A0A]">₹{op.payout}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={11} className="text-[#E25238]" />
                    <span className="font-medium">{op.creatorsNeeded}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} className="text-[#E25238]" />
                    <span className="font-medium truncate">{op.deadline}</span>
                  </span>
                </div>
              </div>
            </button>

            {/* Save button */}
            <button
              data-testid={`save-${op.id}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleSave(op.id);
                toast.success(saved ? "Removed from saved" : "Saved");
              }}
              aria-label={saved ? "Unsave" : "Save"}
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
            >
              <Bookmark
                size={13}
                className={saved ? "text-[#E25238]" : "text-[#0A0A0A]"}
                fill={saved ? "#E25238" : "none"}
                strokeWidth={saved ? 0 : 2}
              />
            </button>
          </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display font-bold text-lg text-[#0A0A0A]">No opportunities found</p>
            <p className="text-sm text-[#525252] mt-1">Try a different category or search.</p>
          </div>
        )}
      </div>

    </div>
  );
}
