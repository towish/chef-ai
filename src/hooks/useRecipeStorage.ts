"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "chefai_recipes";

interface SavedRecipe {
  id: string;
  title: string;
  createdAt: string;
  data: any;
}

export function useRecipeStorage() {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedRecipes(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recipes:", e);
    }
  }, []);

  // Save recipe
  const saveRecipe = (recipe: any): SavedRecipe => {
    const saved: SavedRecipe = {
      id: Date.now().toString(),
      title: recipe.title,
      createdAt: new Date().toISOString(),
      data: recipe,
    };
    
    const updated = [saved, ...savedRecipes].slice(0, 50); // Keep last 50
    setSavedRecipes(updated);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save recipe:", e);
    }
    
    return saved;
  };

  // Delete recipe
  const deleteRecipe = (id: string) => {
    const updated = savedRecipes.filter(r => r.id !== id);
    setSavedRecipes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Clear all
  const clearAll = () => {
    setSavedRecipes([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    savedRecipes,
    saveRecipe,
    deleteRecipe,
    clearAll,
  };
}
