import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { APPLICANTS, PORTFOLIO, BRANDS } from "@/data/mockData";
import { toast } from "sonner";

export default function CreatorProfileBrandView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const c = APPLICANTS.find((a) => a.id === id) || APPLICANTS[0];

  return (
    <div data-testid="creator-profile-brand" className="min-h-full bg-[#F9F9F8] flex flex-col pb-2">
      <TopBar title="Creator Profile" showMore />

      <div className="px-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <img src={c.avatar} alt={c.name} className="w-20 h-20 rounded-3xl object-cover" />
          <div className="flex-1 pt-1">
            <h2 className="font-display font-black text-xl text-[#0A0A0A] tracking-tight">{c.name}</h2>
            <p className="text-sm text-[#525252] font-medium">{c.handle}</p>
            <div className="flex items-center gap-3 mt-2">
              <div>
                <span className="font-display font-bold text-[#0A0A0A]">{c.followers}</span>
                <span className="text-xs text-[#525252] font-medium ml-1">Followers</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-[#525252]" />
              <div>
                <span className="font-display font-bold text-[#0A0A0A]">{c.engagement}</span>
                <span className="text-xs text-[#525252] font-medium ml-1">Engagement</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {["Lifestyle", "Fashion", "Beauty"].map((cat) => (
            <span key={cat} className="px-4 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-xs font-bold uppercase tracking-wider">
              {cat}
            </span>
          ))}
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#E25238] mb-2">About</p>
          <p className="text-sm text-[#0A0A0A] font-medium leading-relaxed">
            Lifestyle creator | Love skincare & fashion. Creating honest & aesthetic content.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#E25238]">Portfolio</p>
            <button data-testid="view-portfolio" className="text-xs font-bold text-[#0A0A0A] uppercase tracking-wider">View All</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PORTFOLIO.map((p, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden">
                <img src={p} alt="portfolio" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#E25238] mb-3">Past Collaborations</p>
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {BRANDS.slice(0, 5).map((b) => (
              <BrandLogo key={b.id} name={b.name} size={56} />
            ))}
          </div>
        </div>
      </div>

      {/* Floating actions */}
      <div className="sticky bottom-0 left-0 right-0 z-20 mt-4">
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
