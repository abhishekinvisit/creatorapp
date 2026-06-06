import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, TrendingUp, Users } from "lucide-react";

const FEATURES = [
  { icon: Zap, text: "Instant brand matching" },
  { icon: TrendingUp, text: "Track campaign performance" },
  { icon: Users, text: "10,000+ active creators" },
];

export default function SplashScreen() {
  const navigate = useNavigate();
  return (
    <div
      data-testid="splash-screen"
      className="min-h-full flex flex-col bg-[#0A0A0A] relative overflow-hidden"
    >
      {/* Background glows */}
      <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-[#E25238] opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-[#F59E0B] opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#E25238] opacity-5 blur-3xl pointer-events-none" />

      {/* Top badge */}
      <div className="pt-16 flex justify-center relative z-10">
        <span className="px-4 py-1.5 rounded-full bg-[#E25238]/15 border border-[#E25238]/30 text-[#E25238] text-[10px] font-bold uppercase tracking-[0.3em]">
          Creator Marketplace
        </span>
      </div>

      {/* Center hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        {/* Logo */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-[#E25238] rounded-[28px] blur-2xl opacity-40 scale-110" />
          <div className="relative w-24 h-24 rounded-[24px] bg-gradient-to-br from-[#E25238] to-[#F59E0B] flex items-center justify-center shadow-2xl">
            <div className="w-11 h-11 rounded-full border-[4px] border-white opacity-90" />
          </div>
        </div>

        {/* Wordmark */}
        <h1 className="font-display font-black text-6xl tracking-tighter text-white leading-none mb-2">
          OLL
          <span className="text-[#E25238]">COLLAB</span>
        </h1>
        <p className="text-sm font-medium text-neutral-400 tracking-[0.2em] uppercase mt-1 mb-10">
          Where Brands Meet Creators
        </p>

        {/* Feature pills */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-[#E25238]/15 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-[#E25238]" />
              </div>
              <span className="text-sm font-medium text-neutral-300">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-12 relative z-10 space-y-3">
        <button
          data-testid="get-started-btn"
          onClick={() => navigate("/account-type")}
          className="w-full bg-[#E25238] text-white rounded-full py-5 font-bold text-base flex items-center justify-center gap-2 hover:bg-[#C9452D] transition-all group shadow-xl shadow-[#E25238]/20"
        >
          Get Started
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          data-testid="login-link"
          onClick={() => navigate("/login")}
          className="w-full py-4 rounded-full border border-white/15 font-bold text-sm text-neutral-300 hover:border-white/30 hover:text-white transition-all"
        >
          Already have an account? Log in
        </button>
        <p className="text-center text-[10px] text-neutral-600 font-medium pt-1">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
