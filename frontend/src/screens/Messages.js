import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MessageCircle } from "lucide-react";
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
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

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
          creator_id: t.creator_id,
          brand_id: t.brand_id,
        }));
        setThreads(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accountType, setThreads]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = q.trim()
    ? threads.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()))
    : threads;

  const bg = dark ? "bg-[#0A0A0A]" : "bg-[#F9F9F8]";
  const cardBg = dark ? "bg-white/5 border border-white/10" : "bg-white border border-[#E5E5E5]";
  const textPrimary = dark ? "text-white" : "text-[#0A0A0A]";
  const textSecondary = dark ? "text-neutral-400" : "text-[#525252]";
  const inputBg = dark ? "bg-white/5 border-white/10 text-white placeholder-neutral-500" : "bg-white border-[#E5E5E5] text-[#0A0A0A]";

  return (
    <div data-testid="messages-list" className={`min-h-full pb-6 ${bg}`}>
      {/* Header */}
      <div className={`sticky top-0 z-30 px-5 pt-5 pb-3 ${bg}`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className={`font-display font-black text-2xl tracking-tight ${textPrimary}`}>Messages</h1>
          {threads.length > 0 && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${dark ? "bg-white/10 text-neutral-400" : "bg-[#F3F3F3] text-[#525252]"}`}>
              {threads.length}
            </span>
          )}
        </div>
        {/* Search bar */}
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border ${inputBg}`}>
          <Search size={16} className={textSecondary} />
          <input
            data-testid="message-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations…"
            className="flex-1 outline-none bg-transparent text-sm font-medium"
          />
        </div>
      </div>

      <div className="px-5 space-y-2.5">
        {loading ? (
          <div className="pt-12 flex justify-center">
            <div className={`w-8 h-8 border-4 rounded-full animate-spin ${dark ? "border-white/10 border-t-[#E25238]" : "border-[#E5E5E5] border-t-[#E25238]"}`} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="pt-16 flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 ${dark ? "bg-white/5 border border-white/10" : "bg-white border border-[#E5E5E5]"}`}>
              <MessageCircle size={32} className={dark ? "text-neutral-600" : "text-[#CBCBCB]"} />
            </div>
            <p className={`font-display font-bold text-xl ${textPrimary}`}>
              {q ? "No results" : "No messages yet"}
            </p>
            <p className={`text-sm mt-2 font-medium max-w-[220px] ${textSecondary}`}>
              {q
                ? `No conversations matching "${q}"`
                : accountType === "creator"
                  ? "Apply to opportunities to start conversations with brands."
                  : "Accept applicants to start messaging them."}
            </p>
          </div>
        ) : (
          filtered.map((t) => (
            <button
              key={t.id}
              data-testid={`thread-${t.id}`}
              onClick={() => navigate(`/chat/${t.id}`)}
              className={`w-full text-left rounded-2xl p-4 flex items-center gap-3.5 hover:opacity-90 active:scale-[0.99] transition-all ${cardBg}`}
            >
              {/* Avatar with online dot */}
              <div className="relative flex-shrink-0">
                <BrandLogo name={t.name} size={52} dark={dark} />
                {t.online && (
                  <span className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-[#22C55E] ring-2 ${dark ? "ring-[#0A0A0A]" : "ring-[#F9F9F8]"}`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h4 className={`font-display font-bold text-sm truncate ${t.unread > 0 ? textPrimary : textSecondary}`}>
                    {t.name}
                  </h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${t.unread > 0 ? "text-[#E25238]" : textSecondary}`}>
                    {t.time}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${t.unread > 0 ? `font-semibold ${textPrimary}` : `font-medium ${textSecondary}`}`}>
                    {t.lastMessage}
                  </p>
                  {t.unread > 0 && (
                    <span className="bg-[#E25238] text-white text-[10px] font-black rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0">
                      {t.unread > 9 ? "9+" : t.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
