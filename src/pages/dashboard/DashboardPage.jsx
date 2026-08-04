import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCards } from "@/components/dashboard/StatCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/apiClient";

const DashboardPage = () => {
  // 1. Fetch Monthly Summary Statistics from GET /transactions/summary
  const { data: summaryData } = useQuery({
    queryKey: ["transactions-summary"],
    queryFn: async () => {
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
  const { data: transactions = [], isLoading: isTxLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
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
        <SpendingChart />
        <RecentTransactions
          transactions={transactions}
          isLoading={isTxLoading}
        />
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
