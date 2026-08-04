import React from "react";
import { useAuthStore } from "../../lib/api/store/authStore";
import { Navigate, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/apiClient";
import { Loader2 } from "lucide-react";

export const DashboardProtec = ({ children }) => {
  const location = useLocation();
  const { token, clearAuth } = useAuthStore();


  // TOP LEVEL HOOK DECLARATION - Unconditional execution
  const { isLoading, isError, data: userData } = useQuery({
    queryKey: ["auth-me", token],
    queryFn: async () => {
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data?.data?.user || response.data?.user || response.data;
   
    },
    enabled: !!token,
    retry: 1,
    staleTime: 5 * 60 * 1000,
   
  });

  // Conditional Returns AFTER all hooks have been declared
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#f7f9fb]">
        <Loader2 className="animate-spin text-black mb-2" size={40} />
        <div className="text-sm font-semibold text-[#191c1e]">
          Verifying session...
        </div>
      </div>
    );
  }

  if (isError || !userData) {
    clearAuth();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default DashboardProtec;