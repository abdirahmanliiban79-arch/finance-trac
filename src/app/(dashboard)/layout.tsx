import type { ReactNode } from "react";
import DashboardProtec from "@/components/Routes/DashboardProtec";
import DashboardShell from "@/components/layout/DashboardShell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProtec>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProtec>
  );
}
