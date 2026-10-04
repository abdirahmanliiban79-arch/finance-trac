"use client";

import { useMemo } from "react";
import { BarChart2, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/apiClient";
import type { ChartDataPoint } from "@/types";

interface ChartApiResponse {
  status: string;
  data: { chart: ChartDataPoint[] };
}

export const SpendingChart = () => {
  const { data, isLoading } = useQuery<ChartDataPoint[]>({
    queryKey: ["transactions-chart"],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      const response = await api.get<ChartApiResponse>(
        "/transactions/chart",
      );
      return response.data?.data?.chart ?? [];
    },
    staleTime: 60 * 1000, // 1 minute
  });

  const { months, maxTotal, hasData, totals } = useMemo(() => {
    const points: ChartDataPoint[] = data ?? [];
    const max = Math.max(
      ...points.map((p) => Math.max(p.income, p.expense)),
      1,
    );
    const hasAnyData = points.some((p) => p.income > 0 || p.expense > 0);
    const totalIncome = points.reduce((s, p) => s + p.income, 0);
    const totalExpense = points.reduce((s, p) => s + p.expense, 0);
    return {
      months: points,
      maxTotal: max,
      hasData: hasAnyData,
      totals: { income: totalIncome, expense: totalExpense },
    };
  }, [data]);

  const formatCurrency = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;

  return (
    <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-sm space-y-4 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#c6c6cd]/20 pb-4">
        <div>
          <h3 className="text-base font-bold font-mono text-[#191c1e]">
            Monthly Overview
          </h3>
          <p className="text-xs text-[#45464d] mt-0.5">
            Income vs Expenses — last 6 months
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Income
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#191c1e] inline-block" />
            Expense
          </span>
        </div>
      </div>

      {/* Summary row */}
      {!isLoading && hasData && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 rounded-lg px-3 py-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wide">
                Total Income
              </p>
              <p className="text-sm font-bold font-mono text-emerald-700">
                {formatCurrency(totals.income)}
              </p>
            </div>
          </div>
          <div className="bg-[#fff0f0] rounded-lg px-3 py-2 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <p className="text-[10px] text-rose-700 font-semibold uppercase tracking-wide">
                Total Expense
              </p>
              <p className="text-sm font-bold font-mono text-rose-700">
                {formatCurrency(totals.expense)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart area */}
      {isLoading ? (
        <div className="h-52 animate-pulse rounded-lg border border-[#c6c6cd]/30 bg-[#eceef0]" />
      ) : hasData ? (
        <div className="h-52 bg-[#f7f9fb] rounded-lg border border-[#c6c6cd]/20 px-4 pt-4 pb-2">
          <div className="flex h-full items-end justify-between gap-2 sm:gap-3">
            {months.map((month) => {
              const incomeH = Math.max((month.income / maxTotal) * 100, 0);
              const expenseH = Math.max((month.expense / maxTotal) * 100, 0);
              return (
                <div
                  key={`${month.year}-${month.month}`}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                >
                  {/* Tooltip-style values on hover */}
                  <div className="flex h-full w-full items-end justify-center gap-1 relative group">
                    {/* Income bar */}
                    <div
                      className="w-3 sm:w-4 rounded-t bg-emerald-500 hover:bg-emerald-400 transition-all cursor-default"
                      style={{
                        height: `${incomeH}%`,
                        minHeight: month.income > 0 ? "3px" : "0",
                      }}
                      title={`Income: ${formatCurrency(month.income)}`}
                    />
                    {/* Expense bar */}
                    <div
                      className="w-3 sm:w-4 rounded-t bg-[#191c1e] hover:bg-[#2d3036] transition-all cursor-default"
                      style={{
                        height: `${expenseH}%`,
                        minHeight: month.expense > 0 ? "3px" : "0",
                      }}
                      title={`Expenses: ${formatCurrency(month.expense)}`}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-[#45464d]">
                    {month.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-52 bg-[#f7f9fb] rounded-lg border border-dashed border-[#c6c6cd]/50 flex flex-col items-center justify-center text-[#45464d] gap-2">
          <BarChart2 className="w-9 h-9 opacity-30" />
          <span className="text-xs font-semibold">No activity yet</span>
          <span className="text-[10px] opacity-70 text-center max-w-[180px]">
            Add transactions to see your monthly income vs expenses
          </span>
        </div>
      )}
    </div>
  );
};

export default SpendingChart;
