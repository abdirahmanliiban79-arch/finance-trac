import mongoose, {
  Schema,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";

export type CategoryType = "income" | "expense";

export interface ICategory {
  name: string;
  type: CategoryType;
  isCustom: boolean;
  createdBy: Types.ObjectId | null;
  userId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryModel = Model<ICategory>;
export type CategoryDocument = HydratedDocument<ICategory>;

export interface CategoryLean extends ICategory {
  _id: Types.ObjectId;
}

const categorySchema = new Schema<ICategory, CategoryModel>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["income", "expense"],
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.pre("save", function () {
  if (this.isCustom) {
    if (!this.userId && this.createdBy) this.userId = this.createdBy;
    if (!this.createdBy && this.userId) this.createdBy = this.userId;
  } else {
    this.userId = null;
    this.createdBy = null;
  }
});

categorySchema.index({ name: 1, createdBy: 1 }, { unique: true });
categorySchema.index({ name: 1, userId: 1 });

export const Category: CategoryModel =
  (mongoose.models.Category as CategoryModel | undefined) ??
  mongoose.model<ICategory, CategoryModel>("Category", categorySchema);
