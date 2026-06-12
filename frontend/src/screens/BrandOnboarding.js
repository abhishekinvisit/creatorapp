import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Camera, Building2, ChevronDown } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { onboardingApi } from "@/lib/api";
import { toast } from "sonner";

import { MASTER_CATEGORIES } from "@/data/categories";

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
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const [logoData, setLogoData] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandCategory, setBrandCategory] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
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
    if (!brandName.trim()) { toast.error("Please enter your brand name"); return false; }
    if (!brandCategory) { toast.error("Please select a brand category"); return false; }
    if (officialEmail && !officialEmail.includes("@")) { toast.error("Enter a valid email address"); return false; }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onboardingApi.completeBrand({
        brand_name: brandName,
        brand_category: brandCategory,
        gst_number: gstNumber || "",
        official_email: officialEmail || "",
        brand_bio: brandBio,
        logo_data: logoData.length > 500000 ? "" : logoData,
      });
    } catch (_) {}
    completeOnboarding({ brandName, brandCategory, gstNumber, brandBio, logoData });
    setSaving(false);
    toast.success("Brand profile created! Let's find creators. 🚀");
    navigate("/brand/dashboard");
  };

  return (
    <div className="min-h-full bg-[#F9F9F8] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#E25238] mb-1">Brand Account</p>
      </div>

      {/* Progress — single step */}
      <div className="px-5 pt-2 mb-1">
        <div className="h-1 rounded-full bg-[#E25238] w-full" />
      </div>

      <div className="px-5 mb-6 mt-4">
        <h1 className="font-display font-black text-[2.1rem] leading-[1.05] tracking-[-0.03em] text-[#0A0A0A]">
          Set up your<br />brand profile
        </h1>
        <p className="text-sm text-[#525252] font-medium mt-2">Fill in your details to start finding creators.</p>
      </div>

      <div className="flex-1 px-5 overflow-y-auto space-y-5">

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

        {/* Brand Name */}
        <div>
          <Label required>Brand Name</Label>
          <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Glow Skincare" />
        </div>

        {/* Category */}
        <div className="relative">
          <Label required>Brand Category</Label>
          <button
            onClick={() => setCatOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-4 bg-white border-2 border-[#E5E5E5] rounded-2xl text-sm font-medium text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors mt-2"
          >
            <span className={brandCategory ? "text-[#0A0A0A]" : "text-[#B0B0B0]"}>
              {brandCategory || "Select a category"}
            </span>
            <ChevronDown size={16} className={`text-[#525252] transition-transform ${catOpen ? "rotate-180" : ""}`} />
          </button>
          {catOpen && (
            <div className="absolute z-20 mt-1 w-full bg-white border-2 border-[#E5E5E5] rounded-2xl shadow-lg max-h-60 overflow-y-auto p-2">
              <input
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Search categories…"
                className="w-full px-3 py-2 mb-2 bg-[#F9F9F8] border border-[#E5E5E5] rounded-xl text-sm font-medium text-[#0A0A0A] outline-none focus:border-[#0A0A0A] placeholder:text-[#B0B0B0]"
                onClick={(e) => e.stopPropagation()}
              />
              {MASTER_CATEGORIES.filter((c) => c.toLowerCase().includes(catSearch.toLowerCase())).map((c) => (
                <button
                  key={c}
                  onClick={() => { setBrandCategory(c); setCatOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                    brandCategory === c ? "bg-[#0A0A0A] text-white" : "hover:bg-[#F3F3F3] text-[#0A0A0A]"
                  }`}
                >
                  {brandCategory === c && <Check size={12} className="inline mr-1.5 -mt-0.5" />}
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Official Email */}
        <div>
          <Label>Official Email</Label>
          <Input
            type="email"
            value={officialEmail}
            onChange={(e) => setOfficialEmail(e.target.value)}
            placeholder="brand@company.com (optional)"
          />
        </div>

        {/* GST Number */}
        <div>
          <Label>Company GST Number</Label>
          <Input
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
            placeholder="e.g. 29ABCDE1234F1Z5 (optional)"
            maxLength={15}
          />
          <p className="text-[11px] text-[#525252] mt-1.5 font-medium">
            Required for verified brand status
          </p>
        </div>

        {/* Bio */}
        <div>
          <Label>Brand Bio</Label>
          <textarea
            value={brandBio}
            onChange={(e) => setBrandBio(e.target.value)}
            placeholder="Tell creators what your brand is about, what you stand for, and what kind of collaborations you're looking for…"
            rows={4}
            maxLength={500}
            className="w-full px-4 py-4 bg-white border-2 border-[#E5E5E5] rounded-2xl text-[#0A0A0A] font-medium text-sm outline-none focus:border-[#0A0A0A] transition-colors placeholder:text-[#B0B0B0] resize-none"
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[11px] text-[#525252] font-medium">Optional — helps attract creators</p>
            <p className="text-[11px] text-[#525252] font-medium">{brandBio.length}/500</p>
          </div>
        </div>

        {/* Preview */}
        {brandName && (
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-4">
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

      {/* CTA */}
      <div className="px-5 pt-4 pb-8 mt-4">
        <button
          onClick={submit}
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
          ) : (
            <>Launch My Brand <Check size={16} /></>
          )}
        </button>
        <p className="text-center text-[11px] text-[#525252] font-medium mt-3">
          You can always update this from Profile Settings
        </p>
      </div>
    </div>
  );
}
