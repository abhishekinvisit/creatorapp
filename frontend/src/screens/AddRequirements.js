import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

const CATS = ["Beauty", "Fashion", "Lifestyle", "Fitness", "Food", "Tech"];
const AGES = ["13-17", "18-24", "25-34", "35+"];
const GENDERS = ["All", "Female", "Male", "Non-binary"];

export default function AddRequirements() {
  const navigate = useNavigate();
  const { draftOpportunity, publishOpportunity } = useApp();
  const [data, setData] = useState({ category: "", minFollowers: "", age: "", gender: "", location: "", images: [] });

  const handlePublish = () => {
    publishOpportunity({ ...draftOpportunity, ...data, creatorsNeeded: parseInt(draftOpportunity.creatorsNeeded || 5) });
    toast.success("Opportunity published successfully");
    navigate("/brand/dashboard");
  };

  return (
    <div data-testid="add-requirements" className="min-h-full bg-[#0A0A0A] text-white pb-32">
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

        <Field label="Add Product Images (Optional)">
          <button
            data-testid="req-add-images"
            onClick={() => toast.info("Image upload demo only")}
            className="w-full bg-white/5 border-2 border-dashed border-white/15 rounded-2xl py-8 flex flex-col items-center justify-center gap-2 hover:border-[#E25238] transition-colors"
          >
            <Plus size={24} />
            <span className="font-bold text-sm">Add Images</span>
          </button>
        </Field>
      </div>

      <div className="fixed bottom-0 left-0 right-0 sm:relative sm:mt-8">
        <div className="px-5 py-4 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent">
          <button
            data-testid="publish-opportunity"
            onClick={handlePublish}
            className="w-full bg-[#E25238] text-white rounded-full py-5 font-bold hover:bg-[#C9452D] transition-colors"
          >
            Publish Opportunity
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
