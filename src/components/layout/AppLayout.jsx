import React, { useState } from "react";
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

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[#f7f9fb] font-sans antialiased">
      {/* Sidebar with modal opener callback */}
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={(path) => navigate(path)}
        onLogout={handleLogout}
        onOpenAddTx={() => setIsAddTxOpen(true)}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-8">
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
