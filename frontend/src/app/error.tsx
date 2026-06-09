"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#111113] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        
        <h2 className="text-2xl font-bold mb-3">Something went wrong!</h2>
        
        <p className="text-white/50 mb-8 text-sm leading-relaxed">
          {error.message || "An unexpected error occurred while rendering this page. Please try again."}
        </p>
        
        <div className="flex gap-4 w-full">
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
          >
            Go Home
          </button>
          
          <button
            onClick={() => reset()}
            className="flex-1 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
