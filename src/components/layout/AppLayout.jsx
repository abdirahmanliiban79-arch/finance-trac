import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/lib/api/store/authStore";
import { AddTransactionModal } from "../dashboard/AddTransactionModal";

export const AppLayout = ({
  children,
  activeRoute = "dashboard",
  title = "Overview",
}) => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const lockScroll = sidebarOpen && mq.matches;
    document.body.style.overflow = lockScroll ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-[#f7f9fb] font-sans antialiased">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={(path) => { navigate(path); setSidebarOpen(false); }}
        onLogout={handleLogout}
        onOpenAddTx={() => { setIsAddTxOpen(true); setSidebarOpen(false); }}
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
          isMenuOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1280px] mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* Global Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
