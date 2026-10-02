"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/api/apiClient";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/api/store/authStore";
import type { ApiErrorBody, AuthResponse } from "@/types";

interface LoginCredentials {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loginMutation = useMutation({
    mutationFn: async (userData: LoginCredentials): Promise<AuthResponse> => {
      const response = await api.post("/auth/login", userData);
      return response.data;
    },
    onSuccess: (data: AuthResponse) => {
      const userData = data.user || data?.data?.user;
      const token = data.token || data?.data?.token;
      if (userData && token) {
        setAuth(userData, token);
        toast.success("Login successful!");
        router.replace("/dashboard");
        setFormData({
          email: "",
          password: "",
        });
      } else {
        toast.error("Invalid response format from server.");
      }
    },
    onError: (error) => {
      const err = error as AxiosError<ApiErrorBody>;
      const msg =
        err.response?.data?.message ||
        "Email or password is wrong. Please try again.";
      toast.error(msg);
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    loginMutation.mutate(formData);
  };

  const onNavigateToRegister = () => {
    router.push("/register");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-semibold text-[#191c1e]">
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
        <div className="flex items-center justify-between">
          <Label
            htmlFor="password"
            className="text-xs font-semibold text-[#191c1e]"
          >
            Password
          </Label>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
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

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full h-10 bg-black text-white hover:bg-black/90 font-medium rounded text-sm flex items-center justify-center gap-2 mt-2"
      >
        {loginMutation.isPending ? (
          "Logging in..."
        ) : (
          <>
            Login <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#c6c6cd]/40" />
        </div>
      </div>

      {/* Create Account Trigger */}
      <div className="text-center space-y-3">
        <p className="text-xs text-[#45464d]">Don&apos;t have an account?</p>
        <Button
          onClick={onNavigateToRegister}
          type="button"
          variant="outline"
          className="w-full h-10 border-[#c6c6cd] text-[#191c1e] hover:bg-[#f2f4f6] font-semibold text-xs rounded"
        >
          Create an account
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
