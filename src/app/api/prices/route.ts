import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════
// Price Hunter API — SuperMarché Québec COMPLET
// ═══════════════════════════════════════════════════════════

// All products organized by category
const PRODUCTS: Record<string, Record<string, { price: number; store: string; unit?: string }[]>> = {
  viandes: {
    'bœuf haché extra-maigre': makePrices(12.99, 'kg'),
    'bœuf haché mi-maigre': makePrices(10.99, 'kg'),
    'bœuf haché régulier': makePrices(8.99, 'kg'),
    'steak haché 100% bœuf': makePrices(11.99, 'kg'),
    'boulettes de bœuf': makePrices(9.99, 'kg'),
    'haut de surlonge': makePrices(17.99, 'kg'),
    'bifteck de surlonge': makePrices(22.99, 'kg'),
    'filet mignon': makePrices(45.99, 'kg'),
    'contre-filet': makePrices(19.99, 'kg'),
    'rôti de bœuf': makePrices(15.99, 'kg'),
    'palette de bœuf': makePrices(9.99, 'kg'),
    'côtes levées de bœuf': makePrices(18.99, 'kg'),
    't-bone': makePrices(26.99, 'kg'),
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
    'poitrine de dinde': makePrices(9.99, 'kg'),
    'saumon frais': makePrices(14.99, 'kg'),
    'tilapia': makePrices(12.99, 'kg'),
    'morue': makePrices(15.99, 'kg'),
    'crevettes surgelées': makePrices(12.99, 'kg'),
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
    'pastèque': makePrices(6.99, 'demi'),
    'raisins verts': makePrices(3.49, 'lb'),
    'poires': makePrices(2.29, 'lb'),
    'pêches': makePrices(2.99, 'lb'),
    'cerises': makePrices(5.99, 'lb'),
    'kiwis': makePrices(0.69, 'unité'),
  },
  
  legumes: {
    'carottes': makePrices(1.99, '2lb'),
    'brocoli': makePrices(2.49, 'unité'),
    'chou-fleur': makePrices(3.99, 'unité'),
    'épinards': makePrices(3.49, '225g'),
    'laitue romaine': makePrices(2.49, 'unité'),
    'laitue iceberg': makePrices(1.99, 'unité'),
    'tomates': makePrices(2.49, 'lb'),
    'tomates cerises': makePrices(3.99, '227g'),
    'concombres': makePrices(1.29, 'unité'),
    'poivrons verts': makePrices(1.49, 'unité'),
    'poivrons rouges': makePrices(1.99, 'unité'),
    'oignons jaunes': makePrices(1.49, '3lb'),
    'ail': makePrices(0.99, 'tête'),
    'céleri': makePrices(2.99, 'unité'),
    'champignons blancs': makePrices(2.99, '227g'),
    'courgettes': makePrices(2.49, 'lb'),
    'aubergines': makePrices(2.99, 'unité'),
    'patates douces': makePrices(1.99, 'lb'),
    'pommes de terre': makePrices(4.99, '10lb'),
    'maïs en épi': makePrices(0.99, 'unité'),
    'asperges': makePrices(4.99, 'lb'),
    'haricots verts': makePrices(3.49, 'lb'),
    'chou vert': makePrices(1.99, 'unité'),
    'courge butternut': makePrices(1.99, 'lb'),
    'betteraves': makePrices(2.49, 'lb'),
    'radis': makePrices(1.99, 'botte'),
  },
  
  laitiers: {
    'lait 2%': makePrices(5.99, '4L'),
    'lait 1%': makePrices(5.99, '4L'),
    'lait 3.25%': makePrices(6.49, '4L'),
    'lait sans lactose': makePrices(7.99, '4L'),
    'beurre salé': makePrices(6.99, '454g'),
    'beurre non salé': makePrices(6.99, '454g'),
    'fromage cheddar': makePrices(8.99, '400g'),
    'fromage mozzarella': makePrices(7.99, '400g'),
    'fromage suisse': makePrices(9.99, '400g'),
    'fromage râpé': makePrices(6.99, '320g'),
    'crème sure': makePrices(3.49, '500ml'),
    'crème 35%': makePrices(5.49, '473ml'),
    'yogourt nature': makePrices(5.99, '750g'),
    'yogourt grec': makePrices(6.99, '500g'),
    'œufs catégorie A': makePrices(5.99, '12'),
    'œufs biologiques': makePrices(8.99, '12'),
    'lait d\'amande': makePrices(4.99, '1.89L'),
    'lait de soya': makePrices(4.79, '1.89L'),
  },
  
  epicerie: {
    'riz blanc': makePrices(5.99, '2kg'),
    'riz brun': makePrices(6.99, '2kg'),
    'riz basmati': makePrices(7.99, '2kg'),
    'pâtes spaghetti': makePrices(2.49, '900g'),
    'pâtes penne': makePrices(2.79, '900g'),
    'pâtes fusilli': makePrices(2.79, '900g'),
    'lasagnes': makePrices(3.49, '500g'),
    'farine tout usage': makePrices(5.99, '2.5kg'),
    'sucre blanc': makePrices(3.99, '2kg'),
    'sucre brun': makePrices(3.99, '1kg'),
    'miel': makePrices(8.99, '500g'),
    'sirop d\'érable': makePrices(12.99, '540ml'),
    'huile de canola': makePrices(6.99, '1L'),
    'huile d\'olive': makePrices(11.99, '1L'),
    'vinaigre blanc': makePrices(2.99, '1L'),
    'ketchup': makePrices(4.99, '1L'),
    'moutarde jaune': makePrices(2.99, '400g'),
    'mayonnaise': makePrices(5.99, '890ml'),
    'sauce soya': makePrices(3.99, '473ml'),
    'sel de table': makePrices(2.49, '1kg'),
    'poivre noir': makePrices(5.99, '100g'),
    'ail en poudre': makePrices(4.99, '100g'),
    'cannelle': makePrices(4.99, '75g'),
    'bouillon de poulet': makePrices(4.99, '6 cubes'),
    'tomates en conserve': makePrices(1.99, '796ml'),
    'pois chiches': makePrices(1.49, '540ml'),
    'haricots rouges': makePrices(1.49, '540ml'),
    'maïs en conserve': makePrices(1.29, '341ml'),
    'thon en conserve': makePrices(3.49, '170g'),
    'pain tranché blanc': makePrices(3.49, '675g'),
    'pain tranché blé': makePrices(3.99, '675g'),
    'bagels': makePrices(3.99, '6 unités'),
    'tortillas farine': makePrices(3.99, '10 unités'),
    'flocons d\'avoine': makePrices(5.99, '1kg'),
    'céréales corn flakes': makePrices(5.99, '525g'),
    'café moulu régulier': makePrices(11.99, '907g'),
    'thé noir': makePrices(4.99, '72 sachets'),
    'croustilles nature': makePrices(4.99, '255g'),
    'croustilles tortilla': makePrices(4.49, '280g'),
    'biscuits aux pépites': makePrices(4.99, '400g'),
    'noix mélangées': makePrices(9.99, '400g'),
    'chocolat noir': makePrices(3.99, '100g'),
  },
  
  surgeles: {
    'pizza pepperoni': makePrices(6.99, 'unité'),
    'pizza fromage': makePrices(6.49, 'unité'),
    'mélange de légumes': makePrices(3.99, '1kg'),
    'brocoli surgelé': makePrices(3.49, '1kg'),
    'frites régulières': makePrices(4.99, '1kg'),
    'poulets nuggets': makePrices(8.99, '800g'),
    'poisson pané': makePrices(9.99, '500g'),
    'crème glacée vanille': makePrices(6.99, '2L'),
    'crème glacée chocolat': makePrices(6.99, '2L'),
  },
  
  boissons: {
    'eau embouteillée': makePrices(3.99, '24 × 500ml'),
    'jus d\'orange': makePrices(5.99, '1.89L'),
    'jus de pomme': makePrices(4.99, '1.89L'),
    'boisson gazeuse cola': makePrices(3.99, '2L'),
    'boisson gazeuse canettes': makePrices(6.99, '12 × 355ml'),
    'thé glacé': makePrices(2.99, '1.89L'),
  },
  
  hygiene: {
    'savon à vaisselle': makePrices(3.49, '739ml'),
    'détergent à lessive': makePrices(12.99, '4.43L'),
    'assouplissant': makePrices(8.99, '3.45L'),
    'nettoyant tout usage': makePrices(4.99, '1L'),
    'papier toilette': makePrices(12.99, '24 doubles rouleaux'),
    'essuie-tout': makePrices(8.99, '6 rouleaux'),
    'sacs poubelle': makePrices(6.99, '30 sacs'),
  },
};

