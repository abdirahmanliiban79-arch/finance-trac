import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { ZodError } from "zod";

export class AppError extends Error {
  readonly statusCode: number;
  readonly status: "fail" | "error";
  readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

interface MongoDuplicateKeyError {
  code?: number;
  keyValue?: Record<string, unknown>;
}

function isDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as MongoDuplicateKeyError).code === 11000
  );
}

const MAX_BODY_BYTES = 64 * 1024;

export async function readJson(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new AppError("Request body too large", 413);
  }

  if (!request.body) {
    throw new AppError("Invalid JSON body", 400);
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let totalBytes = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();

      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        throw new AppError("Request body too large", 413);
      }

      text += decoder.decode(value, { stream: true });
    }

    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new AppError("Invalid JSON body", 400);
  }
}

export function errorResponse(error: unknown): NextResponse {
  let statusCode = 500;
  let status: "fail" | "error" = "error";
  let message = "Something went wrong on the server!";

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    status = error.status;
    message = error.message;
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    status = "fail";
    message = `Invalid ${error.path}: ${error.value}.`;
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    status = "fail";
    message = `Invalid input data. ${Object.values(error.errors)
      .map((fieldError) => fieldError.message)
      .join(". ")}`;
  } else if (isDuplicateKeyError(error)) {
    const value = error.keyValue ? Object.values(error.keyValue)[0] : undefined;
    statusCode = 400;
    status = "fail";
    message = `Duplicate field value: "${String(value)}". Please use another value!`;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    status = "fail";
    message = error.issues.map((issue) => issue.message).join(", ");
  } else if (error instanceof Error) {
    const isDevelopment = process.env.NODE_ENV === "development";
    message = isDevelopment && error.message ? error.message : message;
  }

  const body: Record<string, unknown> = { status, message };

  if (statusCode >= 500) {
    console.error("[api-error]", error);
  }

  if (process.env.NODE_ENV === "development") {
    body.stack = error instanceof Error ? error.stack : undefined;
    if (!(error instanceof AppError) && !(error instanceof Error)) {
      body.error = error;
    }
  }

  return NextResponse.json(body, { status: statusCode });
}
