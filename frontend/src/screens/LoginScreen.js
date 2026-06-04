import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ChevronLeft } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { setIsAuthed, accountType } = useApp();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("phone"); // phone | otp
  const [otp, setOtp] = useState("");

  const goToOnboarding = () => {
    setIsAuthed(true);
    navigate("/onboarding");
  };

  const handleContinue = () => {
    if (step === "phone") {
      if (phone.length < 10) {
        toast.error("Enter a valid 10-digit mobile number");
        return;
      }
      setStep("otp");
      toast.success("OTP sent: 1234 (demo)");
    } else {
      if (otp !== "1234") {
        toast.error("Invalid OTP. Use 1234 for demo.");
        return;
      }
      goToOnboarding();
    }
  };

  const handleEmail = () => {
    goToOnboarding();
  };

  return (
    <div data-testid="login-screen" className="min-h-full bg-[#F9F9F8] flex flex-col">
      <div className="px-5 py-4 flex items-center">
        <button data-testid="login-back" onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="px-8 pt-6">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#E25238] mb-3">
          {accountType === "brand" ? "Brand Account" : "Creator Account"}
        </p>
        <h1 className="font-display font-black text-4xl tracking-tight text-[#0A0A0A] leading-[1.05]">
          Welcome<br />back!
        </h1>
        <p className="text-base text-[#525252] mt-3 font-medium">
          {step === "phone" ? "Login or sign up to continue." : "Enter the 4-digit code we sent you."}
        </p>
      </div>

      <div className="flex-1 px-6 pt-10">
        {step === "phone" ? (
          <div className="bg-white rounded-2xl border border-[#E5E5E5] flex items-center overflow-hidden">
            <div className="px-4 py-4 border-r border-[#E5E5E5] bg-[#F9F9F8] font-bold text-[#0A0A0A]">+91</div>
            <input
              data-testid="phone-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Enter mobile number"
              className="flex-1 px-4 py-4 outline-none bg-white text-[#0A0A0A] font-medium"
            />
          </div>
        ) : (
          <div>
            <input
              data-testid="otp-input"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="• • • •"
              className="w-full px-4 py-5 outline-none bg-white border border-[#E5E5E5] rounded-2xl text-[#0A0A0A] font-bold text-2xl tracking-[0.5em] text-center"
            />
            <p className="text-xs text-[#525252] mt-3 text-center font-medium">
              Demo OTP: <span className="font-bold text-[#0A0A0A]">1234</span>
            </p>
          </div>
        )}

        <button
          data-testid={step === "otp" ? "otp-verify" : "login-continue"}
          onClick={handleContinue}
          className="w-full mt-6 bg-[#0A0A0A] text-white rounded-full py-5 font-bold hover:bg-[#E25238] transition-colors"
        >
          {step === "otp" ? "Verify & Continue" : "Continue"}
        </button>

        {step === "phone" && (
          <>
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#E5E5E5]" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#525252]">or</span>
              <div className="flex-1 h-px bg-[#E5E5E5]" />
            </div>

            <button
              data-testid="login-email"
              onClick={handleEmail}
              className="w-full py-4 rounded-full border-2 border-[#0A0A0A] font-bold flex items-center justify-center gap-2 hover:bg-[#0A0A0A] hover:text-white transition-colors"
            >
              <Mail size={18} />
              Continue with Email
            </button>
          </>
        )}
      </div>

      <div className="px-8 pb-8 pt-6 text-center">
        <p className="text-xs text-[#525252] font-medium">
          By continuing, you agree to our{" "}
          <span className="text-[#E25238] font-bold">Terms & Conditions</span>
        </p>
      </div>
    </div>
  );
}
