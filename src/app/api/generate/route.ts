import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// ═══════════════════════════════════════════════════════════
// ChefAI Recipe Generation API — GROQ POWERED
// ═══════════════════════════════════════════════════════════

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `Tu es ChefAI, un chef cuisinier québécois passionné et créatif.

RÈGLES ABSOLUES:
1. Tu DOIS créer une recette UNIQUE basée sur les ingrédients demandés
2. Ne JAMAIS utiliser des ingrédients non mentionnés (sauf sel, poivre, huile)
3. Chaque recette doit être DIFFÉRENTE — sois créatif!
4. Adapte le style au type de plat demandé (burger → smash burger, poutine → poutine, etc.)

Format JSON requis:
{
  "title": "Titre créatif en français",
  "description": "Description appétissante",
  "prepTime": "X min",
  "cookTime": "X min",
  "servings": 4,
  "ingredients": ["quantité + ingrédient", ...],
  "instructions": ["Étape détaillée 1", ...],
  "tips": ["Conseil pro", ...]
}

IMPORTANT:
- Si on demande "smash burger" → Donne une vraie recette de smash burger
- Si on demande "saumon" → Donne une recette avec du saumon
- Sois précis avec les temps de cuisson
- Les instructions doivent être détaillées (5-8 étapes minimum)`;

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

    const userRequest = `Crée une recette avec ces ingrédients: ${ingredients.join(', ')}
${cuisine ? `Style: ${cuisine}` : ''}
${dietary ? `Restrictions: ${dietary}` : ''}`;

    // 🚀 APPEL GROQ API
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userRequest }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content || '';
    
    // 🧹 NETTOYAGE
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // 📦 PARSE JSON
    try {
      const recipe = JSON.parse(cleaned);
      return NextResponse.json({
        success: true,
        recipe,
        source: 'groq',
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Fallback to smart mock
      return NextResponse.json({
        success: true,
        recipe: getSmartMockRecipe(ingredients.join(' ')),
        source: 'mock',
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error('Recipe generation error:', error);
    return NextResponse.json({
      success: true,
      recipe: getSmartMockRecipe('default'),
      source: 'mock',
      timestamp: new Date().toISOString(),
    });
  }
}

// Smart mock fallback
function getSmartMockRecipe(request: string) {
  const lower = request.toLowerCase();
  
  if (lower.includes('burger') || lower.includes('smash')) {
    return {
      title: "Smash Burger Style Normandin",
      description: "Burger smash croustillant style québécois",
      prepTime: "15 min",
      cookTime: "10 min",
      servings: 4,
      ingredients: ["2 lbs bœuf 80/20", "4 pains briochés", "4 tranches cheddar", "Oignons", "Cornichons", "Sauce spéciale"],
      instructions: ["Diviser le bœuf en 8 boules", "Chauffer fonte TRÈS fort", "Smash les boules avec spatule", "Cuire 2-3 min, retourner", "Ajouter fromage", "Assembler et servir"],
      tips: ["Plaque TRÈS chaude = croustillant", "Smash immédiatement!"]
    };
  }
  
  if (lower.includes('poutine')) {
    return {
      title: "Poutine Québécoise",
      description: "Classique avec fromage en grains",
      prepTime: "10 min",
      cookTime: "15 min",
      servings: 4,
      ingredients: ["2 lbs frites", "1 lb fromage en grains", "2 tasses sauce brune"],
      instructions: ["Frire frites 325°F 5 min", "Refris 375°F 3 min", "Ajouter fromage sur frites chaudes", "Verser sauce chaude"],
      tips: ["Fromage doit grincer!", "Sauce bien chaude"]
    };
  }

  return {
    title: "Poulet Sauté aux Légumes",
    description: "Plat simple et délicieux",
    prepTime: "15 min",
    cookTime: "25 min",
    servings: 4,
    ingredients: ["2 poitrines poulet", "1 oignon", "2 gousses ail", "Huile", "Sel poivre"],
    instructions: ["Couper poulet en dés", "Chauffer huile à feu vif", "Revenir oignon ail 2 min", "Ajouter poulet 8-10 min", "Servir"],
    tips: ["Marinade 30 min = plus de goût"]
  };
}
