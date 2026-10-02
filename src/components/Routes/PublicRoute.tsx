"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/lib/api/store/authStore";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useHasMounted } from "@/hooks/useHasMounted";

export const PublicRoute = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const mounted = useHasMounted();
  const { token } = useAuthStore();

  useEffect(() => {
    if (mounted && token) {
      router.replace("/dashboard");
    }
  }, [mounted, token, router]);

  if (!mounted || token) {
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

export default PublicRoute;
