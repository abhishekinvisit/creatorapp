import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

const statusLabel = {
  applied: "Under Review",
  viewed: "Viewed by Brand",
  accepted: "Accepted",
  rejected: "Rejected",
};

export default function ApplicationStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, withdrawApplication } = useApp();
  const app = applications.find((a) => a.id === id) || applications[0];

  if (!app) {
    return (
      <div className="min-h-full bg-[#F9F9F8] flex items-center justify-center">
        <p className="text-[#525252]">No application found.</p>
      </div>
    );
  }

  const handleWithdraw = () => {
    withdrawApplication(app.id);
    toast.success("Application withdrawn");
    navigate("/applications");
  };

  return (
    <div data-testid="application-status" className="min-h-full bg-[#F9F9F8] pb-12">
      <TopBar title="Application Details" />

      <div className="px-5">
        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-5 flex items-center gap-4 mb-5">
          <BrandLogo name={app.brandName} size={56} />
          <div className="flex-1">
            <h2 className="font-display font-bold text-lg text-[#0A0A0A]">{app.brandName}</h2>
            <p className="text-xs text-[#525252] font-medium">Applied on {app.appliedOn}</p>
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-[#F59E0B]/15 text-[#B45309] text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              {statusLabel[app.status]}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-5 mb-5">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#E25238] mb-2">Your Application</p>
          <p className="text-sm text-[#0A0A0A] font-medium leading-relaxed">
            Your profile and cover note has been shared with the brand.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-5 mb-8">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#E25238] mb-2">Cover Note</p>
          <p className="text-sm text-[#0A0A0A] font-medium leading-relaxed">
            Hi! I'm a skincare creator based in Delhi. I love creating honest and authentic content. I have worked with skincare brands before and would love to collaborate on this campaign.
          </p>
        </div>

        <button
          data-testid="withdraw-btn"
          onClick={handleWithdraw}
          className="w-full py-4 rounded-full border-2 border-[#0A0A0A] font-bold hover:bg-[#0A0A0A] hover:text-white transition-colors"
        >
          Withdraw Application
        </button>
      </div>
    </div>
  );
}
