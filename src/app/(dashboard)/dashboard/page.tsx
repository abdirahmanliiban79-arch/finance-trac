"use client";

import { StatCards } from "@/components/dashboard/StatCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/apiClient";
import type { Summary, Transaction } from "@/types";

export default function DashboardPage() {
  const period = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  };

  const { data: summaryData, isLoading: isSummaryLoading } =
    useQuery<Summary>({
      queryKey: ["transactions-summary", period.year, period.month],
      queryFn: async (): Promise<Summary> => {
        const response = await api.get("/transactions/summary", {
          params: period,
        });
        return (
          response.data?.data || {
            netBalance: 0,
            totalIncome: 0,
            totalExpense: 0,
          }
        );
      },
    });

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
    totalBalance: summaryData?.netBalance ?? 0,
    totalIncome: summaryData?.totalIncome ?? 0,
    totalExpenses: summaryData?.totalExpense ?? 0,
  };

  return (
    <>
      <StatCards stats={stats} isLoading={isSummaryLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Chart backed by /api/transactions/chart */}
        <SpendingChart />

        <RecentTransactions
          transactions={transactions}
          isLoading={isTxLoading}
        />
      </div>
    </>
  );
}
