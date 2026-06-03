import { useState } from "react";
import { Settings as SettingsIcon, Eye, Check, MessageCircle, Megaphone, AtSign } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useApp } from "@/context/AppContext";

const TABS = ["All", "Unread", "Mentions"];

const iconMap = {
  view: Eye,
  accept: Check,
  message: MessageCircle,
  post: Megaphone,
  mention: AtSign,
};

export default function Notifications() {
  const { notifications, markAllNotificationsRead, accountType } = useApp();
  const [tab, setTab] = useState("All");
  const dark = accountType === "brand";

  const filtered = notifications.filter((n) => {
    if (tab === "All") return true;
    if (tab === "Unread") return n.unread;
    return n.type === "mention";
  });

  return (
    <div data-testid="notifications-screen" className={`min-h-full ${dark ? "bg-[#0A0A0A] text-white" : "bg-[#F9F9F8]"}`}>
      <TopBar
        title="Notifications"
        dark={dark}
        rightSlot={
          <button data-testid="notif-settings" onClick={markAllNotificationsRead} className={`w-10 h-10 rounded-full flex items-center justify-center ${dark ? "bg-white/10" : "bg-black/5"}`}>
            <SettingsIcon size={18} />
          </button>
        }
      />

      <div className="px-5">
        <div className="flex items-center gap-2 pb-3">
          {TABS.map((t) => (
            <button
              key={t}
              data-testid={`notif-tab-${t.toLowerCase()}`}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                tab === t
                  ? (dark ? "bg-[#E25238] text-white" : "bg-[#0A0A0A] text-white")
                  : (dark ? "bg-white/5 text-neutral-300 border border-white/10" : "bg-white text-[#525252] border border-[#E5E5E5]")
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          {filtered.map((n, idx) => {
            const Icon = iconMap[n.type] || Eye;
            return (
              <div
                key={n.id}
                data-testid={`notif-${n.id}`}
                className={`flex items-start gap-4 py-4 ${idx !== 0 ? (dark ? "border-t border-white/10" : "border-t border-[#E5E5E5]") : ""}`}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                  n.unread
                    ? "bg-[#E25238] text-white"
                    : (dark ? "bg-white/10 text-neutral-300" : "bg-[#F3F3F3] text-[#525252]")
                }`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium leading-snug ${dark ? "text-white" : "text-[#0A0A0A]"}`}>{n.text}</p>
                  <p className={`text-xs mt-1 font-bold uppercase tracking-wider ${dark ? "text-neutral-500" : "text-[#525252]"}`}>{n.time} ago</p>
                </div>
                {n.unread && <div className="w-2 h-2 rounded-full bg-[#E25238] mt-2 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        <button
          data-testid="view-all-notif"
          className={`w-full text-center py-4 text-sm font-bold uppercase tracking-wider mt-4 ${dark ? "text-[#E25238]" : "text-[#E25238]"}`}
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}
