import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

interface StatCardsProps {
  stats?: {
    totalBalance?: number;
    totalIncome?: number;
    totalExpenses?: number;
  };
  isLoading?: boolean;
}

export const StatCards = ({ stats, isLoading }: StatCardsProps) => {
  const { totalBalance = 0, totalIncome = 0, totalExpenses = 0 } = stats || {};

  const cards = [
    {
      title: "Net Balance",
      amount: `$${totalBalance.toLocaleString()}`,
      caption: "This month",
      icon: Wallet,
      bgColor: "bg-black text-white",
      iconColor: "bg-white/10 text-white",
    },
    {
      title: "Total Income",
      amount: `$${totalIncome.toLocaleString()}`,
      caption: "This month",
      icon: ArrowUpRight,
      bgColor: "bg-white text-[#191c1e]",
      iconColor: "bg-[#eceef0] text-[#006c49]",
    },
    {
      title: "Total Expenses",
      amount: `$${totalExpenses.toLocaleString()}`,
      caption: "This month",
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
              {isLoading ? (
                <div className="h-9 w-28 animate-pulse rounded bg-current opacity-20" />
              ) : (
                <h3 className="text-3xl font-bold font-mono tracking-tight">
                  {card.amount}
                </h3>
              )}
              <div className="mt-2 text-xs opacity-60">{card.caption}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;
