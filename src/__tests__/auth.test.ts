/**
 * Auth API Tests — register, login, and /me endpoint.
 *
 * These tests run against an in-memory MongoDB (via setup.ts) so no real Atlas
 * connection is required. Each test is fully isolated: all collections are
 * cleared by the afterEach in setup.ts.
 */
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { GET as meHandler } from "@/app/api/auth/me/route";
import { User } from "@/lib/server/models/User";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(
  method: string,
  url: string,
  body?: object,
  headers?: Record<string, string>,
): NextRequest {
  return new NextRequest(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// ─── POST /api/auth/register ─────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  const validPayload = {
    username: "Jane Doe",
    email: "jane@example.com",
    password: "secret123",
  };

  it("201 — creates a new user and returns a JWT", async () => {
    const req = makeRequest("POST", "http://localhost/api/auth/register", validPayload);
    const res = await registerHandler(req);
    const body = await res.json() as { status: string; token: string; data: { user: { email: string; username: string } } };

    expect(res.status).toBe(201);
    expect(body.status).toBe("success");
    expect(typeof body.token).toBe("string");
    expect(body.data.user.email).toBe(validPayload.email);
    expect(body.data.user.username).toBe(validPayload.username);
    // password must not be present in the response
    expect((body.data.user as Record<string, unknown>).password).toBeUndefined();
  });

  it("400 — rejects duplicate email", async () => {
    const req1 = makeRequest("POST", "http://localhost/api/auth/register", validPayload);
    await registerHandler(req1);

    const req2 = makeRequest("POST", "http://localhost/api/auth/register", validPayload);
    const res = await registerHandler(req2);
    const body = await res.json() as { status: string; message: string };

    expect(res.status).toBe(400);
    expect(body.status).toBe("fail");
    expect(body.message).toMatch(/already exists/i);
  });

  it("400 — rejects short username", async () => {
    const req = makeRequest("POST", "http://localhost/api/auth/register", {
      ...validPayload,
      username: "ab",
    });
    const res = await registerHandler(req);
    expect(res.status).toBe(400);
  });

  it("400 — rejects invalid email", async () => {
    const req = makeRequest("POST", "http://localhost/api/auth/register", {
      ...validPayload,
      email: "not-an-email",
    });
    const res = await registerHandler(req);
    expect(res.status).toBe(400);
  });

  it("400 — rejects short password", async () => {
    const req = makeRequest("POST", "http://localhost/api/auth/register", {
      ...validPayload,
      password: "abc",
    });
    const res = await registerHandler(req);
    expect(res.status).toBe(400);
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  const credentials = { email: "john@example.com", password: "mypassword" };

  async function seedUser() {
    await User.create({
      username: "John Doe",
      email: credentials.email,
      password: credentials.password,
      role: "user",
    });
  }

  it("200 — returns JWT on valid credentials", async () => {
    await seedUser();

    const req = makeRequest("POST", "http://localhost/api/auth/login", credentials);
    const res = await loginHandler(req);
    const body = await res.json() as { status: string; token: string; data: { user: { email: string } } };

    expect(res.status).toBe(200);
    expect(body.status).toBe("success");
    expect(typeof body.token).toBe("string");
    expect(body.data.user.email).toBe(credentials.email);
    expect((body.data.user as Record<string, unknown>).password).toBeUndefined();
  });

  it("401 — rejects wrong password", async () => {
    await seedUser();

    const req = makeRequest("POST", "http://localhost/api/auth/login", {
      ...credentials,
      password: "wrongpassword",
    });
    const res = await loginHandler(req);
    const body = await res.json() as { status: string; message: string };

    expect(res.status).toBe(401);
    expect(body.status).toBe("fail");
  });

  it("401 — rejects non-existent user", async () => {
    const req = makeRequest("POST", "http://localhost/api/auth/login", {
      email: "nobody@example.com",
      password: "whatever123",
    });
    const res = await loginHandler(req);
    expect(res.status).toBe(401);
  });

  it("400 — rejects missing email", async () => {
    const req = makeRequest("POST", "http://localhost/api/auth/login", {
      password: "mypassword",
    });
    const res = await loginHandler(req);
    expect(res.status).toBe(400);
  });

  it("400 — rejects invalid email format", async () => {
    const req = makeRequest("POST", "http://localhost/api/auth/login", {
      email: "bad-email",
      password: "mypassword",
    });
    const res = await loginHandler(req);
    expect(res.status).toBe(400);
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

describe("GET /api/auth/me", () => {
  async function registerAndGetToken() {
    const req = makeRequest("POST", "http://localhost/api/auth/register", {
      username: "Alice",
      email: "alice@example.com",
      password: "alicepass123",
    });
    const res = await registerHandler(req);
    const body = await res.json() as { token: string };
    return body.token;
  }

  it("200 — returns current user when token is valid", async () => {
    const token = await registerAndGetToken();

    const req = makeRequest("GET", "http://localhost/api/auth/me", undefined, {
      Authorization: `Bearer ${token}`,
    });
    const res = await meHandler(req);
    const body = await res.json() as { status: string; data: { user: { email: string } } };

    expect(res.status).toBe(200);
    expect(body.status).toBe("success");
    expect(body.data.user.email).toBe("alice@example.com");
    expect((body.data.user as Record<string, unknown>).password).toBeUndefined();
  });

  it("401 — rejects missing Authorization header", async () => {
    const req = makeRequest("GET", "http://localhost/api/auth/me");
    const res = await meHandler(req);
    expect(res.status).toBe(401);
  });

  it("401 — rejects invalid/tampered token", async () => {
    const req = makeRequest("GET", "http://localhost/api/auth/me", undefined, {
      Authorization: "Bearer this.is.not.a.valid.jwt",
    });
    const res = await meHandler(req);
    expect(res.status).toBe(401);
  });
});
