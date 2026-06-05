import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, SlidersHorizontal, Sparkles, Shirt, Camera, Dumbbell, UtensilsCrossed } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/context/AppContext";

const CATEGORY_ICONS = [
  { name: "Beauty", icon: Sparkles },
  { name: "Fashion", icon: Shirt },
  { name: "Lifestyle", icon: Camera },
  { name: "Fitness", icon: Dumbbell },
  { name: "Food", icon: UtensilsCrossed },
];

export default function SearchScreen() {
  const navigate = useNavigate();
  const { opportunities } = useApp();
  const [q, setQ] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);

  // Derive unique brands from real opportunities
  const popularBrands = useMemo(() => {
    const seen = new Set();
    const brands = [];
    for (const opp of opportunities) {
      const name = opp.brandName || opp.brand;
      const id = opp.brandId || opp.brand_id;
      if (name && !seen.has(name)) {
        seen.add(name);
        brands.push({ id: id || name, name });
      }
      if (brands.length >= 8) break;
    }
    return brands;
  }, [opportunities]);

  const handleSearch = (value) => {
    if (!value.trim()) return;
    setRecentSearches((prev) => {
      const next = [value, ...prev.filter((s) => s !== value)].slice(0, 5);
      return next;
    });
  };

  return (
    <div data-testid="search-screen" className="min-h-full bg-[#F9F9F8] pb-6">
      <TopBar title="Search" showBack={false} />

      <div className="px-5">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(q); }}
          className="bg-white rounded-2xl border border-[#E5E5E5] flex items-center px-4 py-3.5 mb-6"
        >
          <SearchIcon size={18} className="text-[#525252]" />
          <input
            data-testid="search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search brands, campaigns..."
            className="flex-1 outline-none px-3 text-sm font-medium bg-transparent"
          />
          <button type="button" className="ml-1"><SlidersHorizontal size={16} /></button>
        </form>

        {popularBrands.length > 0 && (
          <Section title="Popular Brands" onSeeAll={() => navigate("/home")}>
            <div className="grid grid-cols-4 gap-3">
              {popularBrands.slice(0, 4).map((b) => (
                <button
                  key={b.id}
                  data-testid={`popular-brand-${b.id}`}
                  onClick={() => navigate("/home")}
                  className="flex flex-col items-center gap-2"
                >
                  <BrandLogo name={b.name} size={56} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#525252] text-center truncate w-full">{b.name}</span>
                </button>
              ))}
            </div>
          </Section>
        )}

        <Section title="Categories">
          <div className="grid grid-cols-5 gap-3">
            {CATEGORY_ICONS.map((c) => (
              <button
                key={c.name}
                data-testid={`cat-icon-${c.name.toLowerCase()}`}
                onClick={() => setQ(c.name)}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5E5E5] flex items-center justify-center hover:border-[#0A0A0A] transition-colors">
                  <c.icon size={20} className="text-[#0A0A0A]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#525252]">{c.name}</span>
              </button>
            ))}
          </div>
        </Section>

        {recentSearches.length > 0 && (
          <Section title="Recent Searches">
            <div className="space-y-2">
              {recentSearches.map((r) => (
                <button
                  key={r}
                  data-testid={`recent-${r.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setQ(r)}
                  className="w-full text-left px-4 py-3 bg-white rounded-2xl border border-[#E5E5E5] hover:border-[#0A0A0A] text-sm font-medium flex items-center gap-3"
                >
                  <SearchIcon size={14} className="text-[#525252]" />
                  {r}
                </button>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

const Section = ({ title, onSeeAll, children }) => (
  <div className="mb-7">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-display font-bold text-base text-[#0A0A0A]">{title}</h3>
      {onSeeAll && (
        <button onClick={onSeeAll} className="text-xs font-bold text-[#E25238] uppercase tracking-wider">See All</button>
      )}
    </div>
    {children}
  </div>
);
