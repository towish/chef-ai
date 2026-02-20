import { ChefHat, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ChefHat className="w-10 h-10 text-orange-400" />
        </div>

        {/* 404 */}
        <div className="text-6xl font-bold text-orange-500 mb-2">404</div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-2">
          Recipe Not Found
        </h2>

        {/* Description */}
        <p className="text-white/60 mb-6">
          Looks like this dish hasn't been invented yet. 
          Let's get you back to the kitchen!
        </p>

        {/* Home button */}
        <Link
          href="/"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          Back to Kitchen
        </Link>
      </div>
    </div>
  );
}
