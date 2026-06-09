import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { loginWithToken, accountType } = useApp();

  const [step, setStep] = useState("email"); // email | password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmail = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.checkEmail(email.trim().toLowerCase());
      setIsNew(!res.exists);
      setStep("password");
    } catch (_) {
      // If backend unreachable, still proceed
      setIsNew(true);
      setStep("password");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      let res;
      if (isNew) {
        res = await authApi.register(email.trim().toLowerCase(), password, accountType);
        toast.success("Account created!");
      } else {
        res = await authApi.login(email.trim().toLowerCase(), password);
      }
      loginWithToken(res.token, res.account_type, res.onboarding_complete);
      if (res.onboarding_complete) {
        navigate(res.account_type === "brand" ? "/brand/dashboard" : "/home");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong. Try again.");
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
          onClick={() => step === "password" ? setStep("email") : navigate(-1)}
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
          {step === "email"
            ? <>Welcome<br />back!</>
            : isNew
            ? <>Create your<br />account</>
            : <>Welcome<br />back!</>
          }
        </h1>
        <p className="text-base text-[#525252] mt-3 font-medium">
          {step === "email"
            ? "Enter your email to continue."
            : isNew
            ? "Choose a password for your new account."
            : `Signing in as ${email}`
          }
        </p>
      </div>

      <div className="flex-1 px-6 pt-10 space-y-4">
        {/* Email */}
        <div className={`bg-white rounded-2xl border-2 transition-colors flex items-center overflow-hidden ${step === "email" ? "border-[#0A0A0A]" : "border-[#E5E5E5]"}`}>
          <div className="pl-4 pr-2 text-[#525252]"><Mail size={18} /></div>
          <input
            data-testid="email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => handleKey(e, step === "email" ? handleEmail : () => {})}
            placeholder="your@email.com"
            disabled={step === "password"}
            className="flex-1 px-3 py-4 outline-none bg-white text-[#0A0A0A] font-medium disabled:text-[#525252]"
          />
        </div>

        {/* Password — slide in */}
        {step === "password" && (
          <div className="bg-white rounded-2xl border-2 border-[#0A0A0A] flex items-center overflow-hidden animate-fade-up">
            <div className="pl-4 pr-2 text-[#525252]"><Lock size={18} /></div>
            <input
              data-testid="password-input"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => handleKey(e, handleAuth)}
              placeholder={isNew ? "Create a password (min 6 chars)" : "Enter your password"}
              autoFocus
              className="flex-1 px-3 py-4 outline-none bg-white text-[#0A0A0A] font-medium"
            />
            <button
              onClick={() => setShowPw((v) => !v)}
              className="px-4 text-[#525252] hover:text-[#0A0A0A]"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        )}

        {/* CTA */}
        <button
          data-testid="login-continue"
          onClick={step === "email" ? handleEmail : handleAuth}
          disabled={loading}
          className="w-full mt-2 bg-[#0A0A0A] text-white rounded-2xl py-4 font-bold hover:bg-[#E25238] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {step === "email" ? "Continue" : isNew ? "Create Account" : "Sign In"}
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {step === "password" && isNew && (
          <p className="text-center text-xs text-[#525252] font-medium">
            Already have an account?{" "}
            <button
              onClick={() => { setIsNew(false); }}
              className="font-bold text-[#0A0A0A] hover:text-[#E25238]"
            >
              Sign in instead
            </button>
          </p>
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
