import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";

const DARK_ROUTES = ["/brand/dashboard", "/brand/applicants", "/brand/post", "/brand/requirements", "/brand/discover"];

// Routes that should show the bottom nav (tab destinations only)
const NAV_ROUTES = new Set([
  "/home",
  "/search",
  "/applications",
  "/messages",
  "/profile",
  "/settings",
  "/notifications",
  "/brands",
  "/brand/dashboard",
  "/brand/applicants",
  "/brand/discover",
]);

export const PhoneFrame = () => {
  const location = useLocation();
  const isDark = DARK_ROUTES.some((p) => location.pathname.startsWith(p));
  const showNav = NAV_ROUTES.has(location.pathname);

  return (
    <div className="phone-frame-wrapper min-h-screen w-full flex items-center justify-center p-0 sm:p-6">
      <div
        data-testid="phone-frame"
        className={`relative w-full sm:w-[420px] h-[100dvh] sm:h-[860px] sm:max-h-[92vh] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] sm:rounded-[44px] sm:border-[10px] sm:border-black flex flex-col ${isDark ? "app-screen-dark" : "app-screen"} grain`}
      >
        {/* Notch on sm+ */}
        <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-50 items-end justify-center pb-1">
          <div className="w-2 h-2 rounded-full bg-neutral-700" />
        </div>
        <div className="relative flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide pt-0 sm:pt-6">
          <Outlet />
        </div>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
};
