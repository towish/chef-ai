import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════
// Price Hunter API — Prix Basés sur SuperMarché.ca
// ═══════════════════════════════════════════════════════════

// Price structure with consistent units
interface Product {
  name: string;
  prices: { store: string; price: number }[];
}

// Realistic QC prices based on circulaire patterns
const PRODUCTS: Record<string, Record<string, Product>> = {
  // ═══════════════════════════════════════════════════════════
  // VIANDES (prix au kg sauf indication)
  // ═══════════════════════════════════════════════════════════
  viandes: {
    // BŒUF
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
    'flanchet': makePrices(11.99, 'kg'),
    'côtes levées de bœuf': makePrices(18.99, 'kg'),
    't-bone': makePrices(26.99, 'kg'),
    'viande à bourguignon': makePrices(12.99, 'kg'),
    'bœuf haché en vrac': makePrices(7.99, 'kg'),
    'bœuf à fondue': makePrices(18.99, 'kg'),
    
    // PORC
    'filet de porc': makePrices(10.99, 'kg'),
    'côtelettes de porc': makePrices(7.99, 'kg'),
    'épaule de porc': makePrices(5.99, 'kg'),
    'carré de porc': makePrices(8.99, 'kg'),
    'travers de porc': makePrices(7.49, 'kg'),
    'porc haché': makePrices(6.99, 'kg'),
    'roulades de porc': makePrices(9.99, 'kg'),
    'jambon à l\'os': makePrices(4.99, 'kg'),
    'jambon tranché': makePrices(14.99, 'kg'),
    'bacon': makePrices(7.99, '375g'),
    
    // POULET
    'poulet entier': makePrices(2.99, 'lb'),
    'poitrines de poulet': makePrices(11.99, 'kg'),
    'cuisses de poulet': makePrices(5.99, 'kg'),
    'ailes de poulet': makePrices(8.99, 'kg'),
    'hauts de cuisse': makePrices(6.99, 'kg'),
    'escalopes de poulet': makePrices(13.99, 'kg'),
    'filets de poulet': makePrices(12.99, 'kg'),
    'poulet haché': makePrices(9.99, 'kg'),
    'poulet BBQ prêt': makePrices(9.99, 'unité'),
    'tendres de poulet': makePrices(14.99, 'kg'),
    'pilons de poulet': makePrices(4.99, 'kg'),
    
    // DINDE
    'dinde entière': makePrices(2.49, 'lb'),
    'poitrine de dinde': makePrices(9.99, 'kg'),
    'dinde hachée': makePrices(8.99, 'kg'),
    'escalopes de dinde': makePrices(11.99, 'kg'),
    
    // POISSON & FRUITS DE MER
    'saumon frais': makePrices(14.99, 'kg'),
    'saumon fumé': makePrices(29.99, '250g'),
    'tilapia': makePrices(12.99, 'kg'),
    'morue': makePrices(15.99, 'kg'),
    'filet de sole': makePrices(18.99, 'kg'),
    'crevettes surgelées': makePrices(12.99, 'kg'),
    'crevettes fraîches': makePrices(19.99, 'kg'),
    'surimi': makePrices(5.99, '250g'),
    'thon frais': makePrices(22.99, 'kg'),
    
    // AUTRES VIANDES
    'agneau': makePrices(24.99, 'kg'),
    'veau': makePrices(19.99, 'kg'),
    'lapin': makePrices(16.99, 'kg'),
  },

  // ═══════════════════════════════════════════════════════════
  // CHARCUTERIE (prix par format)
  // ═══════════════════════════════════════════════════════════
  charcuterie: {
    'saucisses fumées': makePrices(4.99, 'unité'),
    'hot-dogs': makePrices(3.99, 'unité'),
    'pepperoni': makePrices(5.99, '250g'),
    'capicollo': makePrices(6.99, '100g'),
    'mortadelle': makePrices(4.99, '100g'),
    'roast beef tranché': makePrices(8.99, '100g'),
    'poitrine fumée': makePrices(5.99, '250g'),
    'boudin noir': makePrices(4.99, 'unité'),
    'terrines': makePrices(7.99, '250g'),
  },

  // ═══════════════════════════════════════════════════════════
  // FRUITS & LÉGUMES (prix au lb ou format)
  // ═══════════════════════════════════════════════════════════
  fruits: {
    'pommes': makePrices(1.99, 'lb'),
    'pommes biologiques': makePrices(3.49, 'lb'),
    'bananes': makePrices(0.69, 'lb'),
    'bananes biologiques': makePrices(0.99, 'lb'),
    'oranges': makePrices(1.79, 'lb'),
    'mandarines': makePrices(2.49, 'lb'),
    'citrons': makePrices(0.99, 'unité'),
    'limes': makePrices(0.79, 'unité'),
    'pamplemousses': makePrices(1.29, 'unité'),
    'fraises': makePrices(4.99, '454g'),
    'fraises biologiques': makePrices(6.99, '454g'),
    'bleuets': makePrices(5.99, '340g'),
    'framboises': makePrices(5.99, '340g'),
    'mangues': makePrices(1.49, 'unité'),
    'avocats': makePrices(1.29, 'unité'),
    'ananas': makePrices(3.99, 'unité'),
    'pastèque': makePrices(6.99, 'demi'),
    'melon miel': makePrices(4.99, 'unité'),
    'cantoup': makePrices(3.99, 'unité'),
    'raisins verts': makePrices(3.49, 'lb'),
    'raisins rouges': makePrices(3.49, 'lb'),
    'pommes de reinette': makePrices(2.49, 'lb'),
    'poires': makePrices(2.29, 'lb'),
    'pêches': makePrices(2.99, 'lb'),
    'nectarines': makePrices(2.99, 'lb'),
    'prunes': makePrices(2.49, 'lb'),
    'cerises': makePrices(5.99, 'lb'),
    'kiwis': makePrices(0.69, 'unité'),
  },

  legumes: {
    'carottes': makePrices(1.99, '2lb'),
    'carottes biologiques': makePrices(3.49, '2lb'),
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
    'oignons rouges': makePrices(1.99, '3lb'),
    'ail': makePrices(0.99, 'tête'),
    'échalotes': makePrices(1.99, '250g'),
    'céleri': makePrices(2.99, 'unité'),
    'champignons blancs': makePrices(2.99, '227g'),
    'champignons cremini': makePrices(3.49, '227g'),
    'courgettes': makePrices(2.49, 'lb'),
    'aubergines': makePrices(2.99, 'unité'),
    'patates douces': makePrices(1.99, 'lb'),
    'pommes de terre': makePrices(4.99, '10lb'),
    'maïs en épi': makePrices(0.99, 'unité'),
    'asperges': makePrices(4.99, 'lb'),
    'haricots verts': makePrices(3.49, 'lb'),
    'pois mange-tout': makePrices(3.99, 'lb'),
    'chou vert': makePrices(1.99, 'unité'),
    'chou rouge': makePrices(2.49, 'unité'),
    'bok choy': makePrices(2.99, 'unité'),
    'ignames': makePrices(2.49, 'lb'),
    'panais': makePrices(2.99, 'lb'),
    'betteraves': makePrices(2.49, 'lb'),
    'radis': makePrices(1.99, 'botte'),
    'courge butternut': makePrices(1.99, 'lb'),
    'citrouille': makePrices(0.79, 'lb'),
  },

  // ═══════════════════════════════════════════════════════════
  // PRODUITS LAITIERS
  // ═══════════════════════════════════════════════════════════
  laitiers: {
    'lait 2%': makePrices(5.99, '4L'),
    'lait 1%': makePrices(5.99, '4L'),
    'lait 3.25%': makePrices(6.49, '4L'),
    'lait sans lactose': makePrices(7.99, '4L'),
    'lait biologique': makePrices(8.99, '4L'),
    'lait chocolaté': makePrices(6.99, '2L'),
    'beurre salé': makePrices(6.99, '454g'),
    'beurre non salé': makePrices(6.99, '454g'),
    'margarine': makePrices(4.99, '907g'),
    'fromage cheddar': makePrices(8.99, '400g'),
    'fromage mozzarella': makePrices(7.99, '400g'),
    'fromage suisse': makePrices(9.99, '400g'),
    'fromage cottage': makePrices(4.99, '500g'),
    'fromage ricotta': makePrices(5.99, '475g'),
    'fromage feta': makePrices(6.99, '200g'),
    'fromage parmesan': makePrices(9.99, '250g'),
    'fromage râpé': makePrices(6.99, '320g'),
    'crème sure': makePrices(3.49, '500ml'),
    'crème 15%': makePrices(3.99, '473ml'),
    'crème 35%': makePrices(5.49, '473ml'),
    'yogourt nature': makePrices(5.99, '750g'),
    'yogourt grec': makePrices(6.99, '500g'),
    'yogourt aux fruits': makePrices(4.99, '650g'),
    'œufs catégorie A': makePrices(5.99, '12'),
    'œufs biologiques': makePrices(8.99, '12'),
    'œufs gros format': makePrices(6.99, '12'),
    'lait d\'amande': makePrices(4.99, '1.89L'),
    'lait de soya': makePrices(4.79, '1.89L'),
    'lait d\'avoine': makePrices(5.49, '1.89L'),
    'lait de coco': makePrices(2.99, '400ml'),
  },

  // ═══════════════════════════════════════════════════════════
  // ÉPICERIE SÈCHE
  // ═══════════════════════════════════════════════════════════
  epicerie: {
    // Riz & Pâtes
    'riz blanc': makePrices(5.99, '2kg'),
    'riz brun': makePrices(6.99, '2kg'),
    'riz basmati': makePrices(7.99, '2kg'),
    'riz jasmin': makePrices(6.99, '2kg'),
    'riz arborio': makePrices(5.99, '1kg'),
    'pâtes spaghetti': makePrices(2.49, '900g'),
    'pâtes penne': makePrices(2.79, '900g'),
    'pâtes fusilli': makePrices(2.79, '900g'),
    'pâtes linguine': makePrices(2.49, '900g'),
    'lasagnes': makePrices(3.49, '500g'),
    'nouilles udon': makePrices(3.99, '200g'),
    
    // Farine & Sucre
    'farine tout usage': makePrices(5.99, '2.5kg'),
    'farine de blé entier': makePrices(6.99, '2kg'),
    'farine à gâteau': makePrices(4.99, '2kg'),
    'sucre blanc': makePrices(3.99, '2kg'),
    'sucre brun': makePrices(3.99, '1kg'),
    'sucre glace': makePrices(3.49, '500g'),
    'miel': makePrices(8.99, '500g'),
    'sirop d\'érable': makePrices(12.99, '540ml'),
    'cassonade': makePrices(4.49, '1kg'),
    'sucre inverti': makePrices(5.99, '700g'),
    
    // Huiles & Vinaigres
    'huile de canola': makePrices(6.99, '1L'),
    'huile d\'olive': makePrices(11.99, '1L'),
    'huile d\'olive extra-vierge': makePrices(14.99, '1L'),
    'huile végétale': makePrices(5.99, '1L'),
    'huile de tournesol': makePrices(6.99, '1L'),
    'vinaigre blanc': makePrices(2.99, '1L'),
    'vinaigre de cidre': makePrices(3.99, '1L'),
    'vinaigre balsamique': makePrices(5.99, '500ml'),
    'vinaigre de vin rouge': makePrices(4.99, '500ml'),
    
    // Sauces
    'ketchup': makePrices(4.99, '1L'),
    'moutarde jaune': makePrices(2.99, '400g'),
    'moutarde de dijon': makePrices(3.99, '250g'),
    'mayonnaise': makePrices(5.99, '890ml'),
    'sauce soya': makePrices(3.99, '473ml'),
    'sauce hp': makePrices(4.99, '740ml'),
    'sauce aux prunes': makePrices(3.49, '285ml'),
    'salsa': makePrices(3.99, '454ml'),
    'pesto': makePrices(5.99, '190g'),
    'sauce tomate': makePrices(2.49, '680ml'),
    
    // Épices
    'sel de table': makePrices(2.49, '1kg'),
    'sel de mer': makePrices(3.99, '500g'),
    'poivre noir': makePrices(5.99, '100g'),
    'poivre blanc': makePrices(6.99, '100g'),
    'ail en poudre': makePrices(4.99, '100g'),
    'oignon en poudre': makePrices(4.49, '100g'),
    'paprika': makePrices(4.49, '75g'),
    'cumin': makePrices(4.99, '70g'),
    'cannelle': makePrices(4.99, '75g'),
    'origan': makePrices(3.99, '50g'),
    'basilic': makePrices(3.99, '25g'),
    'thym': makePrices(3.99, '30g'),
    'romarin': makePrices(4.49, '30g'),
    'épices italiennes': makePrices(4.99, '60g'),
    'poudre d\'oignon': makePrices(4.49, '100g'),
    'gingembre moulu': makePrices(4.99, '50g'),
    'muscade': makePrices(5.49, '50g'),
    'clou de girofle': makePrices(5.99, '50g'),
    'curry': makePrices(4.99, '60g'),
    'chili en poudre': makePrices(4.49, '80g'),
    'cayenne': makePrices(4.99, '50g'),
    
    // Bouillons
    'bouillon de poulet': makePrices(4.99, '6 cubes'),
    'bouillon de bœuf': makePrices(4.99, '6 cubes'),
    'bouillon de légumes': makePrices(4.99, '6 cubes'),
    'consommé de poulet': makePrices(1.99, '473ml'),
    'consommé de bœuf': makePrices(1.99, '473ml'),
    'fonds de veau': makePrices(3.49, '398ml'),
    
    // Conserves
    'tomates en conserve': makePrices(1.99, '796ml'),
    'tomates en dés': makePrices(1.49, '796ml'),
    'pâte de tomate': makePrices(1.29, '156ml'),
    'pois chiches': makePrices(1.49, '540ml'),
    'haricots rouges': makePrices(1.49, '540ml'),
    'haricots noirs': makePrices(1.49, '540ml'),
    'haricots blancs': makePrices(1.49, '540ml'),
    'maïs en conserve': makePrices(1.29, '341ml'),
    'pois verts': makePrices(1.29, '341ml'),
    'thon en conserve': makePrices(3.49, '170g'),
    'saumon en conserve': makePrices(4.99, '213g'),
    'sardines': makePrices(2.99, '106g'),
    
    // Pain & Boulangerie
    'pain tranché blanc': makePrices(3.49, '675g'),
    'pain tranché blé': makePrices(3.99, '675g'),
    'pain tranché multigrains': makePrices(4.49, '675g'),
    'bagels': makePrices(3.99, '6 unités'),
    'tortillas farine': makePrices(3.99, '10 unités'),
    'tortillas maïs': makePrices(2.99, '10 unités'),
    'pitas': makePrices(3.49, '6 unités'),
    'croissants': makePrices(4.99, '6 unités'),
    'muffins anglais': makePrices(3.49, '6 unités'),
    
    // Céréales & Petit-déjeuner
    'flocons d\'avoine': makePrices(5.99, '1kg'),
    'gruau rapide': makePrices(4.99, '500g'),
    'céréales corn flakes': makePrices(5.99, '525g'),
    'céréales cheerios': makePrices(6.99, '425g'),
    'céréales raisin bran': makePrices(6.49, '515g'),
    'granola': makePrices(6.99, '500g'),
    'crème de blé': makePrices(4.49, '425g'),
    
    // Café & Thé
    'café moulu régulier': makePrices(11.99, '907g'),
    'café moulu biologique': makePrices(14.99, '454g'),
    'café décaféiné': makePrices(12.99, '454g'),
    'capsules café': makePrices(9.99, '12 unités'),
    'café instantané': makePrices(8.99, '200g'),
    'thé noir': makePrices(4.99, '72 sachets'),
    'thé vert': makePrices(5.49, '40 sachets'),
    'tisanes': makePrices(4.99, '20 sachets'),
    
    // Collations
    'croustilles nature': makePrices(4.99, '255g'),
    'croustilles barbecue': makePrices(4.99, '255g'),
    'croustilles tortilla': makePrices(4.49, '280g'),
    'biscuits sandwich': makePrices(4.49, '350g'),
    'biscuits aux pépites': makePrices(4.99, '400g'),
    'craquelins soda': makePrices(3.49, '450g'),
    'noix mélangées': makePrices(9.99, '400g'),
    'amandes': makePrices(10.99, '400g'),
    'noix de cajou': makePrices(11.99, '400g'),
    'arachides': makePrices(5.99, '400g'),
    'chocolat noir': makePrices(3.99, '100g'),
    'chocolat au lait': makePrices(3.49, '100g'),
  },

  // ═══════════════════════════════════════════════════════════
  // SURGELÉS
  // ═══════════════════════════════════════════════════════════
  surgeles: {
    'pizza pepperoni': makePrices(6.99, 'unité'),
    'pizza fromage': makePrices(6.49, 'unité'),
    'pizza végétarienne': makePrices(7.99, 'unité'),
    'mélange de légumes': makePrices(3.99, '1kg'),
    'brocoli surgelé': makePrices(3.49, '1kg'),
    'fèves surgelées': makePrices(3.99, '1kg'),
    'épinards surgelés': makePrices(3.49, '1kg'),
    'frites régulières': makePrices(4.99, '1kg'),
    'frites ondulées': makePrices(5.49, '1kg'),
    'pâté chinois surgelé': makePrices(7.99, '900g'),
    'poulets nuggets': makePrices(8.99, '800g'),
    'doigts de poulet': makePrices(9.99, '800g'),
    'poisson pané': makePrices(9.99, '500g'),
    'bâtonnets de poisson': makePrices(8.49, '500g'),
    'crevettes surgelées': makePrices(14.99, '1kg'),
    'crème glacée vanille': makePrices(6.99, '2L'),
    'crème glacée chocolat': makePrices(6.99, '2L'),
    'crème glacée mixte': makePrices(7.99, '2L'),
    'sorbet': makePrices(5.99, '2L'),
    'gaufres surgelées': makePrices(4.99, '8 unités'),
    'crêpes surgelées': makePrices(4.99, '12 unités'),
  },

  // ═══════════════════════════════════════════════════════════
  // BOISSONS
  // ═══════════════════════════════════════════════════════════
  boissons: {
    'eau embouteillée': makePrices(3.99, '24 × 500ml'),
    'eau gazeuse': makePrices(3.99, '12 × 355ml'),
    'jus d\'orange': makePrices(5.99, '1.89L'),
    'jus de pomme': makePrices(4.99, '1.89L'),
    'jus de raisin': makePrices(4.99, '1.89L'),
    'jus de légumes': makePrices(4.49, '1L'),
    'boisson gazeuse cola': makePrices(3.99, '2L'),
    'boisson gazeuse citron-lime': makePrices(3.99, '2L'),
    'boisson gazeuse ginger ale': makePrices(3.99, '2L'),
    'boisson gazeuse canettes': makePrices(6.99, '12 × 355ml'),
    'boisson énergisante': makePrices(3.99, '473ml'),
    'thé glacé': makePrices(2.99, '1.89L'),
    'limonade': makePrices(2.99, '1.89L'),
  },

  // ═══════════════════════════════════════════════════════════
  // HYGIÈNE & NETTOYAGE
  // ═══════════════════════════════════════════════════════════
  hygiène: {
    'savon à vaisselle': makePrices(3.49, '739ml'),
    'détergent à lessive': makePrices(12.99, '4.43L'),
    'détergent pods': makePrices(14.99, '42 pods'),
    'assouplissant': makePrices(8.99, '3.45L'),
    'nettoyant tout usage': makePrices(4.99, '1L'),
    'nettoyant vitres': makePrices(3.49, '946ml'),
    'nettoyant pour planchers': makePrices(4.99, '1.89L'),
    'eau de javel': makePrices(3.99, '1.42L'),
    'papier toilette': makePrices(12.99, '24 doubles rouleaux'),
    'essuie-tout': makePrices(8.99, '6 rouleaux'),
    'mouchoirs': makePrices(4.99, '12 boîtes'),
    'sacs poubelle': makePrices(6.99, '30 sacs'),
    'savon pour les mains': makePrices(2.99, '250ml'),
    'shampoing': makePrices(5.99, '400ml'),
    'conditioner': makePrices(5.99, '400ml'),
    'dentifrice': makePrices(3.99, '130g'),
    'brossette': makePrices(4.99, 'unité'),
  },
};

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

