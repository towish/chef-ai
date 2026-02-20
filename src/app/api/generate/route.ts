import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════
// ChefAI Recipe Generation API — With Mock Fallback
// ═══════════════════════════════════════════════════════════

// Mock recipes for fallback
const MOCK_RECIPES: Record<string, any> = {
  default: {
    title: "Poulet Sauté aux Légumes",
    description: "Un plat simple et délicieux parfait pour la semaine",
    prepTime: "15 min",
    cookTime: "25 min",
    servings: 4,
    ingredients: [
      "2 poitrines de poulet",
      "2 tasses de riz",
      "1 oignon",
      "2 gousses d'ail",
      "2 c.soupe d'huile d'olive",
      "Sel et poivre"
    ],
    instructions: [
      "Couper le poulet en dés et l'oignon en fines lamelles",
      "Chauffer l'huile dans un wok à feu vif",
      "Faire revenir l'oignon et l'ail 2 minutes",
      "Ajouter le poulet et cuire 8-10 minutes",
      "Servir sur un lit de riz",
      "Assaisonner au goût"
    ],
    tips: [
      "Mariner le poulet 30 min pour plus de saveur",
      "Ajouter des légumes selon la saison"
    ],
    nutrition: { calories: 450, protein: "35g" }
  },
  dejeuner: {
    title: "Œufs Brouillés aux Fines Herbes",
    description: "Un petit-déjeuner classique et réconfortant",
    prepTime: "5 min",
    cookTime: "10 min",
    servings: 2,
    ingredients: [
      "4 œufs",
      "2 c.soupe de beurre",
      "1 c.soupe de ciboulette",
      "Sel et poivre"
    ],
    instructions: [
      "Battre les œufs avec sel et poivre",
      "Faire fondre le beurre à feu doux",
      "Verser les œufs et remuer doucement",
      "Cuire 5-7 minutes jusqu'à consistance crémeuse",
      "Garnir de ciboulette fraîche"
    ],
    tips: ["Ne pas surcuire", "Servir immédiatement"],
    nutrition: { calories: 280, protein: "18g" }
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, cuisine, dietary } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ingredients required' },
        { status: 400 }
      );
    }

    // Try Gemini API first
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash'
        });

        const prompt = `Crée une recette avec ces ingrédients: ${ingredients.join(', ')}
${cuisine ? `Style: ${cuisine}` : ''}
${dietary ? `Restrictions: ${dietary}` : ''}

Réponds en JSON:
{
  "title": "Nom de la recette",
  "description": "Description courte",
  "prepTime": "15 min",
  "cookTime": "30 min",
  "servings": 4,
  "ingredients": ["ingrédient 1", ...],
  "instructions": ["étape 1", ...],
  "tips": ["conseil 1", ...]
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const recipe = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            success: true,
            recipe,
            source: 'gemini',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (geminiError) {
        console.error('Gemini API failed:', geminiError);
        // Fall through to mock
      }
    }

    // Fallback to mock recipe
    const recipeKey = ingredients.some(i => /œuf|egg/i.test(i)) ? 'dejeuner' : 'default';
    const mockRecipe = {
      ...MOCK_RECIPES[recipeKey],
      ingredients: [
        ...MOCK_RECIPES[recipeKey].ingredients.slice(0, 2),
        ...ingredients.slice(0, 3).map(i => `• ${i}`),
        ...MOCK_RECIPES[recipeKey].ingredients.slice(3)
      ]
    };

    return NextResponse.json({
      success: true,
      recipe: mockRecipe,
      source: 'mock',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Recipe generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recipe' },
      { status: 500 }
    );
  }
}
