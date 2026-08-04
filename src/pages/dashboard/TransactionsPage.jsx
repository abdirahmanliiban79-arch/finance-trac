import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/apiClient";
import { toast } from "sonner";
import {
  Search,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export const TransactionsPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all', 'income', 'expense'

  // Fetch Transactions List
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await api.get("/transactions");
      return response.data?.data?.transactions || [];
    },
  });

  // Delete Transaction Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      toast.success("Transaction deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-summary"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete transaction"
      );
    },
  });

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      (tx.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === "all" ? true : tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <AppLayout activeRoute="transactions" title="Transactions Management">
      <div className="space-y-6">
        {/* Header Control Panel */}
        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#45464d]" />
            <Input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs border-[#c6c6cd] rounded"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-[#45464d]" />
            <div className="flex bg-[#f7f9fb] p-1 rounded-lg border border-[#c6c6cd]/40 text-xs font-semibold">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1.5 rounded transition-colors ${
                  typeFilter === "all"
                    ? "bg-black text-white shadow-sm"
                    : "text-[#45464d] hover:text-black"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter("income")}
                className={`px-3 py-1.5 rounded transition-colors ${
                  typeFilter === "income"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-[#45464d] hover:text-black"
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setTypeFilter("expense")}
                className={`px-3 py-1.5 rounded transition-colors ${
                  typeFilter === "expense"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-[#45464d] hover:text-black"
                }`}
              >
                Expenses
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="bg-white rounded-xl border border-[#c6c6cd]/30 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#c6c6cd]/20 flex items-center justify-between">
            <h3 className="font-mono font-bold text-sm text-[#191c1e]">
              All Transactions ({filteredTransactions.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-black w-6 h-6" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-16 text-xs text-[#45464d]">
              No transactions match your query.
            </div>
          ) : (
            <div className="divide-y divide-[#c6c6cd]/20">
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === "income";
                return (
                  <div
                    key={tx._id}
                    className="flex flex-col gap-3 p-4 transition-colors hover:bg-[#f7f9fb] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isIncome
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#191c1e]">
                          {tx.description || tx.category?.name || "Transaction"}
                        </p>
                        <p className="text-[11px] text-[#45464d]">
                          {tx.category?.name || "Uncategorized"} •{" "}
                          {new Date(tx.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
                      <span
                        className={`text-sm font-bold font-mono ${
                          isIncome ? "text-emerald-600" : "text-[#191c1e]"
                        }`}
                      >
                        {isIncome
                          ? `+$${tx.amount.toFixed(2)}`
                          : `-$${tx.amount.toFixed(2)}`}
                      </span>
                      <button
                        onClick={() => deleteMutation.mutate(tx._id)}
                        disabled={deleteMutation.isPending}
                        className="text-[#ba1a1a] hover:bg-rose-50 p-2 rounded transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default TransactionsPage;
