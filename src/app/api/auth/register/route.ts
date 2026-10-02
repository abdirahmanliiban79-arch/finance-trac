import { NextResponse, type NextRequest } from "next/server";
import { generateToken } from "@/lib/server/auth";
import { connectDB } from "@/lib/server/db";
import { AppError, errorResponse, readJson } from "@/lib/server/errors";
import { User } from "@/lib/server/models/User";
import { serializeUser } from "@/lib/server/serialize";
import { parseWith, registerSchema } from "@/lib/server/validators";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const body = parseWith(registerSchema, await readJson(request));
    const email = body.email.toLowerCase();

    const userExists = await User.findOne({ email });

    if (userExists) {
      throw new AppError("User already exists with this email", 400);
    }

    const user = await User.create({
      username: body.username,
      email,
      password: body.password,
      role: "user",
    });

    const token = generateToken(String(user._id));

    return NextResponse.json(
      {
        status: "success",
        token,
        data: { user: serializeUser(user) },
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
