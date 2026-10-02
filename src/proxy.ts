import { NextResponse, type NextRequest } from "next/server";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;
const MAX_TRACKED_CLIENTS = 10_000;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const clients = new Map<string, RateLimitEntry>();
let newClientCounter = 0;

function getClientIp(request: NextRequest): string {
  const realIp = request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const chain = forwardedFor
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (chain.length > 0) {
      return chain[chain.length - 1];
    }
  }

  return "unknown";
}

function pruneExpiredEntries(now: number): void {
  for (const [ip, entry] of clients) {
    if (entry.resetAt <= now) {
      clients.delete(ip);
    }
  }
}

function evictOldestEntries(): void {
  while (clients.size >= MAX_TRACKED_CLIENTS) {
    const oldestKey = clients.keys().next().value;

    if (oldestKey === undefined) {
      return;
    }

    clients.delete(oldestKey);
  }
}

export function proxy(request: NextRequest): NextResponse {
  const now = Date.now();
  const ip = getClientIp(request);
  const entry = clients.get(ip);

  if (!entry || entry.resetAt <= now) {
    clients.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    newClientCounter += 1;

    if (newClientCounter % 100 === 0 || clients.size >= MAX_TRACKED_CLIENTS) {
      pruneExpiredEntries(now);
      evictOldestEntries();
    }

    return NextResponse.next();
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((entry.resetAt - now) / 1000),
    );

    return NextResponse.json(
      {
        status: "fail",
        message:
          "Too many requests from this IP, please try again after 15 minutes",
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
