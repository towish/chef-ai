"use client";

import Link from "next/link";
import { ChefHat, DollarSign, Heart, Info } from "lucide-react";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:block">ChefAI</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
          >
            <ChefHat className="w-4 h-4" />
            <span className="hidden sm:inline">Recettes</span>
          </Link>
          <Link
            href="/price-hunter"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
          >
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Price Hunter</span>
          </Link>
          <Link
            href="/favorites"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
          >
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Favoris</span>
          </Link>
          <Link
            href="/about"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">À propos</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
