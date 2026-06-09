import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Wallet, Calendar, Users, Tag, ListChecks, Globe, Share2, BadgeCheck, Languages, CheckCircle2 } from "lucide-react";

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
import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/context/AppContext";
import { ApplyDialog } from "@/screens/ApplyDialog";
import { toast } from "sonner";

export default function OpportunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { opportunities, isSaved, toggleSave, hasApplied, applications, accountType, user } = useApp();
  const [showApply, setShowApply] = useState(false);
  const [apiOp, setApiOp] = useState(null);
  const [applied, setApplied] = useState(false);

  const ctxOp = opportunities.find((o) => String(o.id) === String(id));
  const op = apiOp || ctxOp;

  // Check applied status from context applications (loaded on login) or derive after apply
  useEffect(() => {
    setApplied(hasApplied(id));
  }, [id, applications, hasApplied]);

  useEffect(() => {
    // Always fetch from API to get fresh data including brand logo/links
    import("@/lib/api").then(({ opportunitiesApi }) => {
      opportunitiesApi.get(id)
        .then((o) => setApiOp({
          id: o.id,
          brandId: o.brand_id,
          brandName: o.brand_name,
          brandCategory: o.brand_category,
          brandLogo: o.brand_logo || "",
          brandBio: o.brand_bio || "",
          brandInstagram: o.brand_instagram || "",
          brandWebsite: o.brand_website || "",
          title: o.title,
          pitch: o.pitch,
          description: o.description,
          payout: o.payout,
          payoutMin: o.payout_min || 0,
          payoutMax: o.payout_max || 0,
          followersMin: o.followers_min || 0,
          followersMax: o.followers_max || 0,
          needed: o.creators_needed,
          deadline: o.deadline,
          category: o.category,
          cover: o.cover_url,
          language: o.languages || [],
          verified: o.verified,
          applicants: o.applicants_count,
          requirements: o.requirements || [],
        }))
        .catch(() => {});
    });
  }, [id]);

  if (!op) return (
    <div className="min-h-full bg-[#F9F9F8] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#E5E5E5] border-t-[#E25238] rounded-full animate-spin" />
    </div>
  );

  const saved = isSaved(op.id);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${op.brandName} – ${op.title}`, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).then(() => toast.success("Link copied!")).catch(() => toast.info(url));
    }
  };

  return (
    <div data-testid="opportunity-details" className="min-h-full bg-[#F9F9F8] flex flex-col pb-2">
      <TopBar
        title=""
        showBack
        showBookmark
        bookmarkActive={saved}
        onBookmarkClick={() => {
          toggleSave(op.id);
          toast.success(saved ? "Removed from saved" : "Saved");
        }}
      />

      <div className="px-5">
        {/* Brand header */}
        <div className="flex items-center gap-4 mb-2">
          {op.brandLogo ? (
            <img src={op.brandLogo} alt={op.brandName} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <BrandLogo name={op.brandName} size={64} />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-black text-2xl text-[#0A0A0A] tracking-tight">{op.brandName}</h1>
              {op.verified && <BadgeCheck size={18} className="text-[#E25238]" fill="#E25238" stroke="white" />}
            </div>
            <p className="text-sm text-[#525252] font-medium">{op.brandCategory}{op.verified ? " · Verified Brand" : ""}</p>
          </div>
        </div>

        {/* Already applied banner */}
        {applied && (
          <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/25">
            <CheckCircle2 size={18} className="text-[#15803D] flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#15803D]">You've already applied</p>
              <p className="text-xs text-[#15803D]/80 font-medium">Track your application in My Applications.</p>
            </div>
          </div>
        )}

        {/* Cover */}
        {op.cover && (
          <div className="mt-5 mb-6 rounded-3xl overflow-hidden h-44">
            <img src={op.cover} alt={op.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* About brand */}
        <div className="mb-6">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#E25238] mb-2">About Brand</p>
          <p className="text-sm text-[#0A0A0A] leading-relaxed font-medium">
            {op.brandBio || `${op.brandName} hasn't added a description yet.`}
          </p>
          <div className="flex items-center gap-3 mt-4">
            {op.brandInstagram && (
              <a href={op.brandInstagram} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center hover:border-[#0A0A0A] transition-colors">
                <InstagramIcon size={16} />
              </a>
            )}
            {op.brandWebsite && (
              <a href={op.brandWebsite} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center hover:border-[#0A0A0A] transition-colors">
                <Globe size={16} />
              </a>
            )}
            {!op.brandInstagram && !op.brandWebsite && (
              <span className="text-xs text-[#525252] font-medium">No links provided</span>
            )}
          </div>
        </div>

        {/* Campaign */}
        <div className="mb-6">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#E25238] mb-2">Campaign Details</p>
          {op.title && (
            <h2 className="font-display font-black text-xl text-[#0A0A0A] tracking-tight mb-2">{op.title}</h2>
          )}
          <p className="text-sm text-[#0A0A0A] leading-relaxed font-medium">{op.description || op.pitch}</p>
        </div>

        {/* Details list */}
        <div className="bg-white rounded-3xl border border-[#E5E5E5] divide-y divide-[#F3F3F3] mb-6">
          {[
            { icon: Wallet,   label: "Budget", value: (() => {
              const min = op.payoutMin || 0;
              const max = op.payoutMax || 0;
              if (min > 0 && max > 0) return `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}`;
              if (max > 0) return `Up to ₹${max.toLocaleString("en-IN")}`;
              if (min > 0) return `₹${min.toLocaleString("en-IN")}+`;
              return `₹${(op.payout || 0).toLocaleString("en-IN")} per reel`;
            })() },
            { icon: Calendar, label: "Application Deadline",  value: op.deadline },
            { icon: Users,    label: "Creators Needed",       value: `${op.needed}` },
            { icon: Tag,      label: "Category",              value: op.category },
          ].map((row) => (
            <div key={row.label} className="flex items-center px-5 py-4 gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F3F3F3] flex items-center justify-center">
                <row.icon size={16} className="text-[#E25238]" />
              </div>
              <span className="flex-1 text-sm font-medium text-[#525252]">{row.label}</span>
              <span className="text-sm font-bold text-[#0A0A0A]">{row.value}</span>
            </div>
          ))}

          {/* Content Language */}
          {op.language?.length > 0 && (
            <div className="flex items-start px-5 py-4 gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F3F3F3] flex items-center justify-center flex-shrink-0">
                <Languages size={16} className="text-[#E25238]" />
              </div>
              <span className="text-sm font-medium text-[#525252] pt-0.5 flex-shrink-0">Language</span>
              <div className="flex-1 flex flex-wrap gap-1.5 justify-end">
                {op.language.map((l) => (
                  <span key={l} className="px-2.5 py-1 rounded-full bg-[#F3F3F3] text-[#0A0A0A] text-xs font-bold">{l}</span>
                ))}
              </div>
            </div>
          )}

          {op.requirements?.length > 0 && (
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
          )}
        </div>
      </div>

      {/* Floating actions */}
      <div className="sticky bottom-0 left-0 right-0 z-20 mt-4">
        <div className="px-5 py-4 bg-gradient-to-t from-[#F9F9F8] via-[#F9F9F8]/95 to-transparent">
          {applied ? (
            <button
              data-testid="already-applied-btn"
              onClick={() => navigate("/applications")}
              className="w-full bg-[#22C55E] text-white rounded-full py-5 font-bold text-base flex items-center justify-center gap-2 shadow-xl"
            >
              <CheckCircle2 size={18} />
              Applied — View My Applications
            </button>
          ) : (() => {
            const creatorCats = accountType === "creator" ? (user?.creator?.category || []) : [];
            const opCat = op.category || "";
            const catMismatch = accountType === "creator" && creatorCats.length > 0 && opCat && !creatorCats.includes(opCat);
            if (catMismatch) {
              return (
                <div className="w-full bg-[#F3F3F3] rounded-full py-5 font-bold text-sm text-[#525252] flex flex-col items-center justify-center text-center px-6">
                  <span className="font-bold text-[#0A0A0A] text-base">Category Mismatch</span>
                  <span className="text-xs mt-0.5">This opportunity is in <strong>{opCat}</strong>. Your niche: {creatorCats.join(", ")}.</span>
                </div>
              );
            }
            return (
              <button
                data-testid="apply-now-btn"
                onClick={() => setShowApply(true)}
                className="w-full bg-[#0A0A0A] text-white rounded-full py-5 font-bold text-base hover:bg-[#E25238] active:scale-[0.98] transition-all shadow-xl"
              >
                Send My Profile
              </button>
            );
          })()}
          <button
            data-testid="share-btn"
            onClick={handleShare}
            className="w-full mt-3 py-3 rounded-full border border-[#E5E5E5] font-bold text-sm flex items-center justify-center gap-2 bg-white hover:bg-black hover:text-white transition-colors"
          >
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>

      {showApply && (
        <ApplyDialog
          opportunity={op}
          onClose={() => setShowApply(false)}
          onApplied={() => {
            setApplied(true);
            setShowApply(false);
            navigate("/application-submitted");
          }}
        />
      )}
    </div>
  );
}
