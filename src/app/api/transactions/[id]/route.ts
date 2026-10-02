import { NextResponse, type NextRequest } from "next/server";
import { authenticate } from "@/lib/server/auth";
import { AppError, errorResponse } from "@/lib/server/errors";
import { Transaction } from "@/lib/server/models/Transaction";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const user = await authenticate(request);
    const { id } = await context.params;

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: user._id,
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    return NextResponse.json({
      status: "success",
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
