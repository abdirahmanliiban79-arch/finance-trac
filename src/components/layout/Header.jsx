import React from "react";
import { Search, Bell, HelpCircle, FileText, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Header = ({ title = "Overview", onSearch, onLogout, onMenuToggle, isMenuOpen = false }) => {
  return (
    <header className="h-16 bg-white border-b border-[#c6c6cd]/40 px-4 md:px-8 flex items-center justify-between shrink-0">
      {/* Hamburger (mobile only) + Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="md:hidden p-1.5 rounded-lg text-[#45464d] hover:bg-[#f7f9fb] transition-colors"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="truncate text-base font-bold font-mono text-[#191c1e] sm:text-lg md:text-xl max-w-[40vw] sm:max-w-none">
          {title}
        </h1>
      </div>

      {/* Action Controls & Search */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Search Input — hidden on mobile */}
        <div className="relative w-40 md:w-64 hidden sm:block">
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
          className="hidden text-xs font-semibold text-[#45464d] hover:text-black border-l border-[#c6c6cd]/40 pl-4 sm:inline"
        >
          Logout
        </button>
      </div>
    </header>
  );
};
