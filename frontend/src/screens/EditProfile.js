import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Plus, X, Link2, Pencil, MapPin, BarChart2, ChevronDown } from "lucide-react";

const InstagramIcon = ({ size = 16, className = "", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
const YoutubeIcon = ({ size = 16, className = "", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);
const LinkedInIcon = ({ size = 16, className = "", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
  </svg>
);
const TikTokIcon = ({ size = 16, className = "", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.16 8.16 0 0 0 4.76 1.51V6.8a4.85 4.85 0 0 1-1-.11z"/>
  </svg>
);
const GlobeIcon = ({ size = 16, className = "", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { WorkedWithItem } from "@/components/WorkedWithItem";
import { useApp } from "@/context/AppContext";
import { profileApi, reelsApi } from "@/lib/api";
import { AudienceInsightsModal } from "@/components/AudienceInsightsModal";
import { toast } from "sonner";

import { MASTER_CATEGORIES, LANGUAGES as ALL_LANGUAGES } from "@/data/categories";
const ALL_CATEGORIES = MASTER_CATEGORIES;

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser, accountType, workedWith, setWorkedWith, refreshProfile } = useApp();
  const profile = accountType === "brand" ? user.brand : user.creator;

  // Form state — shared
  const [name, setName] = useState(profile.name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const isValidImg = (s) => s && (s.startsWith("data:") || s.startsWith("http"));
  const [avatar, setAvatar] = useState(accountType === "brand" ? (isValidImg(user.brand.logo) ? user.brand.logo : "") : (user.creator.avatar || ""));

  // Creator-only form state
  const [handle, setHandle] = useState(profile.handle || "");
  const [creatorEmail, setCreatorEmail] = useState(profile.email || "");
  const [state, setState] = useState(profile.state || "");
  const [location, setLocation] = useState(profile.location || "");
  const [instagramUrl, setInstagramUrl] = useState(profile.instagramUrl || "");
  const [youtubeUrl, setYoutubeUrl] = useState(profile.youtubeUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl || "");
  const [tiktokUrl, setTiktokUrl] = useState(profile.tiktokUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl || "");
  const [followersCount, setFollowersCount] = useState(String(profile.followersCount || ""));
  const [collaborations, setCollaborations] = useState(String(profile.collaborations || ""));
  const [cats, setCats] = useState(profile.category || []);
  const [catSearch, setCatSearch] = useState("");
  const [languages, setLanguages] = useState(profile.language || []);
  const [isPublic, setIsPublic] = useState(profile.isPublic !== false);
  const [showInsights, setShowInsights] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  // Brand-only form state
  const [brandInstagramUrl, setBrandInstagramUrl] = useState(profile.instagramUrl || "");
  const [brandWebsiteUrl, setBrandWebsiteUrl] = useState(profile.websiteUrl || "");
  const [officialEmail, setOfficialEmail] = useState(profile.officialEmail || "");

  // Reels
  const [reels, setReels] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [editingReel, setEditingReel] = useState(null);

  const avatarRef = useRef(null);

  // Load fresh profile data from the API on mount — overrides any stale AppContext state
  useEffect(() => {
    const loader = accountType === "brand" ? profileApi.getBrand() : profileApi.getCreator();
    loader.then((p) => {
      if (accountType === "brand") {
        setName(p.brand_name || "");
        setBio(p.bio || "");
        setBrandInstagramUrl(p.instagram_url || "");
        setBrandWebsiteUrl(p.website_url || "");
        setOfficialEmail(p.official_email || "");
        const logo = p.logo_data || "";
        setAvatar(isValidImg(logo) ? logo : "");
      } else {
        setName(p.full_name || "");
        setBio(p.bio || "");
        setHandle(p.handle || "");
        setCreatorEmail(p.email || "");
        setState(p.state || "");
        setLocation(p.location || "");
        setInstagramUrl(p.instagram_url || "");
        setYoutubeUrl(p.youtube_url || "");
        setLinkedinUrl(p.linkedin_url || "");
        setTiktokUrl(p.tiktok_url || "");
        setWebsiteUrl(p.website_url || "");
        setFollowersCount(String(p.followers_count || ""));
        setCollaborations(String(p.collaborations_count || ""));
        setCats(Array.isArray(p.categories) ? p.categories : []);
        setLanguages(Array.isArray(p.languages) ? p.languages : []);
        setIsPublic(p.is_public !== false);
        const av = p.avatar_url || "";
        setAvatar(isValidImg(av) ? av : "");
      }
    }).catch(() => {});
  }, [accountType]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (accountType !== "creator") { setReelsLoading(false); return; }
    reelsApi.list()
      .then((data) => setReels(data))
      .catch(() => setReels([]))
      .finally(() => setReelsLoading(false));
  }, [accountType]);

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 3 * 1024 * 1024) { toast.error("Image must be under 3MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (accountType === "brand") {
      setUser((prev) => ({
        ...prev,
        brand: { ...prev.brand, name, bio, logo: avatar, instagramUrl: brandInstagramUrl, websiteUrl: brandWebsiteUrl, officialEmail },
      }));
      try {
        await profileApi.updateBrand({
          brand_name: name,
          bio,
          logo_data: avatar,
          instagram_url: brandInstagramUrl,
          website_url: brandWebsiteUrl,
          official_email: officialEmail,
        });
        await refreshProfile();
        toast.success("Profile updated");
        navigate(-1);
      } catch (_) {
        toast.error("Failed to save profile. Please try again.");
      }
    } else {
      const workedWithPayload = workedWith.map((b) => ({
        id: b.id || String(Math.random()),
        name: b.name || b.brand_name || "",
        logo: b.logo || b.logo_data || "",
      }));
      setUser((prev) => ({
        ...prev,
        creator: {
          ...prev.creator,
          name, handle, bio, email: creatorEmail, state, instagramUrl, youtubeUrl, linkedinUrl, tiktokUrl, websiteUrl,
          category: cats, location, language: languages, avatar,
          followersCount: Number(followersCount) || prev.creator.followersCount,
          followers: followersCount
            ? Number(followersCount).toLocaleString("en-IN")
            : prev.creator.followers,
          collaborations: Number(collaborations) || prev.creator.collaborations,
        },
      }));
      try {
        await profileApi.updateCreator({
          full_name: name,
          email: creatorEmail,
          handle,
          bio,
          instagram_url: instagramUrl,
          youtube_url: youtubeUrl,
          linkedin_url: linkedinUrl,
          tiktok_url: tiktokUrl,
          website_url: websiteUrl,
          categories: cats,
          location,
          state,
          languages,
          avatar_url: avatar,
          followers_count: Number(followersCount) || undefined,
          collaborations_count: Number(collaborations) || undefined,
          worked_with: workedWithPayload,
          is_public: isPublic,
        });
        await refreshProfile();
        toast.success("Profile updated");
        navigate(-1);
      } catch (_) {
        toast.error("Failed to save profile. Please try again.");
      }
    }
  };

  const toggleCat = (c) => setCats((prev) => {
    if (prev.includes(c)) return prev.filter((x) => x !== c);
    if (prev.length >= 3) {
      toast.error("You can select up to 3 categories");
      return prev;
    }
    return [...prev, c];
  });
  const toggleLang = (l) => setLanguages((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]);

  const removeBrand = (id) => setWorkedWith((prev) => prev.filter((b) => b.id !== id));
  const addBrand = (b) => {
    if (workedWith.find((w) => w.id === b.id)) return;
    setWorkedWith((prev) => [...prev, b]);
    setShowBrandPicker(false);
  };

  const removeReel = async (id) => {
    setReels((prev) => prev.filter((r) => r.id !== id));
    try { await reelsApi.delete(id); }
    catch (_) { toast.error("Failed to delete reel"); }
  };

  const saveReel = async (data) => {
    try {
      if (data.id) {
        await reelsApi.update(data.id, {
          brand: data.brand,
          title: data.title,
          instagram_url: data.instagramUrl || data.instagram_url,
          thumbnail: data.thumbnail,
        });
        setReels((prev) => prev.map((r) => r.id === data.id ? { ...r, ...data } : r));
      } else {
        const created = await reelsApi.create({
          brand: data.brand,
          title: data.title,
          instagram_url: data.instagramUrl || data.instagram_url || "",
          thumbnail: data.thumbnail || "",
          sort_order: 0,
        });
        setReels((prev) => [{ ...data, id: created.id, instagram_url: created.instagram_url }, ...prev]);
      }
      toast.success(data.id ? "Reel updated" : "Reel added");
    } catch (_) {
      toast.error("Failed to save reel");
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
          {accountType === "brand" ? (
            avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-28 h-28 rounded-[32px] object-cover ring-4 ring-white shadow-lg"
              />
            ) : (
              <BrandLogo name={name} size={112} />
            )
          ) : (
            <img
              src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&q=80"}
              alt="avatar"
              className="w-28 h-28 rounded-[32px] object-cover ring-4 ring-white shadow-lg"
            />
          )}
          <button
            data-testid="change-avatar"
            onClick={() => avatarRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center shadow-lg hover:bg-[#E25238] transition-colors"
          >
            <Camera size={16} />
          </button>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Identity */}
        <Section label="Identity">
          <Field label="Full Name">
            <Input testId="profile-name" value={name} onChange={setName} placeholder="Your name" />
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
              placeholder={accountType === "brand" ? "Tell creators about your brand." : "Tell brands what makes you you."}
              className="w-full bg-white border border-[#E5E5E5] rounded-2xl px-4 py-4 outline-none font-medium resize-none focus:border-[#0A0A0A] transition-colors"
            />
          </Field>
          {accountType !== "brand" && (
            <Field label="Personal Email">
              <input
                type="email"
                value={creatorEmail}
                onChange={(e) => setCreatorEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white border border-[#E5E5E5] rounded-2xl px-4 py-4 outline-none font-medium focus:border-[#0A0A0A] transition-colors text-sm"
              />
            </Field>
          )}
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
          {accountType !== "brand" && (
            <Field label="State">
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full bg-white border border-[#E5E5E5] rounded-2xl px-4 py-4 outline-none font-medium focus:border-[#0A0A0A] transition-colors text-sm"
              />
            </Field>
          )}
        </Section>

        {/* Creator stats */}
        {accountType !== "brand" && (
          <Section label="Stats">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Instagram Followers">
                <input
                  data-testid="profile-followers"
                  type="number"
                  min="0"
                  value={followersCount}
                  onChange={(e) => setFollowersCount(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full bg-white border border-[#E5E5E5] rounded-2xl px-4 py-4 outline-none font-medium focus:border-[#0A0A0A] transition-colors"
                />
              </Field>
              <Field label="Brand Collaborations">
                <input
                  data-testid="profile-collaborations"
                  type="number"
                  min="0"
                  value={collaborations}
                  onChange={(e) => setCollaborations(e.target.value)}
                  placeholder="e.g. 12"
                  className="w-full bg-white border border-[#E5E5E5] rounded-2xl px-4 py-4 outline-none font-medium focus:border-[#0A0A0A] transition-colors"
                />
              </Field>
            </div>
          </Section>
        )}

        {/* Social links — creator */}
        {accountType !== "brand" && (
          <Section label="Social Links">
            <SocialField
              icon={<InstagramIcon size={16} className="text-[#E25238]" />}
              testId="profile-instagram-url"
              value={instagramUrl}
              onChange={setInstagramUrl}
              placeholder="https://instagram.com/your.handle"
            />
            <SocialField
              icon={<YoutubeIcon size={16} className="text-[#E25238]" />}
              testId="profile-youtube-url"
              value={youtubeUrl}
              onChange={setYoutubeUrl}
              placeholder="https://youtube.com/@channel"
            />
            <SocialField
              icon={<TikTokIcon size={16} className="text-[#E25238]" />}
              testId="profile-tiktok-url"
              value={tiktokUrl}
              onChange={setTiktokUrl}
              placeholder="https://tiktok.com/@handle"
            />
            <SocialField
              icon={<LinkedInIcon size={16} className="text-[#E25238]" />}
              testId="profile-linkedin-url"
              value={linkedinUrl}
              onChange={setLinkedinUrl}
              placeholder="https://linkedin.com/in/name"
            />
            <SocialField
              icon={<GlobeIcon size={16} className="text-[#E25238]" />}
              testId="profile-website-url"
              value={websiteUrl}
              onChange={setWebsiteUrl}
              placeholder="https://yourwebsite.com"
            />
          </Section>
        )}

        {/* Social links — brand */}
        {accountType === "brand" && (
          <Section label="Online Presence">
            <SocialField
              icon={<InstagramIcon size={16} className="text-[#E25238]" />}
              testId="profile-brand-instagram"
              value={brandInstagramUrl}
              onChange={setBrandInstagramUrl}
              placeholder="https://instagram.com/yourbrand"
            />
            <SocialField
              icon={<GlobeIcon size={16} className="text-[#E25238]" />}
              testId="profile-brand-website"
              value={brandWebsiteUrl}
              onChange={setBrandWebsiteUrl}
              placeholder="https://yourbrand.com"
            />
            <Field label="Official Email">
              <input
                type="email"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                placeholder="brand@company.com"
                className="w-full bg-white border border-[#E5E5E5] rounded-2xl px-4 py-4 outline-none font-medium focus:border-[#0A0A0A] transition-colors text-sm"
              />
            </Field>
          </Section>
        )}

        {/* Categories */}
        {accountType !== "brand" && (
          <Section label="Categories" hint="Pick up to 3 that describe you best.">
            <div className="relative">
              <button
                onClick={() => setCatOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[#E5E5E5] rounded-2xl text-sm font-medium text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors"
              >
                <span className={cats.length ? "text-[#0A0A0A]" : "text-[#B0B0B0]"}>
                  {cats.length ? cats.join(", ") : "Select categories"}
                </span>
                <ChevronDown size={16} className={`text-[#525252] transition-transform ${catOpen ? "rotate-180" : ""}`} />
              </button>
              {catOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-[#E5E5E5] rounded-2xl shadow-lg max-h-60 overflow-y-auto p-2">
                  <input
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    placeholder="Search categories…"
                    className="w-full px-3 py-2 mb-2 bg-[#F9F9F8] border border-[#E5E5E5] rounded-xl text-sm font-medium text-[#0A0A0A] outline-none focus:border-[#0A0A0A] placeholder:text-[#B0B0B0]"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {ALL_CATEGORIES.filter((c) => c.toLowerCase().includes(catSearch.toLowerCase())).map((c) => {
                    const active = cats.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleCat(c)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                          active ? "bg-[#0A0A0A] text-white" : "hover:bg-[#F3F3F3] text-[#0A0A0A]"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Content Languages */}
        {accountType !== "brand" && (
          <Section label="Content Languages" hint="Languages you create content in.">
            <div className="relative">
              <button
                onClick={() => setLangOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[#E5E5E5] rounded-2xl text-sm font-medium text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors"
              >
                <span className={languages.length ? "text-[#0A0A0A]" : "text-[#B0B0B0]"}>
                  {languages.length ? languages.join(", ") : "Select languages"}
                </span>
                <ChevronDown size={16} className={`text-[#525252] transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>
              {langOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-[#E5E5E5] rounded-2xl shadow-lg max-h-60 overflow-y-auto p-2">
                  {ALL_LANGUAGES.map((l) => {
                    const active = languages.includes(l);
                    return (
                      <button
                        key={l}
                        onClick={() => toggleLang(l)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                          active ? "bg-[#0A0A0A] text-white" : "hover:bg-[#F3F3F3] text-[#0A0A0A]"
                        }`}
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Audience Insights */}
        {accountType !== "brand" && (
          <Section label="Audience Insights">
            <button
              data-testid="audience-insights-edit-btn"
              onClick={() => setShowInsights(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-[#E5E5E5] rounded-2xl hover:border-[#E25238] transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-[#E25238] flex items-center justify-center flex-shrink-0">
                <BarChart2 size={16} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-[#0A0A0A]">Audience Insights</p>
                <p className="text-xs text-[#525252] font-medium">Add demographics to attract brands</p>
              </div>
            </button>
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
            hint={reelsLoading ? "Loading..." : `${reels.length} reels — these show on your profile.`}
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
            {reelsLoading ? (
              <p className="text-sm text-[#525252] py-6 text-center font-medium">Loading reels…</p>
            ) : reels.length === 0 ? (
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
                      {r.thumbnail ? (
                        <img src={r.thumbnail} alt={r.title} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <InstagramIcon size={18} className="text-white/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#525252] uppercase tracking-wider">{r.brand}</p>
                      <p className="text-sm font-bold text-[#0A0A0A] truncate">{r.title}</p>
                      <p className="text-[10px] text-[#525252] truncate font-medium flex items-center gap-1">
                        <Link2 size={10} /> {r.instagram_url || r.instagramUrl}
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

      {showBrandPicker && (
        <BrandPickerModal
          existing={workedWith}
          onClose={() => setShowBrandPicker(false)}
          onPick={addBrand}
        />
      )}

      {editingReel !== null && (
        <ReelEditor
          reel={editingReel === "new" ? null : reels.find((r) => r.id === editingReel)}
          onClose={() => setEditingReel(null)}
          onSave={saveReel}
        />
      )}

      {showInsights && accountType !== "brand" && (
        <AudienceInsightsModal
          open={showInsights}
          onClose={() => setShowInsights(false)}
          isOwner={true}
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

const SocialField = ({ icon, testId, value, onChange, placeholder }) => (
  <div className="flex items-center bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden focus-within:border-[#0A0A0A] transition-colors">
    <div className="px-4 py-4 border-r border-[#E5E5E5] bg-[#F9F9F8] flex items-center justify-center w-[52px]">
      {icon}
    </div>
    <input
      data-testid={testId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 px-3 py-4 outline-none font-medium bg-transparent text-sm"
    />
  </div>
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

const BRAND_SUGGESTIONS = [
  { id: "b-s1", name: "Mamaearth",   logo: "" },
  { id: "b-s2", name: "Nykaa",       logo: "" },
  { id: "b-s3", name: "Bewakoof",    logo: "" },
  { id: "b-s4", name: "Myntra",      logo: "" },
  { id: "b-s5", name: "Sugar",       logo: "" },
  { id: "b-s6", name: "WOW Skin",    logo: "" },
  { id: "b-s7", name: "Plum",        logo: "" },
  { id: "b-s8", name: "MCaffeine",   logo: "" },
  { id: "b-s9", name: "Minimalist",  logo: "" },
  { id: "b-s10", name: "Dot & Key",  logo: "" },
  { id: "b-s11", name: "The Derma Co", logo: "" },
  { id: "b-s12", name: "boAt",       logo: "" },
];

const BrandPickerModal = ({ existing, onClose, onPick }) => {
  const [q, setQ] = useState("");
  const [customName, setCustomName] = useState("");
  const [customLogo, setCustomLogo] = useState("");
  const [customLink, setCustomLink] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const customLogoRef = useRef(null);
  const filtered = BRAND_SUGGESTIONS.filter((b) =>
    !existing.find((e) => e.id === b.id) &&
    b.name.toLowerCase().includes(q.toLowerCase())
  );

  const handleCustomLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 3 * 1024 * 1024) { toast.error("Image must be under 3MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setCustomLogo(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <PickerModal title="Add Brand" onClose={onClose}>
      <div className="flex items-center bg-[#F9F9F8] border border-[#E5E5E5] rounded-2xl overflow-hidden mb-4 focus-within:border-[#0A0A0A] transition-colors">
        <input
          data-testid="brand-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search brands..."
          className="flex-1 px-4 py-3.5 outline-none font-medium bg-transparent text-sm"
        />
      </div>

      {/* Toggle to show custom brand form */}
      <button
        onClick={() => setShowCustomForm((v) => !v)}
        className="w-full text-left text-xs font-bold text-[#525252] mb-3 flex items-center gap-1.5 hover:text-[#0A0A0A] transition-colors"
      >
        <span className="text-[#E25238]">{showCustomForm ? "▲" : "▼"}</span>
        Add a custom brand (not in list)
      </button>

      {/* Custom brand entry */}
      {showCustomForm && (
        <div className="mb-4 bg-[#F9F9F8] border border-[#E5E5E5] rounded-2xl p-4 space-y-2.5">
          <p className="text-xs text-[#525252] font-medium">Brand name, logo &amp; link:</p>
          <div className="flex items-center gap-2">
            <button
              data-testid="custom-brand-logo"
              onClick={() => customLogoRef.current?.click()}
              className="w-12 h-12 rounded-xl bg-white border border-[#E5E5E5] flex items-center justify-center flex-shrink-0 hover:border-[#0A0A0A] transition-colors overflow-hidden"
              title="Upload logo"
            >
              {customLogo ? (
                <img src={customLogo} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <Camera size={16} className="text-[#525252]" />
              )}
            </button>
            <input ref={customLogoRef} type="file" accept="image/*" className="hidden" onChange={handleCustomLogo} />
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Brand name *"
              className="flex-1 bg-white border border-[#E5E5E5] rounded-2xl px-4 py-3 outline-none font-medium text-sm focus:border-[#0A0A0A] transition-colors"
            />
          </div>
          <input
            value={customLink}
            onChange={(e) => setCustomLink(e.target.value)}
            placeholder="Website or profile link (optional)"
            className="w-full bg-white border border-[#E5E5E5] rounded-2xl px-4 py-3 outline-none font-medium text-sm focus:border-[#0A0A0A] transition-colors"
          />
          <button
            onClick={() => {
              if (!customName.trim()) { toast.error("Enter a brand name"); return; }
              onPick({ id: `custom-${Date.now()}`, name: customName.trim(), logo: customLogo, link: customLink.trim() });
              setCustomName(""); setCustomLogo(""); setCustomLink(""); setShowCustomForm(false);
            }}
            className="w-full py-3 bg-[#0A0A0A] text-white rounded-2xl font-bold text-sm"
          >
            Add Brand
          </button>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((b) => (
          <button
            key={b.id}
            data-testid={`brand-pick-${b.id}`}
            onClick={() => onPick(b)}
            className="w-full text-left px-4 py-3.5 rounded-2xl bg-[#F9F9F8] border border-[#E5E5E5] hover:border-[#0A0A0A] font-bold text-sm transition-all"
          >
            {b.name}
          </button>
        ))}
        {!filtered.length && !q.trim() && (
          <p className="text-center text-sm text-[#525252] py-6 font-medium">Search for a brand above.</p>
        )}
      </div>
    </PickerModal>
  );
};

const ReelEditor = ({ reel, onClose, onSave }) => {
  const thumbRef = useRef(null);
  const [data, setData] = useState(
    reel
      ? { ...reel, instagramUrl: reel.instagram_url || reel.instagramUrl || "" }
      : { thumbnail: "", brand: "", title: "", instagramUrl: "" }
  );
  const [saving, setSaving] = useState(false);

  const handleThumbFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 3 * 1024 * 1024) { toast.error("Image must be under 3MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (result.length > 5000000) { toast.error("Image too large after encoding"); return; }
      setData((d) => ({ ...d, thumbnail: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!data.brand || !data.title || !data.instagramUrl) {
      toast.error("Brand, title and Instagram URL are required");
      return;
    }
    setSaving(true);
    await onSave(data);
    setSaving(false);
  };

  return (
    <PickerModal title={reel ? "Edit Reel" : "Add Reel"} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="relative w-32 aspect-[9/16] rounded-2xl overflow-hidden bg-[#0A0A0A]">
            {data.thumbnail ? (
              <img src={data.thumbnail} alt="thumb" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera size={28} className="text-white/30" />
              </div>
            )}
            <button
              data-testid="reel-thumb-change"
              onClick={() => thumbRef.current?.click()}
              className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white text-[#0A0A0A] flex items-center justify-center shadow"
            >
              <Camera size={14} />
            </button>
            <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumbFile} />
          </div>
        </div>
        <p className="text-center text-xs text-[#525252] font-medium">Tap camera to upload thumbnail</p>

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
          <button
            data-testid="reel-save"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-4 rounded-full bg-[#0A0A0A] text-white font-bold text-sm hover:bg-[#E25238] transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : reel ? "Save Changes" : "Add Reel"}
          </button>
        </div>
      </div>
    </PickerModal>
  );
};
