import { NextResponse, type NextRequest } from "next/server";
import { generateToken } from "@/lib/server/auth";
import { connectDB } from "@/lib/server/db";
import { AppError, errorResponse, readJson } from "@/lib/server/errors";
import { User } from "@/lib/server/models/User";
import { serializeUser } from "@/lib/server/serialize";
import { loginSchema, parseWith } from "@/lib/server/validators";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const body = parseWith(loginSchema, await readJson(request));
    const email = body.email.toLowerCase();

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(body.password))) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken(String(user._id));

    return NextResponse.json({
      status: "success",
      token,
      data: { user: serializeUser(user) },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
