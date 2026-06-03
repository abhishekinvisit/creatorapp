import { useNavigate } from "react-router-dom";
import { User, Lock, Bell, ShieldCheck, UserX, HelpCircle, LogOut, ChevronRight, Repeat } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const { accountType, switchMode, logout } = useApp();
  const dark = accountType === "brand";

  const rows = [
    { id: "edit", icon: User, label: "Edit Profile", action: () => navigate("/profile/edit") },
    { id: "switch", icon: Repeat, label: `Switch to ${accountType === "creator" ? "Brand" : "Creator"} Mode`, action: () => {
        const next = accountType === "creator" ? "brand" : "creator";
        switchMode(next);
        toast.success(`Switched to ${next} mode`);
        navigate(next === "brand" ? "/brand/dashboard" : "/home");
      }
    },
    { id: "account", icon: Lock, label: "Account Settings", action: () => toast.info("Coming soon") },
    { id: "notif", icon: Bell, label: "Notifications", action: () => navigate("/notifications") },
    { id: "privacy", icon: ShieldCheck, label: "Privacy & Security", action: () => toast.info("Coming soon") },
    { id: "blocked", icon: UserX, label: "Blocked Users", action: () => toast.info("No blocked users") },
    { id: "help", icon: HelpCircle, label: "Help & Support", action: () => toast.info("Support: hello@ollcollab.com") },
  ];

  return (
    <div data-testid="settings-screen" className={`min-h-full pb-24 ${dark ? "bg-[#0A0A0A] text-white" : "bg-[#F9F9F8]"}`}>
      <TopBar title="Settings" dark={dark} />
      <div className="px-5">
        <div className={`rounded-3xl overflow-hidden ${dark ? "bg-white/5 border border-white/10" : "bg-white border border-[#E5E5E5]"}`}>
          {rows.map((r, idx) => (
            <button
              key={r.id}
              data-testid={`settings-${r.id}`}
              onClick={r.action}
              className={`w-full flex items-center gap-4 px-5 py-4 ${idx !== 0 ? (dark ? "border-t border-white/10" : "border-t border-[#F3F3F3]") : ""} hover:bg-black/5 transition-colors text-left`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dark ? "bg-white/10" : "bg-[#F3F3F3]"}`}>
                <r.icon size={16} className={dark ? "text-[#E25238]" : "text-[#0A0A0A]"} />
              </div>
              <span className="flex-1 font-bold text-sm">{r.label}</span>
              <ChevronRight size={18} className={dark ? "text-neutral-500" : "text-[#525252]"} />
            </button>
          ))}
        </div>

        <button
          data-testid="logout-btn"
          onClick={() => { logout(); navigate("/"); }}
          className="mt-6 w-full flex items-center gap-3 px-5 py-4 rounded-3xl bg-[#EF4444]/10 text-[#EF4444] font-bold hover:bg-[#EF4444] hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>

        <p className={`text-center text-xs font-medium mt-6 ${dark ? "text-neutral-500" : "text-[#525252]"}`}>
          OLLCOLLAB · v1.0.0
        </p>
      </div>
      <BottomNav />
    </div>
  );
}
