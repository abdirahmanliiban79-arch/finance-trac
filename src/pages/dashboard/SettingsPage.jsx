import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/lib/api/store/authStore";
import { User, Shield, Bell, Moon, Database } from "lucide-react";

export const SettingsPage = () => {
  const { user } = useAuthStore();

  return (
    <AppLayout activeRoute="settings" title="Account Settings">
      <div className="space-y-6 max-w-4xl">
        {/* User Profile Card */}
        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xl font-bold font-mono">
              {user?.username ? user.username[0].toUpperCase() : "U"}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191c1e] font-mono">
                {user?.username || "FinTrack User"}
              </h3>
              <p className="text-xs text-[#45464d]">{user?.email || "user@example.com"}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full">
                Role: {user?.role || "user"}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-sm space-y-3">
            <h4 className="font-mono font-bold text-xs text-[#191c1e] uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" /> Security & Privacy
            </h4>
            <p className="text-xs text-[#45464d]">
              Your session is authenticated via standard JWT Bearer Tokens.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
                Status: Encrypted & Secure
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-sm space-y-3">
            <h4 className="font-mono font-bold text-xs text-[#191c1e] uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" /> System & Database
            </h4>
            <p className="text-xs text-[#45464d]">
              Backend Connected to MongoDB with automatic default category seeding enabled.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
                MongoDB Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
