import React from "react";
import { BarChart2 } from "lucide-react";

export const SpendingChart = () => {
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

      {/* Visual Chart Placeholder */}
      <div className="h-48 bg-[#f7f9fb] rounded-lg border border-dashed border-[#c6c6cd]/50 flex flex-col items-center justify-center text-[#45464d]">
        <BarChart2 className="w-8 h-8 mb-2 opacity-40" />
        <span className="text-xs font-semibold">Spending Analytics Chart</span>
        <span className="text-[10px] opacity-70">
          Chart library (Recharts/Chart.js) Integration Ready
        </span>
      </div>
    </div>
  );
};
