import { Category, type CategoryType } from "./models/Category";

interface SeedCategory {
  name: string;
  type: CategoryType;
  isCustom: false;
  createdBy: null;
  userId: null;
}

export const defaultCategories: SeedCategory[] = [
  { name: "Salary", type: "income", isCustom: false, createdBy: null, userId: null },
  { name: "Freelance", type: "income", isCustom: false, createdBy: null, userId: null },
  { name: "Investments", type: "income", isCustom: false, createdBy: null, userId: null },
  { name: "Business", type: "income", isCustom: false, createdBy: null, userId: null },
  { name: "Other Income", type: "income", isCustom: false, createdBy: null, userId: null },
  { name: "Housing & Rent", type: "expense", isCustom: false, createdBy: null, userId: null },
  { name: "Groceries & Food", type: "expense", isCustom: false, createdBy: null, userId: null },
  { name: "Transportation & Gas", type: "expense", isCustom: false, createdBy: null, userId: null },
  { name: "Utilities & Bills", type: "expense", isCustom: false, createdBy: null, userId: null },
  { name: "Entertainment", type: "expense", isCustom: false, createdBy: null, userId: null },
  { name: "Medical & Healthcare", type: "expense", isCustom: false, createdBy: null, userId: null },
  { name: "Shopping & Personal", type: "expense", isCustom: false, createdBy: null, userId: null },
  { name: "Education", type: "expense", isCustom: false, createdBy: null, userId: null },
  { name: "Subscriptions", type: "expense", isCustom: false, createdBy: null, userId: null },
  { name: "Miscellaneous", type: "expense", isCustom: false, createdBy: null, userId: null },
];

export async function seedCategories(): Promise<boolean> {
  try {
    const count = await Category.countDocuments({ isCustom: false });

    if (count === 0) {
      await Category.insertMany(defaultCategories);
    }

    return true;
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    return false;
  }
}
