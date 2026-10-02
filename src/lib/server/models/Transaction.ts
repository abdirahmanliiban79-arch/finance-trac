import mongoose, {
  Schema,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";
import type { CategoryType } from "./Category";

export interface ITransaction {
  user: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  type: CategoryType;
  category: Types.ObjectId;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionModel = Model<ITransaction>;
export type TransactionDocument = HydratedDocument<ITransaction>;

export interface PopulatedCategory {
  _id: Types.ObjectId;
  name: string;
  type: CategoryType;
}

export interface TransactionLean extends Omit<ITransaction, "category"> {
  _id: Types.ObjectId;
  category: PopulatedCategory | null;
}

const transactionSchema = new Schema<ITransaction, TransactionModel>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["income", "expense"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [250, "Description cannot exceed 250 characters"],
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.pre("validate", function () {
  if (this.user && !this.userId) this.userId = this.user;
  if (this.userId && !this.user) this.user = this.userId;
});

export const Transaction: TransactionModel =
  (mongoose.models.Transaction as TransactionModel | undefined) ??
  mongoose.model<ITransaction, TransactionModel>(
    "Transaction",
    transactionSchema,
  );
