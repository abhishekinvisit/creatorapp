import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, X, MapPin, Users, Check, ChevronDown, Bookmark } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { creatorsApi } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const CATEGORIES = ["All", "Beauty", "Fashion", "Lifestyle", "Fitness", "Food", "Tech", "Travel"];
const AGES = ["Any", "13-17", "18-24", "25-34", "35+"];
const GENDERS = ["Any", "Female", "Male", "Non-binary"];
const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Bengali", "Marathi", "Malayalam", "Punjabi"];
const FOLLOWER_BUCKETS = [
  { id: "any",  label: "Any",   min: 0 },
  { id: "1k",   label: "1K+",   min: 1000 },
  { id: "10k",  label: "10K+",  min: 10000 },
  { id: "50k",  label: "50K+",  min: 50000 },
  { id: "100k", label: "100K+", min: 100000 },
];
const SORT_OPTIONS = [
  { id: "followers",      label: "Most Followers" },
  { id: "recent",        label: "Recently Updated" },
  { id: "collaborations", label: "Most Collabs" },
  { id: "name",          label: "Name (A–Z)" },
];

const DEFAULT_FILTERS = {
  category: "All",
  age: "Any",
  gender: "Any",
  location: "",
  followers: "any",
  language: [],
};

function formatFollowers(n) {
  if (!n) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function mapCreator(c) {
  return {
    id: c.user_id || c.creator_user_id,
    name: c.full_name || "Creator",
    handle: c.handle || "",
    avatar: c.avatar_url || "",
    location: c.location || "",
    followers: formatFollowers(c.followers_count),
    followersNum: c.followers_count || 0,
    collaborations: c.collaborations_count || 0,
    categories: c.categories || [],
    languages: c.languages || [],
    age: c.age || "",
    gender: c.gender || "",
    bio: c.bio || "",
  };
}

export default function BrandDiscover() {
  const navigate = useNavigate();
  const { isCreatorSaved, saveCreator, unsaveCreator } = useApp();
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("followers");
  const [showSort, setShowSort] = useState(false);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch creators from API
  useEffect(() => {
    setLoading(true);
    const params = { sort_by: sortBy };
    if (filters.category !== "All") params.category = filters.category;
    if (filters.followers !== "any") {
      const bucket = FOLLOWER_BUCKETS.find((b) => b.id === filters.followers);
      if (bucket) params.min_followers = bucket.min;
    }
    if (filters.language.length === 1) params.language = filters.language[0];
    creatorsApi.list(params)
      .then((data) => setCreators(data.map(mapCreator)))
      .catch(() => setCreators([]))
      .finally(() => setLoading(false));
  }, [sortBy, filters.category, filters.followers]);

  const activeCount =
    (filters.category !== "All" ? 1 : 0) +
    (filters.age !== "Any" ? 1 : 0) +
    (filters.gender !== "Any" ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.followers !== "any" ? 1 : 0) +
    (filters.language.length > 0 ? 1 : 0);

  // Client-side filtering for fields not passed to API (age, gender, location, languages[multi])
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return creators.filter((c) => {
      if (term && !c.name.toLowerCase().includes(term) && !c.handle.toLowerCase().includes(term)) return false;
      if (filters.age !== "Any" && String(c.age) !== filters.age) return false;
      if (filters.gender !== "Any" && c.gender !== filters.gender) return false;
      if (filters.location && !(c.location || "").toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.language.length > 1 && !filters.language.some((l) => (c.languages || []).includes(l))) return false;
      return true;
    });
  }, [creators, q, filters.age, filters.gender, filters.location, filters.language]);

  const reset = () => setFilters(DEFAULT_FILTERS);
  const currentSort = SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0];

  return (
    <div data-testid="brand-discover" className="min-h-full bg-[#0A0A0A] text-white pb-8">
      <TopBar title="Discover Creators" dark showBack={false} />

      <div className="px-5">
        {/* Search + filter */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 py-3.5">
            <Search size={16} className="text-neutral-400" />
            <input
              data-testid="discover-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search creators..."
              className="flex-1 outline-none px-3 text-sm font-medium bg-transparent text-white placeholder-neutral-500"
            />
            {q && (
              <button onClick={() => setQ("")} className="text-neutral-400 hover:text-white">
                <X size={15} />
              </button>
            )}
          </div>
          <button
            data-testid="open-filters"
            onClick={() => setShowFilters(true)}
            className="relative w-12 h-12 rounded-2xl bg-[#E25238] flex items-center justify-center hover:bg-[#C9452D] transition-colors"
            aria-label="Open filters"
          >
            <SlidersHorizontal size={16} />
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-[#E25238] text-[10px] font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Sort + results count row */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400">
            {loading ? "Loading…" : `${results.length} creator${results.length === 1 ? "" : "s"}`}
          </p>
          <div className="relative">
            <button
              data-testid="sort-btn"
              onClick={() => setShowSort((s) => !s)}
              className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white"
            >
              {currentSort.label} <ChevronDown size={13} />
            </button>
            {showSort && (
              <div className="absolute right-0 top-6 z-30 bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden shadow-xl min-w-[160px]">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    data-testid={`sort-${s.id}`}
                    onClick={() => { setSortBy(s.id); setShowSort(false); }}
                    className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${
                      sortBy === s.id ? "bg-[#E25238] text-white" : "text-neutral-300 hover:bg-white/5"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active filter chips */}
        {activeCount > 0 && (
          <div data-testid="active-filters" className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-3 mb-1">
            <ActiveChip show={filters.category !== "All"} label={filters.category} onClear={() => setFilters({ ...filters, category: "All" })} />
            <ActiveChip show={filters.age !== "Any"} label={`Age ${filters.age}`} onClear={() => setFilters({ ...filters, age: "Any" })} />
            <ActiveChip show={filters.gender !== "Any"} label={filters.gender} onClear={() => setFilters({ ...filters, gender: "Any" })} />
            <ActiveChip show={!!filters.location} label={filters.location} onClear={() => setFilters({ ...filters, location: "" })} />
            <ActiveChip show={filters.followers !== "any"} label={FOLLOWER_BUCKETS.find((b) => b.id === filters.followers)?.label || ""} onClear={() => setFilters({ ...filters, followers: "any" })} />
            {filters.language.map((l) => (
              <ActiveChip key={l} show label={l} onClear={() => setFilters({ ...filters, language: filters.language.filter((x) => x !== l) })} />
            ))}
            <button data-testid="clear-filters" onClick={reset} className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#E25238] whitespace-nowrap px-2">
              Clear all
            </button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="pt-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-white/10 border-t-[#E25238] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((c, idx) => (
              <div
                key={c.id}
                data-testid={`creator-${c.id}`}
                className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-start gap-4 animate-fade-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <button
                  onClick={() => navigate(`/brand/creator/${c.id}`)}
                  className="flex items-start gap-4 flex-1 min-w-0 text-left"
                >
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E25238] to-[#F59E0B] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-black text-2xl">{c.name[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-white truncate">{c.name}</h4>
                    <p className="text-xs text-neutral-400 font-medium truncate">{c.handle}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-neutral-300 font-medium">
                        <Users size={11} className="text-[#E25238]" />
                        <span className="font-bold text-white">{c.followers}</span>
                      </span>
                      {c.location && (
                        <span className="flex items-center gap-1 text-neutral-300 font-medium">
                          <MapPin size={11} className="text-[#E25238]" />
                          {c.location}
                        </span>
                      )}
                    </div>
                    {c.categories.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {c.categories.slice(0, 3).map((cat) => (
                          <span key={cat} className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider text-neutral-300">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
                <button
                  data-testid={`save-creator-${c.id}`}
                  onClick={() => isCreatorSaved(c.id) ? unsaveCreator(c.id) : saveCreator(c.id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isCreatorSaved(c.id)
                      ? "bg-[#E25238] text-white"
                      : "bg-white/10 text-neutral-400 hover:bg-white/20 hover:text-white"
                  }`}
                  title={isCreatorSaved(c.id) ? "Unsave creator" : "Save creator"}
                >
                  <Bookmark size={15} fill={isCreatorSaved(c.id) ? "currentColor" : "none"} />
                </button>
              </div>
            ))}

            {results.length === 0 && !loading && (
              <div className="text-center py-16">
                <p className="font-display font-bold text-lg text-white">No creators found</p>
                <p className="text-sm text-neutral-400 mt-1 font-medium">Try relaxing your filters or search term.</p>
                {activeCount > 0 && (
                  <button data-testid="reset-empty" onClick={reset} className="mt-5 px-6 py-3 bg-[#E25238] text-white rounded-full font-bold text-sm">
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showSort && (
        <div className="fixed inset-0 z-20" onClick={() => setShowSort(false)} />
      )}

      {showFilters && (
        <FilterSheet
          filters={filters}
          onApply={(next) => { setFilters(next); setShowFilters(false); }}
          onClose={() => setShowFilters(false)}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      )}
    </div>
  );
}

const ActiveChip = ({ show, label, onClear }) => {
  if (!show || !label) return null;
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E25238]/15 text-[#E25238] text-xs font-bold whitespace-nowrap">
      {label}
      <button onClick={onClear} aria-label={`Clear ${label}`} className="w-4 h-4 rounded-full bg-[#E25238] text-white flex items-center justify-center">
        <X size={10} strokeWidth={3} />
      </button>
    </div>
  );
};

const FilterSheet = ({ filters, onApply, onClose, onReset }) => {
  const [draft, setDraft] = useState(filters);

  return (
    <div
      data-testid="filter-sheet"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-[#111111] border border-white/10 text-white rounded-t-3xl sm:rounded-3xl p-6 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-black text-2xl tracking-tight">Filters</h3>
          <button data-testid="filter-close" onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <FilterBlock label="Category">
          <Pills options={CATEGORIES} value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} testId="filter-cat" />
        </FilterBlock>

        <FilterBlock label="Min Followers">
          <Pills
            options={FOLLOWER_BUCKETS.map((b) => b.label)}
            value={FOLLOWER_BUCKETS.find((b) => b.id === draft.followers)?.label}
            onChange={(label) => {
              const next = FOLLOWER_BUCKETS.find((b) => b.label === label);
              setDraft({ ...draft, followers: next ? next.id : "any" });
            }}
            testId="filter-followers"
          />
        </FilterBlock>

        <FilterBlock label="Age">
          <Pills options={AGES} value={draft.age} onChange={(v) => setDraft({ ...draft, age: v })} testId="filter-age" />
        </FilterBlock>

        <FilterBlock label="Gender">
          <Pills options={GENDERS} value={draft.gender} onChange={(v) => setDraft({ ...draft, gender: v })} testId="filter-gender" />
        </FilterBlock>

        <FilterBlock label="Location">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-[#E25238] transition-colors">
            <div className="px-4 py-4 border-r border-white/10">
              <MapPin size={16} className="text-[#E25238]" />
            </div>
            <input
              data-testid="filter-location"
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              placeholder="City, Country"
              className="flex-1 px-3 py-4 outline-none font-medium bg-transparent text-sm text-white placeholder-neutral-500"
            />
          </div>
        </FilterBlock>

        <FilterBlock label="Content Language">
          <MultiPills
            options={LANGUAGES}
            value={draft.language}
            onToggle={(lang) =>
              setDraft({
                ...draft,
                language: draft.language.includes(lang)
                  ? draft.language.filter((l) => l !== lang)
                  : [...draft.language, lang],
              })
            }
            testId="filter-lang"
          />
        </FilterBlock>

        <div className="flex gap-3 pt-3 sticky bottom-0 bg-[#111111]">
          <button
            data-testid="filter-reset"
            onClick={() => { onReset(); setDraft(DEFAULT_FILTERS); }}
            className="flex-1 py-4 rounded-full border border-white/15 font-bold text-sm"
          >
            Reset
          </button>
          <button
            data-testid="filter-apply"
            onClick={() => onApply(draft)}
            className="flex-1 py-4 rounded-full bg-[#E25238] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#C9452D] transition-colors"
          >
            <Check size={14} strokeWidth={2.8} /> Show Results
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterBlock = ({ label, children }) => (
  <div className="mb-6">
    <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#E25238] mb-3">{label}</p>
    {children}
  </div>
);

const Pills = ({ options, value, onChange, testId }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button
        key={o}
        data-testid={`${testId}-${String(o).toLowerCase().replace(/\s+/g, "-").replace(/\+/g, "plus")}`}
        onClick={() => onChange(o)}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
          value === o ? "bg-[#E25238] text-white" : "bg-white/5 text-neutral-300 border border-white/10 hover:border-white/30"
        }`}
      >
        {o}
      </button>
    ))}
  </div>
);

const MultiPills = ({ options, value, onToggle, testId }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => {
      const active = value.includes(o);
      return (
        <button
          key={o}
          data-testid={`${testId}-${o.toLowerCase()}`}
          onClick={() => onToggle(o)}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            active ? "bg-[#E25238] text-white" : "bg-white/5 text-neutral-300 border border-white/10 hover:border-white/30"
          }`}
        >
          {o}
        </button>
      );
    })}
  </div>
);
