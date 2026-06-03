import { ChevronLeft, Bell, Menu, Bookmark, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TopBar = ({ title, showBack = true, showMenu = false, showBell = false, showBookmark = false, bookmarkActive = false, onBookmarkClick, showMore = false, dark = false, onMenuClick, rightSlot }) => {
  const navigate = useNavigate();
  const textCls = dark ? "text-white" : "text-[#0A0A0A]";
  const iconBtnCls = `w-10 h-10 rounded-full flex items-center justify-center ${dark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"} transition-colors`;

  return (
    <div className={`sticky top-0 z-30 px-5 py-4 flex items-center justify-between ${dark ? "bg-[#0A0A0A]" : "bg-[#F9F9F8]"}`}>
      <div className="flex items-center gap-2">
        {showBack && (
          <button data-testid="topbar-back" onClick={() => navigate(-1)} className={iconBtnCls}>
            <ChevronLeft size={20} className={textCls} />
          </button>
        )}
        {showMenu && (
          <button data-testid="topbar-menu" onClick={onMenuClick} className={iconBtnCls}>
            <Menu size={20} className={textCls} />
          </button>
        )}
      </div>
      <h2 className={`font-display font-bold text-lg ${textCls} tracking-tight`}>{title}</h2>
      <div className="flex items-center gap-2">
        {rightSlot}
        {showBookmark && (
          <button
            data-testid="topbar-bookmark"
            onClick={onBookmarkClick}
            className={iconBtnCls}
            aria-label={bookmarkActive ? "Remove from saved" : "Save"}
          >
            <Bookmark
              size={18}
              className={bookmarkActive ? "text-[#E25238]" : textCls}
              fill={bookmarkActive ? "#E25238" : "none"}
              strokeWidth={bookmarkActive ? 0 : 2}
            />
          </button>
        )}
        {showBell && (
          <button data-testid="topbar-bell" onClick={() => navigate("/notifications")} className={iconBtnCls}>
            <Bell size={18} className={textCls} />
          </button>
        )}
        {showMore && (
          <button data-testid="topbar-more" className={iconBtnCls}>
            <MoreVertical size={18} className={textCls} />
          </button>
        )}
        {!showBack && !showMenu && !showBookmark && !showBell && !showMore && !rightSlot && <div className="w-10" />}
      </div>
    </div>
  );
};
