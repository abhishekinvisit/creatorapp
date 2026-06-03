import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ApplicationSubmitted() {
  const navigate = useNavigate();
  return (
    <div data-testid="application-submitted" className="min-h-full bg-[#F9F9F8] flex flex-col items-center justify-center px-8 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-72 h-72 rounded-full bg-[#E25238]/10 blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 rounded-full bg-[#F59E0B]/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-[#E25238]/20 pulse-ring" />
          <div className="relative w-24 h-24 rounded-full bg-[#0A0A0A] flex items-center justify-center">
            <Check size={48} className="text-white" strokeWidth={3} />
          </div>
        </div>

        <h1 className="font-display font-black text-3xl tracking-tight text-[#0A0A0A] leading-tight">
          Application<br />Submitted!
        </h1>
        <p className="text-base text-[#525252] mt-4 font-medium max-w-xs">
          Your profile has been shared with the brand. We'll notify you once they respond.
        </p>

        <div className="w-full max-w-xs mt-12 space-y-3">
          <button
            data-testid="view-applications-btn"
            onClick={() => navigate("/applications")}
            className="w-full bg-[#0A0A0A] text-white rounded-full py-4 font-bold hover:bg-[#E25238] transition-colors"
          >
            View My Applications
          </button>
          <button
            data-testid="back-home-btn"
            onClick={() => navigate("/home")}
            className="w-full py-4 rounded-full font-bold text-sm text-[#0A0A0A] hover:underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
