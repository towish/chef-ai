import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════
// Price Hunter API — SuperMarché Québec COMPLET
// ═══════════════════════════════════════════════════════════

const PRODUCTS: Record<string, Record<string, { price: number; store: string; unit?: string }[]>> = {
  // ═══════════════════════════════════════════════════════════
  // VIANDES
  // ═══════════════════════════════════════════════════════════
  boeuf: {
    'haut de surlonge': getPriceList(8.79),
    'filet mignon': getPriceList(17.99),
    'bifteck surlonge': getPriceList(12.49),
    'palette': getPriceList(5.79),
    'rôti de boeuf': getPriceList(9.79),
    'steak haché': getPriceList(6.79),
    'boulettes': getPriceList(5.79),
    't-bone': getPriceList(14.99),
    'ribs de boeuf': getPriceList(11.99),
  },
  porc: {
    'côtelettes': getPriceList(4.79),
    'filet de porc': getPriceList(6.79),
    'épaule de porc': getPriceList(3.79),
    'carré de porc': getPriceList(5.49),
    'travers de porc': getPriceList(4.99),
  },
  poulet: {
    'poitrines': getPriceList(8.79),
    'cuisses': getPriceList(3.79),
    'ailes': getPriceList(4.79),
    'dinde hachée': getPriceList(5.99),
    'poulet entier': getPriceList(2.99, 'lb'),
  },
  poisson: {
    'saumon': getPriceList(12.99),
    'tilapia': getPriceList(8.99),
    'morue': getPriceList(10.99),
    'crevettes': getPriceList(9.99),
  },

  // ═══════════════════════════════════════════════════════════
  // FRUITS & LÉGUMES
  // ═══════════════════════════════════════════════════════════
  fruits: {
    'pommes': getPriceList(1.99, 'lb'),
    'bananes': getPriceList(0.59, 'lb'),
    'oranges': getPriceList(1.49, 'lb'),
    'fraises': getPriceList(3.99),
    'bleuets': getPriceList(4.99),
    'framboises': getPriceList(4.49),
    'ananas': getPriceList(3.49),
    'mangues': getPriceList(1.49),
    'avocats': getPriceList(1.29),
    'citrons': getPriceList(0.79),
    'limes': getPriceList(0.69),
    'raisins': getPriceList(2.99, 'lb'),
    'poires': getPriceList(1.99, 'lb'),
    'pêches': getPriceList(2.49, 'lb'),
    'melons': getPriceList(4.99),
    'pastèque': getPriceList(6.99),
  },
  legumes: {
    'carottes': getPriceList(1.49, 'lb'),
    'brocoli': getPriceList(1.99),
    'chou-fleur': getPriceList(2.99),
    'épinards': getPriceList(2.49),
    'laitue': getPriceList(1.49),
    'tomates': getPriceList(1.99, 'lb'),
    'concombres': getPriceList(0.99),
    'poivrons': getPriceList(1.29),
    'oignons': getPriceList(0.99, 'lb'),
    'ail': getPriceList(0.49),
    'céleri': getPriceList(1.99),
    'champignons': getPriceList(2.49),
    'courgettes': getPriceList(1.49),
    'aubergines': getPriceList(1.99),
    'patates douces': getPriceList(1.29, 'lb'),
    'pommes de terre': getPriceList(0.99, 'lb'),
    'maïs': getPriceList(0.79),
    'asperges': getPriceList(3.99),
    'haricots verts': getPriceList(2.99),
  },

  // ═══════════════════════════════════════════════════════════
  // PRODUITS LAITIERS
  // ═══════════════════════════════════════════════════════════
  laitiers: {
    'lait 2%': getPriceList(4.99, '4L'),
    'lait 1%': getPriceList(4.99, '4L'),
    'lait entier': getPriceList(5.49, '4L'),
    'lait sans lactose': getPriceList(6.99, '4L'),
    'beurre': getPriceList(5.99, '454g'),
    'fromage cheddar': getPriceList(6.99, '400g'),
    'fromage mozzarella': getPriceList(5.99, '400g'),
    'fromage suisse': getPriceList(7.99, '400g'),
    'crème sure': getPriceList(2.99),
    'yogourt nature': getPriceList(4.99, '750g'),
    'yogourt grec': getPriceList(5.99, '500g'),
    'oeufs': getPriceList(4.99, '12'),
    'oeufs biologiques': getPriceList(7.99, '12'),
    'crème 35%': getPriceList(4.49),
    'lait d\'amande': getPriceList(4.49, '1.89L'),
    'lait de soya': getPriceList(4.29, '1.89L'),
  },

  // ═══════════════════════════════════════════════════════════
  // ÉPICERIE SÈCHE
  // ═══════════════════════════════════════════════════════════
  epicerie: {
    'riz blanc': getPriceList(3.99, '2kg'),
    'riz brun': getPriceList(4.99, '2kg'),
    'riz basmati': getPriceList(5.99, '2kg'),
    'pâtes spaghetti': getPriceList(1.99, '900g'),
    'pâtes penne': getPriceList(2.29, '900g'),
    'pâtes fusilli': getPriceList(2.29, '900g'),
    'pâtes lasagne': getPriceList(2.99, '500g'),
    'farine': getPriceList(3.99, '2.5kg'),
    'sucre': getPriceList(2.99, '2kg'),
    'sucre brun': getPriceList(3.49, '1kg'),
    'miel': getPriceList(6.99, '500g'),
    'sirop d\'érable': getPriceList(9.99, '500ml'),
    'huile canola': getPriceList(4.99, '1L'),
    'huile olive': getPriceList(8.99, '1L'),
    'vinaigre': getPriceList(2.99, '1L'),
    'sauce soya': getPriceList(3.49),
    'ketchup': getPriceList(3.99, '1L'),
    'moutarde': getPriceList(2.49),
    'mayonnaise': getPriceList(4.99, '890ml'),
    'sel': getPriceList(1.49, '1kg'),
    'poivre': getPriceList(4.99, '100g'),
    'épices italiennes': getPriceList(3.99),
    'ail en poudre': getPriceList(3.49),
    'oignon en poudre': getPriceList(3.49),
    'cannelle': getPriceList(3.99),
    'bouillon poulet': getPriceList(3.49, '6'),
    'bouillon boeuf': getPriceList(3.49, '6'),
    'canned tomatoes': getPriceList(1.49, '796ml'),
    'canned beans': getPriceList(1.29, '540ml'),
    'canned corn': getPriceList(1.19, '341ml'),
    'thon en conserve': getPriceList(2.49, '170g'),
    'pain tranché': getPriceList(2.99),
    'tortillas': getPriceList(3.49, '10'),
    'céréales': getPriceList(4.99, '500g'),
    'gruau': getPriceList(4.49, '1kg'),
    'café moulu': getPriceList(9.99, '907g'),
    'thé': getPriceList(3.99, '20 sachets'),
  },

  // ═══════════════════════════════════════════════════════════
  // SURGELÉS
  // ═══════════════════════════════════════════════════════════
  surgeles: {
    'pizza pepperoni': getPriceList(5.99),
    'pizza fromage': getPriceList(5.49),
    'pizza végé': getPriceList(6.99),
    'légumes surgelés': getPriceList(2.99, '1kg'),
    'brocoli surgelé': getPriceList(2.49, '1kg'),
    'fèves surgelées': getPriceList(2.99, '1kg'),
    'frites surgelées': getPriceList(3.99, '1kg'),
    'poulets nuggets': getPriceList(6.99, '800g'),
    'poisson pané': getPriceList(7.99, '500g'),
    'crème glacée vanille': getPriceList(5.99, '2L'),
    'crème glacée chocolat': getPriceList(5.99, '2L'),
    'crème glacée mixte': getPriceList(6.99, '2L'),
  },

  // ═══════════════════════════════════════════════════════════
  // BOISSONS
  // ═══════════════════════════════════════════════════════════
  boissons: {
    'eau embouteillée': getPriceList(2.99, '24'),
    'jus d\'orange': getPriceList(4.99, '1.89L'),
    'jus de pomme': getPriceList(3.99, '1.89L'),
    'jus de légumes': getPriceList(3.49, '1L'),
    'boisson gazeuse cola': getPriceList(2.99, '2L'),
    'boisson gazeuse sprite': getPriceList(2.99, '2L'),
    'boisson énergisante': getPriceList(2.99),
    'bière': getPriceList(12.99, '6'),
    'vin rouge': getPriceList(12.99, '750ml'),
    'vin blanc': getPriceList(11.99, '750ml'),
  },

  // ═══════════════════════════════════════════════════════════
  // SNACKS
  // ═══════════════════════════════════════════════════════════
  snacks: {
    'croustilles nature': getPriceList(3.99, '255g'),
    'croustilles BBQ': getPriceList(3.99, '255g'),
    'croustilles tortilla': getPriceList(3.49, '280g'),
    'biscuits chocolat': getPriceList(3.99, '350g'),
    'biscuits oatmeal': getPriceList(3.49, '350g'),
    'craquelins': getPriceList(2.99, '450g'),
    'noix mélangées': getPriceList(6.99, '400g'),
    'amandes': getPriceList(7.99, '400g'),
    'chocolat noir': getPriceList(3.49, '100g'),
    'chocolat au lait': getPriceList(2.99, '100g'),
    'bonbons': getPriceList(2.99, '200g'),
    'guimauves': getPriceList(2.49, '300g'),
  },

  // ═══════════════════════════════════════════════════════════
  // NETTOYAGE
  // ═══════════════════════════════════════════════════════════
  nettoyage: {
    'savon à vaisselle': getPriceList(2.99, '739ml'),
    'détergent à lessive': getPriceList(9.99, '4.43L'),
    'assouplissant': getPriceList(6.99, '3.45L'),
    'nettoyant tout usage': getPriceList(3.99, '1L'),
    'nettoyant vitres': getPriceList(2.99, '946ml'),
    'papier toilette': getPriceList(9.99, '24'),
    'essuie-tout': getPriceList(6.99, '6'),
    'sacs poubelle': getPriceList(4.99, '20'),
  },
};

