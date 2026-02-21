import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════
// Price Hunter API — VERSION FINALE
// ═══════════════════════════════════════════════════════════

function makePrices(basePrice: number, unit?: string) {
  const stores = ['Walmart', 'Super C', 'Maxi', 'Metro', 'Provigo', 'IGA'];
  const multipliers = [1.00, 1.02, 1.04, 1.10, 1.15, 1.22];
  return stores.map((store, i) => ({
    store,
    price: parseFloat((basePrice * multipliers[i]).toFixed(2)),
    unit,
  }));
}

const PRODUCTS = {
  viandes: {
    'boeuf haché maigre': makePrices(12.99, 'kg'),
    'boeuf haché mi-maigre': makePrices(10.99, 'kg'),
    'boeuf haché régulier': makePrices(8.99, 'kg'),
    'steak haché': makePrices(11.99, 'kg'),
    'boulettes de boeuf': makePrices(9.99, 'kg'),
    'haut de surlonge': makePrices(17.99, 'kg'),
    'bifteck surlonge': makePrices(22.99, 'kg'),
    'rôti de boeuf': makePrices(15.99, 'kg'),
    'ribs de boeuf': makePrices(18.99, 'kg'),
    'filet de porc': makePrices(10.99, 'kg'),
    'côtelettes de porc': makePrices(7.99, 'kg'),
    'épaule de porc': makePrices(5.99, 'kg'),
    'travers de porc': makePrices(7.49, 'kg'),
    'bacon': makePrices(7.99, '375g'),
    'poulet entier': makePrices(2.99, 'lb'),
    'poitrines de poulet': makePrices(11.99, 'kg'),
    'cuisses de poulet': makePrices(5.99, 'kg'),
    'ailes de poulet': makePrices(8.99, 'kg'),
    'escalopes de poulet': makePrices(13.99, 'kg'),
    'dinde entière': makePrices(2.49, 'lb'),
    'saumon frais': makePrices(14.99, 'kg'),
    'tilapia': makePrices(12.99, 'kg'),
    'morue': makePrices(15.99, 'kg'),
    'crevettes': makePrices(12.99, 'kg'),
  },
  fruits: {
    'pommes': makePrices(1.99, 'lb'),
    'bananes': makePrices(0.69, 'lb'),
    'oranges': makePrices(1.79, 'lb'),
    'citrons': makePrices(0.99, 'unité'),
    'limes': makePrices(0.79, 'unité'),
    'fraises': makePrices(4.99, '454g'),
    'bleuets': makePrices(5.99, '340g'),
    'framboises': makePrices(5.99, '340g'),
    'mangues': makePrices(1.49, 'unité'),
    'avocats': makePrices(1.29, 'unité'),
    'ananas': makePrices(3.99, 'unité'),
    'raisins': makePrices(3.49, 'lb'),
    'poires': makePrices(2.29, 'lb'),
    'pêches': makePrices(2.99, 'lb'),
    'kiwis': makePrices(0.69, 'unité'),
  },
  legumes: {
    'carottes': makePrices(1.99, '2lb'),
    'brocoli': makePrices(2.49, 'unité'),
    'chou-fleur': makePrices(3.99, 'unité'),
    'épinards': makePrices(3.49, '225g'),
    'laitue romaine': makePrices(2.49, 'unité'),
    'tomates': makePrices(2.49, 'lb'),
    'tomates cerises': makePrices(3.99, '227g'),
    'concombres': makePrices(1.29, 'unité'),
    'poivrons verts': makePrices(1.49, 'unité'),
    'oignons jaunes': makePrices(1.49, '3lb'),
    'ail': makePrices(0.99, 'tête'),
    'céleri': makePrices(2.99, 'unité'),
    'champignons': makePrices(2.99, '227g'),
    'courgettes': makePrices(2.49, 'lb'),
    'pommes de terre': makePrices(4.99, '10lb'),
    'maïs en épi': makePrices(0.99, 'unité'),
    'asperges': makePrices(4.99, 'lb'),
    'haricots verts': makePrices(3.49, 'lb'),
    'patates douces': makePrices(1.99, 'lb'),
    'betteraves': makePrices(2.49, 'lb'),
  },
  laitiers: {
    'lait 2%': makePrices(5.99, '4L'),
    'lait 1%': makePrices(5.99, '4L'),
    'lait entier': makePrices(6.49, '4L'),
    'beurre salé': makePrices(6.99, '454g'),
    'fromage cheddar': makePrices(8.99, '400g'),
    'fromage mozzarella': makePrices(7.99, '400g'),
    'fromage râpé': makePrices(6.99, '320g'),
    'crème sure': makePrices(3.49, '500ml'),
    'yogourt nature': makePrices(5.99, '750g'),
    'yogourt grec': makePrices(6.99, '500g'),
    'oeufs': makePrices(5.99, '12'),
    'lait amande': makePrices(4.99, '1.89L'),
    'lait soya': makePrices(4.79, '1.89L'),
  },
  epicerie: {
    'riz blanc': makePrices(5.99, '2kg'),
    'riz brun': makePrices(6.99, '2kg'),
    'pâtes spaghetti': makePrices(2.49, '900g'),
    'pâtes penne': makePrices(2.79, '900g'),
    'farine': makePrices(5.99, '2.5kg'),
    'sucre': makePrices(3.99, '2kg'),
    'miel': makePrices(8.99, '500g'),
    'sirop érable': makePrices(12.99, '540ml'),
    'huile canola': makePrices(6.99, '1L'),
    'huile olive': makePrices(11.99, '1L'),
    'ketchup': makePrices(4.99, '1L'),
    'moutarde': makePrices(2.99, '400g'),
    'mayonnaise': makePrices(5.99, '890ml'),
    'sel': makePrices(2.49, '1kg'),
    'poivre': makePrices(5.99, '100g'),
    'bouillon poulet': makePrices(4.99, '6 cubes'),
    'tomates conserve': makePrices(1.99, '796ml'),
    'haricots rouges': makePrices(1.49, '540ml'),
    'maïs conserve': makePrices(1.29, '341ml'),
    'thon conserve': makePrices(3.49, '170g'),
    'pain tranché': makePrices(3.49, '675g'),
    'bagels': makePrices(3.99, '6 unités'),
    'tortillas': makePrices(3.99, '10 unités'),
    'avoine': makePrices(5.99, '1kg'),
    'céréales': makePrices(5.99, '525g'),
    'café': makePrices(11.99, '907g'),
    'thé': makePrices(4.99, '72 sachets'),
    'croustilles': makePrices(4.99, '255g'),
    'biscuits': makePrices(4.99, '400g'),
    'noix': makePrices(9.99, '400g'),
  },
  surgeles: {
    'pizza pepperoni': makePrices(6.99, 'unité'),
    'pizza fromage': makePrices(6.49, 'unité'),
    'légumes surgelés': makePrices(3.99, '1kg'),
    'frites': makePrices(4.99, '1kg'),
    'nuggets poulet': makePrices(8.99, '800g'),
    'poisson pané': makePrices(9.99, '500g'),
    'crème glacée vanille': makePrices(6.99, '2L'),
  },
  boissons: {
    'eau embouteillée': makePrices(3.99, '24x500ml'),
    'jus orange': makePrices(5.99, '1.89L'),
    'jus pomme': makePrices(4.99, '1.89L'),
    'cola': makePrices(3.99, '2L'),
    'thé glacé': makePrices(2.99, '1.89L'),
  },
  hygiene: {
    'savon vaisselle': makePrices(3.49, '739ml'),
    'détergent lessive': makePrices(12.99, '4.43L'),
    'assouplissant': makePrices(8.99, '3.45L'),
    'nettoyant maison': makePrices(4.99, '1L'),
    'papier toilette': makePrices(12.99, '24 rouleaux'),
    'essuie-tout': makePrices(8.99, '6 rouleaux'),
    'sacs poubelle': makePrices(6.99, '30 sacs'),
  },
};

