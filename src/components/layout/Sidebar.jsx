import React from "react";
import {
  LayoutDashboard,
  Receipt,
  FolderKanban,
  Settings,
  LogOut,
  PlusCircle,
  Wallet,
} from "lucide-react";

export const Sidebar = ({
  activeRoute = "dashboard",
  onNavigate,
  onLogout,
  onOpenAddTx,
  user,
}) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: Receipt,
      path: "/transactions",
    },
    {
      id: "categories",
      label: "Categories",
      icon: FolderKanban,
      path: "/categories",
    },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <aside className="w-64 bg-[#191c1e] text-white flex flex-col justify-between p-4 min-h-screen border-r border-white/10">
      <div className="space-y-6">
        {/* App Logo */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-mono font-bold text-lg tracking-wider">
            FinTrack Pro
          </span>
        </div>

        {/* Quick Action: Add Transaction Button */}
        <button
          onClick={() => onOpenAddTx && onOpenAddTx()}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate && onNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-[#c6c6cd] hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="border-t border-white/10 pt-4 space-y-3">
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs uppercase">
            {user?.username ? user.username[0] : "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {user?.username }
            </p>
            <p className="text-[10px] text-[#c6c6cd] truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>

        <button
          onClick={() => onLogout && onLogout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
