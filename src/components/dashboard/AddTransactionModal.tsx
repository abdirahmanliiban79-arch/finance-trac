"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/api/apiClient";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import type { ApiErrorBody, Category } from "@/types";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TransactionFormState {
  amount: string;
  type: string;
  category: string;
  description: string;
  date: string;
}

interface NewTransactionPayload {
  amount: number;
  type: string;
  category: string;
  description: string;
  date: string;
}

function getTodayDateInput(): string {
  return new Date().toLocaleDateString("en-CA");
}

export const AddTransactionModal = ({
  isOpen,
  onClose,
}: AddTransactionModalProps) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<TransactionFormState>({
    amount: "",
    type: "expense",
    category: "",
    description: "",
    date: getTodayDateInput(),
  });

  // Fetch categories (Backend-ku wuxuu soo baxaysaa oo kaliya kuwa user-ka u furan)
  const { data: categories = [], isLoading: isCatLoading } = useQuery<
    Category[]
  >({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const response = await api.get("/categories");
      const rawCategories =
        response.data?.data?.categories ||
        response.data?.categories ||
        response.data ||
        [];
      return Array.isArray(rawCategories) ? (rawCategories as Category[]) : [];
    },
    enabled: isOpen,
  });

  const filteredCategories = categories.filter((c) => {
    if (!c.type) return true;
    return c.type.toLowerCase() === formData.type.toLowerCase();
  });

  const handleTypeChange = (newType: string) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: "",
    }));
  };

  const createMutation = useMutation({
    mutationFn: async (
      newTx: NewTransactionPayload
    ): Promise<unknown> => {
      // Backend-ku isaga ayaa req.user._id toos uga dhalinaya Token-ka
      const response = await api.post("/transactions", newTx);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Transaction added successfully!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-summary"] });

      setFormData({
        amount: "",
        type: "expense",
        category: "",
        description: "",
        date: getTodayDateInput(),
      });
      onClose();
    },
    onError: (error) => {
      const err = error as AxiosError<ApiErrorBody>;
      const errorMsg =
        err.response?.data?.message || "Failed to create transaction";
      toast.error(errorMsg);
    },
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category.");
      return;
    }

    createMutation.mutate({
      amount: Number(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description,
      date: formData.date
        ? new Date(`${formData.date}T00:00:00`).toISOString()
        : new Date().toISOString(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold font-mono text-[#191c1e]">
            Add New Transaction
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#f7f9fb] rounded-lg border border-[#c6c6cd]/40">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`py-1.5 text-xs font-bold rounded transition-colors ${
                formData.type === "expense"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-[#45464d] hover:text-black"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`py-1.5 text-xs font-bold rounded transition-colors ${
                formData.type === "income"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-[#45464d] hover:text-black"
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label
              htmlFor="amount"
              className="text-xs font-semibold text-[#191c1e]"
            >
              Amount ($)
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              className="h-10 text-xs border-[#c6c6cd] focus-visible:ring-black rounded"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1">
            <Label
              htmlFor="category"
              className="text-xs font-semibold text-[#191c1e]"
            >
              Category
            </Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isCatLoading}
              className="w-full h-10 px-3 text-xs bg-white border border-[#c6c6cd] rounded focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="">
                {isCatLoading
                  ? "Loading categories..."
                  : filteredCategories.length === 0
                    ? `No ${formData.type} categories found`
                    : `-- Select ${formData.type === "income" ? "Income" : "Expense"} Category --`}
              </option>
              {filteredCategories.map((cat) => (
                <option key={cat._id || cat.id} value={cat._id || cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {filteredCategories.length === 0 && !isCatLoading && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 pt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>No {formData.type} categories available.</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label
              htmlFor="description"
              className="text-xs font-semibold text-[#191c1e]"
            >
              Description (Optional)
            </Label>
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="e.g. Grocery store purchase"
              value={formData.description}
              onChange={handleChange}
              className="h-10 text-xs border-[#c6c6cd] focus-visible:ring-black rounded"
            />
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label
              htmlFor="date"
              className="text-xs font-semibold text-[#191c1e]"
            >
              Date
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="h-10 text-xs border-[#c6c6cd] focus-visible:ring-black rounded"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full h-10 bg-black text-white hover:bg-black/90 text-xs font-semibold rounded mt-2 flex items-center justify-center gap-2"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Transaction"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;
