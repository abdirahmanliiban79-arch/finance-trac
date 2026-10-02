"use client";

import { useSyncExternalStore } from "react";
import {
  LayoutDashboard,
  Receipt,
  FolderKanban,
  Settings,
  LogOut,
  PlusCircle,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

const subscribeMobile = (callback: () => void) => {
  const mq = window.matchMedia(MOBILE_MEDIA_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
};

const getMobileSnapshot = () => window.matchMedia(MOBILE_MEDIA_QUERY).matches;

const getServerMobileSnapshot = () => false;

interface SidebarProps {
  activeRoute?: string;
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
  onOpenAddTx?: () => void;
  user?: User | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({
  activeRoute = "dashboard",
  onNavigate,
  onLogout,
  onOpenAddTx,
  user,
  isOpen = false,
  onClose,
}: SidebarProps) => {
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getServerMobileSnapshot
  );

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
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex h-screen w-64 max-w-[min(16rem,85vw)] flex-col justify-between border-r border-white/10 bg-[#191c1e] p-4 text-white shadow-xl transition-transform duration-300 ease-in-out md:static md:z-auto md:h-auto md:min-h-screen md:max-w-none md:translate-x-0 md:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
      aria-hidden={isMobile && !isOpen ? true : undefined}
      aria-label="Main navigation"
    >
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto">
        {/* App Logo */}
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 font-bold text-black">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="truncate font-mono text-lg font-bold tracking-wider">
              FinTrack Pro
            </span>
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="rounded-lg p-1.5 text-[#c6c6cd] transition-colors hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
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
      <div className="shrink-0 border-t border-white/10 pt-4 space-y-3">
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
