import { NextResponse } from "next/server";
import { openApiDocument } from "@/lib/server/openapi";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(openApiDocument);
}
