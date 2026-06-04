import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Send, Paperclip, MoreVertical } from "lucide-react";
import { TopBar } from "@/components/TopBar";
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

const isRealThread = (id) => id && id.length === 36 && id.split("-").length === 5;

export default function ChatScreen() {
  const { id } = useParams();
  const { threads, accountType, currentUserId } = useApp();
  const thread = threads.find((t) => t.id === id);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState(thread?.messages || []);
  const [sending, setSending] = useState(false);
  const dark = accountType === "brand";
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const threadName = thread?.name || (accountType === "creator" ? "Brand" : "Creator");

  // Load messages from API for real threads
  const loadMessages = useCallback(() => {
    if (!isRealThread(id)) return;
    messagesApi.messages(id)
      .then((data) => {
        const mapped = data.map((m) => ({
          id: m.id,
          from: m.sender_id === currentUserId ? "me" : m.from_role,
          text: m.text,
          time: formatTime(m.sent_at),
        }));
        setMsgs(mapped);
      })
      .catch(() => {});
  }, [id, currentUserId]);

  // Initial load + poll every 4 seconds
  useEffect(() => {
    loadMessages();
    if (isRealThread(id)) {
      pollRef.current = setInterval(loadMessages, 4000);
    }
    return () => clearInterval(pollRef.current);
  }, [loadMessages, id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    if (!text.trim() || sending) return;
    const msgText = text.trim();
    setText("");

    // Optimistic update
    const optimistic = { id: `opt-${Date.now()}`, from: "me", text: msgText, time: "now" };
    setMsgs((prev) => [...prev, optimistic]);

    if (isRealThread(id)) {
      setSending(true);
      try {
        const sent = await messagesApi.sendMessage(id, msgText);
        setMsgs((prev) => prev.map((m) =>
          m.id === optimistic.id
            ? { id: sent.id, from: "me", text: sent.text, time: formatTime(sent.sent_at) }
            : m
        ));
      } catch (_) {
        // Keep optimistic message
      } finally {
        setSending(false);
      }
    }
  };

  return (
    <div data-testid="chat-screen" className={`min-h-full flex flex-col ${dark ? "bg-[#0A0A0A] text-white" : "bg-[#F9F9F8]"}`}>
      <div className={`sticky top-0 z-30 px-5 py-3 flex items-center gap-3 ${dark ? "bg-[#0A0A0A] border-b border-white/10" : "bg-[#F9F9F8] border-b border-[#E5E5E5]"}`}>
        <TopBar title="" dark={dark} rightSlot={<MoreVertical size={18} className={dark ? "text-white" : ""} />} />
      </div>

      <div className="flex items-center gap-3 px-5 -mt-2 pb-3">
        <BrandLogo name={threadName} size={42} dark={dark} />
        <div>
          <h3 className="font-display font-bold">{threadName}</h3>
          <p className={`text-xs font-medium ${dark ? "text-neutral-500" : "text-[#525252]"}`}>
            {accountType === "brand" ? "Creator" : "Brand"}
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 py-3 space-y-3 overflow-y-auto">
        {msgs.map((m, i) => (
          <div key={m.id || i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-4 py-3 rounded-3xl ${
              m.from === "me"
                ? "bg-[#0A0A0A] text-white rounded-br-md"
                : dark ? "bg-white/10 text-white rounded-bl-md" : "bg-white border border-[#E5E5E5] text-[#0A0A0A] rounded-bl-md"
            }`}>
              <p className="text-sm font-medium">{m.text}</p>
              <p className={`text-[10px] mt-1 ${m.from === "me" ? "text-white/60" : (dark ? "text-neutral-400" : "text-[#525252]")}`}>{m.time}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className={`px-4 py-3 ${dark ? "bg-[#0A0A0A] border-t border-white/10" : "bg-[#F9F9F8] border-t border-[#E5E5E5]"}`}>
        <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${dark ? "bg-white/5 border border-white/10" : "bg-white border border-[#E5E5E5]"}`}>
          <button className={dark ? "text-neutral-400" : "text-[#525252]"}><Paperclip size={18} /></button>
          <input
            data-testid="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className={`flex-1 px-2 py-2 outline-none bg-transparent font-medium text-sm ${dark ? "text-white placeholder-neutral-500" : "text-[#0A0A0A]"}`}
          />
          <button
            data-testid="chat-send"
            onClick={send}
            disabled={sending}
            className="w-10 h-10 rounded-full bg-[#E25238] flex items-center justify-center text-white hover:bg-[#C9452D] transition-colors disabled:opacity-60"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
