import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, X, BadgeCheck, MapPin, Users, Check } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { APPLICANTS } from "@/data/mockData";

const CATEGORIES = ["All", "Beauty", "Fashion", "Lifestyle", "Fitness", "Food", "Tech", "Travel"];
const AGES = ["Any", "13-17", "18-24", "25-34", "35+"];
const GENDERS = ["Any", "Female", "Male", "Non-binary"];
const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Bengali", "Marathi", "Malayalam", "Punjabi"];
const FOLLOWER_BUCKETS = [
  { id: "any", label: "Any", min: 0 },
  { id: "1k", label: "1K+", min: 1000 },
  { id: "10k", label: "10K+", min: 10000 },
  { id: "50k", label: "50K+", min: 50000 },
  { id: "100k", label: "100K+", min: 100000 },
];

const DEFAULT_FILTERS = {
  category: "All",
  age: "Any",
  gender: "Any",
  location: "",
  followers: "any",
  language: [],
};

export default function BrandDiscover() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const activeCount =
    (filters.category !== "All" ? 1 : 0) +
    (filters.age !== "Any" ? 1 : 0) +
    (filters.gender !== "Any" ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.followers !== "any" ? 1 : 0) +
    (filters.language.length > 0 ? 1 : 0);

  const results = useMemo(() => {
    const minFollowers = FOLLOWER_BUCKETS.find((b) => b.id === filters.followers)?.min || 0;
    const term = q.trim().toLowerCase();
    return APPLICANTS.filter((c) => {
      if (term && !c.name.toLowerCase().includes(term) && !c.handle.toLowerCase().includes(term)) return false;
      if (filters.category !== "All" && !(c.categories || []).includes(filters.category)) return false;
      if (filters.age !== "Any" && c.age !== filters.age) return false;
      if (filters.gender !== "Any" && c.gender !== filters.gender) return false;
      if (filters.location && !(c.location || "").toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (c.followersNum < minFollowers) return false;
      if (filters.language.length > 0 && !filters.language.some((l) => (c.language || []).includes(l))) return false;
      return true;
    });
  }, [q, filters]);

  const reset = () => setFilters(DEFAULT_FILTERS);

  return (
    <div data-testid="brand-discover" className="min-h-full bg-[#0A0A0A] text-white pb-8">
      <TopBar title="Discover Creators" dark showBack={false} />

      <div className="px-5">
        {/* Search + filter */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 py-3.5">
            <Search size={16} className="text-neutral-400" />
            <input
              data-testid="discover-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search creators..."
              className="flex-1 outline-none px-3 text-sm font-medium bg-transparent text-white placeholder-neutral-500"
            />
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
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 mb-3">
          {results.length} creator{results.length === 1 ? "" : "s"}
        </p>

        <div className="space-y-3">
          {results.map((c, idx) => (
            <button
              key={c.id}
              data-testid={`creator-${c.id}`}
              onClick={() => navigate(`/brand/creator/${c.id}`)}
              className="w-full text-left bg-white/5 border border-white/10 rounded-3xl p-4 flex items-start gap-4 hover:bg-white/10 transition-all animate-fade-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <img src={c.avatar} alt={c.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="font-display font-bold text-white truncate">{c.name}</h4>
                  <BadgeCheck size={14} className="text-[#E25238] flex-shrink-0" fill="#E25238" stroke="#0A0A0A" />
                </div>
                <p className="text-xs text-neutral-400 font-medium truncate">{c.handle}</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-neutral-300 font-medium">
                    <Users size={11} className="text-[#E25238]" />
                    <span className="font-bold text-white">{c.followers}</span>
                  </span>
                  <span className="flex items-center gap-1 text-neutral-300 font-medium">
                    <MapPin size={11} className="text-[#E25238]" />
                    {c.location}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {(c.categories || []).slice(0, 3).map((cat) => (
                    <span key={cat} className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider text-neutral-300">
                      {cat}
                    </span>
                  ))}
                  <span className="text-[10px] font-medium text-neutral-500">· {c.age} · {c.gender}</span>
                </div>
              </div>
            </button>
          ))}

          {results.length === 0 && (
            <div className="text-center py-16">
              <p className="font-display font-bold text-lg text-white">No creators match these filters</p>
              <p className="text-sm text-neutral-400 mt-1 font-medium">Try relaxing your filters or search term.</p>
              <button data-testid="reset-empty" onClick={reset} className="mt-5 px-6 py-3 bg-[#E25238] text-white rounded-full font-bold text-sm">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

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
