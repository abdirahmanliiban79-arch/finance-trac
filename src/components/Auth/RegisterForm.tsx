"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/api/apiClient";
import { toast } from "sonner";
import type { ApiErrorBody, AuthResponse } from "@/types";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createMutation = useMutation({
    mutationFn: async (userData: RegisterFormData): Promise<AuthResponse> => {
      const response = await api.post("/auth/register", {
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Registration successful! Please login.");
      router.replace("/login");
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      const err = error as AxiosError<ApiErrorBody>;
      const errorMsg =
        err.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMsg);
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      toast.error("Please fill in all the required fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    createMutation.mutate(formData);
  };

  const onNavigateToLogin = () => {
    router.push("/login");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div className="space-y-1.5">
        <Label
          htmlFor="username"
          className="text-xs font-semibold text-[#191c1e]"
        >
          Full Name
        </Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="John Doe"
          value={formData.username}
          onChange={handleChange}
          className="h-10 border-[#c6c6cd] focus-visible:ring-black focus-visible:ring-1 rounded"
        />
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="text-xs font-semibold text-[#191c1e]"
        >
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="example@company.com"
          value={formData.email}
          onChange={handleChange}
          className="h-10 border-[#c6c6cd] focus-visible:ring-black focus-visible:ring-1 rounded"
        />
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <Label
          htmlFor="password"
          className="text-xs font-semibold text-[#191c1e]"
        >
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="h-10 border-[#c6c6cd] focus-visible:ring-black focus-visible:ring-1 rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45464d] hover:text-black"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label
          htmlFor="confirmPassword"
          className="text-xs font-semibold text-[#191c1e]"
        >
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="h-10 border-[#c6c6cd] focus-visible:ring-black focus-visible:ring-1 rounded"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full h-10 bg-black text-white hover:bg-black/90 font-medium rounded text-sm flex items-center justify-center gap-2 mt-2"
      >
        {createMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Registering...
          </>
        ) : (
          <>
            Register <UserPlus className="w-4 h-4" />
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#c6c6cd]/40" />
        </div>
      </div>

      {/* Back to Login Trigger */}
      <div className="text-center space-y-3">
        <p className="text-xs text-[#45464d]">Already have an account?</p>
        <Button
          type="button"
          variant="outline"
          className="w-full h-10 border-[#c6c6cd] text-[#191c1e] hover:bg-[#f2f4f6] font-semibold text-xs rounded"
          onClick={onNavigateToLogin}
        >
          Sign In
        </Button>
      </div>
    </form>
  );
};

export default RegisterForm;
