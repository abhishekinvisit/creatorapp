import { useState } from "react";
import { useParams } from "react-router-dom";
import { Send, Paperclip, MoreVertical } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/context/AppContext";

export default function ChatScreen() {
  const { id } = useParams();
  const { threads, accountType } = useApp();
  const thread = threads.find((t) => t.id === id) || threads[0];
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState(thread.messages);
  const dark = accountType === "brand";

  const send = () => {
    if (!text.trim()) return;
    setMsgs([...msgs, { from: "me", text, time: "now" }]);
    setText("");
  };

  return (
    <div data-testid="chat-screen" className={`min-h-full flex flex-col ${dark ? "bg-[#0A0A0A] text-white" : "bg-[#F9F9F8]"}`}>
      <div className={`sticky top-0 z-30 px-5 py-3 flex items-center gap-3 ${dark ? "bg-[#0A0A0A] border-b border-white/10" : "bg-[#F9F9F8] border-b border-[#E5E5E5]"}`}>
        <TopBar title="" dark={dark} rightSlot={<MoreVertical size={18} className={dark ? "text-white" : ""} />} />
      </div>

      <div className="flex items-center gap-3 px-5 -mt-2 pb-3">
        <BrandLogo name={thread.name} size={42} dark={dark} />
        <div>
          <h3 className="font-display font-bold">{thread.name}</h3>
          <p className={`text-xs font-medium ${thread.online ? "text-[#22C55E]" : (dark ? "text-neutral-500" : "text-[#525252]")}`}>
            {thread.online ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 py-3 space-y-3 overflow-y-auto">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
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
          <button data-testid="chat-send" onClick={send} className="w-10 h-10 rounded-full bg-[#E25238] flex items-center justify-center text-white hover:bg-[#C9452D] transition-colors">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
