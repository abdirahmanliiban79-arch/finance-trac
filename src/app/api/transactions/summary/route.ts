import { NextResponse, type NextRequest } from "next/server";
import { authenticate } from "@/lib/server/auth";
import { AppError, errorResponse } from "@/lib/server/errors";
import { Transaction } from "@/lib/server/models/Transaction";

interface SummaryAggregation {
  _id: "income" | "expense";
  totalAmount: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await authenticate(request);

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    const currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth();

    if (yearParam !== null) {
      const parsedYear = Number(yearParam);

      if (!Number.isInteger(parsedYear) || parsedYear < 1970 || parsedYear > 2100) {
        throw new AppError("Invalid year. Must be between 1970 and 2100.", 400);
      }

      currentYear = parsedYear;
    }

    if (monthParam !== null) {
      const parsedMonth = Number(monthParam);

      if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        throw new AppError("Invalid month. Must be between 1 and 12.", 400);
      }

      currentMonth = parsedMonth - 1;
    }

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 1);

    const summary = await Transaction.aggregate<SummaryAggregation>([
      {
        $match: {
          userId: user._id,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    for (const item of summary) {
      if (item._id === "income") totalIncome = item.totalAmount;
      if (item._id === "expense") totalExpense = item.totalAmount;
    }

    const netBalance = totalIncome - totalExpense;

    return NextResponse.json({
      status: "success",
      data: {
        period: {
          year: currentYear,
          month: currentMonth + 1,
        },
        totalIncome,
        totalExpense,
        netBalance,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
