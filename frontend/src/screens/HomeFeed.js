import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Wallet, Calendar, Users, BadgeCheck, Bookmark, X, Sparkles, Globe2 } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { FILTER_CATEGORIES as CATEGORIES } from "@/data/categories";
import { useApp } from "@/context/AppContext";
import { opportunitiesApi } from "@/lib/api";
import { toast } from "sonner";

const ALL_LANGUAGES = ["Hindi", "English", "Tamil", "Telugu", "Kannada", "Marathi", "Bengali", "Gujarati", "Punjabi", "Malayalam"];
const PAYOUT_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "₹500+", value: 500 },
  { label: "₹750+", value: 750 },
  { label: "₹1000+", value: 1000 },
];

function mapApiOpp(o) {
  return {
    id: o.id,
    brandName: o.brand_name || o.brandName || "",
    brandCategory: o.brand_category || o.brandCategory || "",
    brandLogo: o.brand_logo || o.brandLogo || "",
    title: o.title,
    pitch: o.pitch || "",
    description: o.description || "",
    payout: o.payout || 0,
    payoutMin: o.payout_min || 0,
    payoutMax: o.payout_max || 0,
    followersMin: o.followers_min || 0,
    followersMax: o.followers_max || 0,
    needed: o.creators_needed || o.needed || 1,
    deadline: o.deadline || "",
    category: o.category || "",
    cover: o.cover_url || o.cover || "",
    language: o.languages || o.language || [],
    verified: !!o.verified,
    applicants: o.applicants_count || o.applicants || 0,
  };
}

