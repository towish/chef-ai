"use client";

import { useState } from "react";
import { generateRecipe, Recipe } from "./actions";
import { ChefHat, Image as ImageIcon, List, Type, Loader2, Sparkles } from "lucide-react";

export default function Home() {
  const [mode, setMode] = useState<"text" | "ingredients" | "image">("text");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecipe(null);

    const formData = new FormData(e.currentTarget);
    formData.append("type", mode);

    const result = await generateRecipe(formData);

    if (result.success && result.data) {
      setRecipe(result.data);
    } else {
      setError(result.error || "Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-3 border-b pb-6 border-gray-200">
          <div className="p-3 bg-orange-500 rounded-xl shadow-lg shadow-orange-200">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">ChefAI</h1>
            <p className="text-gray-500">Your AI-powered culinary assistant</p>
          </div>
        </header>

        {/* Input Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 transition-all">
          
          {/* Mode Switcher */}
          <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setMode("text")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "text" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Type className="w-4 h-4" />
              Request
            </button>
            <button
              type="button"
              onClick={() => setMode("ingredients")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "ingredients" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="w-4 h-4" />
              Ingredients
            </button>
            <button
              type="button"
              onClick={() => setMode("image")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "image" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Photo
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {mode === "text" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">What are you craving?</label>
                <textarea
                  name="content"
                  placeholder="e.g. A spicy pasta dish with shrimp and lemon..."
                  className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-y"
                  required
                />
              </div>
            )}

            {mode === "ingredients" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">List your ingredients</label>
                <textarea
                  name="content"
                  placeholder="e.g. Chicken breast, broccoli, soy sauce, rice..."
                  className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-y"
                  required
                />
              </div>
            )}

            {mode === "image" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Upload a photo of your fridge or ingredients</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-orange-500 transition-colors">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-sm font-medium">Click or drag to upload image</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-orange-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating magic...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Recipe
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
        </section>

        {/* Results */}
        {recipe && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 overflow-hidden border border-gray-100">
              <div className="bg-orange-600 p-6 md:p-8 text-white">
                <h2 className="text-3xl font-bold font-serif">{recipe.title}</h2>
              </div>
              
              <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
                
                {/* Left Column: Ingredients */}
                <div className="md:col-span-1 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                      Ingredients
                    </h3>
                    <ul className="space-y-3 text-gray-600 text-sm leading-relaxed">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-orange-400 mt-1.5">•</span>
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {recipe.tips && recipe.tips.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                      <h4 className="font-bold text-yellow-800 text-sm mb-2">Chef's Tips</h4>
                      <ul className="space-y-2 text-yellow-700 text-xs">
                         {recipe.tips.map((tip, i) => (
                           <li key={i}>• {tip}</li>
                         ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right Column: Steps */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                    Instructions
                  </h3>
                  <div className="space-y-6">
                    {recipe.steps.map((step, i) => (
                      <div key={i} className="flex gap-4 group">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-sm group-hover:bg-orange-600 group-hover:text-white transition-colors">
                          {i + 1}
                        </span>
                        <p className="text-gray-600 leading-relaxed mt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
