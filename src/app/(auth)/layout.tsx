import type { ReactNode } from "react";
import { PublicRoute } from "@/components/Routes/PublicRoute";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <PublicRoute>{children}</PublicRoute>;
}