// Helper to generate price list for all stores
function getPriceList(basePrice: number, unit?: string) {
  const stores = ['Walmart', 'Super C', 'Maxi', 'Metro', 'Provigo', 'IGA'];
  return stores.map((store, i) => ({
    store,
    price: parseFloat((basePrice * (1 + (i * 0.05))).toFixed(2)),
    unit,
  }));
}

// Search function
function searchProducts(query: string) {
  const lower = query.toLowerCase();
  const results: any[] = [];
  
  for (const [category, items] of Object.entries(PRODUCTS)) {
    for (const [item, prices] of Object.entries(items)) {
      if (item.includes(lower) || lower.includes(item.split(' ')[0])) {
        results.push({
          category,
          item,
          prices: prices.sort((a, b) => a.price - b.price),
          bestDeal: prices.sort((a, b) => a.price - b.price)[0],
        });
      }
    }
  }
  
  return results;
}

// Get all products in category
function getCategoryProducts(category: string) {
  const cat = PRODUCTS[category];
  if (!cat) return null;
  
  return Object.entries(cat).map(([item, prices]) => ({
    item,
    prices: (prices as any[]).sort((a, b) => a.price - b.price),
    bestDeal: (prices as any[]).sort((a, b) => a.price - b.price)[0],
  }));
}

