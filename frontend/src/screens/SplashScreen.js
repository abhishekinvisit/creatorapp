import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SplashScreen() {
  const navigate = useNavigate();
  return (
    <div
      data-testid="splash-screen"
      className="min-h-screen flex flex-col bg-[#0A0A0A] relative overflow-hidden"
    >
      {/* Background glows */}
      <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-[#E25238] opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-[#F59E0B] opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#E25238] opacity-5 blur-3xl pointer-events-none" />

      {/* Center hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        {/* Logo mark */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#E25238] rounded-full blur-2xl opacity-30 scale-110" />
          <img
            src="/rytspot-logo.png"
            alt="Rytspot"
            className="relative w-24 h-24 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Wordmark */}
        <h1 className="font-display font-black text-6xl tracking-tighter text-white leading-none mb-4">
          Ryt<span className="text-[#E25238]">spot</span>
        </h1>

        {/* Tagline */}
        <p className="text-base font-medium text-neutral-400 text-center leading-relaxed max-w-xs">
          Connecting Right Creators with Right Brands
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-12 relative z-10 space-y-3">
        <button
          data-testid="get-started-btn"
          onClick={() => navigate("/account-type")}
          className="w-full bg-[#E25238] text-white rounded-full py-5 font-bold text-base flex items-center justify-center gap-2 hover:bg-[#C9452D] transition-all group shadow-xl shadow-[#E25238]/20"
        >
          Get Started
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
        
        <p className="text-center text-[10px] text-neutral-600 font-medium pt-1">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
