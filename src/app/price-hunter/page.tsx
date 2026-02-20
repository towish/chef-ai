"use client";

import { useState } from "react";
import { Search, TrendingDown, Loader2, ShoppingCart, Plus, Check, AlertCircle, Trash2, Download, MapPin } from "lucide-react";

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
  const [showList, setShowList] = useState(false);

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
        setShowList(false);
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

  const removeFromList = (itemName: string) => {
    setGroceryList(groceryList.filter(i => i.item !== itemName));
  };

  const isInList = (item: string) => groceryList.find(i => i.item === item);

  const generateGroceryList = () => {
    const byStore: Record<string, { items: ProductResult[]; total: number }> = {};
    
    groceryList.forEach(item => {
      const best = item.bestDeal;
      if (!byStore[best.store]) {
        byStore[best.store] = { items: [], total: 0 };
      }
      byStore[best.store].items.push(item);
      byStore[best.store].total += best.price;
    });

    return byStore;
  };

  const groceryByStore = generateGroceryList();
  const grandTotal = groceryList.reduce((sum, i) => sum + i.bestDeal.price, 0);

  const exportList = () => {
    let text = "🛒 MA LISTE D'ÉPICERIE\n\n";
    
    Object.entries(groceryByStore).forEach(([store, data]) => {
      text += `📍 ${store.toUpperCase()}\n`;
      data.items.forEach(item => {
        text += `  • ${item.item} - $${item.bestDeal.price.toFixed(2)} ${item.bestDeal.unit || ''}\n`;
      });
      text += `  Sous-total: $${data.total.toFixed(2)}\n\n`;
    });
    
    text += `💰 TOTAL: $${grandTotal.toFixed(2)}\n`;
    text += `\nGénéré par ChefAI Price Hunter`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'liste-epicerie.txt';
    a.click();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full mb-3">
            <TrendingDown className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">300+ produits comparés</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Price Hunter Québec</h1>
          <p className="text-neutral-400 text-sm">Walmart • Super C • Maxi • Metro • Provigo • IGA</p>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-200">
            Prix indicatifs basés sur les circulaire québécoises. Validez en magasin.
          </p>
        </div>

        {/* Grocery List Button */}
        {groceryList.length > 0 && (
          <button
            onClick={() => setShowList(!showList)}
            className="w-full bg-gradient-to-r from-green-500/20 to-transparent border border-green-500/30 rounded-xl p-4 mb-4 flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-400" />
              <span className="font-bold">Ma liste ({groceryList.length})</span>
            </div>
            <span className="text-green-400 font-bold">${grandTotal.toFixed(2)}</span>
          </button>
        )}

        {/* Grocery List Detail */}
        {showList && groceryList.length > 0 && (
          <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-4 mb-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">🛒 Liste par magasin</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportList}
                  className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1.5 rounded-lg"
                >
                  <Download className="w-4 h-4" /> Exporter
                </button>
                <button
                  onClick={() => setGroceryList([])}
                  className="flex items-center gap-1 text-sm bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" /> Vider
                </button>
              </div>
            </div>

            {Object.entries(groceryByStore).map(([store, data]) => (
              <div key={store} className="border border-white/10 rounded-xl overflow-hidden">
                <div className="bg-white/5 p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="font-bold">{store}</span>
                    <span className="text-xs text-neutral-400">({data.items.length} articles)</span>
                  </div>
                  <span className="text-green-400 font-bold">${data.total.toFixed(2)}</span>
                </div>
                <div className="p-2 space-y-1">
                  {data.items.map(item => (
                    <div key={item.item} className="flex justify-between py-1.5 px-2 text-sm">
                      <span className="flex-1">{item.item}</span>
                      <span className="text-neutral-400">${item.bestDeal.price.toFixed(2)} {item.bestDeal.unit || ''}</span>
                      <button
                        onClick={() => removeFromList(item.item)}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">${grandTotal.toFixed(2)}</div>
              <div className="text-sm text-neutral-400">Total estimé</div>
            </div>
          </div>
        )}

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
            {categories.slice(0, 9).map(cat => (
              <button
                key={cat.name}
                onClick={() => { setIngredient(cat.name); searchPrices(); }}
                className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition capitalize"
              >
                {cat.name} ({cat.itemCount})
              </button>
            ))}
          </div>
        </div>

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
                    <div className="text-green-400 font-bold">
                      ${item.bestDeal.price.toFixed(2)} {item.bestDeal.unit || ''}
                    </div>
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
                {item.prices.map((p, j) => (
                  <div key={j} className={`flex justify-between py-1.5 px-2 text-sm ${p.store === item.bestDeal.store ? 'text-green-400 font-medium' : 'text-neutral-400'}`}>
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
