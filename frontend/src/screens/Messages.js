import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/context/AppContext";

export default function Messages() {
  const navigate = useNavigate();
  const { threads, accountType } = useApp();
  const dark = accountType === "brand";

  return (
    <div data-testid="messages-list" className={`min-h-full pb-24 ${dark ? "bg-[#0A0A0A] text-white" : "bg-[#F9F9F8]"}`}>
      <TopBar title="Messages" showBack={false} dark={dark} />
      <div className="px-5">
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
      <BottomNav />
    </div>
  );
}
