import { useNavigate, useParams } from "react-router-dom";
import { Instagram, MapPin } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { APPLICANTS, REELS, BRANDS } from "@/data/mockData";
import { ReelCard } from "@/components/ReelCard";
import { WorkedWithItem } from "@/components/WorkedWithItem";
import { toast } from "sonner";

export default function CreatorProfileBrandView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const c = APPLICANTS.find((a) => a.id === id) || APPLICANTS[0];
  const workedWith = BRANDS.slice(0, 6);
  const collabsCount = 42;
  const instagramUrl = `https://instagram.com/${c.handle.replace("@", "")}`;
  const openInstagram = () => window.open(instagramUrl, "_blank", "noopener,noreferrer");

  return (
    <div data-testid="creator-profile-brand" className="min-h-full bg-[#F9F9F8] flex flex-col pb-2">
      <TopBar title="Creator Profile" showMore />

      {/* HEADER */}
      <div className="px-5">
        <div className="flex items-start gap-4">
          <img
            src={c.avatar}
            alt={c.name}
            className="w-[88px] h-[88px] rounded-[28px] object-cover ring-4 ring-white shadow-md flex-shrink-0"
          />
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="font-display font-black text-2xl text-[#0A0A0A] tracking-tight leading-tight">
              {c.name}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm text-[#525252] font-medium truncate">{c.handle}</p>
              <button
                data-testid="ig-link"
                onClick={openInstagram}
                aria-label="Open Instagram"
                className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#E25238] via-[#F59E0B] to-[#E25238] flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform"
              >
                <Instagram size={12} className="text-white" strokeWidth={2.6} />
              </button>
            </div>
            {c.location && (
              <div data-testid="profile-location" className="flex items-center gap-1 mt-1.5 text-xs text-[#525252] font-medium">
                <MapPin size={12} className="text-[#E25238]" />
                <span>{c.location}</span>
              </div>
            )}

            <div className="flex items-center gap-5 mt-3">
              <div data-testid="stat-followers">
                <p className="font-display font-black text-base text-[#0A0A0A] leading-none">{c.followers}</p>
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#525252] mt-1">Followers</p>
              </div>
              <div className="w-px h-7 bg-[#E5E5E5]" />
              <div data-testid="stat-collaborations">
                <p className="font-display font-black text-base text-[#0A0A0A] leading-none">{collabsCount}</p>
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#525252] mt-1">Collaborations</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm font-medium text-[#0A0A0A] mt-5 leading-relaxed">
          Lifestyle creator | Love skincare & fashion. Creating honest & aesthetic content.
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {["Lifestyle", "Fashion", "Beauty"].map((cat) => (
            <span
              key={cat}
              className="px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-bold uppercase tracking-[0.15em]"
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#525252]">Worked With</p>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#525252]">
              {workedWith.length} brands
            </span>
          </div>
          <div className="flex items-start gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
            {workedWith.map((b) => (
              <WorkedWithItem key={b.id} brand={b} />
            ))}
          </div>
        </div>
      </div>

      {/* PORTFOLIO – main focus */}
      <div className="mt-8">
        <div className="px-5 flex items-end justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#E25238]">Portfolio</p>
            <h3 className="font-display font-black text-2xl text-[#0A0A0A] tracking-tight leading-tight mt-1">
              Featured Reels
            </h3>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#525252]">
            {REELS.length} reels
          </span>
        </div>

        <div data-testid="reels-grid" className="px-5 grid grid-cols-2 gap-3">
          {REELS.map((r, i) => (
            <ReelCard key={r.id} reel={r} testId={`reel-${r.id}`} delay={i * 70} />
          ))}
        </div>
      </div>

      {/* Floating actions */}
      <div className="sticky bottom-0 left-0 right-0 z-20 mt-6">
        <div className="px-5 py-4 bg-gradient-to-t from-[#F9F9F8] via-[#F9F9F8]/95 to-transparent flex gap-3">
          <button
            data-testid="shortlist-btn"
            onClick={() => toast.success(`${c.name} shortlisted!`)}
            className="flex-1 py-4 rounded-full border-2 border-[#0A0A0A] font-bold hover:bg-[#0A0A0A] hover:text-white transition-colors"
          >
            Shortlist
          </button>
          <button
            data-testid="message-btn"
            onClick={() => navigate("/messages")}
            className="flex-1 py-4 rounded-full bg-[#0A0A0A] text-white font-bold hover:bg-[#E25238] transition-colors"
          >
            Message
          </button>
        </div>
      </div>
    </div>
  );
}
