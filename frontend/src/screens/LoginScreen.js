import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Phone, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { loginWithToken, accountType } = useApp();

  const [step, setStep] = useState("phone"); // phone | otp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const cleanPhone = () => phone.replace(/\D/g, "");

  const handleSendOtp = async () => {
    const digits = cleanPhone();
    if (digits.length < 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp(digits);
      setStep("otp");
      setCountdown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.message || "Could not send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(cleanPhone(), code, accountType);
      await loginWithToken(res.token, res.account_type, res.onboarding_complete);
      if (res.onboarding_complete) {
        navigate(res.account_type === "brand" ? "/brand/dashboard" : "/home");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      toast.error(err.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e, fn) => e.key === "Enter" && fn();

  return (
    <div data-testid="login-screen" className="min-h-full bg-[#F9F9F8] flex flex-col">
      {/* Back */}
      <div className="px-5 py-4 flex items-center">
        <button
          onClick={() => step === "otp" ? setStep("phone") : navigate(-1)}
          className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Header */}
      <div className="px-8 pt-4">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#E25238] mb-3">
          {accountType === "brand" ? "Brand Account" : "Creator Account"}
        </p>
        <h1 className="font-display font-black text-4xl tracking-tight text-[#0A0A0A] leading-[1.05]">
          {step === "phone" ? (
            <>Welcome<br />back!</>
          ) : (
            <>Verify<br />your phone</>
          )}
        </h1>
        <p className="text-base text-[#525252] mt-3 font-medium">
          {step === "phone"
            ? "Enter your mobile number to continue."
            : `We sent a 6-digit code to +91 ${phone.replace(/\D/g, "")}`
          }
        </p>
      </div>

      <div className="flex-1 px-6 pt-10 space-y-4">
        {step === "phone" && (
          <>
            <div className="bg-white rounded-2xl border-2 border-[#0A0A0A] flex items-center overflow-hidden">
              <div className="pl-4 pr-1 text-[#525252]"><Phone size={18} /></div>
              <span className="pl-2 pr-1 text-sm font-bold text-[#0A0A0A] border-r border-[#E5E5E5] py-4 pr-3">+91</span>
              <input
                data-testid="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d\s\-()]/g, "").slice(0, 14))}
                onKeyDown={(e) => handleKey(e, handleSendOtp)}
                placeholder="98765 43210"
                autoFocus
                inputMode="numeric"
                className="flex-1 px-3 py-4 outline-none bg-white text-[#0A0A0A] font-medium text-lg tracking-widest"
              />
            </div>

            <button
              data-testid="send-otp-btn"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full mt-2 bg-[#0A0A0A] text-white rounded-2xl py-4 font-bold hover:bg-[#E25238] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/>
                </svg>
              ) : (
                <>Send OTP <ArrowRight size={16} /></>
              )}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            {/* OTP boxes */}
            <div className="flex gap-3 justify-center">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className={`w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-colors bg-white ${
                    digit ? "border-[#0A0A0A] text-[#0A0A0A]" : "border-[#E5E5E5] text-[#B0B0B0]"
                  } focus:border-[#E25238]`}
                />
              ))}
            </div>

            <button
              data-testid="verify-otp-btn"
              onClick={handleVerifyOtp}
              disabled={loading || otp.join("").length !== 6}
              className="w-full mt-2 bg-[#0A0A0A] text-white rounded-2xl py-4 font-bold hover:bg-[#E25238] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/>
                </svg>
              ) : (
                <>Verify & Continue <ArrowRight size={16} /></>
              )}
            </button>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-[#525252] font-medium">
                  Resend OTP in <span className="font-black text-[#0A0A0A]">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={() => { setOtp(["","","","","",""]); handleSendOtp(); }}
                  className="text-sm font-bold text-[#E25238] hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <p className="text-center text-xs text-[#B0B0B0] font-medium pt-1">
              Hint: any 6-digit code works for demo
            </p>
          </>
        )}
      </div>

      <div className="px-8 pb-8 pt-4 text-center">
        <p className="text-xs text-[#525252] font-medium">
          By continuing, you agree to our{" "}
          <span className="text-[#E25238] font-bold">Terms & Conditions</span>
        </p>
      </div>
    </div>
  );
}