const CATEGORY_MAP: Record<string, string> = {
  'viande': 'viandes', 'viandes': 'viandes',
  'boeuf': 'viandes', 'porc': 'viandes', 'poulet': 'viandes', 'poisson': 'viandes',
  'fruit': 'fruits', 'fruits': 'fruits',
  'legume': 'legumes', 'legumes': 'legumes',
  'laitier': 'laitiers', 'laitiers': 'laitiers', 'lait': 'laitiers', 'fromage': 'laitiers',
  'epicerie': 'epicerie',
  'surgele': 'surgeles', 'surgeles': 'surgeles',
  'boisson': 'boissons', 'boissons': 'boissons',
  'hygiene': 'hygiene',
};

function searchProducts(query: string) {
  const normalized = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const results: any[] = [];
  
  // Check category
  for (const [alias, category] of Object.entries(CATEGORY_MAP)) {
    if (normalized === alias || normalized.includes(alias)) {
      const catProducts = PRODUCTS[category as keyof typeof PRODUCTS];
      if (catProducts) {
        for (const [item, prices] of Object.entries(catProducts)) {
          const sorted = [...prices].sort((a, b) => a.price - b.price);
          results.push({ category, item, prices: sorted, bestDeal: sorted[0] });
        }
        return results;
      }
    }
  }
  
  // Search items
  for (const [category, items] of Object.entries(PRODUCTS)) {
    for (const [item, prices] of Object.entries(items)) {
      const normalizedItem = item.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      if (normalizedItem.includes(normalized) || normalized.includes(normalizedItem.split(' ')[0])) {
        const sorted = [...prices].sort((a, b) => a.price - b.price);
        results.push({ category, item, prices: sorted, bestDeal: sorted[0] });
      }
    }
  }
  
  return results;
}

function listCategories() {
  return Object.keys(PRODUCTS).map(name => ({
    name,
    itemCount: Object.keys(PRODUCTS[name as keyof typeof PRODUCTS]).length,
  }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const list = searchParams.get('list');
  
  if (list === 'categories') {
    return NextResponse.json({ success: true, categories: listCategories(), totalProducts: Object.values(PRODUCTS).reduce((s, c) => s + Object.keys(c).length, 0) });
  }
  
  if (q) {
    const results = searchProducts(q);
    if (results.length === 0) {
      return NextResponse.json({ success: false, error: 'Non trouvé', suggestion: 'viandes, fruits, legumes, laitiers, epicerie, surgeles, boissons, hygiene' });
    }
    return NextResponse.json({ success: true, query: q, results, count: results.length });
  }
  
  return NextResponse.json({ success: true, categories: Object.keys(PRODUCTS), totalProducts: Object.values(PRODUCTS).reduce((s, c) => s + Object.keys(c).length, 0) });
}
