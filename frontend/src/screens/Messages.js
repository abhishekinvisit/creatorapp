import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/context/AppContext";
import { messagesApi } from "@/lib/api";

function timeAgo(isoStr) {
  if (!isoStr) return "";
  try {
    const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  } catch (_) {
    return "";
  }
}

export default function Messages() {
  const navigate = useNavigate();
  const { threads, setThreads, accountType } = useApp();
  const dark = accountType === "brand";

  useEffect(() => {
    messagesApi.threads()
      .then((data) => {
        const mapped = data.map((t) => ({
          id: t.id,
          name: accountType === "creator" ? (t.brand_name || "Brand") : (t.creator_name || "Creator"),
          online: false,
          lastMessage: t.last_message || "Conversation started",
          time: timeAgo(t.updated_at),
          unread: accountType === "creator" ? (t.unread_creator || 0) : (t.unread_brand || 0),
          messages: [],
          // keep both IDs for chat screen
          creator_id: t.creator_id,
          brand_id: t.brand_id,
        }));
        setThreads(mapped);
      })
      .catch(() => {});
  }, [accountType, setThreads]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div data-testid="messages-list" className={`min-h-full pb-6 ${dark ? "bg-[#0A0A0A] text-white" : "bg-[#F9F9F8]"}`}>
      <TopBar title="Messages" showBack={false} dark={dark} />
      <div className="px-5">
        {threads.length === 0 && (
          <div className="text-center py-16">
            <p className={`font-display font-bold text-lg ${dark ? "text-white" : "text-[#0A0A0A]"}`}>No messages yet</p>
            <p className={`text-sm mt-1 font-medium ${dark ? "text-neutral-400" : "text-[#525252]"}`}>
              {accountType === "creator"
                ? "Apply to opportunities to start conversations."
                : "Accept applicants to message them."}
            </p>
          </div>
        )}
        {threads.map((t, idx) => (
          <button
            key={t.id}
            data-testid={`thread-${t.id}`}
            onClick={() => navigate(`/chat/${t.id}`)}
            className={`w-full text-left py-4 flex items-center gap-4 ${idx !== 0 ? (dark ? "border-t border-white/10" : "border-t border-[#E5E5E5]") : ""}`}
          >
            <div className="relative">
              <BrandLogo name={t.name} size={52} dark={dark} />
              {t.online && (
                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#22C55E] ${dark ? "border-2 border-[#0A0A0A]" : "border-2 border-[#F9F9F8]"}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold truncate">{t.name}</h4>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${dark ? "text-neutral-500" : "text-[#525252]"}`}>{t.time}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className={`text-sm font-medium truncate pr-2 ${dark ? "text-neutral-400" : "text-[#525252]"}`}>{t.lastMessage}</p>
                {t.unread > 0 && (
                  <span className="bg-[#E25238] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {t.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
