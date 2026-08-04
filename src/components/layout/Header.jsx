import React from "react";
import { Search, Bell, HelpCircle, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Header = ({ title = "Overview", onSearch, onLogout }) => {
  return (
    <header className="h-16 bg-white border-b border-[#c6c6cd]/40 px-8 flex items-center justify-between shrink-0">
      {/* Page Title */}
      <h1 className="text-xl font-bold font-mono text-[#191c1e]">{title}</h1>

      {/* Action Controls & Search */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#45464d]" />
          <Input
            type="text"
            placeholder="Search data..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="h-9 pl-9 text-xs border-[#c6c6cd] bg-[#f7f9fb] focus-visible:ring-black rounded"
          />
        </div>

        {/* Icon Action Buttons */}
        <div className="flex items-center gap-1 border-l border-[#c6c6cd]/40 pl-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-[#45464d] hover:text-black"
          >
            <Bell className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-[#45464d] hover:text-black"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-[#45464d] hover:text-black"
          >
            <FileText className="w-4 h-4" />
          </Button>
        </div>

        {/* Logout Quick Link */}
        <button
          onClick={onLogout}
          className="text-xs font-semibold text-[#45464d] hover:text-black border-l border-[#c6c6cd]/40 pl-4"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
