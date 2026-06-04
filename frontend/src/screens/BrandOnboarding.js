import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, Camera, Building2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

const TOTAL_STEPS = 3;
const BRAND_CATEGORIES = [
  "Beauty & Skincare", "Fashion & Apparel", "Food & Beverage", "Health & Wellness",
  "Tech & Electronics", "Home & Decor", "Sports & Fitness", "Education",
  "Finance & Fintech", "Travel & Hospitality", "Automotive", "Entertainment",
  "Lifestyle", "FMCG", "Other",
];

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-500 ${
            i < step ? "bg-[#E25238] flex-[2]" : "bg-[#E5E5E5] flex-1"
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

export default function BrandOnboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  // Step 1 — Identity
  const [logoData, setLogoData] = useState("");
  const [brandName, setBrandName] = useState("");

  // Step 2 — Business
  const [brandCategory, setBrandCategory] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  // Step 3 — About
  const [brandBio, setBrandBio] = useState("");

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo must be under 2 MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setLogoData(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (step === 1) {
      if (!brandName.trim()) { toast.error("Please enter your brand name"); return false; }
    }
    if (step === 2) {
      if (!brandCategory) { toast.error("Please select a brand category"); return false; }
      if (!gstNumber.trim()) { toast.error("Please enter your GST number"); return false; }
      if (gstNumber.trim().length < 15) { toast.error("GST number must be at least 15 characters"); return false; }
    }
    return true;
  };

  const next = async () => {
    if (!validate()) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        brand_name: brandName,
        brand_category: brandCategory,
        gst_number: gstNumber,
        brand_bio: brandBio,
        logo_data: logoData.length > 500 ? "" : logoData, // skip large base64 to backend
      };
      await fetch("/api/onboarding/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (_) {}
    completeOnboarding({
      brandName,
      brandCategory,
      gstNumber,
      brandBio,
      logoData,
    });
    setSaving(false);
    toast.success("Brand profile created! Let's find creators. 🚀");
    navigate("/brand/dashboard");
  };

  const back = () => {
    if (step === 1) return;
    setStep((s) => s - 1);
  };

  const stepLabels = ["Brand Identity", "Business Details", "About Your Brand"];
  const stepHeadings = [
    ["Set up your", "brand profile"],
    ["Business", "details"],
    ["Tell creators", "about you"],
  ];
  const stepSubs = [
    "Start with your brand name and logo.",
    "Required for verified brand status.",
    "A short intro shown to creators.",
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

        {/* ── Step 1: Identity ── */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Logo upload */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="relative w-24 h-24 rounded-[24px] bg-white border-2 border-dashed border-[#E5E5E5] hover:border-[#0A0A0A] transition-colors overflow-hidden flex items-center justify-center group"
              >
                {logoData ? (
                  <img src={logoData} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-[#B0B0B0] group-hover:text-[#0A0A0A] transition-colors">
                    <Camera size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Logo</span>
                  </div>
                )}
                {logoData && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                  </div>
                )}
              </button>
              <p className="text-[11px] text-[#525252] font-medium">Tap to upload logo (optional)</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            </div>

            <div>
              <Label required>Brand Name</Label>
              <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Glow Skincare" />
            </div>
          </div>
        )}

        {/* ── Step 2: Business ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <Label required>Brand Category</Label>
              <div className="flex flex-wrap gap-2">
                {BRAND_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setBrandCategory(c)}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                      brandCategory === c
                        ? "bg-[#0A0A0A] text-white"
                        : "bg-white border-2 border-[#E5E5E5] text-[#525252] hover:border-[#0A0A0A]"
                    }`}
                  >
                    {brandCategory === c && <Check size={10} className="inline mr-1 -mt-0.5" />}
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label required>Company GST Number</Label>
              <Input
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 29ABCDE1234F1Z5"
                maxLength={15}
              />
              <p className="text-[11px] text-[#525252] mt-1.5 font-medium">
                15-character GST identification number
              </p>
            </div>
          </div>
        )}

        {/* ── Step 3: About ── */}
        {step === 3 && (
          <div>
            <Label>Brand Bio / About</Label>
            <textarea
              value={brandBio}
              onChange={(e) => setBrandBio(e.target.value)}
              placeholder="Tell creators what your brand is about, what you stand for, and what kind of collaborations you're looking for…"
              rows={6}
              maxLength={500}
              className="w-full px-4 py-4 bg-white border-2 border-[#E5E5E5] rounded-2xl text-[#0A0A0A] font-medium text-sm outline-none focus:border-[#0A0A0A] transition-colors placeholder:text-[#B0B0B0] resize-none"
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[11px] text-[#525252] font-medium">Optional — but helps attract creators</p>
              <p className="text-[11px] text-[#525252] font-medium">{brandBio.length}/500</p>
            </div>

            {/* Brand summary card */}
            {brandName && (
              <div className="mt-6 bg-white rounded-2xl border border-[#E5E5E5] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#525252] mb-3">Profile Preview</p>
                <div className="flex items-center gap-3">
                  {logoData ? (
                    <img src={logoData} alt={brandName} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A0A0A] to-[#525252] flex items-center justify-center">
                      <Building2 size={20} className="text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-display font-bold text-sm text-[#0A0A0A]">{brandName}</p>
                    <p className="text-[11px] text-[#525252] font-medium">{brandCategory}</p>
                  </div>
                </div>
                {brandBio && (
                  <p className="text-xs text-[#525252] font-medium mt-3 leading-relaxed line-clamp-3">{brandBio}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pt-4 pb-8 mt-4">
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
              Creating profile…
            </span>
          ) : step === TOTAL_STEPS ? (
            <>
              Launch My Brand <Check size={16} />
            </>
          ) : (
            <>
              Continue <ChevronRight size={16} />
            </>
          )}
        </button>

        {step === TOTAL_STEPS && (
          <p className="text-center text-[11px] text-[#525252] font-medium mt-3">
            You can always update this from Profile Settings
          </p>
        )}
      </div>
    </div>
  );
}
