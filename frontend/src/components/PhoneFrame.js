import { Outlet, useLocation } from "react-router-dom";

export const PhoneFrame = () => {
  const location = useLocation();
  const isDark = ["/brand/dashboard", "/brand/applicants", "/brand/post", "/brand/requirements"].some(p => location.pathname.startsWith(p));

  return (
    <div className="phone-frame-wrapper min-h-screen w-full flex items-center justify-center p-0 sm:p-6">
      <div
        data-testid="phone-frame"
        className={`relative w-full sm:w-[420px] h-[100dvh] sm:h-[860px] sm:max-h-[92vh] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] sm:rounded-[44px] sm:border-[10px] sm:border-black ${isDark ? "app-screen-dark" : "app-screen"} grain`}
      >
        {/* Notch on sm+ */}
        <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-50 items-end justify-center pb-1">
          <div className="w-2 h-2 rounded-full bg-neutral-700" />
        </div>
        <div className="relative h-full w-full overflow-y-auto overflow-x-hidden scrollbar-hide pt-0 sm:pt-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
