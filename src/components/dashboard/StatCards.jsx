import React from "react";
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

export const StatCards = ({ stats }) => {
  // Default values haddii aan data wali la helin
  const { totalBalance = 0, totalIncome = 0, totalExpenses = 0 } = stats || {};

  const cards = [
    {
      title: "Total Balance",
      amount: `$${totalBalance.toLocaleString()}`,
      change: "+12.5%",
      isPositive: true,
      icon: Wallet,
      bgColor: "bg-black text-white",
      iconColor: "bg-white/10 text-white",
    },
    {
      title: "Total Income",
      amount: `$${totalIncome.toLocaleString()}`,
      change: "+8.2%",
      isPositive: true,
      icon: ArrowUpRight,
      bgColor: "bg-white text-[#191c1e]",
      iconColor: "bg-[#eceef0] text-[#006c49]",
    },
    {
      title: "Total Expenses",
      amount: `$${totalExpenses.toLocaleString()}`,
      change: "-3.1%",
      isPositive: false,
      icon: ArrowDownRight,
      bgColor: "bg-white text-[#191c1e]",
      iconColor: "bg-[#ffdad6]/50 text-[#ba1a1a]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-6 rounded-xl border border-[#c6c6cd]/30 shadow-sm flex flex-col justify-between space-y-4 ${card.bgColor}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.iconColor}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold font-mono tracking-tight">
                {card.amount}
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs">
                <span
                  className={`font-semibold ${card.isPositive ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {card.change}
                </span>
                <span className="opacity-60">vs last month</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
