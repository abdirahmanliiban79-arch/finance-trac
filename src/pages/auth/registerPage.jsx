import React from "react";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import  RegisterForm  from "../../components/Auth/RegisterForm";

export const RegisterPage = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#f7f9fb] font-sans overflow-hidden">
      <div className="relative z-10 w-full max-w-[440px] px-4 py-8 flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mb-3 shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-[#191c1e]">
            FinTrack Pro
          </h1>
          <p className="text-xs text-[#45464d] mt-1 font-medium">
            Private Wealth Management Portal
          </p>
        </div>

        {/* Register Card */}
        <Card className="w-full bg-white border-[#c6c6cd]/50 shadow-[0_1px_3px_rgba(15,23,42,0.08)] rounded-lg">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold font-mono text-[#191c1e]">
                Create Account
              </h2>
              <p className="text-sm text-[#45464d] mt-1">
                Start managing your wealth portfolio today.
              </p>
            </div>

            {/* Register Form Component */}
            <RegisterForm/>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#45464d] sm:gap-6">
          <a href="#" className="hover:text-black transition-colors">
            Security Statement
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Support
          </a>
        </div>
      </div>
    </div>
  );
};
