"use client";

import { useState } from "react";
import { Search, TrendingDown, MapPin, Loader2 } from "lucide-react";

interface PriceResult {
  store: string;
  price: number;
  unit: string;
  inStock: boolean;
}

export default function PriceHunterPage() {
  const [ingredient, setIngredient] = useState("");
  const [location, setLocation] = useState("Montreal, QC");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    ingredient: string;
    prices: PriceResult[];
    bestDeal: PriceResult;
  } | null>(null);

  const searchPrices = async () => {
    if (!ingredient.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient, location }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full mb-4">
            <TrendingDown className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Price Hunter</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Compare Grocery Prices</h1>
          <p className="text-neutral-400">Find the best deals near you</p>
        </div>

        {/* Search Form */}
        <div className="bg-neutral-900/50 backdrop-blur border border-white/10 rounded-2xl p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-neutral-400 mb-2">What are you looking for?</label>
              <input
                type="text"
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                placeholder="e.g. chicken breast, milk, eggs..."
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 outline-none focus:border-green-500/50"
                onKeyDown={(e) => e.key === 'Enter' && searchPrices()}
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-neutral-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-green-500/50"
                />
              </div>
            </div>
          </div>
          <button
            onClick={searchPrices}
            disabled={loading || !ingredient.trim()}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Compare Prices
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Best Deal */}
            <div className="bg-gradient-to-r from-green-500/20 to-transparent border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <TrendingDown className="w-5 h-5" />
                <span className="font-bold">Best Deal</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{results.bestDeal.store}</h3>
                  <p className="text-neutral-400">{results.ingredient}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-400">
                    ${results.bestDeal.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-neutral-400">per {results.bestDeal.unit}</div>
                </div>
              </div>
            </div>

            {/* All Prices */}
            <div className="bg-neutral-900/50 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-bold">All Prices</h3>
              </div>
              <div className="divide-y divide-white/5">
                {results.prices.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-4 ${i === 0 ? 'bg-green-500/5' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        i === 0 ? 'bg-green-500 text-white' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-medium">{item.store}</div>
                        {!item.inStock && (
                          <div className="text-xs text-red-400">Out of stock</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">${item.price.toFixed(2)}</div>
                      <div className="text-xs text-neutral-500">per {item.unit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
