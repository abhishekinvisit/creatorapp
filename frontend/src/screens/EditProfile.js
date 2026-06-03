import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Plus, Instagram, Youtube, Globe } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser, accountType } = useApp();
  const profile = accountType === "brand" ? user.brand : user.creator;
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [cats] = useState(profile.category);

  const save = () => {
    if (accountType === "brand") {
      setUser({ ...user, brand: { ...user.brand, name, bio } });
    } else {
      setUser({ ...user, creator: { ...user.creator, name, bio } });
    }
    toast.success("Profile updated");
    navigate(-1);
  };

  return (
    <div data-testid="edit-profile" className="min-h-full bg-[#F9F9F8] pb-32">
      <TopBar
        title="Edit Profile"
        rightSlot={
          <button data-testid="save-profile" onClick={save} className="px-4 py-2 bg-[#0A0A0A] text-white rounded-full text-xs font-bold uppercase tracking-wider">Save</button>
        }
      />

      <div className="px-5">
        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img
              src={accountType === "brand" ? "https://images.unsplash.com/photo-1629380108599-ea06489d66f5?w=200&q=80" : user.creator.avatar}
              alt="avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <button data-testid="change-avatar" className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center">
              <Camera size={16} />
            </button>
          </div>
        </div>

        <Field label="Full Name">
          <input
            data-testid="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] rounded-2xl px-4 py-4 outline-none font-medium focus:border-[#0A0A0A]"
          />
        </Field>

        <Field label="Bio">
          <textarea
            data-testid="profile-bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 160))}
            className="w-full bg-white border border-[#E5E5E5] rounded-2xl px-4 py-4 outline-none font-medium resize-none focus:border-[#0A0A0A]"
          />
          <p className="text-xs text-[#525252] text-right mt-1 font-medium">{bio.length}/160</p>
        </Field>

        <Field label="Category">
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <span key={c} className="px-4 py-2 bg-[#0A0A0A] text-white rounded-full text-xs font-bold">
                {c}
              </span>
            ))}
            <button data-testid="add-category" className="px-3 py-2 rounded-full border border-dashed border-[#0A0A0A] text-xs font-bold flex items-center gap-1">
              <Plus size={12} /> Add
            </button>
          </div>
        </Field>

        <Field label="Social Links">
          <div className="space-y-2">
            {[
              { icon: Instagram, name: "instagram", placeholder: "@username" },
              { icon: Youtube, name: "youtube", placeholder: "Channel name" },
              { icon: Globe, name: "website", placeholder: "https://..." },
            ].map((s) => (
              <div key={s.name} className="bg-white border border-[#E5E5E5] rounded-2xl px-4 py-3 flex items-center gap-3">
                <s.icon size={16} className="text-[#525252]" />
                <input
                  data-testid={`social-${s.name}`}
                  placeholder={s.placeholder}
                  className="flex-1 outline-none font-medium text-sm"
                />
              </div>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div className="mb-5">
    <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#525252] mb-2">{label}</p>
    {children}
  </div>
);
