import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Wallet, Calendar, Users, BadgeCheck } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { CATEGORIES } from "@/data/mockData";
import { useApp } from "@/context/AppContext";

export default function HomeFeed() {
  const navigate = useNavigate();
  const { opportunities } = useApp();
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = opportunities.filter((o) => {
    const matchCat = activeCat === "All" || o.category === activeCat;
    const matchSearch = !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.brandName.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div data-testid="home-feed" className="min-h-full bg-[#F9F9F8] pb-24">
      <TopBar title="Home" showBack={false} showMenu showBell />

      <div className="px-5 pb-4">
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

      {/* Opportunity cards */}
      <div className="px-5 space-y-4">
        {filtered.map((op, idx) => (
          <button
            key={op.id}
            data-testid={`opportunity-${op.id}`}
            onClick={() => navigate(`/opportunity/${op.id}`)}
            className="w-full text-left bg-white rounded-3xl overflow-hidden border border-[#E5E5E5] hover:-translate-y-1 hover:shadow-xl transition-all animate-fade-up"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="relative h-32 overflow-hidden">
              <img src={op.cover} alt={op.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur text-xs font-bold uppercase tracking-wider">
                {op.category}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <BrandLogo name={op.brandName} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-bold text-base text-[#0A0A0A] truncate">{op.brandName}</h3>
                    {op.verified && <BadgeCheck size={16} className="text-[#E25238] flex-shrink-0" fill="#E25238" stroke="white" />}
                  </div>
                  <p className="text-xs text-[#525252] font-medium">{op.brandCategory}</p>
                </div>
              </div>

              <p className="text-sm font-medium text-[#0A0A0A] mb-4 leading-snug">{op.pitch}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-[#525252]">
                  <Wallet size={14} className="text-[#E25238]" />
                  <span className="font-bold text-[#0A0A0A]">₹{op.payout}</span>
                  <span className="font-medium">per reel</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#525252]">
                  <Calendar size={14} className="text-[#E25238]" />
                  <span className="font-medium">Apply before {op.deadline}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#525252]">
                  <Users size={14} className="text-[#E25238]" />
                  <span className="font-medium">{op.creatorsNeeded} Creators Needed</span>
                </div>
              </div>

              <div className="bg-[#0A0A0A] text-white text-center py-3 rounded-full font-bold text-sm hover:bg-[#E25238] transition-colors">
                View Details
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display font-bold text-lg text-[#0A0A0A]">No opportunities found</p>
            <p className="text-sm text-[#525252] mt-1">Try a different category or search.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
