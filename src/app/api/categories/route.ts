import { NextResponse, type NextRequest } from "next/server";
import { authenticate } from "@/lib/server/auth";
import { connectDB } from "@/lib/server/db";
import { AppError, errorResponse, readJson } from "@/lib/server/errors";
import { Category } from "@/lib/server/models/Category";
import { createCategorySchema, parseWith } from "@/lib/server/validators";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await authenticate(request);

    const categories = await Category.find({
      $or: [{ isCustom: false }, { userId: user._id }],
    }).sort({ type: 1, name: 1 });

    return NextResponse.json({
      status: "success",
      results: categories.length,
      data: { categories },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const user = await authenticate(request);
    const body = parseWith(createCategorySchema, await readJson(request));

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${escapeRegExp(body.name)}$`, "i") },
      $or: [{ isCustom: false }, { userId: user._id }],
    });

    if (existingCategory) {
      throw new AppError("Category with this name already exists", 400);
    }

    const category = await Category.create({
      name: body.name,
      type: body.type,
      isCustom: true,
      createdBy: user._id,
      userId: user._id,
    });

    return NextResponse.json(
      {
        status: "success",
        data: { category },
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
