import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Wallet, Calendar, Users, Tag, ListChecks, Instagram, Youtube, Globe, Share2, BadgeCheck } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/context/AppContext";
import { ApplyDialog } from "@/screens/ApplyDialog";

export default function OpportunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { opportunities } = useApp();
  const [showApply, setShowApply] = useState(false);
  const op = opportunities.find((o) => o.id === id) || opportunities[0];

  return (
    <div data-testid="opportunity-details" className="min-h-full bg-[#F9F9F8] pb-32">
      <TopBar title="" showBack showBookmark />

      <div className="px-5">
        {/* Brand header */}
        <div className="flex items-center gap-4 mb-2">
          <BrandLogo name={op.brandName} size={64} />
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-black text-2xl text-[#0A0A0A] tracking-tight">{op.brandName}</h1>
              {op.verified && <BadgeCheck size={18} className="text-[#E25238]" fill="#E25238" stroke="white" />}
            </div>
            <p className="text-sm text-[#525252] font-medium">{op.brandCategory} · Verified Brand</p>
          </div>
        </div>

        {/* Cover */}
        <div className="mt-5 mb-6 rounded-3xl overflow-hidden h-44">
          <img src={op.cover} alt={op.title} className="w-full h-full object-cover" />
        </div>

        {/* About brand */}
        <div className="mb-6">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#E25238] mb-2">About Brand</p>
          <p className="text-sm text-[#0A0A0A] leading-relaxed font-medium">
            {op.brandName} is trusted by 1M+ customers. We create clean, effective & safe products.
          </p>
          <div className="flex items-center gap-3 mt-4">
            {[Instagram, Youtube, Globe].map((Icon, i) => (
              <button key={i} className="w-10 h-10 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center hover:border-[#0A0A0A]">
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Campaign */}
        <div className="mb-6">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#E25238] mb-2">Campaign Details</p>
          <p className="text-sm text-[#0A0A0A] leading-relaxed font-medium">{op.description}</p>
        </div>

        {/* Details list */}
        <div className="bg-white rounded-3xl border border-[#E5E5E5] divide-y divide-[#F3F3F3] mb-6">
          {[
            { icon: Wallet, label: "Payout", value: `₹${op.payout} per reel` },
            { icon: Calendar, label: "Deadline", value: op.deadline },
            { icon: Users, label: "Creators", value: `${op.creatorsNeeded}` },
            { icon: Tag, label: "Category", value: op.category },
          ].map((row) => (
            <div key={row.label} className="flex items-center px-5 py-4 gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F3F3F3] flex items-center justify-center">
                <row.icon size={16} className="text-[#E25238]" />
              </div>
              <span className="flex-1 text-sm font-medium text-[#525252]">{row.label}</span>
              <span className="text-sm font-bold text-[#0A0A0A]">{row.value}</span>
            </div>
          ))}
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#F3F3F3] flex items-center justify-center">
                <ListChecks size={16} className="text-[#E25238]" />
              </div>
              <span className="text-sm font-medium text-[#525252]">Requirements</span>
            </div>
            <ul className="pl-12 space-y-1.5">
              {op.requirements.map((r) => (
                <li key={r} className="text-sm font-bold text-[#0A0A0A] flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#E25238] mt-2 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Floating actions */}
      <div className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-auto sm:w-[400px] mx-auto sm:relative sm:mt-2">
        <div className="px-5 py-4 bg-gradient-to-t from-[#F9F9F8] via-[#F9F9F8]/95 to-transparent">
          <button
            data-testid="apply-now-btn"
            onClick={() => setShowApply(true)}
            className="w-full bg-[#0A0A0A] text-white rounded-full py-5 font-bold text-base hover:bg-[#E25238] transition-colors shadow-xl"
          >
            Apply Now
          </button>
          <button data-testid="share-btn" className="w-full mt-3 py-3 rounded-full border border-[#E5E5E5] font-bold text-sm flex items-center justify-center gap-2 bg-white hover:bg-black hover:text-white transition-colors">
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>

      {showApply && <ApplyDialog opportunity={op} onClose={() => setShowApply(false)} onApplied={() => { setShowApply(false); navigate("/application-submitted"); }} />}
    </div>
  );
}
