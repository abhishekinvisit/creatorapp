import { ExternalLink } from "lucide-react";

const InstagramIcon = ({ size = 16, className = "", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
import { BrandLogo } from "@/components/BrandLogo";

/**
 * Vertical 9:16 reel card.
 * Tapping opens the Instagram reel/post in a new tab.
 */
export const ReelCard = ({ reel, testId, delay = 0 }) => {
  const open = () => {
    window.open(reel.instagramUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      data-testid={testId}
      onClick={open}
      className="group relative aspect-[9/16] w-full rounded-3xl overflow-hidden bg-[#0A0A0A] text-left animate-fade-up hover:-translate-y-1 transition-all shadow-sm hover:shadow-2xl"
      style={{ animationDelay: `${delay}ms` }}
    >
      {reel.thumbnail ? (
        <img
          src={reel.thumbnail}
          alt={reel.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      ) : null}
      {/* Top gradient + brand */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/70 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <BrandLogo name={reel.brand} size={28} dark />
          <span className="text-[11px] font-bold text-white truncate drop-shadow">{reel.brand}</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center">
          <ExternalLink size={12} className="text-white" />
        </div>
      </div>

      {/* Bottom gradient + title + IG icon */}
      <div className="absolute bottom-0 left-0 right-0 p-3 pt-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
        <div className="flex items-end justify-between gap-2">
          <p className="text-xs font-bold text-white leading-snug line-clamp-2 flex-1 drop-shadow">
            {reel.title}
          </p>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <InstagramIcon size={14} className="text-[#0A0A0A]" />
          </div>
        </div>
      </div>
    </button>
  );
};
