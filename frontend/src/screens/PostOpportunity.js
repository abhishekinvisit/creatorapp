import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export default function PostOpportunity() {
  const navigate = useNavigate();
  const { setDraftOpportunity } = useApp();
  const [data, setData] = useState({
    title: "",
    description: "",
    payoutMin: "",
    payoutMax: "",
    creatorsNeeded: "",
    deadline: "",
    coverUrl: "",
  });
  const [coverPreview, setCoverPreview] = useState(null);
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be under 3 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCoverPreview(ev.target.result);
      setData((prev) => ({ ...prev, coverUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    setCoverPreview(null);
    setData((prev) => ({ ...prev, coverUrl: "" }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleContinue = () => {
    if (!data.title || !data.description) {
      toast.error("Please fill in title and description");
      return;
    }
    if (data.payoutMin && data.payoutMax && Number(data.payoutMin) > Number(data.payoutMax)) {
      toast.error("Minimum budget cannot exceed maximum budget");
      return;
    }
    setDraftOpportunity(data);
    navigate("/brand/requirements");
  };

  return (
    <div data-testid="post-opportunity" className="min-h-full bg-[#0A0A0A] text-white flex flex-col pb-2">
      <TopBar title="Post Opportunity" dark />

      <div className="px-5 space-y-5">
        <Field label="Campaign Cover Image">
          {coverPreview ? (
            <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "16/7" }}>
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              <button
                onClick={handleRemoveCover}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white text-sm hover:bg-black/90 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full bg-white/5 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 py-8 hover:border-[#E25238]/60 hover:bg-white/[0.07] transition-all"
            >
              <span className="text-3xl">🖼️</span>
              <span className="text-sm font-semibold text-neutral-300">Upload a cover image</span>
              <span className="text-xs text-neutral-500">JPG, PNG or WebP · Max 3 MB</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />
        </Field>

        <Field label="Campaign Title">
          <input
            data-testid="campaign-title"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            placeholder="e.g. Vitamin C Serum Promotion"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white placeholder-neutral-500 font-medium focus:border-[#E25238]"
          />
        </Field>

        <Field label="Campaign Description">
          <textarea
            data-testid="campaign-desc"
            rows={4}
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            placeholder="Tell creators about your campaign..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white placeholder-neutral-500 font-medium resize-none focus:border-[#E25238]"
          />
        </Field>

        <Field label="Budget Range (₹ per reel)">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 mb-1.5">Min ₹</p>
              <input
                data-testid="campaign-payout-min"
                type="number"
                value={data.payoutMin}
                onChange={(e) => setData({ ...data, payoutMin: e.target.value })}
                placeholder="e.g. 500"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white placeholder-neutral-500 font-medium focus:border-[#E25238]"
              />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 mb-1.5">Max ₹</p>
              <input
                data-testid="campaign-payout-max"
                type="number"
                value={data.payoutMax}
                onChange={(e) => setData({ ...data, payoutMax: e.target.value })}
                placeholder="e.g. 2000"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white placeholder-neutral-500 font-medium focus:border-[#E25238]"
              />
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5 font-medium">Creators can see the full range and propose a counter offer</p>
        </Field>

        <Field label="Number of Creators Needed">
          <input
            data-testid="campaign-creators"
            type="number"
            value={data.creatorsNeeded}
            onChange={(e) => setData({ ...data, creatorsNeeded: e.target.value })}
            placeholder="Enter number"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white placeholder-neutral-500 font-medium focus:border-[#E25238]"
          />
        </Field>

        <Field label="Deadline">
          <input
            data-testid="campaign-deadline"
            type="date"
            value={data.deadline}
            onChange={(e) => setData({ ...data, deadline: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white placeholder-neutral-500 font-medium focus:border-[#E25238]"
          />
        </Field>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-20 mt-4">
        <div className="px-5 py-4 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent">
          <button
            data-testid="post-continue"
            onClick={handleContinue}
            className="w-full bg-[#E25238] text-white rounded-full py-5 font-bold hover:bg-[#C9452D] transition-colors"
          >
            Continue →
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
