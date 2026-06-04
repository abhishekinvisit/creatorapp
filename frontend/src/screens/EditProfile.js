import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Plus, X, Link2, Pencil, Upload, MapPin } from "lucide-react";

const InstagramIcon = ({ size = 16, className = "", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { WorkedWithItem } from "@/components/WorkedWithItem";
import { useApp } from "@/context/AppContext";
import { REELS as DEFAULT_REELS, BRANDS } from "@/data/mockData";
import { toast } from "sonner";

const ALL_CATEGORIES = ["Lifestyle", "Fashion", "Beauty", "Fitness", "Food", "Tech", "Travel", "Skincare"];
const ALL_LANGUAGES = ["Hindi", "English", "Tamil", "Telugu", "Kannada", "Marathi", "Bengali", "Gujarati", "Punjabi", "Malayalam"];

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser, accountType, workedWith, setWorkedWith } = useApp();
  const profile = accountType === "brand" ? user.brand : user.creator;

  // Form state
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle || "");
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location || "");
  const [instagramUrl, setInstagramUrl] = useState(profile.instagramUrl || `https://instagram.com/${(profile.handle || "").replace("@", "")}`);
  const [cats, setCats] = useState(profile.category);
  const [languages, setLanguages] = useState(profile.language || []);
  const [reels, setReels] = useState(DEFAULT_REELS);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [editingReel, setEditingReel] = useState(null); // null | "new" | reelId

  const save = async () => {
    if (accountType === "brand") {
      setUser({ ...user, brand: { ...user.brand, name, bio } });
      try {
        const { profileApi } = await import("@/lib/api");
        await profileApi.updateBrand({ brand_name: name, bio });
      } catch (_) {}
    } else {
      setUser({ ...user, creator: { ...user.creator, name, handle, bio, instagramUrl, category: cats, location, language: languages } });
      try {
        const { profileApi } = await import("@/lib/api");
        await profileApi.updateCreator({
          full_name: name,
          handle,
          bio,
          instagram_url: instagramUrl,
          categories: cats,
          location,
          languages,
        });
      } catch (_) {}
    }
    toast.success("Profile updated");
    navigate(-1);
  };

  const toggleCat = (c) => {
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const toggleLang = (l) => {
    setLanguages((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
  };

  const removeBrand = (id) => setWorkedWith((prev) => prev.filter((b) => b.id !== id));
  const addBrand = (b) => {
    if (workedWith.find((w) => w.id === b.id)) return;
    setWorkedWith((prev) => [...prev, b]);
    setShowBrandPicker(false);
  };

  const removeReel = (id) => setReels((prev) => prev.filter((r) => r.id !== id));

  const saveReel = (data) => {
    if (data.id) {
      setReels((prev) => prev.map((r) => (r.id === data.id ? data : r)));
    } else {
      setReels((prev) => [{ ...data, id: `reel-${Date.now()}` }, ...prev]);
    }
    setEditingReel(null);
  };

  return (
    <div data-testid="edit-profile" className="min-h-full bg-[#F9F9F8] pb-10">
      <TopBar
        title="Edit Profile"
        rightSlot={
          <button
            data-testid="save-profile"
            onClick={save}
            className="px-5 py-2 bg-[#0A0A0A] text-white rounded-full text-xs font-bold uppercase tracking-[0.15em]"
          >
            Save
          </button>
        }
      />

      {/* Avatar */}
      <div className="flex justify-center mb-7">
        <div className="relative">
          <img
            src={accountType === "brand" ? "https://images.unsplash.com/photo-1629380108599-ea06489d66f5?w=240&q=80" : user.creator.avatar}
            alt="avatar"
            className="w-28 h-28 rounded-[32px] object-cover ring-4 ring-white shadow-lg"
          />
          <button
            data-testid="change-avatar"
            className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center shadow-lg hover:bg-[#E25238] transition-colors"
          >
            <Camera size={16} />
          </button>
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Identity */}
        <Section label="Identity">
          <Field label="Full Name">
            <Input testId="profile-name" value={name} onChange={setName} />
          </Field>
          {accountType !== "brand" && (
            <Field label="Username">
              <div className="flex items-center bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden focus-within:border-[#0A0A0A] transition-colors">
                <span className="pl-4 pr-1 text-[#525252] font-bold">@</span>
                <input
                  data-testid="profile-handle"
                  value={handle.replace(/^@/, "")}
                  onChange={(e) => setHandle("@" + e.target.value.replace(/^@/, ""))}
                  placeholder="your.handle"
                  className="flex-1 px-2 py-4 outline-none font-medium bg-transparent"
                />
              </div>
            </Field>
          )}
          <Field label="Bio" hint={`${bio.length}/160`}>
            <textarea
              data-testid="profile-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 160))}
              placeholder="Tell brands what makes you you."
              className="w-full bg-white border border-[#E5E5E5] rounded-2xl px-4 py-4 outline-none font-medium resize-none focus:border-[#0A0A0A] transition-colors"
            />
          </Field>
          {accountType !== "brand" && (
            <Field label="Location">
              <div className="flex items-center bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden focus-within:border-[#0A0A0A] transition-colors">
                <div className="px-4 py-4 border-r border-[#E5E5E5] bg-[#F9F9F8]">
                  <MapPin size={16} className="text-[#E25238]" />
                </div>
                <input
                  data-testid="profile-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mumbai, India"
                  className="flex-1 px-3 py-4 outline-none font-medium bg-transparent text-sm"
                />
              </div>
            </Field>
          )}
        </Section>

        {/* Instagram link */}
        {accountType !== "brand" && (
          <Section label="Instagram Link">
            <Field hint="This URL opens when someone taps the IG icon next to your name.">
              <div className="flex items-center bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden focus-within:border-[#0A0A0A] transition-colors">
                <div className="px-4 py-4 border-r border-[#E5E5E5] bg-[#F9F9F8]">
                  <InstagramIcon size={16} className="text-[#E25238]" />
                </div>
                <input
                  data-testid="profile-instagram-url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/your.handle"
                  className="flex-1 px-3 py-4 outline-none font-medium bg-transparent text-sm"
                />
              </div>
            </Field>
          </Section>
        )}

        {/* Categories */}
        {accountType !== "brand" && (
          <Section label="Categories" hint="Pick 3 that describe you best.">
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((c) => {
                const active = cats.includes(c);
                return (
                  <button
                    key={c}
                    data-testid={`cat-${c.toLowerCase()}`}
                    onClick={() => toggleCat(c)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all ${
                      active
                        ? "bg-[#0A0A0A] text-white"
                        : "bg-white border border-[#E5E5E5] text-[#525252] hover:border-[#0A0A0A]"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* Content Languages */}
        {accountType !== "brand" && (
          <Section label="Content Languages" hint="Languages you create content in.">
            <div className="flex flex-wrap gap-2">
              {ALL_LANGUAGES.map((l) => {
                const active = languages.includes(l);
                return (
                  <button
                    key={l}
                    data-testid={`lang-${l.toLowerCase()}`}
                    onClick={() => toggleLang(l)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all ${
                      active
                        ? "bg-[#0A0A0A] text-white"
                        : "bg-white border border-[#E5E5E5] text-[#525252] hover:border-[#0A0A0A]"
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* Worked With */}
        {accountType !== "brand" && (
          <Section
            label="Worked With"
            hint="Brands you've collaborated with — shown on your profile."
            action={
              <button
                data-testid="add-brand"
                onClick={() => setShowBrandPicker(true)}
                className="px-4 py-2 bg-[#0A0A0A] text-white rounded-full text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-1.5"
              >
                <Plus size={14} strokeWidth={2.6} /> Add Brand
              </button>
            }
          >
            {workedWith.length === 0 ? (
              <p className="text-sm text-[#525252] py-6 text-center font-medium">No brands yet. Tap "Add Brand" to start.</p>
            ) : (
              <div className="flex flex-wrap items-start gap-3">
                {workedWith.map((b) => (
                  <WorkedWithItem key={b.id} brand={b}>
                    <button
                      data-testid={`worked-remove-${b.id}`}
                      onClick={() => removeBrand(b.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#EF4444] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                      aria-label={`Remove ${b.name}`}
                    >
                      <X size={11} strokeWidth={3} />
                    </button>
                  </WorkedWithItem>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Featured Reels */}
        {accountType !== "brand" && (
          <Section
            label="Featured Reels"
            hint={`${reels.length} reels — these show on your profile.`}
            action={
              <button
                data-testid="add-reel"
                onClick={() => setEditingReel("new")}
                className="px-4 py-2 bg-[#E25238] text-white rounded-full text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-1.5"
              >
                <Plus size={14} strokeWidth={2.6} /> Add Reel
              </button>
            }
          >
            {reels.length === 0 ? (
              <p className="text-sm text-[#525252] py-6 text-center font-medium">No reels yet. Add your first one.</p>
            ) : (
              <div className="space-y-3">
                {reels.map((r) => (
                  <div
                    key={r.id}
                    data-testid={`reel-row-${r.id}`}
                    className="bg-white border border-[#E5E5E5] rounded-2xl p-3 flex items-center gap-3"
                  >
                    <div className="relative w-14 aspect-[9/16] rounded-xl overflow-hidden flex-shrink-0 bg-[#0A0A0A]">
                      <img src={r.thumbnail} alt={r.title} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#525252] uppercase tracking-wider">{r.brand}</p>
                      <p className="text-sm font-bold text-[#0A0A0A] truncate">{r.title}</p>
                      <p className="text-[10px] text-[#525252] truncate font-medium flex items-center gap-1">
                        <Link2 size={10} /> {r.instagramUrl}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button
                        data-testid={`reel-edit-${r.id}`}
                        onClick={() => setEditingReel(r.id)}
                        className="w-8 h-8 rounded-full bg-[#F3F3F3] hover:bg-[#0A0A0A] hover:text-white flex items-center justify-center transition-colors"
                        aria-label="Edit reel"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        data-testid={`reel-delete-${r.id}`}
                        onClick={() => removeReel(r.id)}
                        className="w-8 h-8 rounded-full bg-[#F3F3F3] hover:bg-[#EF4444] hover:text-white flex items-center justify-center transition-colors"
                        aria-label="Delete reel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}
      </div>

      {/* Brand picker modal */}
      {showBrandPicker && (
        <BrandPickerModal
          existing={workedWith}
          onClose={() => setShowBrandPicker(false)}
          onPick={addBrand}
        />
      )}

      {/* Reel edit modal */}
      {editingReel !== null && (
        <ReelEditor
          reel={editingReel === "new" ? null : reels.find((r) => r.id === editingReel)}
          onClose={() => setEditingReel(null)}
          onSave={saveReel}
        />
      )}
    </div>
  );
}

const Section = ({ label, hint, action, children }) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#E25238]">{label}</p>
      {action}
    </div>
    <div className="space-y-3">{children}</div>
    {hint && <p className="text-xs text-[#525252] font-medium mt-2">{hint}</p>}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div>
    {label && <p className="text-xs font-bold text-[#525252] mb-1.5">{label}</p>}
    {children}
    {hint && <p className="text-[10px] text-[#525252] text-right mt-1 font-medium">{hint}</p>}
  </div>
);

const Input = ({ value, onChange, placeholder, testId }) => (
  <input
    data-testid={testId}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full bg-white border border-[#E5E5E5] rounded-2xl px-4 py-4 outline-none font-medium focus:border-[#0A0A0A] transition-colors"
  />
);

const PickerModal = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-up"
    onClick={onClose}
  >
    <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-black text-xl text-[#0A0A0A] tracking-tight">{title}</h3>
        <button data-testid="picker-close" onClick={onClose} className="w-9 h-9 rounded-full bg-[#F3F3F3] flex items-center justify-center">
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const ReelEditor = ({ reel, onClose, onSave }) => {
  const [data, setData] = useState(
    reel || {
      thumbnail: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?crop=entropy&w=400&q=80",
      brand: "",
      title: "",
      instagramUrl: "",
    }
  );

  const handleSave = () => {
    if (!data.brand || !data.title || !data.instagramUrl) {
      toast.error("Brand, title and Instagram URL are required");
      return;
    }
    onSave(data);
  };

  return (
    <PickerModal title={reel ? "Edit Reel" : "Add Reel"} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="relative w-32 aspect-[9/16] rounded-2xl overflow-hidden bg-[#0A0A0A]">
            <img src={data.thumbnail} alt="thumb" className="absolute inset-0 w-full h-full object-cover" />
            <button
              data-testid="reel-thumb-change"
              onClick={() => toast.info("Thumbnail upload demo only")}
              className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white text-[#0A0A0A] flex items-center justify-center"
            >
              <Camera size={14} />
            </button>
          </div>
        </div>

        <Field label="Brand">
          <Input testId="reel-brand" value={data.brand} onChange={(v) => setData({ ...data, brand: v })} placeholder="e.g. Mamaearth" />
        </Field>
        <Field label="Reel Title">
          <Input testId="reel-title" value={data.title} onChange={(v) => setData({ ...data, title: v })} placeholder="e.g. GRWM ft. Vit-C Serum" />
        </Field>
        <Field label="Instagram URL">
          <div className="flex items-center bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden focus-within:border-[#0A0A0A] transition-colors">
            <div className="px-4 py-4 border-r border-[#E5E5E5] bg-[#F9F9F8]">
              <InstagramIcon size={16} className="text-[#E25238]" />
            </div>
            <input
              data-testid="reel-url"
              value={data.instagramUrl}
              onChange={(e) => setData({ ...data, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/p/..."
              className="flex-1 px-3 py-4 outline-none font-medium bg-transparent text-sm"
            />
          </div>
        </Field>

        <div className="flex gap-3 pt-2">
          <button data-testid="reel-cancel" onClick={onClose} className="flex-1 py-4 rounded-full border border-[#E5E5E5] font-bold text-sm">
            Cancel
          </button>
          <button data-testid="reel-save" onClick={handleSave} className="flex-1 py-4 rounded-full bg-[#0A0A0A] text-white font-bold text-sm hover:bg-[#E25238] transition-colors">
            {reel ? "Save Changes" : "Add Reel"}
          </button>
        </div>
      </div>
    </PickerModal>
  );
};

const BrandPickerModal = ({ existing, onClose, onPick }) => {
  const [tab, setTab] = useState("listed");
  const [name, setName] = useState("");
  const [logoSrc, setLogoSrc] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const addCustom = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Brand name is required");
      return;
    }
    onPick({
      id: `custom-${Date.now()}`,
      name: trimmed,
      category: "Custom",
      verified: false,
      logo: trimmed.slice(0, 4).toUpperCase(),
      customLogo: logoSrc || undefined,
    });
    toast.success(`${trimmed} added`);
  };

  return (
    <PickerModal title="Add Brand" onClose={onClose}>
      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-[#F3F3F3] rounded-full p-1">
        <button
          data-testid="picker-tab-listed"
          onClick={() => setTab("listed")}
          className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all ${
            tab === "listed" ? "bg-white text-[#0A0A0A] shadow-sm" : "text-[#525252]"
          }`}
        >
          Listed
        </button>
        <button
          data-testid="picker-tab-custom"
          onClick={() => setTab("custom")}
          className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all ${
            tab === "custom" ? "bg-white text-[#0A0A0A] shadow-sm" : "text-[#525252]"
          }`}
        >
          Add Custom
        </button>
      </div>

      {tab === "listed" ? (
        <div className="grid grid-cols-3 gap-3">
          {BRANDS.map((b) => {
            const added = existing.find((w) => w.id === b.id);
            return (
              <button
                key={b.id}
                data-testid={`pick-brand-${b.id}`}
                onClick={() => !added && onPick(b)}
                disabled={!!added}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                  added ? "opacity-40 cursor-not-allowed" : "hover:bg-[#F3F3F3]"
                }`}
              >
                <BrandLogo name={b.name} size={48} />
                <span className="text-[11px] font-bold text-[#0A0A0A] truncate w-full text-center">
                  {b.name}
                </span>
                {added && <span className="text-[9px] font-bold uppercase tracking-wider text-[#525252]">Added</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-[#525252] font-medium">
            Can't find the brand? Add it manually below.
          </p>

          {/* Logo upload */}
          <div className="flex flex-col items-center gap-2">
            <button
              data-testid="custom-logo-upload"
              onClick={() => fileRef.current?.click()}
              className="relative w-24 h-24 rounded-3xl border-2 border-dashed border-[#0A0A0A] bg-[#F9F9F8] flex items-center justify-center overflow-hidden hover:border-[#E25238] transition-colors"
            >
              {logoSrc ? (
                <>
                  <img src={logoSrc} alt="logo" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center">
                    <Camera size={12} />
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-[#0A0A0A]">
                  <Upload size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Logo</span>
                </div>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
              data-testid="custom-logo-input"
            />
            <p className="text-[10px] text-[#525252] font-medium">PNG, JPG · up to 2MB · optional</p>
          </div>

          {/* Name input */}
          <Field label="Brand Name">
            <Input
              testId="custom-brand-name"
              value={name}
              onChange={setName}
              placeholder="e.g. Studio Sapphire"
            />
          </Field>

          <div className="flex gap-3 pt-1">
            <button
              data-testid="custom-cancel"
              onClick={onClose}
              className="flex-1 py-4 rounded-full border border-[#E5E5E5] font-bold text-sm"
            >
              Cancel
            </button>
            <button
              data-testid="custom-add"
              onClick={addCustom}
              className="flex-1 py-4 rounded-full bg-[#0A0A0A] text-white font-bold text-sm hover:bg-[#E25238] transition-colors"
            >
              Add Brand
            </button>
          </div>
        </div>
      )}
    </PickerModal>
  );
};

