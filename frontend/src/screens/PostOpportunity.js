import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export default function PostOpportunity() {
  const navigate = useNavigate();
  const { setDraftOpportunity } = useApp();
  const [data, setData] = useState({ title: "", description: "", payout: "", creatorsNeeded: "", deadline: "", coverUrl: "" });
  const coverRef = useRef(null);

  const handleCoverFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 3 * 1024 * 1024) { toast.error("Image must be under 3MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setData((d) => ({ ...d, coverUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleContinue = () => {
    if (!data.title || !data.description) {
      toast.error("Please fill in title and description");
      return;
    }
    setDraftOpportunity(data);
    navigate("/brand/requirements");
  };

  return (
    <div data-testid="post-opportunity" className="min-h-full bg-[#0A0A0A] text-white flex flex-col pb-2">
      <TopBar title="Post Opportunity" dark />

      <div className="px-5 space-y-5">
        {/* Cover image upload */}
        <Field label="Cover Image (Optional)">
          <div
            data-testid="cover-upload-area"
            onClick={() => coverRef.current?.click()}
            className="w-full rounded-2xl overflow-hidden border-2 border-dashed border-white/15 cursor-pointer hover:border-[#E25238] transition-colors"
          >
            {data.coverUrl ? (
              <div className="relative">
                <img src={data.coverUrl} alt="cover" className="w-full h-40 object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); setData((d) => ({ ...d, coverUrl: "" })); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#EF4444] transition-colors"
                >
                  <span className="text-xs font-bold">✕</span>
                </button>
              </div>
            ) : (
              <div className="py-7 flex flex-col items-center justify-center gap-2 text-neutral-400">
                <Camera size={24} />
                <span className="font-bold text-sm">Upload Cover Image</span>
                <span className="text-xs">JPG, PNG up to 3MB</span>
              </div>
            )}
          </div>
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverFile}
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

        <Field label="Payout (per reel) ₹">
          <input
            data-testid="campaign-payout"
            type="number"
            value={data.payout}
            onChange={(e) => setData({ ...data, payout: e.target.value })}
            placeholder="Enter amount"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 outline-none text-white placeholder-neutral-500 font-medium focus:border-[#E25238]"
          />
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
