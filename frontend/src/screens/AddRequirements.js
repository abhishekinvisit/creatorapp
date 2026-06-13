import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { useApp } from "@/context/AppContext";
import { opportunitiesApi } from "@/lib/api";
import { toast } from "sonner";

import { MASTER_CATEGORIES as CATS } from "@/data/categories";
const GENDERS = ["All", "Female", "Male", "Non-binary"];
const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Bengali", "Marathi", "Malayalam", "Punjabi"];

const MIN_AGE = 13;
const MAX_AGE = 65;

export default function AddRequirements() {
  const navigate = useNavigate();
  const { draftOpportunity, publishOpportunity } = useApp();
  const [data, setData] = useState({
    category: "",
    followersMin: "",
    followersMax: "",
    ageMin: MIN_AGE,
    ageMax: MAX_AGE,
    gender: "",
    location: "",
    language: [],
  });
  const [saving, setSaving] = useState(false);

  const toggleLanguage = (lang) => {
    setData((prev) => ({
      ...prev,
      language: prev.language.includes(lang)
        ? prev.language.filter((l) => l !== lang)
        : [...prev.language, lang],
    }));
  };

  const handleAgeMin = (val) => {
    const v = parseInt(val);
    setData((prev) => {
      if (v > prev.ageMax) return { ...prev, ageMin: v, ageMax: v };
      return { ...prev, ageMin: v };
    });
  };

  const handleAgeMax = (val) => {
    const v = parseInt(val);
    setData((prev) => {
      if (v < prev.ageMin) return { ...prev, ageMin: v, ageMax: v };
      return { ...prev, ageMax: v };
    });
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      const payoutMin = parseInt(draftOpportunity.payoutMin || 0);
      const payoutMax = parseInt(draftOpportunity.payoutMax || 0);
      const followersMin = parseInt(data.followersMin || 0);
      const followersMax = parseInt(data.followersMax || 0);

      const ageRange =
        data.ageMin === MIN_AGE && data.ageMax === MAX_AGE
          ? ""
          : `${data.ageMin}-${data.ageMax}`;

      const requirements = [
        ageRange ? `Age: ${ageRange}` : "",
        data.gender && data.gender !== "All" ? `Gender: ${data.gender}` : "",
        data.location ? `Location: ${data.location}` : "",
      ].filter(Boolean);

      const payload = {
        title: draftOpportunity.title || "Untitled Campaign",
        pitch: draftOpportunity.description || draftOpportunity.title || "",
        description: draftOpportunity.description || "",
        payout: payoutMax || payoutMin || 0,
        payout_min: payoutMin,
        payout_max: payoutMax,
        followers_min: followersMin,
        followers_max: followersMax,
        age_min: data.ageMin,
        age_max: data.ageMax,
        creators_needed: parseInt(draftOpportunity.creatorsNeeded || 5),
        deadline: draftOpportunity.deadline || "",
        category: data.category || "Lifestyle",
        cover_url: "",
        requirements,
        languages: data.language,
      };
      const created = await opportunitiesApi.create(payload);
      publishOpportunity({
        id: created.id,
        title: created.title,
        description: created.description || created.pitch || "",
        pitch: created.pitch || "",
        payout: created.payout || 0,
        payoutMin: created.payout_min || 0,
        payoutMax: created.payout_max || 0,
        followersMin: created.followers_min || 0,
        followersMax: created.followers_max || 0,
        needed: created.creators_needed || 1,
        deadline: created.deadline || "",
        category: created.category || "",
        cover_url: created.cover_url || "",
        applicants: 0,
        status: "active",
        languages: created.languages || [],
        requirements: created.requirements || [],
      });
      toast.success("Opportunity published! \uD83D\uDE80");
      navigate("/brand/dashboard");
    } catch (err) {
      toast.error(err.message || "Failed to publish. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="add-requirements" className="min-h-full bg-[#0A0A0A] text-white flex flex-col pb-2">
      <TopBar title="Add Requirements" dark />

      <div className="px-5 space-y-5">
        <Field label="Category">
          <SearchablePills options={CATS} value={data.category} onChange={(v) => setData({ ...data, category: v })} testId="req-cat" />
        </Field>

        <Field label="Follower Range Required">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 mb-1.5">Min Followers</p>
              <input
                data-testid="req-followers-min"
                type="number"
                value={data.followersMin}
                onChange={(e) => setData({ ...data, followersMin: e.target.value })}
                placeholder="e.g. 5000"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white placeholder-neutral-500 font-medium focus:border-[#E25238]"
              />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 mb-1.5">Max Followers</p>
              <input
                data-testid="req-followers-max"
                type="number"
                value={data.followersMax}
                onChange={(e) => setData({ ...data, followersMax: e.target.value })}
                placeholder="e.g. 100000"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white placeholder-neutral-500 font-medium focus:border-[#E25238]"
              />
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5 font-medium">Leave blank to accept all follower counts</p>
        </Field>

        <Field label="Audience Age Range">
          <div className="pt-2 pb-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">Min</span>
              <span className="text-sm font-bold text-white">{data.ageMin} — {data.ageMax}</span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">Max</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={MIN_AGE}
                max={MAX_AGE}
                value={data.ageMin}
                onChange={(e) => handleAgeMin(e.target.value)}
                className="flex-1 h-1.5 rounded-full bg-neutral-700 accent-[#E25238] cursor-pointer"
              />
              <input
                type="range"
                min={MIN_AGE}
                max={MAX_AGE}
                value={data.ageMax}
                onChange={(e) => handleAgeMax(e.target.value)}
                className="flex-1 h-1.5 rounded-full bg-neutral-700 accent-[#E25238] cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1.5 font-medium">Drag to set the age range for this campaign</p>
          </div>
        </Field>

        <Field label="Gender (Audience)">
          <Pills options={GENDERS} value={data.gender} onChange={(v) => setData({ ...data, gender: v })} testId="req-gender" />
        </Field>

        <Field label="Location (Preferred)">
          <input
            data-testid="req-location"
            value={data.location}
            onChange={(e) => setData({ ...data, location: e.target.value })}
            placeholder="e.g. India, Mumbai"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white placeholder-neutral-500 font-medium focus:border-[#E25238]"
          />
        </Field>

        <Field label="Content Language">
          <MultiPills options={LANGUAGES} value={data.language} onToggle={toggleLanguage} testId="req-lang" />
        </Field>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-20 mt-4">
        <div className="px-5 py-4 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent">
          <button
            data-testid="publish-opportunity"
            onClick={handlePublish}
            disabled={saving}
            className="w-full bg-[#E25238] text-white rounded-full py-5 font-bold hover:bg-[#C9452D] transition-colors disabled:opacity-60"
          >
            {saving ? "Publishing..." : "Publish Opportunity"}
          </button>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div>
    <p className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 mb-2">{label}</p>
    {children}
  </div>
);

const Pills = ({ options, value, onChange, testId }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button
        key={o}
        data-testid={`${testId}-${o.toLowerCase()}`}
        onClick={() => onChange(o)}
        className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
          value === o ? "bg-[#E25238] text-white" : "bg-white/5 text-neutral-300 border border-white/10 hover:border-white/30"
        }`}
      >
        {o}
      </button>
    ))}
  </div>
);

const SearchablePills = ({ options, value, onChange, testId }) => {
  const [q, setQ] = React.useState("");
  const filtered = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search categories…"
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none text-white placeholder-neutral-500 text-sm font-medium focus:border-[#E25238] mb-3"
      />
      <div className="flex flex-wrap gap-2">
        {filtered.map((o) => (
          <button
            key={o}
            data-testid={`${testId}-${o.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={() => onChange(o)}
            className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
              value === o ? "bg-[#E25238] text-white" : "bg-white/5 text-neutral-300 border border-white/10 hover:border-white/30"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
};

const MultiPills = ({ options, value, onToggle, testId }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => {
      const active = value.includes(o);
      return (
        <button
          key={o}
          data-testid={`${testId}-${o.toLowerCase()}`}
          onClick={() => onToggle(o)}
          className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
            active ? "bg-[#E25238] text-white" : "bg-white/5 text-neutral-300 border border-white/10 hover:border-white/30"
          }`}
        >
          {o}
        </button>
      );
    })}
  </div>
);
