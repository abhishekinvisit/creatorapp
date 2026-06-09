import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Send, ChevronLeft, MoreVertical, Phone } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/context/AppContext";
import { messagesApi } from "@/lib/api";

function formatTime(isoStr) {
  if (!isoStr) return "now";
  try {
    return new Date(isoStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  } catch (_) {
    return "now";
  }
}

function formatDateLabel(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch (_) {
    return "";
  }
}

const isRealThread = (id) => id && id.length === 36 && id.split("-").length === 5;

export default function ChatScreen() {
  const { id } = useParams();
  const { threads, accountType, currentUserId } = useApp();
  const thread = threads.find((t) => t.id === id);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState(thread?.messages || []);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const dark = accountType === "brand";
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  const threadName = thread?.name || (accountType === "creator" ? "Brand" : "Creator");
  const _validSrc = (s) => s && (s.startsWith("data:") || s.startsWith("http"));
  const threadAvatar = thread?.avatarSrc
    || (accountType === "creator"
      ? (_validSrc(thread?.brand_logo_data) ? thread.brand_logo_data : null)
      : (_validSrc(thread?.creator_avatar_url) ? thread.creator_avatar_url : null))
    || null;
  const role = accountType === "brand" ? "Creator" : "Brand";

  const loadMessages = useCallback(() => {
    if (!isRealThread(id)) { setLoading(false); return; }
    messagesApi.messages(id)
      .then((data) => {
        setMsgs(data.map((m) => ({
          id: m.id,
          from: m.sender_id === currentUserId ? "me" : "them",
          text: m.text,
          time: formatTime(m.sent_at),
          rawTime: m.sent_at,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, currentUserId]);

  useEffect(() => {
    loadMessages();
    if (isRealThread(id)) {
      pollRef.current = setInterval(loadMessages, 4000);
    }
    return () => clearInterval(pollRef.current);
  }, [loadMessages, id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    const msgText = text.trim();
    if (!msgText || sending) return;
    setText("");

    const optimistic = { id: `opt-${Date.now()}`, from: "me", text: msgText, time: "now", rawTime: new Date().toISOString() };
    setMsgs((prev) => [...prev, optimistic]);

    if (isRealThread(id)) {
      setSending(true);
      try {
        const sent = await messagesApi.sendMessage(id, msgText);
        setMsgs((prev) => prev.map((m) =>
          m.id === optimistic.id
            ? { id: sent.id, from: "me", text: sent.text, time: formatTime(sent.sent_at), rawTime: sent.sent_at }
            : m
        ));
      } catch (_) {
        // keep optimistic
      } finally {
        setSending(false);
      }
    }
  };

  const bg = dark ? "bg-[#111111]" : "bg-[#F9F9F8]";
  const headerBg = dark ? "bg-[#0A0A0A] border-white/10" : "bg-white border-[#E5E5E5]";
  const iconBtn = dark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10";
  const inputBg = dark ? "bg-white/5 border-white/10" : "bg-white border-[#E5E5E5]";
  const inputTxt = dark ? "text-white placeholder-neutral-500" : "text-[#0A0A0A]";

  // Insert date separators
  const msgsWithDates = [];
  let lastDate = null;
  for (const m of msgs) {
    const label = formatDateLabel(m.rawTime);
    if (label && label !== lastDate) {
      msgsWithDates.push({ type: "date", label });
      lastDate = label;
    }
    msgsWithDates.push({ type: "msg", ...m });
  }

  return (
    <div
      data-testid="chat-screen"
      className={`fixed inset-0 flex flex-col ${bg}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Header */}
      <div className={`flex-shrink-0 px-4 py-3 flex items-center gap-3 border-b ${headerBg}`}>
        <button
          data-testid="chat-back"
          onClick={() => window.history.back()}
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${iconBtn}`}
        >
          <ChevronLeft size={22} className={dark ? "text-white" : "text-[#0A0A0A]"} />
        </button>
        <BrandLogo name={threadName} size={40} dark={dark} src={threadAvatar} />
        <div className="flex-1 min-w-0">
          <h3 className={`font-display font-bold text-base leading-tight truncate ${dark ? "text-white" : "text-[#0A0A0A]"}`}>
            {threadName}
          </h3>
          <p className={`text-[11px] font-medium ${dark ? "text-neutral-500" : "text-[#525252]"}`}>{role}</p>
        </div>
        <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${iconBtn}`}>
          <MoreVertical size={18} className={dark ? "text-neutral-400" : "text-[#525252]"} />
        </button>
      </div>

      {/* Messages area — scrollable, messages anchor to bottom */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className={`w-8 h-8 border-4 rounded-full animate-spin ${dark ? "border-white/10 border-t-[#E25238]" : "border-[#E5E5E5] border-t-[#E25238]"}`} />
          </div>
        ) : msgs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-8 text-center">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${dark ? "bg-white/5 border border-white/10" : "bg-white border border-[#E5E5E5]"}`}>
              <Phone size={24} className={dark ? "text-neutral-600" : "text-[#CBCBCB]"} />
            </div>
            <p className={`font-display font-bold text-base ${dark ? "text-white" : "text-[#0A0A0A]"}`}>
              Start the conversation
            </p>
            <p className={`text-sm mt-1.5 font-medium ${dark ? "text-neutral-500" : "text-[#525252]"}`}>
              Say hello to {threadName}!
            </p>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-1 flex flex-col justify-end min-h-full">
            {msgsWithDates.map((item, i) => {
              if (item.type === "date") {
                return (
                  <div key={`date-${i}`} className="flex items-center gap-3 py-3">
                    <div className={`flex-1 h-px ${dark ? "bg-white/10" : "bg-[#E5E5E5]"}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${dark ? "text-neutral-600" : "text-[#CBCBCB]"}`}>
                      {item.label}
                    </span>
                    <div className={`flex-1 h-px ${dark ? "bg-white/10" : "bg-[#E5E5E5]"}`} />
                  </div>
                );
              }

              const isMe = item.from === "me";
              const prevItem = msgsWithDates[i - 1];
              const nextItem = msgsWithDates[i + 1];
              const prevFrom = prevItem?.type === "msg" ? prevItem.from : null;
              const nextFrom = nextItem?.type === "msg" ? nextItem.from : null;
              const isFirst = prevFrom !== item.from;
              const isLast = nextFrom !== item.from;

              const bubbleBg = isMe
                ? "bg-[#E25238] text-white"
                : dark
                  ? "bg-white/10 text-white"
                  : "bg-white border border-[#E5E5E5] text-[#0A0A0A]";

              const radius = isMe
                ? `rounded-3xl ${isFirst ? "rounded-tr-md" : ""} ${isLast ? "rounded-br-md" : ""}`
                : `rounded-3xl ${isFirst ? "rounded-tl-md" : ""} ${isLast ? "rounded-bl-md" : ""}`;

              return (
                <div
                  key={item.id || i}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} ${isFirst ? "mt-3" : "mt-0.5"}`}
                >
                  <div className={`max-w-[78%] px-4 py-2.5 ${radius} ${bubbleBg}`}>
                    <p className="text-[14px] font-medium leading-relaxed">{item.text}</p>
                    {isLast && (
                      <p className={`text-[10px] mt-1 font-medium ${isMe ? "text-white/60" : dark ? "text-neutral-500" : "text-[#525252]"}`}>
                        {item.time}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className={`flex-shrink-0 px-4 py-3 border-t ${dark ? "bg-[#0A0A0A] border-white/10" : "bg-white border-[#E5E5E5]"}`}>
        <div className={`flex items-end gap-2 rounded-2xl px-4 py-2 border ${inputBg}`}>
          <input
            ref={inputRef}
            data-testid="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type a message…"
            className={`flex-1 py-2 outline-none bg-transparent font-medium text-sm resize-none ${inputTxt}`}
          />
          <button
            data-testid="chat-send"
            onClick={send}
            disabled={!text.trim() || sending}
            className="w-9 h-9 rounded-full bg-[#E25238] flex items-center justify-center text-white hover:bg-[#C9452D] active:scale-[0.95] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 mb-0.5"
          >
            <Send size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
