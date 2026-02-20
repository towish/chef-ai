"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("ChefAI Error:", error);
  }, [error]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-2">
          Oops! Something went wrong
        </h2>

        {/* Description */}
        <p className="text-white/60 mb-6">
          The chef had a little accident in the kitchen. Let's try again!
        </p>

        {/* Error message (dev only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 text-left">
            <code className="text-red-300 text-xs break-all">
              {error.message}
            </code>
          </div>
        )}

        {/* Retry button */}
        <button
          onClick={reset}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    </div>
  );
}
