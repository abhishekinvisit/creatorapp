import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";

const DARK_ROUTES = ["/brand/dashboard", "/brand/applicants", "/brand/post", "/brand/requirements", "/brand/discover"];

const NAV_ROUTES = new Set([
  "/home",
  "/search",
  "/saved",
  "/applications",
  "/messages",
  "/profile",
  "/settings",
  "/notifications",
  "/brands",
  "/brand/dashboard",
  "/brand/applicants",
  "/brand/discover",
]);

const FEATURES = [
  { emoji: "🎯", title: "Targeted Campaigns", desc: "Match with brands that fit your niche perfectly" },
  { emoji: "💸", title: "Fast Payouts", desc: "Get paid within 48 hours of campaign completion" },
  { emoji: "📊", title: "Real-time Analytics", desc: "Track your applications and earnings live" },
  { emoji: "🤝", title: "Direct Collab", desc: "Chat directly with brands, no middlemen" },
];

const STATS = [
  { value: "12K+", label: "Creators" },
  { value: "800+", label: "Brands" },
  { value: "₹2Cr+", label: "Paid Out" },
];

export const PhoneFrame = () => {
  const location = useLocation();
  const isDark = DARK_ROUTES.some((p) => location.pathname.startsWith(p));
  const showNav = NAV_ROUTES.has(location.pathname);

  return (
    <div className="phone-frame-wrapper min-h-screen w-full flex items-center justify-center p-0 sm:p-6 lg:p-10">
      {/* Mobile: full screen, no wrapper */}
      {/* Tablet: centered phone frame */}
      {/* Desktop: marketing panel + phone frame */}

      <div className="w-full flex items-center justify-center lg:gap-16 xl:gap-24">

        {/* ── Left marketing panel (desktop only) ── */}
        <div className="hidden lg:flex flex-col justify-center max-w-sm xl:max-w-md flex-shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#E25238] to-[#F59E0B] flex items-center justify-center shadow-lg shadow-[#E25238]/30">
              <div className="w-5 h-5 rounded-full border-[3px] border-white" />
            </div>
            <span className="font-display font-black text-2xl tracking-[-0.04em] text-white">OLLCOLLAB</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-black text-4xl xl:text-5xl text-white leading-[1.05] tracking-[-0.03em] mb-4">
            Where Creators<br />
            <span className="text-[#E25238]">Meet Brands</span>
          </h1>
          <p className="text-neutral-400 text-base xl:text-lg font-medium leading-relaxed mb-10">
            The fastest-growing creator economy platform in India. Find brand deals, grow your income, and collaborate with top brands.
          </p>

          {/* Stats row */}
          <div className="flex gap-6 mb-10">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display font-black text-2xl text-white">{s.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-base">
                  {f.emoji}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{f.title}</p>
                  <p className="text-neutral-500 text-xs font-medium leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p className="mt-10 text-xs text-neutral-600 font-medium">
            ← Try the live demo on the right
          </p>
        </div>

        {/* ── Phone frame ── */}
        <div
          data-testid="phone-frame"
          className={`
            relative flex-shrink-0
            w-full sm:w-[390px] md:w-[410px] lg:w-[390px]
            h-[100dvh] sm:h-[820px] md:h-[840px] sm:max-h-[92vh]
            overflow-hidden
            sm:rounded-[44px] sm:border-[10px] sm:border-neutral-900
            shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] sm:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)]
            flex flex-col
            ${isDark ? "app-screen-dark" : "app-screen"}
            grain
          `}
        >
          {/* Notch on sm+ */}
          <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-28 h-[22px] bg-neutral-900 rounded-b-2xl z-50 items-end justify-center pb-1">
            <div className="w-2 h-2 rounded-full bg-neutral-700" />
          </div>

          {/* Side buttons (decorative) */}
          <div className="hidden sm:block absolute -right-[12px] top-24 w-[3px] h-12 bg-neutral-800 rounded-full" />
          <div className="hidden sm:block absolute -left-[12px] top-20 w-[3px] h-7 bg-neutral-800 rounded-full" />
          <div className="hidden sm:block absolute -left-[12px] top-32 w-[3px] h-12 bg-neutral-800 rounded-full" />

          <div className="relative flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide pt-0 sm:pt-[22px]">
            <Outlet />
          </div>
          {showNav && <BottomNav />}
        </div>

      </div>
    </div>
  );
};
