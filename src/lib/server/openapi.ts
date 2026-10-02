export const openApiDocument = {
  openapi: "3.0.0",
  info: {
    title: "Finance Tracker API",
    version: "1.0.0",
    description: "API documentation for the Finance Tracker app",
  },
  servers: [{ url: "/api" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          username: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["user", "admin"] },
          profilePic: { type: "string" },
        },
      },
      Category: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          type: { type: "string", enum: ["income", "expense"] },
          isCustom: { type: "boolean" },
        },
      },
      Transaction: {
        type: "object",
        properties: {
          _id: { type: "string" },
          amount: { type: "number" },
          type: { type: "string", enum: ["income", "expense"] },
          category: {
            oneOf: [
              { type: "string" },
              {
                type: "object",
                properties: {
                  _id: { type: "string" },
                  name: { type: "string" },
                  type: { type: "string", enum: ["income", "expense"] },
                },
              },
            ],
          },
          date: { type: "string", format: "date-time" },
          description: { type: "string" },
        },
      },
      Error: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["fail", "error"] },
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        summary: "API welcome message",
        tags: ["Health"],
        responses: {
          "200": { description: "Welcome message" },
        },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register a new user",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "email", "password"],
                properties: {
                  username: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "User registered successfully" },
          "400": { description: "Validation error" },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login a user",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Login successful, token returned" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/auth/me": {
      get: {
        summary: "Get current user profile",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "User profile details" },
          "401": { description: "Not authenticated" },
        },
      },
    },
    "/categories": {
      get: {
        summary: "Get all categories (predefined + custom)",
        tags: ["Categories"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "List of all categories" },
        },
      },
      post: {
        summary: "Create a custom category",
        tags: ["Categories"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "type"],
                properties: {
                  name: { type: "string" },
                  type: { type: "string", enum: ["income", "expense"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Custom category created successfully" },
          "400": { description: "Validation error" },
        },
      },
    },
    "/categories/{id}": {
      delete: {
        summary: "Delete a custom category",
        tags: ["Categories"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Category deleted successfully" },
          "404": { description: "Category not found" },
        },
      },
    },
    "/transactions": {
      get: {
        summary: "Get all transactions of the user",
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "List of transactions" },
        },
      },
      post: {
        summary: "Create a new transaction",
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["amount", "type", "category"],
                properties: {
                  amount: { type: "number" },
                  type: { type: "string", enum: ["income", "expense"] },
                  category: { type: "string" },
                  date: { type: "string", format: "date-time" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Transaction recorded successfully" },
          "400": { description: "Validation error" },
        },
      },
    },
    "/transactions/summary": {
      get: {
        summary:
          "Get monthly finance summary (total income, expense, and net balance)",
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "year",
            schema: { type: "integer" },
            description: "Year of the summary (e.g. 2026)",
          },
          {
            in: "query",
            name: "month",
            schema: { type: "integer" },
            description: "Month of the summary (1-12)",
          },
        ],
        responses: {
          "200": { description: "Monthly financial statistics" },
        },
      },
    },
    "/transactions/{id}": {
      delete: {
        summary: "Delete a transaction",
        tags: ["Transactions"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Transaction deleted successfully" },
          "404": { description: "Transaction not found" },
        },
      },
    },
  },
} as const;
