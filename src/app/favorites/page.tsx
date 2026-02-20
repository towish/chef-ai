"use client";

import { useState } from "react";
import { ChefHat, Heart, Trash2, Clock, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRecipeStorage } from "@/hooks";
import type { Recipe } from "@/app/actions";

export default function FavoritesPage() {
  const { savedRecipes, deleteRecipe, clearAll } = useRecipeStorage();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  if (selectedRecipe) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <button
          onClick={() => setSelectedRecipe(null)}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Favorites
        </button>

        <div className="max-w-2xl mx-auto bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-orange-500 mb-2">
            {selectedRecipe.title}
          </h2>
          
          {selectedRecipe.prepTime && selectedRecipe.cookTime && (
            <div className="flex gap-4 text-xs text-neutral-500 mb-4">
              <span>⏱️ Prep: {selectedRecipe.prepTime}</span>
              <span>🍳 Cook: {selectedRecipe.cookTime}</span>
              {selectedRecipe.servings && <span>👥 {selectedRecipe.servings} servings</span>}
            </div>
          )}

          <div className="h-1 w-16 bg-orange-500/50 rounded-full mb-6" />

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                Ingredients
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedRecipe.ingredients.map((ing: string, i: number) => (
                  <span
                    key={i}
                    className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                Instructions
              </h3>
              <ol className="space-y-4">
                {selectedRecipe.steps.map((step: string, i: number) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs font-bold border border-orange-500/20">
                      {i + 1}
                    </span>
                    <p className="text-neutral-300 text-sm leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {selectedRecipe.tips && selectedRecipe.tips.length > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <h3 className="text-sm font-bold text-orange-400 mb-2">💡 Chef's Tips</h3>
                <ul className="text-sm text-neutral-300 space-y-1">
                  {selectedRecipe.tips.map((tip: string, i: number) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">Chef<span className="text-orange-500">AI</span></span>
        </Link>
        <div className="flex items-center gap-4">
          {savedRecipes.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Delete all saved recipes?")) {
                  clearAll();
                }
              }}
              className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
          <Link href="/" className="text-sm text-white/60 hover:text-white transition">
            ← Kitchen
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-6 h-6 text-red-400" />
          <h1 className="text-2xl font-bold">Saved Recipes</h1>
          <span className="bg-white/10 px-2 py-1 rounded-full text-sm">
            {savedRecipes.length}
          </span>
        </div>

        {savedRecipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40">No saved recipes yet</p>
            <p className="text-white/20 text-sm mt-2">
              Generate recipes and save your favorites!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {savedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe.data)}
                className="bg-neutral-900/50 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-orange-500/30 transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg group-hover:text-orange-400 transition">
                    {recipe.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRecipe(recipe.id);
                    }}
                    className="text-white/20 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-white/40 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(recipe.createdAt).toLocaleDateString()}
                  </span>
                  {recipe.data.servings && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {recipe.data.servings}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {recipe.data.ingredients?.slice(0, 4).map((ing: string, i: number) => (
                    <span
                      key={i}
                      className="bg-white/5 px-2 py-1 rounded text-xs text-white/60"
                    >
                      {ing}
                    </span>
                  ))}
                  {recipe.data.ingredients?.length > 4 && (
                    <span className="text-xs text-white/40">
                      +{recipe.data.ingredients.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
