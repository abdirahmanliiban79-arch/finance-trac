import { NextResponse } from "next/server";

function notFound(): NextResponse {
  return NextResponse.json(
    {
      status: "fail",
      message: "Can't find this route on this server!",
    },
    { status: 404 },
  );
}

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
