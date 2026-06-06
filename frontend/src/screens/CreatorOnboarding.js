import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, Globe } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { onboardingApi } from "@/lib/api";
import { toast } from "sonner";

import { MASTER_CATEGORIES } from "@/data/categories";

const TOTAL_STEPS = 4;
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia", "UAE", "Singapore", "Germany", "France", "Japan", "Other"];

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-500 ${
            i < step ? "bg-[#E25238] flex-[2]" : i === step - 1 ? "bg-[#E25238] flex-[2]" : "bg-[#E5E5E5] flex-1"
          }`}
        />
      ))}
    </div>
  );
}

function Label({ children, required }) {
  return (
    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#525252] mb-2">
      {children}{required && <span className="text-[#E25238] ml-0.5">*</span>}
    </p>
  );
}

function Input({ value, onChange, placeholder, type = "text", ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-4 bg-white border-2 border-[#E5E5E5] rounded-2xl text-[#0A0A0A] font-medium text-sm outline-none focus:border-[#0A0A0A] transition-colors placeholder:text-[#B0B0B0]"
      {...props}
    />
  );
}

export default function CreatorOnboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 — Personal
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");

  // Step 2 — Location
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("India");

  // Step 3 — Categories
  const [categories, setCategories] = useState([]);
  const [catSearch, setCatSearch] = useState("");

  // Step 4 — Instagram
  const [instagramUrl, setInstagramUrl] = useState("");
  const [followersCount, setFollowersCount] = useState("");
  const [yearsExp, setYearsExp] = useState("");

  const toggleCategory = (c) => {
    setCategories((prev) =>
      prev.includes(c)
        ? prev.filter((x) => x !== c)
        : prev.length < 3
        ? [...prev, c]
        : prev
    );
  };

  const validate = () => {
    if (step === 1) {
      if (!fullName.trim()) { toast.error("Please enter your full name"); return false; }
      if (!gender) { toast.error("Please select your gender"); return false; }
      if (!age || isNaN(age) || Number(age) < 13 || Number(age) > 100) { toast.error("Please enter a valid age (13–100)"); return false; }
    }
    if (step === 2) {
      if (!city.trim()) { toast.error("Please enter your city"); return false; }
      if (!country) { toast.error("Please select your country"); return false; }
    }
    if (step === 3) {
      if (categories.length === 0) { toast.error("Select at least one category"); return false; }
    }
    if (step === 4) {
      if (!instagramUrl.trim()) { toast.error("Please enter your Instagram profile link"); return false; }
      if (!followersCount || isNaN(followersCount) || Number(followersCount) < 0) { toast.error("Please enter a valid follower count"); return false; }
    }
    return true;
  };

  const next = async () => {
    if (!validate()) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    // Final step — save
    setSaving(true);
    try {
      await onboardingApi.completeCreator({
        full_name: fullName,
        gender,
        age: Number(age),
        area,
        city,
        country,
        categories,
        instagram_url: instagramUrl,
        followers_count: Number(followersCount),
        years_experience: Number(yearsExp) || 0,
      });
    } catch (_) {
      // Non-fatal — we still complete onboarding locally
    }
    completeOnboarding({
      fullName,
      gender,
      age: Number(age),
      location: [area, city, country].filter(Boolean).join(", "),
      categories,
      instagramUrl,
      followersCount: Number(followersCount),
      yearsExp: Number(yearsExp) || 0,
    });
    setSaving(false);
    toast.success("Welcome to OLLCOLLAB! 🎉");
    navigate("/home");
  };

  const back = () => {
    if (step === 1) return;
    setStep((s) => s - 1);
  };

  const stepLabels = ["Personal Info", "Location", "Your Niche", "Instagram"];
  const stepHeadings = [
    ["Tell us about", "yourself"],
    ["Where are", "you based?"],
    ["What do you", "create?"],
    ["Your Instagram", "presence"],
  ];
  const stepSubs = [
    "Help brands find the right creator.",
    "Brands look for local creators too.",
    "Pick up to 3 content categories.",
    "Link your profile so brands can verify you.",
  ];

  return (
    <div className="min-h-full bg-[#F9F9F8] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-2 flex items-center gap-3">
        {step > 1 ? (
          <button onClick={back} className="w-10 h-10 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center">
            <ChevronLeft size={18} />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#525252]">
          Step {step} of {TOTAL_STEPS} · {stepLabels[step - 1]}
        </p>
      </div>

      {/* Progress */}
      <div className="px-5 pt-2">
        <ProgressBar step={step} />
      </div>

      {/* Headings */}
      <div className="px-5 mb-7">
        <h1 className="font-display font-black text-[2.1rem] leading-[1.05] tracking-[-0.03em] text-[#0A0A0A]">
          {stepHeadings[step - 1][0]}<br />{stepHeadings[step - 1][1]}
        </h1>
        <p className="text-sm text-[#525252] font-medium mt-2">{stepSubs[step - 1]}</p>
      </div>

      {/* Step content */}
      <div className="flex-1 px-5 overflow-y-auto">

        {/* ── Step 1: Personal ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <Label required>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Priya Sharma" />
            </div>

            <div>
              <Label required>Gender</Label>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                      gender === g
                        ? "bg-[#0A0A0A] text-white"
                        : "bg-white border-2 border-[#E5E5E5] text-[#525252] hover:border-[#0A0A0A]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label required>Age</Label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Your age"
                min="13"
                max="100"
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Location ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <Label>Area / Neighbourhood</Label>
              <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Bandra, Koramangala" />
            </div>
            <div>
              <Label required>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" />
            </div>
            <div>
              <Label required>Country</Label>
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-4 bg-white border-2 border-[#E5E5E5] rounded-2xl text-[#0A0A0A] font-medium text-sm outline-none focus:border-[#0A0A0A] transition-colors appearance-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Globe size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#525252] pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Categories ── */}
        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[#525252] font-medium">Select up to 3</p>
              <span className={`text-xs font-black ${categories.length === 3 ? "text-[#E25238]" : "text-[#525252]"}`}>
                {categories.length}/3
              </span>
            </div>
            <input
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              placeholder="Search categories…"
              className="w-full px-4 py-3 mb-3 bg-white border-2 border-[#E5E5E5] rounded-2xl text-[#0A0A0A] font-medium text-sm outline-none focus:border-[#0A0A0A] transition-colors placeholder:text-[#B0B0B0]"
            />
            <div className="flex flex-wrap gap-2">
              {MASTER_CATEGORIES.filter((c) => c.toLowerCase().includes(catSearch.toLowerCase())).map((c) => {
                const active = categories.includes(c);
                const disabled = !active && categories.length === 3;
                return (
                  <button
                    key={c}
                    onClick={() => toggleCategory(c)}
                    disabled={disabled}
                    className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                      active
                        ? "bg-[#0A0A0A] text-white"
                        : disabled
                        ? "bg-white border-2 border-[#E5E5E5] text-[#B0B0B0] cursor-not-allowed"
                        : "bg-white border-2 border-[#E5E5E5] text-[#525252] hover:border-[#0A0A0A]"
                    }`}
                  >
                    {active && <Check size={12} className="inline mr-1.5 -mt-0.5" />}
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 4: Instagram ── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <Label required>Instagram Profile Link</Label>
              <Input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                type="url"
              />
              <p className="text-[11px] text-[#525252] mt-1.5 font-medium">
                Full link — e.g. https://instagram.com/priya.creates
              </p>
            </div>

            <div>
              <Label required>Instagram Followers</Label>
              <Input
                type="number"
                value={followersCount}
                onChange={(e) => setFollowersCount(e.target.value)}
                placeholder="e.g. 12500"
                min="0"
              />
            </div>

            <div>
              <Label>Years of Experience</Label>
              <Input
                type="number"
                value={yearsExp}
                onChange={(e) => setYearsExp(e.target.value)}
                placeholder="e.g. 2  (optional)"
                min="0"
                max="30"
              />
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pt-4 pb-8 mt-4">
        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i + 1 === step ? "w-5 h-2 bg-[#0A0A0A]" : i + 1 < step ? "w-2 h-2 bg-[#E25238]" : "w-2 h-2 bg-[#E5E5E5]"
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={saving}
          className="w-full py-4 bg-[#0A0A0A] text-white rounded-2xl font-bold text-sm uppercase tracking-[0.15em] hover:bg-[#E25238] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/>
              </svg>
              Saving…
            </span>
          ) : step === TOTAL_STEPS ? (
            <>
              Complete Setup <Check size={16} />
            </>
          ) : (
            <>
              Continue <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
