import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════
// Price Hunter API — Québec Grocery Prices with MEAT CUTS
// ═══════════════════════════════════════════════════════════

const MEAT_CUTS: Record<string, Record<string, { price: number; store: string }[]>> = {
  boeuf: {
    'haut de surlonge': [
      { store: 'Walmart', price: 8.79 },
      { store: 'Super C', price: 8.99 },
      { store: 'Maxi', price: 9.29 },
      { store: 'Metro', price: 9.99 },
      { store: 'Provigo', price: 10.49 },
      { store: 'IGA', price: 10.99 },
    ],
    'filet mignon': [
      { store: 'Walmart', price: 17.99 },
      { store: 'Super C', price: 18.99 },
      { store: 'Maxi', price: 19.49 },
      { store: 'Metro', price: 22.99 },
      { store: 'Provigo', price: 24.99 },
      { store: 'IGA', price: 26.99 },
    ],
    'bifteck surlonge': [
      { store: 'Walmart', price: 12.49 },
      { store: 'Super C', price: 12.99 },
      { store: 'Maxi', price: 13.49 },
      { store: 'Metro', price: 14.99 },
      { store: 'Provigo', price: 15.99 },
      { store: 'IGA', price: 16.49 },
    ],
    'palette': [
      { store: 'Walmart', price: 5.79 },
      { store: 'Super C', price: 5.99 },
      { store: 'Maxi', price: 6.29 },
      { store: 'Metro', price: 6.99 },
      { store: 'Provigo', price: 7.49 },
      { store: 'IGA', price: 7.99 },
    ],
    'rôti de boeuf': [
      { store: 'Walmart', price: 9.79 },
      { store: 'Super C', price: 9.99 },
      { store: 'Maxi', price: 10.49 },
      { store: 'Metro', price: 11.99 },
      { store: 'Provigo', price: 12.99 },
      { store: 'IGA', price: 13.49 },
    ],
    'steak haché': [
      { store: 'Walmart', price: 6.79 },
      { store: 'Super C', price: 6.99 },
      { store: 'Maxi', price: 7.29 },
      { store: 'Metro', price: 7.99 },
      { store: 'Provigo', price: 8.49 },
      { store: 'IGA', price: 8.99 },
    ],
    'boulettes de boeuf': [
      { store: 'Walmart', price: 5.79 },
      { store: 'Super C', price: 5.99 },
      { store: 'Maxi', price: 6.29 },
      { store: 'Metro', price: 6.99 },
      { store: 'Provigo', price: 7.49 },
      { store: 'IGA', price: 7.99 },
    ],
  },
  porc: {
    'côtelettes de porc': [
      { store: 'Walmart', price: 4.79 },
      { store: 'Super C', price: 4.99 },
      { store: 'Maxi', price: 5.29 },
      { store: 'Metro', price: 5.99 },
      { store: 'Provigo', price: 6.49 },
      { store: 'IGA', price: 6.99 },
    ],
    'filet de porc': [
      { store: 'Walmart', price: 6.79 },
      { store: 'Super C', price: 6.99 },
      { store: 'Maxi', price: 7.29 },
      { store: 'Metro', price: 7.99 },
      { store: 'Provigo', price: 8.49 },
      { store: 'IGA', price: 8.99 },
    ],
    'épaule de porc': [
      { store: 'Walmart', price: 3.79 },
      { store: 'Super C', price: 3.99 },
      { store: 'Maxi', price: 4.29 },
      { store: 'Metro', price: 4.99 },
      { store: 'Provigo', price: 5.49 },
      { store: 'IGA', price: 5.99 },
    ],
  },
  poulet: {
    'poitrines de poulet': [
      { store: 'Walmart', price: 8.79 },
      { store: 'Super C', price: 8.99 },
      { store: 'Maxi', price: 9.29 },
      { store: 'Metro', price: 9.99 },
      { store: 'Provigo', price: 10.49 },
      { store: 'IGA', price: 10.99 },
    ],
    'cuisses de poulet': [
      { store: 'Walmart', price: 3.79 },
      { store: 'Super C', price: 3.99 },
      { store: 'Maxi', price: 4.29 },
      { store: 'Metro', price: 4.99 },
      { store: 'Provigo', price: 5.49 },
      { store: 'IGA', price: 5.99 },
    ],
    'ailes de poulet': [
      { store: 'Walmart', price: 4.79 },
      { store: 'Super C', price: 4.99 },
      { store: 'Maxi', price: 5.29 },
      { store: 'Metro', price: 5.99 },
      { store: 'Provigo', price: 6.49 },
      { store: 'IGA', price: 6.99 },
    ],
  },
};

function searchPrices(item: string) {
  const lower = item.toLowerCase();
  
  // Check each meat type
  for (const [meat, cuts] of Object.entries(MEAT_CUTS)) {
    if (lower.includes(meat)) {
      // Check for specific cut
      for (const [cut, prices] of Object.entries(cuts)) {
        if (lower.includes(cut.split(' ')[0]) || lower.includes(cut)) {
          return {
            type: 'specific',
            category: meat,
            item: cut,
            prices: prices,
            bestDeal: prices[0],
          };
        }
      }
      // Return all cuts for this meat
      const allCuts = Object.entries(cuts).map(([cut, prices]) => ({
        cut,
        prices,
        bestDeal: prices[0],
      }));
      
      const overallBest = allCuts.reduce((min, curr) => 
        curr.bestDeal.price < min.bestDeal.price ? curr : min
      );
      
      return {
        type: 'category',
        category: meat,
        cuts: allCuts,
        overallBest,
        message: `Nous avons trouvé ${allCuts.length} coupes de ${meat}. Spécifiez une coupe pour plus de détails.`,
      };
    }
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const item = searchParams.get('ingredient') || searchParams.get('item') || searchParams.get('q');
  
  if (!item) {
    return NextResponse.json({
      success: false,
      error: 'Utilisez ?ingredient=boeuf, ?item=poulet, ou ?q=porc',
      examples: [
        '?ingredient=boeuf',
        '?item=filet mignon',
        '?q=poitrines de poulet',
      ],
    });
  }
  
  const result = searchPrices(item);
  
  if (!result) {
    return NextResponse.json({
      success: false,
      error: 'Item non trouvé',
      suggestion: 'Essayez: boeuf, porc, poulet, ou une coupe spécifique',
      availableCategories: Object.keys(MEAT_CUTS),
    });
  }
  
  return NextResponse.json({
    success: true,
    query: item,
    result,
    timestamp: new Date().toISOString(),
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
  
  const result = searchPrices(searchTerm);
  
  if (!result) {
    return NextResponse.json({
      success: false,
      error: 'Item non trouvé',
      suggestion: 'Essayez: boeuf, porc, poulet',
    });
  }
  
  return NextResponse.json({
    success: true,
    query: searchTerm,
    result,
    timestamp: new Date().toISOString(),
  });
}
