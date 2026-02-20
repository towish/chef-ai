import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// ═══════════════════════════════════════════════════════════
// ChefAI Recipe Generation API — GROQ POWERED v2
// ═══════════════════════════════════════════════════════════

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, cuisine, dietary, request: userRequest } = body;

    // Combine all inputs
    const query = [
      ingredients?.join(', '),
      cuisine,
      dietary,
      userRequest
    ].filter(Boolean).join(' - ');

    if (!query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Décris ce que tu veux cuisiner!' },
        { status: 400 }
      );
    }

    // 🚀 APPEL GROQ API avec prompt détaillé
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Tu es ChefAI, un vrai chef cuisinier québécois avec 20 ans d'expérience. Tu es passionné, chaleureux, et tu connais parfaitement la cuisine québécoise.

Tu dois TOUJOURS répondre avec une recette COMPLÈTE au format JSON.

Format de réponse OBLIGATOIRE (JSON pur, sans markdown):
{
  "title": "Titre créatif et alléchant",
  "description": "2-3 phrases d'introduction passionnées sur ce plat",
  "prepTime": "X min",
  "cookTime": "X min", 
  "servings": 4,
  "ingredients": [
    "250g de bœuf haché 80/20 (très important le ratio gras!)",
    "2 gros oignons jaunes émincés finement",
    "4 tranches de fromage américain orange (le vrai!)",
    "2 pains briochés beurrés",
    "Sel, poivre, huile"
  ],
  "instructions": [
    "PREMIÈRE étape: Prépare tes oignons. Émince-les finement, fais-les suer 30 min à feu doux dans du beurre. C'est LE secret du goût!",
    "DEUXIÈME étape: Prépare la viande. Divise en boules de 125g, NE les compresse pas!",
    "TROISIÈME étape: Chauffe ta poêle en fonte à feu VIF. C'est crucial!",
    "... continue avec 5-6 autres étapes très détaillées"
  ],
  "tips": [
    "Astuce #1: La poêle DOIT être très chaude pour le smash",
    "Astuce #2: Utilise du papier parchemin pour pas que ça colle",
    "Astuce #3: Le fromage orange c'est pas optionnel au Québec!"
  ]
}

RÈGLES IMPORTANTES:
- Ingrédients avec QUANTITÉS PRÉCISES (grammes, litres, unités)
- Instructions DÉTAILLÉES avec temps et astuces
- Si on demande "normandin", inspire-toi de leur style (double patty, confit oignons, fromage orange)
- Si on demande "poutine", parle de fromage en grains qui couine
- Sois CRÉATIF et PASSIONNÉ comme un vrai chef!`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.85,
      max_tokens: 2500,
    });

    const text = completion.choices[0]?.message?.content || '';
    
    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', text.substring(0, 500));
      return NextResponse.json({
        success: false,
        error: 'Le chef a eu un souci. Réessaie!',
      });
    }

    const recipe = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json({
      success: true,
      recipe,
      source: 'groq',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Recipe generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur en cuisine. Réessaie!',
    }, { status: 500 });
  }
}
