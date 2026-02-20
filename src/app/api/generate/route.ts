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
          content: `Tu es un chef cuisinier québécois expérimenté. Tu DOIS répondre en JSON.

Format EXACT:
{
  "title": "Smash Burger Style Normandin",
  "description": "Un double smash burger juteux avec confit d'oignons",
  "prepTime": "15 min",
  "cookTime": "10 min",
  "servings": 2,
  "ingredients": [
    "500g bœuf haché 80/20",
    "4 tranches fromage américain orange",
    "2 oignons jaunes",
    "2 pains briochés",
    "Beurre, sel, poivre"
  ],
  "instructions": [
    "Caraméliser les oignons 30 min à feu doux",
    "Diviser la viande en 4 boules de 125g",
    "Chauffer poêle fonte à feu vif",
    "Smash les boules très fort (0.5cm épaisseur)",
    "Cuire 2-3 min, retourner, ajouter fromage",
    "Griller les pains au beurre",
    "Assembler: pain, moutarde, cornichons, patty, oignons, patty, fromage, pain"
  ],
  "tips": [
    "Poêle TRÈS chaude = croustillant",
    "Smash immédiatement après avoir posé la viande",
    "Fromage orange = secret du goût Normandin"
  ]
}`
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
