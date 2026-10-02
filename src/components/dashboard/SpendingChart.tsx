"use client";

import { useMemo } from "react";
import { BarChart2 } from "lucide-react";
import type { Transaction } from "@/types";

interface SpendingChartProps {
  transactions?: Transaction[];
  isLoading?: boolean;
}

const MONTHS_BACK = 6;

export const SpendingChart = ({
  transactions = [],
  isLoading,
}: SpendingChartProps) => {
  const { months, maxTotal, hasData } = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: MONTHS_BACK }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (MONTHS_BACK - 1 - index),
        1,
      );
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString("en-US", { month: "short" }),
        income: 0,
        expense: 0,
      };
    });

    const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    for (const tx of transactions) {
      const date = new Date(tx.date);
      if (Number.isNaN(date.getTime())) continue;
      const bucket = byKey.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (!bucket) continue;
      const amount = Number.isFinite(tx.amount) ? tx.amount : 0;
      if (tx.type === "income") {
        bucket.income += amount;
      } else {
        bucket.expense += amount;
      }
    }

    const max = Math.max(
      ...buckets.map((bucket) => Math.max(bucket.income, bucket.expense)),
      1,
    );
    const hasAnyData = buckets.some(
      (bucket) => bucket.income > 0 || bucket.expense > 0,
    );

    return { months: buckets, maxTotal: max, hasData: hasAnyData };
  }, [transactions]);

  return (
    <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-sm space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#c6c6cd]/20 pb-4">
        <div>
          <h3 className="text-base font-bold font-mono text-[#191c1e]">
            Monthly Spending
          </h3>
          <p className="text-xs text-[#45464d]">Income vs Expenses overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-black rounded-full inline-block"></span>{" "}
            Expense
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>{" "}
            Income
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-lg border border-[#c6c6cd]/30 bg-[#eceef0]" />
      ) : hasData ? (
        <div className="h-48 bg-[#f7f9fb] rounded-lg border border-[#c6c6cd]/30 px-4 pt-4 pb-2">
          <div className="flex h-full items-end justify-between gap-2 sm:gap-3">
            {months.map((month) => (
              <div
                key={month.key}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              >
                <div className="flex h-full w-full items-end justify-center gap-1">
                  <div
                    className="w-3 rounded-t bg-emerald-500 transition-all sm:w-4"
                    style={{
                      height: `${(month.income / maxTotal) * 100}%`,
                      minHeight: month.income > 0 ? "3px" : "0",
                    }}
                    title={`Income: $${month.income.toFixed(2)}`}
                  />
                  <div
                    className="w-3 rounded-t bg-black transition-all sm:w-4"
                    style={{
                      height: `${(month.expense / maxTotal) * 100}%`,
                      minHeight: month.expense > 0 ? "3px" : "0",
                    }}
                    title={`Expenses: $${month.expense.toFixed(2)}`}
                  />
                </div>
                <span className="text-[10px] font-semibold text-[#45464d]">
                  {month.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-48 bg-[#f7f9fb] rounded-lg border border-dashed border-[#c6c6cd]/50 flex flex-col items-center justify-center text-[#45464d]">
          <BarChart2 className="w-8 h-8 mb-2 opacity-40" />
          <span className="text-xs font-semibold">No activity yet</span>
          <span className="text-[10px] opacity-70">
            Add transactions to see your monthly income vs expenses
          </span>
        </div>
      )}
    </div>
  );
};

export default SpendingChart;
