import { NextResponse, type NextRequest } from "next/server";
import { authenticate } from "@/lib/server/auth";
import { connectDB } from "@/lib/server/db";
import { AppError, errorResponse, readJson } from "@/lib/server/errors";
import { Category } from "@/lib/server/models/Category";
import {
  Transaction,
  type TransactionLean,
} from "@/lib/server/models/Transaction";
import { createTransactionSchema, parseWith } from "@/lib/server/validators";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await authenticate(request);

    const transactions = await Transaction.find({ userId: user._id })
      .populate("category", "name type")
      .sort({ date: -1 })
      .lean<TransactionLean[]>();

    return NextResponse.json({
      status: "success",
      results: transactions.length,
      data: { transactions },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const user = await authenticate(request);
    const body = parseWith(createTransactionSchema, await readJson(request));

    const categoryExists = await Category.findOne({
      _id: body.category,
      $or: [{ isCustom: false }, { userId: user._id }],
    });

    if (!categoryExists) {
      throw new AppError("Category not found or invalid", 404);
    }

    if (categoryExists.type !== body.type) {
      throw new AppError(
        `This category is for ${categoryExists.type}, but you selected ${body.type}`,
        400,
      );
    }

    const transaction = await Transaction.create({
      user: user._id,
      userId: user._id,
      amount: body.amount,
      type: body.type,
      category: body.category,
      date: body.date ? new Date(body.date) : new Date(),
      description: body.description,
    });

    return NextResponse.json(
      {
        status: "success",
        data: { transaction },
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