export default function HomeFeed() {
  const navigate = useNavigate();
  const { opportunities, mergeOpportunities, isSaved, toggleSave, user, accountType, applications, unreadNotifications } = useApp();
  useEffect(() => {
    opportunitiesApi.list()
      .then((opps) => {
        if (opps.length > 0) mergeOpportunities(opps.map(mapApiOpp));
      })
      .catch(() => {});
  }, []);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [discoverAll, setDiscoverAll] = useState(false);
  const [activeCat, setActiveCat] = useState("All");

  // Creator's chosen niche categories
  const creatorCats = accountType === "creator" ? (user?.creator?.category || []) : [];

  // Filter state
  const [filterLanguages, setFilterLanguages] = useState([]);
  const [filterMinPayout, setFilterMinPayout] = useState(0);
  const [filterVerified, setFilterVerified] = useState(false);

  // Pending filter state (edited in drawer, applied on "Apply")
  const [pendingLanguages, setPendingLanguages] = useState([]);
  const [pendingMinPayout, setPendingMinPayout] = useState(0);
  const [pendingVerified, setPendingVerified] = useState(false);

  const openFilters = () => {
    setPendingLanguages(filterLanguages);
    setPendingMinPayout(filterMinPayout);
    setPendingVerified(filterVerified);
    setShowFilters(true);
  };

  const applyFilters = () => {
    setFilterLanguages(pendingLanguages);
    setFilterMinPayout(pendingMinPayout);
    setFilterVerified(pendingVerified);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setPendingLanguages([]);
    setPendingMinPayout(0);
    setPendingVerified(false);
  };

  const togglePendingLang = (l) => {
    setPendingLanguages((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]);
  };

  const activeFilterCount =
    filterLanguages.length + (filterMinPayout > 0 ? 1 : 0) + (filterVerified ? 1 : 0);

  // Filter out opportunities this creator already applied to
  const appliedIds = new Set(
    accountType === "creator" ? applications.map((a) => a.opportunityId) : []
  );
  const notApplied = opportunities.filter((o) => !appliedIds.has(o.id));

  // Step 1 — niche gate: if creator and not discovering all, restrict to their categories
  const nicheFiltered = (!discoverAll && creatorCats.length > 0)
    ? notApplied.filter((o) => creatorCats.includes(o.category))
    : notApplied;

  // Step 2 — all other filters on top
  const filtered = nicheFiltered.filter((o) => {
    const matchCat = activeCat === "All" || o.category === activeCat;
    const matchSearch = !search ||
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.brandName.toLowerCase().includes(search.toLowerCase());
    const matchPayout = filterMinPayout === 0 || o.payout >= filterMinPayout;
    const matchLang = filterLanguages.length === 0 ||
      filterLanguages.some((l) => o.language?.includes(l));
    const matchVerified = !filterVerified || o.verified;
    return matchCat && matchSearch && matchPayout && matchLang && matchVerified;
  });

  // Category pills: in niche mode show only creator's categories, else all
  const visibleCats = (!discoverAll && creatorCats.length > 0)
    ? ["All", ...creatorCats.filter((c) => CATEGORIES.includes(c))]
    : CATEGORIES;

  // When switching modes, reset the active category pill
  const switchMode = (discover) => {
    setDiscoverAll(discover);
    setActiveCat("All");
  };

  return (
    <div data-testid="home-feed" className="min-h-full bg-[#F9F9F8] pb-6">
      <TopBar title="" showBack={false} showMenu showBell unreadCount={unreadNotifications} rightSlot={<div className="hidden" />} />

      {/* Brand wordmark */}
      <div className="-mt-12 px-5 pb-3 flex flex-col items-center pointer-events-none">
        <div className="flex items-center gap-2">
          <img src="/rytspot-logo.png" alt="Rytspot" className="w-7 h-7 object-contain" />
          <h1 className="font-display font-black text-2xl tracking-[-0.04em] text-[#0A0A0A]">
            RYTSPOT
          </h1>
        </div>
      </div>

      <div className="px-5 pb-4 pt-2">
        {/* Search row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-white rounded-2xl border border-[#E5E5E5] flex items-center px-4 py-3.5">
            <Search size={18} className="text-[#525252] flex-shrink-0" />
            <input
              data-testid="home-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search opportunities..."
              className="flex-1 outline-none px-3 text-sm font-medium bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-[#525252] hover:text-[#0A0A0A]">
                <X size={15} />
              </button>
            )}
          </div>
          {/* Filter button */}
          <button
            data-testid="filter-btn"
            onClick={openFilters}
            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
              activeFilterCount > 0
                ? "bg-[#0A0A0A] text-white"
                : "bg-white border border-[#E5E5E5] text-[#0A0A0A]"
            }`}
          >
            <SlidersHorizontal size={18} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#E25238] text-white text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Niche / Discover toggle — only for creators with set categories */}
        {creatorCats.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => switchMode(false)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                !discoverAll
                  ? "bg-[#0A0A0A] text-white"
                  : "bg-white border border-[#E5E5E5] text-[#525252] hover:border-[#0A0A0A]"
              }`}
            >
              <Sparkles size={12} />
              My Niche
            </button>
            <button
              onClick={() => switchMode(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                discoverAll
                  ? "bg-[#0A0A0A] text-white"
                  : "bg-white border border-[#E5E5E5] text-[#525252] hover:border-[#0A0A0A]"
              }`}
            >
              <Globe2 size={12} />
              Discover All
            </button>

          </div>
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {filterVerified && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0A0A0A] text-white text-[11px] font-bold">
                <BadgeCheck size={11} fill="currentColor" stroke="none" /> Verified
                <button onClick={() => setFilterVerified(false)} className="ml-1 opacity-70 hover:opacity-100"><X size={10} /></button>
              </span>
            )}
            {filterMinPayout > 0 && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0A0A0A] text-white text-[11px] font-bold">
                ₹{filterMinPayout}+
                <button onClick={() => setFilterMinPayout(0)} className="ml-1 opacity-70 hover:opacity-100"><X size={10} /></button>
              </span>
            )}
            {filterLanguages.map((l) => (
              <span key={l} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0A0A0A] text-white text-[11px] font-bold">
                {l}
                <button onClick={() => setFilterLanguages((prev) => prev.filter((x) => x !== l))} className="ml-1 opacity-70 hover:opacity-100"><X size={10} /></button>
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Results count */}
      <div className="px-5 mb-3 flex items-center justify-between">
        <p className="text-xs font-bold text-[#525252] uppercase tracking-[0.12em]">
          {filtered.length} {filtered.length === 1 ? "result" : "results"}
          {!discoverAll && creatorCats.length > 0 && (
            <span className="ml-1 text-[#E25238]">· matched to your niche</span>
          )}
        </p>
      </div>

      {/* Opportunity cards */}
      <div className="px-5 space-y-3">
        {filtered.map((op, idx) => {
          const saved = isSaved(op.id);
          return (
            <div key={op.id} className="relative animate-fade-up" style={{ animationDelay: `${idx * 60}ms` }}>
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
                    {op.brandLogo ? (
                      <img src={op.brandLogo} alt={op.brandName} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <BrandLogo name={op.brandName} size={28} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="font-display font-bold text-sm text-[#0A0A0A] truncate">{op.brandName}</h3>
                        {op.verified && <BadgeCheck size={12} className="text-[#E25238] flex-shrink-0" fill="#E25238" stroke="white" />}
                      </div>
                      <p className="text-[10px] text-[#525252] font-medium truncate">{op.brandCategory}</p>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-[#0A0A0A] leading-snug line-clamp-2 mb-2">
                    {op.title}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-[#525252] flex-wrap">
                    <span className="flex items-center gap-1">
                      <Wallet size={11} className="text-[#E25238]" />
                      <span className="font-bold text-[#0A0A0A]">
                        {op.payoutMin > 0 && op.payoutMax > 0
                          ? `₹${op.payoutMin.toLocaleString("en-IN")}–₹${op.payoutMax.toLocaleString("en-IN")}`
                          : `₹${(op.payoutMax || op.payout || 0).toLocaleString("en-IN")}`}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} className="text-[#E25238]" />
                      <span className="font-medium">{op.needed}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-[#E25238]" />
                      <span className="font-medium truncate">{op.deadline}</span>
                    </span>
                  </div>

                  {/* Language tags */}
                  {op.language && op.language.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {op.language.map((l) => (
                        <span key={l} className="px-2 py-0.5 rounded-full bg-[#F9F9F8] border border-[#E5E5E5] text-[9px] font-bold uppercase tracking-wider text-[#525252]">
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
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
            <div className="w-16 h-16 rounded-full bg-[#F0F0F0] flex items-center justify-center mx-auto mb-4">
              <Sparkles size={24} className="text-[#525252]" />
            </div>
            <p className="font-display font-bold text-lg text-[#0A0A0A]">No opportunities found</p>
            {!discoverAll && creatorCats.length > 0 ? (
              <>
                <p className="text-sm text-[#525252] mt-1">
                  No current openings in <span className="font-bold text-[#0A0A0A]">{creatorCats.join(", ")}</span>.
                </p>
                <button
                  onClick={() => switchMode(true)}
                  className="mt-4 px-5 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 mx-auto"
                >
                  <Globe2 size={13} /> Discover All Categories
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-[#525252] mt-1">Try adjusting your filters or search.</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setFilterLanguages([]); setFilterMinPayout(0); setFilterVerified(false); }}
                    className="mt-4 px-5 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-[0.15em]"
                  >
                    Clear All Filters
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Discover prompt at bottom of niche list */}
        {!discoverAll && creatorCats.length > 0 && filtered.length > 0 && (
          <div className="mt-4 bg-white rounded-2xl border border-[#E5E5E5] p-4 text-center">
            <p className="text-xs font-bold text-[#525252]">Showing opportunities matched to your niche</p>
            <button
              onClick={() => switchMode(true)}
              className="mt-2 text-xs font-black text-[#E25238] uppercase tracking-[0.15em] flex items-center gap-1.5 mx-auto hover:underline"
            >
              <Globe2 size={11} /> Discover All Categories
            </button>
          </div>
        )}
      </div>

      {/* Filter drawer backdrop */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Filter drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
          showFilters ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "82vh", overflowY: "auto" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#E5E5E5]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F0F0F0]">
          <h2 className="font-display font-black text-lg text-[#0A0A0A] tracking-tight">Filters</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-[#525252] uppercase tracking-[0.1em] hover:text-[#0A0A0A]"
            >
              Reset
            </button>
            <button onClick={() => setShowFilters(false)} className="w-8 h-8 rounded-full bg-[#F0F0F0] flex items-center justify-center">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-5 py-5 space-y-7 pb-8">
          {/* Verified Brands */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#525252] mb-3">Brand Status</p>
            <button
              onClick={() => setPendingVerified((v) => !v)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 text-sm font-bold transition-all ${
                pendingVerified
                  ? "border-[#0A0A0A] bg-[#0A0A0A] text-white"
                  : "border-[#E5E5E5] bg-white text-[#525252] hover:border-[#0A0A0A]"
              }`}
            >
              <BadgeCheck size={15} fill={pendingVerified ? "white" : "none"} stroke={pendingVerified ? "black" : "currentColor"} />
              Verified brands only
            </button>
          </div>

          {/* Minimum payout */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#525252] mb-3">Minimum Payout</p>
            <div className="flex items-center gap-2 flex-wrap">
              {PAYOUT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPendingMinPayout(opt.value)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                    pendingMinPayout === opt.value
                      ? "bg-[#0A0A0A] text-white"
                      : "bg-[#F9F9F8] border border-[#E5E5E5] text-[#525252] hover:border-[#0A0A0A]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language filter */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#525252] mb-3">Content Language</p>
            <div className="flex flex-wrap gap-2">
              {ALL_LANGUAGES.map((l) => {
                const active = pendingLanguages.includes(l);
                return (
                  <button
                    key={l}
                    onClick={() => togglePendingLang(l)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.12em] transition-all ${
                      active
                        ? "bg-[#0A0A0A] text-white"
                        : "bg-[#F9F9F8] border border-[#E5E5E5] text-[#525252] hover:border-[#0A0A0A]"
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Apply button */}
          <button
            onClick={applyFilters}
            className="w-full py-4 bg-[#0A0A0A] text-white rounded-2xl font-bold text-sm uppercase tracking-[0.15em] hover:bg-[#E25238] transition-colors"
          >
            Apply Filters
            {(pendingLanguages.length + (pendingMinPayout > 0 ? 1 : 0) + (pendingVerified ? 1 : 0)) > 0 && (
              <span className="ml-2 opacity-70">
                ({pendingLanguages.length + (pendingMinPayout > 0 ? 1 : 0) + (pendingVerified ? 1 : 0)})
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