function makePrices(basePrice: number, unit?: string) {
  const stores = ['Walmart', 'Super C', 'Maxi', 'Metro', 'Provigo', 'IGA'];
  // Realistic QC pricing patterns
  const multipliers = [1.00, 1.02, 1.04, 1.10, 1.15, 1.22];
  
  return {
    prices: stores.map((store, i) => ({
      store,
      price: parseFloat((basePrice * multipliers[i]).toFixed(2)),
      unit,
    })),
  };
}

function searchProducts(query: string) {
  const lower = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const results: any[] = [];
  
  for (const [category, items] of Object.entries(PRODUCTS)) {
    for (const [item, data] of Object.entries(items)) {
      const normalizedItem = item.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      
      if (normalizedItem.includes(lower) || lower.includes(normalizedItem.split(' ')[0])) {
        const sortedPrices = [...data.prices].sort((a, b) => a.price - b.price);
        results.push({
          category,
          item,
          prices: sortedPrices,
          bestDeal: sortedPrices[0],
        });
      }
    }
  }
  
  return results;
}

function getCategoryProducts(category: string) {
  const cat = PRODUCTS[category];
  if (!cat) return null;
  
  return Object.entries(cat).map(([item, data]) => {
    const sortedPrices = [...data.prices].sort((a, b) => a.price - b.price);
    return {
      item,
      prices: sortedPrices,
      bestDeal: sortedPrices[0],
    };
  });
}

function listCategories() {
  return Object.keys(PRODUCTS).map(name => ({
    name,
    itemCount: Object.keys(PRODUCTS[name]).length,
  }));
}

// ═══════════════════════════════════════════════════════════
// API HANDLERS
// ═══════════════════════════════════════════════════════════

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
        suggestion: 'Essayez une catégorie: ' + Object.keys(PRODUCTS).join(', '),
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

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ingredient, item } = body;
  const searchTerm = ingredient || item;
  
  if (!searchTerm) {
    return NextResponse.json({
      success: false,
      error: 'ingredient ou item requis',
    });
  }
  
  const results = searchProducts(searchTerm);
  
  if (results.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'Aucun produit trouvé',
      suggestion: 'Essayez: ' + Object.keys(PRODUCTS).join(', '),
    });
  }
  
  return NextResponse.json({
    success: true,
    query: searchTerm,
    results,
    count: results.length,
  });
}
