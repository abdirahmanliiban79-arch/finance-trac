"use client";

import type { ReactNode } from "react";
import DashboardProtec from "@/components/Routes/DashboardProtec";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardProtec>{children}</DashboardProtec>;
}
