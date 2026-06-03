import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SplashScreen() {
  const navigate = useNavigate();
  return (
    <div data-testid="splash-screen" className="min-h-full flex flex-col bg-[#F9F9F8] relative overflow-hidden">
      {/* Background blob */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#E25238]/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#F59E0B]/15 blur-3xl" />

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        {/* Logo block */}
        <div className="relative mb-12 animate-fade-up">
          <div className="absolute inset-0 bg-[#E25238] rounded-3xl rotate-6 scale-110 opacity-20 blur-2xl" />
          <div className="relative w-28 h-28 rounded-[28px] bg-gradient-to-br from-[#E25238] to-[#F59E0B] flex items-center justify-center shadow-2xl">
            <div className="w-14 h-14 rounded-full border-[5px] border-white" />
          </div>
        </div>

        <h1 className="font-display font-black text-5xl tracking-tighter text-[#0A0A0A] mb-3 animate-fade-up">
          OLLCOLLAB
        </h1>
        <p className="text-sm font-bold tracking-[0.3em] uppercase text-[#525252] mb-1">Connect</p>
        <p className="text-sm font-bold tracking-[0.3em] uppercase text-[#525252] mb-1">Collaborate</p>
        <p className="text-sm font-bold tracking-[0.3em] uppercase text-[#E25238]">Create</p>
      </div>

      <div className="px-6 pb-12 relative z-10">
        <button
          data-testid="get-started-btn"
          onClick={() => navigate("/account-type")}
          className="w-full bg-[#0A0A0A] text-white rounded-full py-5 font-bold text-base flex items-center justify-center gap-2 hover:bg-[#E25238] transition-all group shadow-xl"
        >
          Get Started
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-8 h-1.5 rounded-full bg-[#0A0A0A]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]/30" />
        </div>
      </div>
    </div>
  );
}
