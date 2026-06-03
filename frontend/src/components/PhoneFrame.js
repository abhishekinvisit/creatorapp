import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";
import {
  Home, Bookmark, ClipboardList, MessageCircle, User,
  LayoutDashboard, Megaphone, Users, Bell, Settings,
} from "lucide-react";

const DARK_ROUTES = [
  "/brand/dashboard", "/brand/applicants",
  "/brand/post", "/brand/requirements", "/brand/discover",
];

const NAV_ROUTES = new Set([
  "/home", "/search", "/saved", "/applications", "/messages",
  "/profile", "/settings", "/notifications", "/brands",
  "/brand/dashboard", "/brand/applicants", "/brand/discover",
]);

const AUTH_ROUTES = new Set(["/", "/account-type", "/login"]);

const creatorNav = [
  { id: "home",    label: "Home",         icon: Home,          path: "/home" },
  { id: "saved",   label: "Saved",        icon: Bookmark,      path: "/saved" },
  { id: "apps",    label: "Applications", icon: ClipboardList, path: "/applications" },
  { id: "msg",     label: "Messages",     icon: MessageCircle, path: "/messages" },
  { id: "profile", label: "Profile",      icon: User,          path: "/profile" },
];

const brandNav = [
  { id: "dash",    label: "Dashboard", icon: LayoutDashboard, path: "/brand/dashboard" },
  { id: "discover",label: "Discover",  icon: Users,           path: "/brand/discover" },
  { id: "post",    label: "Post",      icon: Megaphone,       path: "/brand/post" },
  { id: "msg",     label: "Messages",  icon: MessageCircle,   path: "/messages" },
  { id: "profile", label: "Profile",   icon: User,            path: "/profile" },
];

const SidebarNav = ({ isDark }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accountType } = useApp();
  const items = accountType === "brand" ? brandNav : creatorNav;

  const border   = isDark ? "border-neutral-800"  : "border-[#E8E8E8]";
  const bg       = isDark ? "bg-[#0D0D0D]"        : "bg-white";
  const activeCls   = isDark
    ? "bg-white/10 text-[#E25238]"
    : "bg-[#F0F0EE] text-[#0A0A0A]";
  const inactiveCls = isDark
    ? "text-neutral-500 hover:bg-white/5 hover:text-neutral-200"
    : "text-[#6B6B6B] hover:bg-[#F5F5F4] hover:text-[#0A0A0A]";

  return (
    <aside
      className={`
        hidden lg:flex flex-col border-r flex-shrink-0 z-40
        h-screen sticky top-0
        w-16 xl:w-60
        ${bg} ${border}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-3 xl:px-5 py-[18px] border-b ${border}`}>
        <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#E25238] to-[#F59E0B] flex items-center justify-center flex-shrink-0">
          <div className="w-3.5 h-3.5 rounded-full border-[2.5px] border-white" />
        </div>
        <span className={`hidden xl:block font-display font-black text-lg tracking-[-0.04em] ${isDark ? "text-white" : "text-[#0A0A0A]"}`}>
          OLLCOLLAB
        </span>
      </div>

      {/* Main nav items */}
      <nav className="flex-1 p-2 xl:p-3 space-y-0.5 overflow-y-auto">
        {items.map(({ id, label, icon: Icon, path }) => {
          const active =
            location.pathname === path ||
            (id === "post" && location.pathname.startsWith("/brand/post"));
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              title={label}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all text-left
                ${active ? activeCls : inactiveCls}
              `}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} className="flex-shrink-0" />
              <span className="hidden xl:block font-bold text-sm">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom utility links */}
      <div className={`p-2 xl:p-3 border-t ${border} space-y-0.5`}>
        {[
          { label: "Notifications", icon: Bell,     path: "/notifications" },
          { label: "Settings",      icon: Settings,  path: "/settings" },
        ].map(({ label, icon: Icon, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            title={label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${inactiveCls}`}
          >
            <Icon size={18} strokeWidth={1.8} className="flex-shrink-0" />
            <span className="hidden xl:block font-bold text-sm">{label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export const PhoneFrame = () => {
  const location = useLocation();
  const isDark  = DARK_ROUTES.some(p => location.pathname.startsWith(p));
  const showNav = NAV_ROUTES.has(location.pathname);
  const isAuth  = AUTH_ROUTES.has(location.pathname);

  const lightBg = "bg-[#F9F9F8] sm:bg-[#F2F2F0]";
  const darkBg  = "bg-[#0A0A0A]";

  return (
    /*
     * MOBILE  (<640px) : flex-col, fixed h-[100dvh], overflow-hidden — unchanged native-app feel
     * TABLET (640-1023): flex-col, min-h-screen, natural page scroll, bottom nav, centered content
     * DESKTOP (1024px+): flex-row, sticky sidebar, full-width content, no bottom nav
     */
    <div
      className={`
        flex flex-col h-[100dvh] overflow-hidden
        sm:h-auto sm:min-h-screen sm:overflow-visible sm:flex-row
        ${isDark ? darkBg : lightBg}
      `}
    >
      {/* Sidebar — desktop only, hidden on auth screens */}
      {!isAuth && <SidebarNav isDark={isDark} />}

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-h-0 sm:min-h-screen">

        {/* Scrollable area:
            mobile  → overflow-y-auto (internal scroll inside fixed-height container)
            tablet+ → overflow-visible (window/page scrolls naturally)
            auth on tablet+ → flex + items-center to vertically center the card */}
        <div
          className={`
            flex-1 min-h-0 overflow-y-auto scrollbar-hide grain
            sm:overflow-visible
            ${isAuth ? "sm:flex sm:items-center sm:justify-center sm:min-h-screen sm:py-10" : ""}
          `}
        >
          {/*
            Content width:
            mobile       → full width
            tablet auth  → max-w-sm card, centered, white bg, rounded, shadow
            tablet feed  → max-w-2xl centered
            desktop feed → unconstrained (sidebar provides left rail)
          */}
          <div
            className={`
              w-full
              ${isAuth
                ? "sm:max-w-sm sm:mx-auto sm:rounded-3xl sm:shadow-xl sm:overflow-hidden"
                : "sm:max-w-2xl sm:mx-auto lg:max-w-none lg:mx-0"}
            `}
          >
            <Outlet />
          </div>
        </div>

        {/* Bottom nav — mobile + tablet, hidden on desktop */}
        {showNav && (
          <div className="flex-shrink-0 lg:hidden">
            <BottomNav />
          </div>
        )}
      </div>
    </div>
  );
};