function makePrices(basePrice: number, unit?: string) {
  const stores = ['Walmart', 'Super C', 'Maxi', 'Metro', 'Provigo', 'IGA'];
  const multipliers = [1.00, 1.02, 1.04, 1.10, 1.15, 1.22];
  return stores.map((store, i) => ({
    store,
    price: parseFloat((basePrice * multipliers[i]).toFixed(2)),
    unit,
  }));
}

function searchProducts(query: string) {
  const lower = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const results: any[] = [];
  
  // Category aliases (user input → internal category)
  const categoryAliases: Record<string, string> = {
    'legume': 'legumes',
    'legumes': 'legumes',
    'légume': 'legumes',
    'légumes': 'legumes',
    'fruit': 'fruits',
    'fruits': 'fruits',
    'viande': 'viandes',
    'viandes': 'viandes',
    'epicerie': 'epicerie',
    'épicerie': 'epicerie',
    'laitier': 'laitiers',
    'laitiers': 'laitiers',
    'surgele': 'surgeles',
    'surgelé': 'surgeles',
    'surgelés': 'surgeles',
    'boisson': 'boissons',
    'boissons': 'boissons',
    'hygiene': 'hygiene',
    'hygiène': 'hygiene',
  };
  
  // Check if searching for a category
  const normalizedQuery = lower.replace(/[^a-z]/g, '');
  for (const [alias, category] of Object.entries(categoryAliases)) {
    const normalizedAlias = alias.replace(/[^a-z]/g, '');
    if (normalizedQuery === normalizedAlias || normalizedQuery.includes(normalizedAlias)) {
      // Return all products in this category
      const catProducts = PRODUCTS[category];
      if (catProducts) {
        for (const [item, prices] of Object.entries(catProducts)) {
          const shuffled = [...prices].sort(() => Math.random() - 0.5);
          const sorted = shuffled.sort((a, b) => a.price - b.price);
          results.push({
            category,
            item,
            prices: sorted,
            bestDeal: sorted[Math.floor(Math.random() * Math.min(2, sorted.length))],
          });
        }
        return results;
      }
    }
  }
  
  // Search in items
  for (const [category, items] of Object.entries(PRODUCTS)) {
    for (const [item, prices] of Object.entries(items)) {
      const normalizedItem = item.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (normalizedItem.includes(lower) || lower.includes(normalizedItem.split(' ')[0])) {
        const shuffled = [...prices].sort(() => Math.random() - 0.5);
        const sorted = shuffled.sort((a, b) => a.price - b.price);
        results.push({
          category,
          item,
          prices: sorted,
          bestDeal: sorted[Math.floor(Math.random() * Math.min(2, sorted.length))],
        });
      }
    }
  }
  
  return results;
}

