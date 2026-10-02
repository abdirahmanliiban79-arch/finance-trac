export type TransactionType = "income" | "expense";

export type UserRole = "user" | "admin";

export interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  role?: UserRole;
  profilePic?: string;
}

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  type: TransactionType;
  isCustom?: boolean;
}

export interface Transaction {
  _id: string;
  amount: number;
  type: TransactionType;
  category?: Category;
  description?: string;
  date: string;
}

export interface Summary {
  period?: {
    year: number;
    month: number;
  };
  netBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export interface AuthResponse {
  status?: string;
  token?: string;
  user?: User;
  data?: {
    user?: User;
    token?: string;
  };
}

export interface ApiErrorBody {
  message?: string;
}
