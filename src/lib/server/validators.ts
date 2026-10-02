import { z } from "zod";
import { AppError } from "./errors";

export const categoryTypeSchema = z.enum(["income", "expense"], {
  message: "Type must be either income or expense",
});

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(50, { message: "Username cannot exceed 50 characters" }),
  email: z
    .string()
    .trim()
    .max(254, { message: "Email cannot exceed 254 characters" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(128, { message: "Password cannot exceed 128 characters" }),
});

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Category name must be at least 2 characters long" })
    .max(50, { message: "Category name cannot exceed 50 characters" }),
  type: categoryTypeSchema,
});

export const createTransactionSchema = z.object({
  amount: z
    .number()
    .positive({ message: "Amount must be a positive number" })
    .max(1_000_000_000_000, { message: "Amount is too large" }),
  type: categoryTypeSchema,
  category: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid Category ID format" }),
  date: z
    .union([z.string(), z.date()])
    .optional()
    .refine(
      (value) =>
        value === undefined ||
        value === "" ||
        !Number.isNaN(new Date(value).getTime()),
      { message: "Invalid date" },
    ),
  description: z
    .string()
    .trim()
    .max(250, { message: "Description cannot exceed 250 characters" })
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export function parseWith<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(", ");
    throw new AppError(message, 400);
  }

  return result.data;
}
