import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getCategories, POST as postCategory } from "@/app/api/categories/route";
import { DELETE as deleteCategory } from "@/app/api/categories/[id]/route";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { Category } from "@/lib/server/models/Category";

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

async function getAuthToken(email = "catuser@example.com"): Promise<string> {
  const req = makeRequest("POST", "http://localhost/api/auth/register", {
    username: "Category Tester",
    email,
    password: "password123",
  });
  const res = await registerHandler(req);
  const body = (await res.json()) as { token: string };
  return body.token;
}

describe("Categories API", () => {
  it("GET /api/categories — returns predefined and user categories", async () => {
    const token = await getAuthToken("cat1@example.com");

    // Predefined category may already be seeded by connectDB() during registration
    let salaryCat = await Category.findOne({ name: "Salary", isCustom: false });
    if (!salaryCat) {
      salaryCat = await Category.create({
        name: "Salary",
        type: "income",
        isCustom: false,
      });
    }

    const req = makeRequest("GET", "http://localhost/api/categories", undefined, {
      Authorization: `Bearer ${token}`,
    });
    const res = await getCategories(req);
    const body = (await res.json()) as {
      status: string;
      results: number;
      data: { categories: Array<{ name: string; type: string }> };
    };

    expect(res.status).toBe(200);
    expect(body.status).toBe("success");
    expect(body.data.categories.some((c) => c.name === "Salary")).toBe(true);
  });

  it("POST /api/categories — creates a new custom category", async () => {
    const token = await getAuthToken("cat2@example.com");

    const req = makeRequest(
      "POST",
      "http://localhost/api/categories",
      { name: "Side Hustle", type: "income" },
      { Authorization: `Bearer ${token}` },
    );
    const res = await postCategory(req);
    const body = (await res.json()) as {
      status: string;
      data: { category: { name: string; type: string; isCustom: boolean } };
    };

    expect(res.status).toBe(201);
    expect(body.status).toBe("success");
    expect(body.data.category.name).toBe("Side Hustle");
    expect(body.data.category.isCustom).toBe(true);
  });

  it("POST /api/categories — rejects duplicate category name for same user", async () => {
    const token = await getAuthToken("cat3@example.com");

    const req1 = makeRequest(
      "POST",
      "http://localhost/api/categories",
      { name: "Consulting", type: "income" },
      { Authorization: `Bearer ${token}` },
    );
    await postCategory(req1);

    const req2 = makeRequest(
      "POST",
      "http://localhost/api/categories",
      { name: "consulting", type: "income" },
      { Authorization: `Bearer ${token}` },
    );
    const res = await postCategory(req2);
    expect(res.status).toBe(400);
  });

  it("DELETE /api/categories/:id — deletes custom category but protects predefined", async () => {
    const token = await getAuthToken("cat4@example.com");

    // 1. Create custom category
    const createReq = makeRequest(
      "POST",
      "http://localhost/api/categories",
      { name: "Custom Sub", type: "expense" },
      { Authorization: `Bearer ${token}` },
    );
    const createRes = await postCategory(createReq);
    const createBody = (await createRes.json()) as {
      data: { category: { _id: string } };
    };
    const customId = createBody.data.category._id;

    // 2. Delete custom category
    const deleteReq = makeRequest("DELETE", `http://localhost/api/categories/${customId}`, undefined, {
      Authorization: `Bearer ${token}`,
    });
    const deleteRes = await deleteCategory(deleteReq, {
      params: Promise.resolve({ id: customId }),
    });
    expect(deleteRes.status).toBe(200);

    // 3. Predefined category cannot be deleted
    const predefined = await Category.create({
      name: "Groceries",
      type: "expense",
      isCustom: false,
    });
    const delPredefinedReq = makeRequest(
      "DELETE",
      `http://localhost/api/categories/${predefined._id}`,
      undefined,
      { Authorization: `Bearer ${token}` },
    );
    const delPredefinedRes = await deleteCategory(delPredefinedReq, {
      params: Promise.resolve({ id: String(predefined._id) }),
    });
    expect(delPredefinedRes.status).toBe(404);
  });
});
