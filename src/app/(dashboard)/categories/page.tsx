"use client";

import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/api/apiClient";
import { toast } from "sonner";
import { Plus, Trash2, Tag, ShieldCheck, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiErrorBody, Category } from "@/types";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("expense");

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const response = await api.get("/categories");
      const raw =
        response.data?.data?.categories ||
        response.data?.categories ||
        response.data ||
        [];
      return Array.isArray(raw) ? (raw as Category[]) : [];
    },
  });

  const createCatMutation = useMutation({
    mutationFn: async (catData: {
      name: string;
      type: string;
    }): Promise<unknown> => {
      const response = await api.post("/categories", catData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Custom category created!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setNewCatName("");
    },
    onError: (error) => {
      const err = error as AxiosError<ApiErrorBody>;
      toast.error(
        err.response?.data?.message || "Failed to create category"
      );
    },
  });

  const deleteCatMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      toast.success("Category deleted!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      const err = error as AxiosError<ApiErrorBody>;
      toast.error(
        err.response?.data?.message || "Cannot delete default categories",
      );
    },
  });

  const handleCreateCategory = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    createCatMutation.mutate({
      name: newCatName.trim(),
      type: newCatType,
    });
  };

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <div className="space-y-6">
        {/* Create Custom Category Form Card */}
        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-sm space-y-4">
          <h3 className="font-mono font-bold text-sm text-[#191c1e] flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" /> Create Custom Category
          </h3>

          <form
            onSubmit={handleCreateCategory}
            className="flex flex-col md:flex-row items-end gap-4"
          >
            <div className="flex-1 space-y-1.5 w-full">
              <Label className="text-xs font-semibold text-[#191c1e]">
                Category Name
              </Label>
              <Input
                type="text"
                placeholder="e.g. Freelance Consulting"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="h-10 text-xs border-[#c6c6cd] rounded"
              />
            </div>

            <div className="w-full md:w-48 space-y-1.5">
              <Label className="text-xs font-semibold text-[#191c1e]">
                Type
              </Label>
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-[#c6c6cd] rounded focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={createCatMutation.isPending}
              className="h-10 bg-black text-white hover:bg-black/90 text-xs font-semibold px-6 rounded w-full md:w-auto"
            >
              {createCatMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add Category"
              )}
            </Button>
          </form>
        </div>

        {/* Categories Grids */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-black w-6 h-6" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Categories */}
            <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#c6c6cd]/20 pb-3">
                <h4 className="font-mono font-bold text-xs text-emerald-600 uppercase tracking-wider">
                  Income Categories ({incomeCategories.length})
                </h4>
              </div>

              <div className="space-y-2">
                {incomeCategories.map((cat) => {
                  const catId = cat._id || cat.id;
                  return (
                    <div
                      key={catId}
                      className="p-3 bg-[#f7f9fb] rounded-lg flex items-center justify-between border border-[#c6c6cd]/20"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-bold text-[#191c1e]">
                          {cat.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {cat.isCustom ? (
                          <>
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full flex items-center gap-1">
                              <User className="w-2.5 h-2.5" /> Custom
                            </span>
                            <button
                              onClick={() => {
                                if (catId) deleteCatMutation.mutate(catId);
                              }}
                              disabled={deleteCatMutation.isPending}
                              className="text-[#ba1a1a] hover:bg-rose-50 p-1 rounded transition-colors"
                              aria-label={`Delete category ${cat.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" /> Default
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expense Categories */}
            <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#c6c6cd]/20 pb-3">
                <h4 className="font-mono font-bold text-xs text-rose-600 uppercase tracking-wider">
                  Expense Categories ({expenseCategories.length})
                </h4>
              </div>

              <div className="space-y-2">
                {expenseCategories.map((cat) => {
                  const catId = cat._id || cat.id;
                  return (
                    <div
                      key={catId}
                      className="p-3 bg-[#f7f9fb] rounded-lg flex items-center justify-between border border-[#c6c6cd]/20"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-xs font-bold text-[#191c1e]">
                          {cat.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {cat.isCustom ? (
                          <>
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-700 rounded-full flex items-center gap-1">
                              <User className="w-2.5 h-2.5" /> Custom
                            </span>
                            <button
                              onClick={() => {
                                if (catId) deleteCatMutation.mutate(catId);
                              }}
                              disabled={deleteCatMutation.isPending}
                              className="text-[#ba1a1a] hover:bg-rose-50 p-1 rounded transition-colors"
                              aria-label={`Delete category ${cat.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" /> Default
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
