"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/lib/api/store/authStore";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/api/apiClient";
import { Loader2 } from "lucide-react";
import { useHasMounted } from "@/hooks/useHasMounted";
import type { User } from "@/types";

export const DashboardProtec = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const mounted = useHasMounted();
  const { token, clearAuth } = useAuthStore();

  const { error } = useQuery<User>({
    queryKey: ["auth-me", token],
    queryFn: async (): Promise<User> => {
      const response = await api.get("/auth/me");
      return response.data?.data?.user || response.data?.user || response.data;
    },
    enabled: !!token,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const status = (error as AxiosError | null)?.response?.status;
  const sessionInvalid = !!token && (status === 401 || status === 403);

  useEffect(() => {
    if (!mounted) return;

    if (!token || sessionInvalid) {
      if (sessionInvalid) {
        clearAuth();
      }
      router.replace("/login");
    }
  }, [mounted, token, sessionInvalid, clearAuth, router]);

  if (!mounted || !token || sessionInvalid) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#f7f9fb]">
        <Loader2 className="animate-spin text-black mb-2" size={40} />
        <div className="text-sm font-semibold text-[#191c1e]">
          Verifying session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default DashboardProtec;
