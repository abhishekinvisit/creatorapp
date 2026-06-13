import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdmin } from "./AdminContext";

const NAV = [
  { to: "/admin/dashboard",    icon: "⊞",  label: "Dashboard" },
  { to: "/admin/users",        icon: "👥", label: "Users" },
  { to: "/admin/creators",     icon: "✦",  label: "Creators" },
  { to: "/admin/brands",       icon: "◈",  label: "Brands" },
  { to: "/admin/verification", icon: "✓",  label: "Verification" },
  { to: "/admin/analytics",    icon: "▲",  label: "Analytics" },
  { to: "/admin/blogs",        icon: "✎",  label: "Blogs" },
  { to: "/admin/logs",         icon: "≡",  label: "Admin Logs" },
  { to: "/admin/settings",     icon: "⚙",  label: "Settings" },
];

export default function AdminLayout() {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-200 ${collapsed ? "w-16" : "w-56"} flex-shrink-0`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-800 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E25238] to-[#F59E0B] flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 rounded-full border-2 border-white" />
          </div>
          {!collapsed && <span className="font-bold text-white font-display text-sm">Rytspot Admin</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors rounded-none
                 ${isActive
                   ? "bg-[#E25238]/15 text-[#E25238] border-r-2 border-[#E25238]"
                   : "text-gray-400 hover:text-white hover:bg-gray-800"
                 } ${collapsed ? "justify-center px-0" : ""}`
              }>
              <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: user + collapse */}
        <div className="border-t border-gray-800 p-3 space-y-2">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-full flex items-center gap-3 px-2 py-2 text-gray-500 hover:text-white text-xs transition-colors rounded-lg hover:bg-gray-800">
            <span className="text-base w-5 text-center">{collapsed ? "→" : "←"}</span>
            {!collapsed && <span>Collapse</span>}
          </button>
          {!collapsed && admin && (
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="w-7 h-7 rounded-full bg-[#E25238] flex items-center justify-center text-xs font-bold flex-shrink-0">
                {admin.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">{admin.name}</div>
                <div className="text-xs text-gray-500 capitalize">{admin.role?.replace("_", " ")}</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-2 py-2 text-red-400 hover:text-red-300 text-xs transition-colors rounded-lg hover:bg-red-500/10 ${collapsed ? "justify-center" : ""}`}>
            <span className="text-base w-5 text-center">⏻</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-gray-950">
        <Outlet />
      </main>
    </div>
  );
}
