export interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  role?: string;
}

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  type: "income" | "expense" | string;
  isCustom?: boolean;
}

export interface Transaction {
  _id: string;
  amount: number;
  type: "income" | "expense" | string;
  category?: Category;
  description?: string;
  date: string;
}

export interface Summary {
  netBalance?: number;
  totalIncome?: number;
  totalExpense?: number;
}

export interface AuthResponse {
  user?: User;
  token?: string;
  data?: {
    user?: User;
    token?: string;
  };
}

export interface ApiErrorBody {
  message?: string;
}
