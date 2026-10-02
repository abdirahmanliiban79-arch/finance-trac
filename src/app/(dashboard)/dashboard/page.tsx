"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { StatCards } from "@/components/dashboard/StatCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/apiClient";
import type { Summary, Transaction } from "@/types";

export default function DashboardPage() {
  // 1. Fetch Monthly Summary Statistics from GET /transactions/summary
  const { data: summaryData } = useQuery<Summary>({
    queryKey: ["transactions-summary"],
    queryFn: async (): Promise<Summary> => {
      const response = await api.get("/transactions/summary");
      return (
        response.data?.data || {
          netBalance: 0,
          totalIncome: 0,
          totalExpense: 0,
        }
      );
    },
  });

  // 2. Fetch User Transactions List from GET /transactions
  const { data: transactions = [], isLoading: isTxLoading } = useQuery<
    Transaction[]
  >({
    queryKey: ["transactions"],
    queryFn: async (): Promise<Transaction[]> => {
      const response = await api.get("/transactions");
      return response.data?.data?.transactions || [];
    },
  });

  const stats = {
    totalBalance: summaryData?.netBalance || 0,
    totalIncome: summaryData?.totalIncome || 0,
    totalExpenses: summaryData?.totalExpense || 0,
  };

  return (
    <AppLayout activeRoute="dashboard" title="Dashboard">
      {/* Dynamic Stat Cards */}
      <StatCards stats={stats} />

      {/* Analytics & Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <SpendingChart transactions={transactions} />
        <RecentTransactions
          transactions={transactions}
          isLoading={isTxLoading}
        />
      </div>
    </AppLayout>
  );
}
