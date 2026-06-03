import { useNavigate } from "react-router-dom";
import { User, Briefcase, ChevronRight, ChevronLeft } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function AccountTypeScreen() {
  const navigate = useNavigate();
  const { setAccountType } = useApp();

  const choose = (type) => {
    setAccountType(type);
    navigate("/login");
  };

  return (
    <div data-testid="account-type-screen" className="min-h-full bg-[#F9F9F8] flex flex-col">
      <div className="px-5 py-4 flex items-center">
        <button data-testid="back-btn" onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="px-8 pt-6 pb-2">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#E25238] mb-3">Step 01</p>
        <h1 className="font-display font-black text-4xl tracking-tight text-[#0A0A0A] leading-[1.05]">
          Choose your<br/>account type
        </h1>
        <p className="text-base text-[#525252] mt-3 font-medium">Join the creator-brand collab economy.</p>
      </div>

      <div className="flex-1 px-6 pt-10 space-y-5">
        <button
          data-testid="select-creator-btn"
          onClick={() => choose("creator")}
          className="w-full text-left p-6 bg-white rounded-3xl border border-[#E5E5E5] hover:border-[#0A0A0A] hover:-translate-y-1 hover:shadow-xl transition-all group"
        >
          <div className="flex items-start justify-between mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E25238] to-[#F59E0B] flex items-center justify-center">
              <User size={26} className="text-white" strokeWidth={2.4} />
            </div>
            <ChevronRight size={22} className="text-[#0A0A0A] group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-display font-black text-2xl text-[#0A0A0A] tracking-tight">I'm a Creator</h3>
          <p className="text-sm text-[#525252] mt-1 font-medium">Find brand opportunities & get paid.</p>
        </button>

        <button
          data-testid="select-brand-btn"
          onClick={() => choose("brand")}
          className="w-full text-left p-6 bg-[#0A0A0A] text-white rounded-3xl hover:-translate-y-1 hover:shadow-xl transition-all group"
        >
          <div className="flex items-start justify-between mb-5">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
              <Briefcase size={26} className="text-[#0A0A0A]" strokeWidth={2.4} />
            </div>
            <ChevronRight size={22} className="text-white group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-display font-black text-2xl text-white tracking-tight">I'm a Brand</h3>
          <p className="text-sm text-neutral-400 mt-1 font-medium">Find the right creators for your campaign.</p>
        </button>
      </div>

      <div className="px-8 pb-8 pt-6">
        <p className="text-xs text-[#525252] text-center font-medium">
          You can switch modes later in settings.
        </p>
      </div>
    </div>
  );
}
