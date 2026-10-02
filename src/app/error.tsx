"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f9fb] p-6 text-center font-sans">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <h1 className="font-mono text-xl font-bold text-[#191c1e]">
          Something went wrong
        </h1>
        <p className="mt-1 text-xs text-[#45464d]">
          {error.message || "An unexpected error occurred."}
        </p>
      </div>
      <Button
        onClick={reset}
        className="h-9 bg-black px-5 text-xs font-semibold text-white hover:bg-black/90"
      >
        Try again
      </Button>
    </div>
  );
}
