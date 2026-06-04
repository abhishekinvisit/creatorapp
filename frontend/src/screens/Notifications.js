import { useState, useEffect } from "react";
import { Check, MessageCircle, Megaphone, AtSign, Bell, Briefcase, Users } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useApp } from "@/context/AppContext";
import { notificationsApi } from "@/lib/api";

const TABS = ["All", "Unread"];

const iconMap = {
  message:   MessageCircle,
  MessageCircle: MessageCircle,
  post:      Megaphone,
  mention:   AtSign,
  apply:     Users,
  Users:     Users,
  status:    Briefcase,
  Briefcase: Briefcase,
  info:      Bell,
  Bell:      Bell,
};

function timeAgo(isoStr) {
  if (!isoStr) return "just now";
  try {
    const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  } catch (_) {
    return "just now";
  }
}

export default function Notifications() {
  const { notifications, setNotifications, markAllNotificationsRead, accountType } = useApp();
  const [tab, setTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const dark = accountType === "brand";

  useEffect(() => {
    notificationsApi.list()
      .then((data) => {
        if (!data.length) return;
        const mapped = data.map((n) => ({
          id: n.id,
          type: n.type || "info",
          icon: n.icon || "Bell",
          text: n.text,
          unread: !n.is_read,
          time: timeAgo(n.created_at),
        }));
        setNotifications(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAll = async () => {
    markAllNotificationsRead();
    try { await notificationsApi.markAll(); } catch (_) {}
  };

  const filtered = notifications.filter((n) => {
    if (tab === "Unread") return n.unread;
    return true;
  });

  return (
    <div data-testid="notifications-screen" className={`min-h-full ${dark ? "bg-[#0A0A0A] text-white" : "bg-[#F9F9F8]"}`}>
      <TopBar
        title="Notifications"
        dark={dark}
        rightSlot={
          <button
            data-testid="notif-settings"
            onClick={handleMarkAll}
            className={`px-3 py-2 rounded-full text-xs font-bold ${dark ? "bg-white/10 text-white" : "bg-black/5 text-[#0A0A0A]"}`}
          >
            Mark all read
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

        {loading ? (
          <div className="pt-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#E5E5E5] border-t-[#E25238] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Bell size={32} className={`mx-auto mb-3 ${dark ? "text-neutral-600" : "text-[#CCCCCC]"}`} />
                <p className={`font-bold ${dark ? "text-white" : "text-[#0A0A0A]"}`}>All caught up!</p>
                <p className={`text-sm mt-1 ${dark ? "text-neutral-400" : "text-[#525252]"}`}>No notifications here.</p>
              </div>
            )}
            {filtered.map((n, idx) => {
              const Icon = iconMap[n.icon] || iconMap[n.type] || Bell;
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
        )}
      </div>
    </div>
  );
}
