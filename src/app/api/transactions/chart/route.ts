import { NextResponse, type NextRequest } from "next/server";
import { authenticate } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/errors";
import { Transaction } from "@/lib/server/models/Transaction";

const MONTHS_BACK = 6;

interface ChartAggregation {
  _id: { year: number; month: number; type: "income" | "expense" };
  totalAmount: number;
}

export interface ChartDataPoint {
  year: number;
  month: number;
  label: string;
  income: number;
  expense: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await authenticate(request);

    const now = new Date();
    // Start of the earliest month we want (6 months back from current)
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - (MONTHS_BACK - 1),
      1,
    );
    // Start of next month (exclusive upper bound)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const aggregation = await Transaction.aggregate<ChartAggregation>([
      {
        $match: {
          userId: user._id,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Build the ordered 6-month buckets
    const MONTH_NAMES = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const buckets: ChartDataPoint[] = Array.from(
      { length: MONTHS_BACK },
      (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - (MONTHS_BACK - 1 - index),
          1,
        );
        return {
          year: date.getFullYear(),
          month: date.getMonth() + 1, // 1-indexed
          label: MONTH_NAMES[date.getMonth()],
          income: 0,
          expense: 0,
        };
      },
    );

    // Map aggregation results into buckets
    for (const item of aggregation) {
      const bucket = buckets.find(
        (b) => b.year === item._id.year && b.month === item._id.month,
      );
      if (!bucket) continue;
      if (item._id.type === "income") {
        bucket.income = item.totalAmount;
      } else {
        bucket.expense = item.totalAmount;
      }
    }

    return NextResponse.json({
      status: "success",
      data: { chart: buckets },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
