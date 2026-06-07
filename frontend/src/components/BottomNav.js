import { Home, Bookmark, ClipboardList, MessageCircle, User, LayoutDashboard, Megaphone, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

const creatorItems = [
  { id: "home", label: "Home", icon: Home, path: "/home" },
  { id: "saved", label: "Saved", icon: Bookmark, path: "/saved" },
  { id: "apps", label: "Applications", icon: ClipboardList, path: "/applications" },
  { id: "msg", label: "Messages", icon: MessageCircle, path: "/messages" },
  { id: "profile", label: "Profile", icon: User, path: "/profile" },
];

const brandItems = [
  { id: "dash", label: "Dashboard", icon: LayoutDashboard, path: "/brand/dashboard" },
  { id: "discover", label: "Discover", icon: Users, path: "/brand/discover" },
  { id: "post", label: "Post", icon: Megaphone, path: "/brand/post" },
  { id: "msg", label: "Messages", icon: MessageCircle, path: "/messages" },
  { id: "profile", label: "Profile", icon: User, path: "/profile" },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accountType, unreadMessages } = useApp();
  const items = accountType === "brand" ? brandItems : creatorItems;
  const isBrand = accountType === "brand";

  return (
    <div
      data-testid="bottom-nav"
      className={`flex-shrink-0 ${isBrand ? "bg-[#0A0A0A]/95 border-t border-neutral-800" : "bg-white/95 border-t border-[#E5E5E5]"} backdrop-blur-xl px-2 py-2 pb-3 z-40`}
    >
      <div className="flex justify-between items-center">
        {items.map((it) => {
          const Icon = it.icon;
          const active = location.pathname === it.path || (it.id === "post" && location.pathname.startsWith("/brand/post"));
          return (
            <button
              key={it.id}
              data-testid={`nav-${it.id}`}
              onClick={() => navigate(it.path)}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all"
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 1.8}
                  className={`transition-colors ${active ? (isBrand ? "text-[#E25238]" : "text-[#0A0A0A]") : (isBrand ? "text-neutral-500" : "text-neutral-400")}`}
                />
                {it.id === "msg" && unreadMessages > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-[#E25238] text-white text-[9px] font-black flex items-center justify-center px-1 leading-none">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold tracking-wider uppercase ${active ? (isBrand ? "text-[#E25238]" : "text-[#0A0A0A]") : (isBrand ? "text-neutral-500" : "text-neutral-400")}`}>
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
