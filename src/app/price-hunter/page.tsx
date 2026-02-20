"use client";

import { useState } from "react";
import { Search, TrendingDown, Loader2, ShoppingCart, Plus, Check } from "lucide-react";

interface PriceItem {
  store: string;
  price: number;
  unit?: string;
}

interface ProductResult {
  category: string;
  item: string;
  prices: PriceItem[];
  bestDeal: PriceItem;
}

export default function PriceHunterPage() {
  const [ingredient, setIngredient] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProductResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [groceryList, setGroceryList] = useState<ProductResult[]>([]);

  // Load categories on mount
  useState(() => {
    fetch('/api/prices?list=categories')
      .then(r => r.json())
      .then(data => {
        if (data.success) setCategories(data.categories);
      });
  });

  const searchPrices = async () => {
    if (!ingredient.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/prices?q=${encodeURIComponent(ingredient)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      } else {
        setError(data.error || "Erreur");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const addToGroceryList = (item: ProductResult) => {
    if (!groceryList.find(i => i.item === item.item)) {
      setGroceryList([...groceryList, item]);
    }
  };

  const isInList = (item: string) => groceryList.find(i => i.item === item);

  const generateGroceryList = () => {
    // Group by store
    const byStore: Record<string, { items: string[]; total: number }> = {};
    
    groceryList.forEach(item => {
      const best = item.bestDeal;
      if (!byStore[best.store]) {
        byStore[best.store] = { items: [], total: 0 };
      }
      byStore[best.store].items.push(item.item);
      byStore[best.store].total += best.price;
    });

    return byStore;
  };

  const groceryByStore = generateGroceryList();

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full mb-4">
            <TrendingDown className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">155+ produits comparés</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Price Hunter Québec</h1>
          <p className="text-neutral-400 text-sm">6 magasins: Walmart, Super C, Maxi, Metro, Provigo, IGA</p>
        </div>

        {/* Search Form */}
        <div className="bg-neutral-900/50 backdrop-blur border border-white/10 rounded-2xl p-4 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              placeholder="Recherche: pommes, lait, boeuf..."
              className="flex-1 bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 outline-none focus:border-green-500/50"
              onKeyDown={(e) => e.key === 'Enter' && searchPrices()}
            />
            <button
              onClick={searchPrices}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-5 rounded-xl transition flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Category buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.slice(0, 6).map(cat => (
              <button
                key={cat.name}
                onClick={() => setIngredient(cat.name)}
                className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full transition"
              >
                {cat.name} ({cat.itemCount})
              </button>
            ))}
          </div>
        </div>

        {/* Grocery List Summary */}
        {groceryList.length > 0 && (
          <div className="bg-gradient-to-r from-green-500/20 to-transparent border border-green-500/30 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-400" />
                <span className="font-bold">Ma liste ({groceryList.length} articles)</span>
              </div>
              <span className="text-green-400 font-bold">
                Total: ${groceryList.reduce((sum, i) => sum + i.bestDeal.price, 0).toFixed(2)}
              </span>
            </div>
            
            <div className="space-y-2">
              {Object.entries(groceryByStore).map(([store, data]) => (
                <div key={store} className="text-sm">
                  <div className="flex justify-between text-neutral-400">
                    <span>{store}: {data.items.length} articles</span>
                    <span>${data.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-center mb-4">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          {results.map((item, i) => (
            <div key={i} className="bg-neutral-900/50 border border-white/10 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-white/10 flex justify-between items-center">
                <div>
                  <span className="text-xs text-neutral-500 uppercase">{item.category}</span>
                  <h3 className="font-bold capitalize">{item.item}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-green-400 font-bold">${item.bestDeal.price.toFixed(2)}</div>
                    <div className="text-xs text-neutral-500">{item.bestDeal.store}</div>
                  </div>
                  <button
                    onClick={() => addToGroceryList(item)}
                    disabled={!!isInList(item.item)}
                    className={`p-2 rounded-lg transition ${
                      isInList(item.item)
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {isInList(item.item) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="p-2">
                {item.prices.slice(0, 4).map((p, j) => (
                  <div key={j} className={`flex justify-between py-1.5 px-2 text-sm ${j === 0 ? 'text-green-400' : 'text-neutral-400'}`}>
                    <span>{p.store}</span>
                    <span>${p.price.toFixed(2)} {p.unit || ''}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
