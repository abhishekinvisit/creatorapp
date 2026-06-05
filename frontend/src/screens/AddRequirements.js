import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useApp } from "@/context/AppContext";
import { opportunitiesApi } from "@/lib/api";
import { toast } from "sonner";

const CATS = ["Beauty", "Fashion", "Lifestyle", "Fitness", "Food", "Tech"];
const AGES = ["Any Age", "13-17", "18-24", "25-34", "35+"];
const GENDERS = ["All", "Female", "Male", "Non-binary"];
const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Bengali", "Marathi", "Malayalam", "Punjabi"];

export default function AddRequirements() {
  const navigate = useNavigate();
  const { draftOpportunity, publishOpportunity } = useApp();
  const [data, setData] = useState({ category: "", minFollowers: "", age: "", gender: "", location: "", language: [] });
  const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const coverRef = useRef(null);

  const toggleLanguage = (lang) => {
    setData((prev) => ({
      ...prev,
      language: prev.language.includes(lang)
        ? prev.language.filter((l) => l !== lang)
        : [...prev.language, lang],
    }));
  };

  const handleCoverFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 3 * 1024 * 1024) { toast.error("Image must be under 3MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setCoverUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      const payload = {
        title: draftOpportunity.title || "Untitled Campaign",
        pitch: draftOpportunity.description || draftOpportunity.title || "",
        description: draftOpportunity.description || "",
        payout: parseInt(draftOpportunity.payout || 0),
        creators_needed: parseInt(draftOpportunity.creatorsNeeded || 5),
        deadline: draftOpportunity.deadline || "",
        category: data.category || "Lifestyle",
        cover_url: coverUrl || draftOpportunity.coverUrl || "",
        requirements: [
          data.minFollowers ? `Min ${data.minFollowers} followers` : "",
          data.age ? `Age: ${data.age}` : "",
          data.gender ? `Gender: ${data.gender}` : "",
          data.location ? `Location: ${data.location}` : "",
        ].filter(Boolean),
        languages: data.language,
      };
      const created = await opportunitiesApi.create(payload);
      publishOpportunity({
        id: created.id,
        title: created.title,
        description: created.description || created.pitch || "",
        pitch: created.pitch || "",
        payout: created.payout || 0,
        needed: created.creators_needed || 1,
        deadline: created.deadline || "",
        category: created.category || "",
        cover_url: created.cover_url || "",
        applicants: 0,
        status: "active",
        languages: created.languages || [],
        requirements: created.requirements || [],
      });
      toast.success("Opportunity published! 🚀");
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
          <Pills options={CATS} value={data.category} onChange={(v) => setData({ ...data, category: v })} testId="req-cat" />
        </Field>

        <Field label="Minimum Followers">
          <input
            data-testid="req-followers"
            type="number"
            value={data.minFollowers}
            onChange={(e) => setData({ ...data, minFollowers: e.target.value })}
            placeholder="e.g. 5000"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white placeholder-neutral-500 font-medium focus:border-[#E25238]"
          />
        </Field>

        <Field label="Audience Age Group">
          <Pills options={AGES} value={data.age} onChange={(v) => setData({ ...data, age: v })} testId="req-age" />
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

        <Field label="Cover Image (Optional)">
          <div
            data-testid="cover-upload-area"
            onClick={() => coverRef.current?.click()}
            className="w-full rounded-2xl overflow-hidden border-2 border-dashed border-white/15 cursor-pointer hover:border-[#E25238] transition-colors"
          >
            {coverUrl ? (
              <div className="relative">
                <img src={coverUrl} alt="cover" className="w-full h-40 object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); setCoverUrl(""); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#EF4444] transition-colors"
                >
                  <span className="text-xs font-bold">✕</span>
                </button>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-neutral-400">
                <Camera size={24} />
                <span className="font-bold text-sm">Upload Cover Image</span>
                <span className="text-xs">JPG, PNG up to 3MB</span>
              </div>
            )}
          </div>
          <input
            ref={coverRef}
            data-testid="req-cover-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverFile}
          />
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