// List all categories
function listCategories() {
  return Object.keys(PRODUCTS).map(cat => ({
    name: cat,
    itemCount: Object.keys(PRODUCTS[cat]).length,
  }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || searchParams.get('ingredient') || searchParams.get('item');
  const category = searchParams.get('category');
  const list = searchParams.get('list');
  
  // List all categories
  if (list === 'categories') {
    return NextResponse.json({
      success: true,
      categories: listCategories(),
      totalProducts: Object.values(PRODUCTS).reduce((sum, cat) => sum + Object.keys(cat).length, 0),
    });
  }
  
  // Get category products
  if (category) {
    const products = getCategoryProducts(category);
    if (!products) {
      return NextResponse.json({
        success: false,
        error: 'Catégorie non trouvée',
        availableCategories: Object.keys(PRODUCTS),
      });
    }
    return NextResponse.json({
      success: true,
      category,
      products,
    });
  }
  
  // Search
  if (q) {
    const results = searchProducts(q);
    if (results.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucun produit trouvé',
        suggestion: 'Essayez une catégorie: ' + Object.keys(PRODUCTS).slice(0, 3).join(', '),
      });
    }
    return NextResponse.json({
      success: true,
      query: q,
      results,
      count: results.length,
    });
  }
  
  // Default: show categories
  return NextResponse.json({
    success: true,
    message: 'Price Hunter API — Québec',
    usage: {
      search: '?q=pommes',
      category: '?category=fruits',
      listCategories: '?list=categories',
    },
    categories: Object.keys(PRODUCTS),
    totalProducts: Object.values(PRODUCTS).reduce((sum, cat) => sum + Object.keys(cat).length, 0),
  });
}
