import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, BadgeCheck } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/context/AppContext";

export default function BrandsList() {
  const { opportunities } = useApp();
  const [q, setQ] = useState("");

  // Derive unique brands from real opportunities
  const brands = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const opp of opportunities) {
      const name = opp.brandName || opp.brand || "";
      if (!name || seen.has(name)) continue;
      seen.add(name);
      result.push({
        id: opp.brandId || opp.brand_id || name,
        name,
        category: opp.brandCategory || opp.category || "",
        verified: !!opp.verified,
      });
    }
    return result;
  }, [opportunities]);

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div data-testid="brands-list" className="min-h-full bg-[#F9F9F8] pb-6">
      <TopBar title="Brands" />

      <div className="px-5">
        <div className="bg-white rounded-2xl border border-[#E5E5E5] flex items-center px-4 py-3.5 mb-4">
          <Search size={18} className="text-[#525252]" />
          <input
            data-testid="brands-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search brands..."
            className="flex-1 outline-none px-3 text-sm font-medium bg-transparent"
          />
          <button><SlidersHorizontal size={16} /></button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-display font-bold text-lg text-[#0A0A0A]">
              {q ? "No brands found" : "No brands yet"}
            </p>
            <p className="text-sm text-[#525252] mt-1">
              {q ? "Try a different search." : "Brands will appear here as opportunities are posted."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((b, idx) => (
              <div
                key={b.id}
                data-testid={`brand-row-${b.id}`}
                className="bg-white rounded-2xl border border-[#E5E5E5] p-4 flex items-center gap-4 animate-fade-up"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <BrandLogo name={b.name} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-display font-bold truncate">{b.name}</h4>
                    {b.verified && (
                      <BadgeCheck size={14} className="text-[#E25238]" fill="#E25238" stroke="white" />
                    )}
                  </div>
                  <p className="text-xs text-[#525252] font-medium">{b.category}</p>
                </div>
                <button className="px-4 py-2 border border-[#0A0A0A] rounded-full text-xs font-bold hover:bg-[#0A0A0A] hover:text-white transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