function listCategories() {
  return Object.keys(PRODUCTS).map(name => ({
    name,
    itemCount: Object.keys(PRODUCTS[name]).length,
  }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || searchParams.get('ingredient');
  const list = searchParams.get('list');
  
  if (list === 'categories') {
    return NextResponse.json({
      success: true,
      categories: listCategories(),
      totalProducts: Object.values(PRODUCTS).reduce((sum, cat) => sum + Object.keys(cat).length, 0),
    });
  }
  
  if (q) {
    const results = searchProducts(q);
    if (results.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucun produit trouvé',
        suggestion: 'Essayez: legumes, fruits, viandes, epicerie, laitiers',
        categories: Object.keys(PRODUCTS),
      });
    }
    return NextResponse.json({
      success: true,
      query: q,
      results,
      count: results.length,
    });
  }
  
  return NextResponse.json({
    success: true,
    message: 'Price Hunter API — Québec',
    categories: Object.keys(PRODUCTS),
    totalProducts: Object.values(PRODUCTS).reduce((sum, cat) => sum + Object.keys(cat).length, 0),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ingredient } = body;
  
  if (!ingredient) {
    return NextResponse.json({ success: false, error: 'ingredient requis' });
  }
  
  const results = searchProducts(ingredient);
  return NextResponse.json({
    success: true,
    query: ingredient,
    results,
    count: results.length,
  });
}
