import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkX, Wallet, Calendar, Users, BadgeCheck } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export default function SavedScreen() {
  const navigate = useNavigate();
  const { savedOpportunities, toggleSave } = useApp();

  if (savedOpportunities.length === 0) {
    return (
      <div data-testid="saved-screen" className="min-h-full bg-[#F9F9F8]">
        <TopBar title="Saved" showBack={false} />
        <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#0A0A0A]/5 flex items-center justify-center mb-6">
            <Bookmark size={28} className="text-[#0A0A0A]" />
          </div>
          <h2 className="font-display font-black text-2xl tracking-tight text-[#0A0A0A]">
            Nothing saved yet
          </h2>
          <p className="text-sm text-[#525252] font-medium mt-2 max-w-xs">
            Tap the bookmark on any opportunity to keep it here for later.
          </p>
          <button
            data-testid="browse-opportunities"
            onClick={() => navigate("/home")}
            className="mt-6 px-6 py-3 bg-[#0A0A0A] text-white rounded-full font-bold text-sm hover:bg-[#E25238] transition-colors"
          >
            Browse Opportunities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="saved-screen" className="min-h-full bg-[#F9F9F8] pb-6">
      <TopBar title="Saved" showBack={false} />

      <div className="px-5">
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#525252] mb-3">
          {savedOpportunities.length} saved
        </p>

        <div className="space-y-4">
          {savedOpportunities.map((op, idx) => (
            <div
              key={op.id}
              className="relative animate-fade-up"
              style={{ animationDelay: `${idx * 70}ms` }}
            >
              <button
                data-testid={`saved-${op.id}`}
                onClick={() => navigate(`/opportunity/${op.id}`)}
                className="w-full text-left bg-white rounded-3xl overflow-hidden border border-[#E5E5E5] hover:-translate-y-1 hover:shadow-xl transition-all"
              >
                <div className="relative h-28 overflow-hidden">
                  <img src={op.cover} alt={op.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur text-xs font-bold uppercase tracking-wider">
                    {op.category}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <BrandLogo name={op.brandName} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display font-bold text-base text-[#0A0A0A] truncate">
                          {op.brandName}
                        </h3>
                        {op.verified && <BadgeCheck size={16} className="text-[#E25238] flex-shrink-0" fill="#E25238" stroke="white" />}
                      </div>
                      <p className="text-xs text-[#525252] font-medium">{op.brandCategory}</p>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-[#0A0A0A] mb-4 leading-snug line-clamp-2">
                    {op.pitch}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[#525252]">
                    <span className="flex items-center gap-1">
                      <Wallet size={12} className="text-[#E25238]" />
                      <span className="font-bold text-[#0A0A0A]">₹{op.payout}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-[#E25238]" />
                      <span className="font-medium">{op.deadline}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} className="text-[#E25238]" />
                      <span className="font-medium">{op.creatorsNeeded}</span>
                    </span>
                  </div>
                </div>
              </button>

              <button
                data-testid={`unsave-${op.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSave(op.id);
                  toast.success("Removed from saved");
                }}
                aria-label="Remove from saved"
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform shadow-md"
              >
                <BookmarkX size={16} className="text-[#E25238]" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
