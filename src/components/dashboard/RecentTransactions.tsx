"use client";

import { ArrowUpRight, ArrowDownRight, Trash2, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/api/apiClient";
import { toast } from "sonner";
import type { ApiErrorBody, Transaction } from "@/types";

interface RecentTransactionsProps {
  transactions?: Transaction[];
  isLoading?: boolean;
}

export const RecentTransactions = ({
  transactions = [],
  isLoading,
}: RecentTransactionsProps) => {
  const queryClient = useQueryClient();

  // Delete Transaction Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      toast.success("Transaction deleted");
      // Automatic Refetching
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-summary"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-chart"] });
    },
    onError: (error) => {
      const err = error as AxiosError<ApiErrorBody>;
      toast.error(
        err.response?.data?.message || "Failed to delete transaction",
      );
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-sm flex items-center justify-center h-48">
        <Loader2 className="animate-spin text-black" size={24} />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-[#c6c6cd]/20 pb-4">
        <div>
          <h3 className="text-base font-bold font-mono text-[#191c1e]">
            Recent Transactions
          </h3>
          <p className="text-xs text-[#45464d]">
            Latest financial activity on your account
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-xs text-[#45464d]">
          No transactions found. Click &quot;Add Transaction&quot; to create one.
        </div>
      ) : (
        <div className="divide-y divide-[#c6c6cd]/20">
          {transactions.slice(0, 5).map((tx) => {
            const isIncome = tx.type === "income";
            return (
              <div
                key={tx._id}
                className="py-3 flex items-center justify-between hover:bg-[#f7f9fb] px-2 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${isIncome ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#191c1e]">
                      {tx.description || tx.category?.name || "Transaction"}
                    </p>
                    <p className="text-[10px] text-[#45464d]">
                      {tx.category?.name} •{" "}
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`text-xs font-bold font-mono ${isIncome ? "text-emerald-600" : "text-[#191c1e]"}`}
                  >
                    {isIncome
                      ? `+$${tx.amount.toFixed(2)}`
                      : `-$${tx.amount.toFixed(2)}`}
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(tx._id)}
                    disabled={deleteMutation.isPending}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 text-[#ba1a1a] hover:bg-rose-50 p-1.5 rounded transition-all"
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
