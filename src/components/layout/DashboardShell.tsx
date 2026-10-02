"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuthStore } from "@/lib/api/store/authStore";
import { queryClient } from "@/lib/queryClient";
import { AddTransactionModal } from "../dashboard/AddTransactionModal";

interface RouteMeta {
  id: string;
  title: string;
}

const ROUTES: Record<string, RouteMeta> = {
  "/dashboard": { id: "dashboard", title: "Dashboard" },
  "/transactions": { id: "transactions", title: "Transactions Management" },
  "/categories": { id: "categories", title: "Categories Management" },
  "/settings": { id: "settings", title: "Account Settings" },
};

const DEFAULT_ROUTE: RouteMeta = { id: "dashboard", title: "Dashboard" };

export const DashboardShell = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const route = ROUTES[pathname] ?? DEFAULT_ROUTE;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const applyScrollLock = () => {
      document.body.style.overflow =
        sidebarOpen && mq.matches ? "hidden" : "";
    };

    applyScrollLock();
    mq.addEventListener("change", applyScrollLock);

    return () => {
      mq.removeEventListener("change", applyScrollLock);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  const handleLogout = () => {
    clearAuth();
    queryClient.clear();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#f7f9fb] font-sans antialiased">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeRoute={route.id}
        onLogout={handleLogout}
        onOpenAddTx={() => {
          setIsAddTxOpen(true);
          setSidebarOpen(false);
        }}
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={route.title}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((open) => !open)}
          isMenuOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1280px] mx-auto space-y-6">{children}</div>
        </main>
      </div>

      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />
    </div>
  );
};

export default DashboardShell;
