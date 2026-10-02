import { NextResponse, type NextRequest } from "next/server";
import { authenticate } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/errors";
import { serializeUser } from "@/lib/server/serialize";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await authenticate(request);

    return NextResponse.json({
      status: "success",
      data: { user: serializeUser(user) },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
