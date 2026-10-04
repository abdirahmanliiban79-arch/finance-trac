import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getTransactions, POST as postTransaction } from "@/app/api/transactions/route";
import { GET as getSummary } from "@/app/api/transactions/summary/route";
import { GET as getChart } from "@/app/api/transactions/chart/route";
import { DELETE as deleteTransaction } from "@/app/api/transactions/[id]/route";
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

async function setupUserAndCategories() {
  const req = makeRequest("POST", "http://localhost/api/auth/register", {
    username: "Tx Tester",
    email: `txtester_${Date.now()}@example.com`,
    password: "password123",
  });
  const res = await registerHandler(req);
  const body = (await res.json()) as { token: string };
  const token = body.token;

  let incomeCat = await Category.findOne({ name: "Salary", isCustom: false });
  if (!incomeCat) {
    incomeCat = await Category.create({
      name: "Salary",
      type: "income",
      isCustom: false,
    });
  }

  let expenseCat = await Category.findOne({ name: "Groceries & Food", isCustom: false });
  if (!expenseCat) {
    expenseCat = await Category.create({
      name: "Groceries & Food",
      type: "expense",
      isCustom: false,
    });
  }

  return { token, incomeCat, expenseCat };
}

describe("Transactions & Summary & Chart APIs", () => {
  it("POST /api/transactions — creates a transaction with valid category", async () => {
    const { token, incomeCat } = await setupUserAndCategories();

    const req = makeRequest(
      "POST",
      "http://localhost/api/transactions",
      {
        amount: 3500,
        type: "income",
        category: String(incomeCat._id),
        description: "Monthly salary",
        date: new Date().toISOString(),
      },
      { Authorization: `Bearer ${token}` },
    );

    const res = await postTransaction(req);
    const body = (await res.json()) as {
      status: string;
      data: { transaction: { amount: number; type: string } };
    };

    expect(res.status).toBe(201);
    expect(body.status).toBe("success");
    expect(body.data.transaction.amount).toBe(3500);
  });

  it("POST /api/transactions — rejects mismatched type and category", async () => {
    const { token, expenseCat } = await setupUserAndCategories();

    const req = makeRequest(
      "POST",
      "http://localhost/api/transactions",
      {
        amount: 100,
        type: "income", // mismatched! expenseCat is expense
        category: String(expenseCat._id),
      },
      { Authorization: `Bearer ${token}` },
    );

    const res = await postTransaction(req);
    expect(res.status).toBe(400);
  });

  it("GET /api/transactions — returns transactions populated with category", async () => {
    const { token, expenseCat } = await setupUserAndCategories();

    await postTransaction(
      makeRequest(
        "POST",
        "http://localhost/api/transactions",
        {
          amount: 50,
          type: "expense",
          category: String(expenseCat._id),
          description: "Lunch",
        },
        { Authorization: `Bearer ${token}` },
      ),
    );

    const req = makeRequest("GET", "http://localhost/api/transactions", undefined, {
      Authorization: `Bearer ${token}`,
    });
    const res = await getTransactions(req);
    const body = (await res.json()) as {
      status: string;
      results: number;
      data: { transactions: Array<{ amount: number; category: { name: string } }> };
    };

    expect(res.status).toBe(200);
    expect(body.results).toBe(1);
    expect(body.data.transactions[0].category.name).toBe("Groceries & Food");
  });

  it("GET /api/transactions/summary — computes correct netBalance, totalIncome, totalExpense", async () => {
    const { token, incomeCat, expenseCat } = await setupUserAndCategories();

    // Add 1000 income
    await postTransaction(
      makeRequest(
        "POST",
        "http://localhost/api/transactions",
        {
          amount: 1000,
          type: "income",
          category: String(incomeCat._id),
          date: new Date().toISOString(),
        },
        { Authorization: `Bearer ${token}` },
      ),
    );

    // Add 400 expense
    await postTransaction(
      makeRequest(
        "POST",
        "http://localhost/api/transactions",
        {
          amount: 400,
          type: "expense",
          category: String(expenseCat._id),
          date: new Date().toISOString(),
        },
        { Authorization: `Bearer ${token}` },
      ),
    );

    const req = makeRequest("GET", "http://localhost/api/transactions/summary", undefined, {
      Authorization: `Bearer ${token}`,
    });
    const res = await getSummary(req);
    const body = (await res.json()) as {
      status: string;
      data: {
        totalIncome: number;
        totalExpense: number;
        netBalance: number;
      };
    };

    expect(res.status).toBe(200);
    expect(body.data.totalIncome).toBe(1000);
    expect(body.data.totalExpense).toBe(400);
    expect(body.data.netBalance).toBe(600);
  });

  it("GET /api/transactions/chart — returns 6-month historical bucketed data", async () => {
    const { token, incomeCat } = await setupUserAndCategories();

    // Add current month transaction
    await postTransaction(
      makeRequest(
        "POST",
        "http://localhost/api/transactions",
        {
          amount: 2500,
          type: "income",
          category: String(incomeCat._id),
          date: new Date().toISOString(),
        },
        { Authorization: `Bearer ${token}` },
      ),
    );

    const req = makeRequest("GET", "http://localhost/api/transactions/chart", undefined, {
      Authorization: `Bearer ${token}`,
    });
    const res = await getChart(req);
    const body = (await res.json()) as {
      status: string;
      data: {
        chart: Array<{
          year: number;
          month: number;
          label: string;
          income: number;
          expense: number;
        }>;
      };
    };

    expect(res.status).toBe(200);
    expect(body.status).toBe("success");
    expect(body.data.chart).toHaveLength(6);
    // The last item is the current month
    const currentBucket = body.data.chart[body.data.chart.length - 1];
    expect(currentBucket.income).toBe(2500);
    expect(currentBucket.expense).toBe(0);
  });

  it("DELETE /api/transactions/:id — deletes user transaction", async () => {
    const { token, incomeCat } = await setupUserAndCategories();

    const createRes = await postTransaction(
      makeRequest(
        "POST",
        "http://localhost/api/transactions",
        {
          amount: 500,
          type: "income",
          category: String(incomeCat._id),
        },
        { Authorization: `Bearer ${token}` },
      ),
    );
    const createBody = (await createRes.json()) as {
      data: { transaction: { _id: string } };
    };
    const txId = createBody.data.transaction._id;

    const delReq = makeRequest("DELETE", `http://localhost/api/transactions/${txId}`, undefined, {
      Authorization: `Bearer ${token}`,
    });
    const delRes = await deleteTransaction(delReq, {
      params: Promise.resolve({ id: txId }),
    });

    expect(delRes.status).toBe(200);
  });
});
