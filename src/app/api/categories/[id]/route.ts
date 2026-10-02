import { NextResponse, type NextRequest } from "next/server";
import { authenticate } from "@/lib/server/auth";
import { AppError, errorResponse } from "@/lib/server/errors";
import { Category } from "@/lib/server/models/Category";

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

    const category = await Category.findOneAndDelete({
      _id: id,
      isCustom: true,
      userId: user._id,
    });

    if (!category) {
      throw new AppError(
        "Category not found or you cannot delete predefined categories",
        404,
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
