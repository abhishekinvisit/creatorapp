import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageCircle, Check } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/context/AppContext";
import { applicationsApi, messagesApi } from "@/lib/api";
import { toast } from "sonner";

const statusMeta = {
  applied:     { label: "Under Review",      dot: "bg-[#F59E0B]",  chip: "bg-[#F59E0B]/15 text-[#B45309]" },
  viewed:      { label: "Viewed by Brand",   dot: "bg-[#3B82F6]",  chip: "bg-[#3B82F6]/15 text-[#1D4ED8]" },
  shortlisted: { label: "Shortlisted ⭐",    dot: "bg-[#F59E0B]",  chip: "bg-[#F59E0B]/15 text-[#B45309]" },
  accepted:    { label: "Accepted 🎉",        dot: "bg-[#22C55E]",  chip: "bg-[#22C55E]/15 text-[#15803D]" },
  rejected:    { label: "Not Selected",      dot: "bg-[#EF4444]",  chip: "bg-[#EF4444]/15 text-[#B91C1C]" },
};

export default function ApplicationStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, withdrawApplication } = useApp();
  const [messaging, setMessaging] = useState(false);

  const app = applications.find((a) => String(a.id) === String(id)) || applications[0];

  if (!app) {
    return (
      <div className="min-h-full bg-[#F9F9F8] flex items-center justify-center">
        <p className="text-[#525252]">No application found.</p>
      </div>
    );
  }

  const meta = statusMeta[app.status] || statusMeta.applied;
  const isAccepted = app.status === "accepted";

  const handleWithdraw = async () => {
    try {
      await applicationsApi.withdraw(app.id);
    } catch (_) {}
    withdrawApplication(app.id);
    toast.success("Application withdrawn");
    navigate("/applications");
  };

  const handleMessage = async () => {
    setMessaging(true);
    try {
      if (app.brandId) {
        const thread = await messagesApi.openWith(app.brandId);
        navigate(`/chat/${thread.id}`);
      } else {
        toast.error("Could not open chat — brand info missing");
      }
    } catch (_) {
      toast.error("Failed to open chat");
    } finally {
      setMessaging(false);
    }
  };

  return (
    <div data-testid="application-status" className="min-h-full bg-[#F9F9F8] pb-12">
      <TopBar title="Application Details" />

      <div className="px-5">
        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-5 flex items-center gap-4 mb-5">
          <BrandLogo name={app.brandName} size={56} />
          <div className="flex-1">
            <h2 className="font-display font-bold text-lg text-[#0A0A0A]">{app.brandName}</h2>
            {app.opportunityTitle && (
              <p className="text-xs text-[#525252] font-medium mt-0.5">{app.opportunityTitle}</p>
            )}
            <p className="text-xs text-[#525252] font-medium">Applied on {app.appliedOn}</p>
            <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold ${meta.chip}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </div>
          </div>
        </div>

        {isAccepted && (
          <div data-testid="accepted-banner" className="bg-gradient-to-br from-[#22C55E]/10 to-[#22C55E]/5 border border-[#22C55E]/30 rounded-3xl p-5 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#22C55E] text-white flex items-center justify-center flex-shrink-0">
                <Check size={20} strokeWidth={3} />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-[#15803D] text-base leading-tight">
                  You're in! {app.brandName} accepted your application.
                </p>
                <p className="text-xs text-[#15803D]/80 font-medium mt-1">
                  Reach out to align on deliverables, timelines and creatives.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-5 mb-5">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#E25238] mb-2">Your Application</p>
          <p className="text-sm text-[#0A0A0A] font-medium leading-relaxed">
            Your profile and cover note has been shared with the brand.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-5 mb-8">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#E25238] mb-2">Cover Note</p>
          <p className="text-sm text-[#0A0A0A] font-medium leading-relaxed">
            {app.note || "No cover note was included with this application."}
          </p>
        </div>

        {isAccepted ? (
          <button
            data-testid="message-brand-btn"
            onClick={handleMessage}
            disabled={messaging}
            className="w-full py-4 rounded-full bg-[#0A0A0A] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#E25238] transition-colors disabled:opacity-60"
          >
            <MessageCircle size={18} />
            {messaging ? "Opening chat…" : `Message ${app.brandName}`}
          </button>
        ) : (
          <button
            data-testid="withdraw-btn"
            onClick={handleWithdraw}
            className="w-full py-4 rounded-full border-2 border-[#0A0A0A] font-bold hover:bg-[#0A0A0A] hover:text-white transition-colors"
          >
            Withdraw Application
          </button>
        )}
      </div>
    </div>
  );
}
