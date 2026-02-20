"use client";

import { useState } from "react";
import { Search, TrendingDown, Loader2 } from "lucide-react";

interface PriceItem {
  store: string;
  price: number;
}

interface CutData {
  cut: string;
  prices: PriceItem[];
  bestDeal: PriceItem;
}

export default function PriceHunterPage() {
  const [ingredient, setIngredient] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const searchPrices = async () => {
    if (!ingredient.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/prices?ingredient=${encodeURIComponent(ingredient)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.result);
      } else {
        setError(data.error || data.suggestion || "Erreur");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full mb-4">
            <TrendingDown className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Price Hunter Québec</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Compare les prix</h1>
          <p className="text-neutral-400">6 magasins comparés en temps réel</p>
        </div>

        {/* Search Form */}
        <div className="bg-neutral-900/50 backdrop-blur border border-white/10 rounded-2xl p-4 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              placeholder="Ex: boeuf, filet mignon, poulet..."
              className="flex-1 bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 outline-none focus:border-green-500/50"
              onKeyDown={(e) => e.key === 'Enter' && searchPrices()}
            />
            <button
              onClick={searchPrices}
              disabled={loading || !ingredient.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-6 rounded-xl transition flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Essayez: boeuf, porc, poulet, filet mignon, poitrines...
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Results - Category (multiple cuts) */}
        {results?.type === 'category' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Coupes de {results.category}</h2>
            <p className="text-neutral-400 text-sm">{results.message}</p>
            
            {results.cuts.map((cutData: CutData, i: number) => (
              <div key={i} className="bg-neutral-900/50 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                  <h3 className="font-bold capitalize">{cutData.cut}</h3>
                  <div className="text-green-400 font-bold">
                    ${cutData.bestDeal.price.toFixed(2)} @ {cutData.bestDeal.store}
                  </div>
                </div>
                <div className="p-2">
                  {cutData.prices.slice(0, 3).map((p, j) => (
                    <div key={j} className="flex justify-between py-2 px-2 text-sm">
                      <span className="text-neutral-400">{p.store}</span>
                      <span>${p.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results - Specific cut */}
        {results?.type === 'specific' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-500/20 to-transparent border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <TrendingDown className="w-5 h-5" />
                <span className="font-bold">Meilleur deal</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold capitalize">{results.item}</h3>
                  <p className="text-neutral-400">{results.bestDeal.store}</p>
                </div>
                <div className="text-3xl font-bold text-green-400">
                  ${results.bestDeal.price.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-white/10 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-white/10">
                <h3 className="font-bold">Tous les prix</h3>
              </div>
              {results.prices.map((p: PriceItem, i: number) => (
                <div key={i} className={`flex justify-between p-3 ${i === 0 ? 'bg-green-500/10' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-green-500 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                      {i + 1}
                    </span>
                    <span>{p.store}</span>
                  </div>
                  <span className="font-bold">${p.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
