import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: "Welcome to Personal Finance Tracker API! 💸",
  });
}
