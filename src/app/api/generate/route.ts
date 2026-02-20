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

    // 🚀 APPEL GROQ API SANS PROMPT (comme Raph a fait avec Grok)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.9,
      max_tokens: 3000,
    });

    const text = completion.choices[0]?.message?.content || '';
    
    // Try to extract JSON, if not, return as text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const recipe = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          success: true,
          recipe,
          source: 'groq',
          raw: text,
          timestamp: new Date().toISOString(),
        });
      } catch {
        // JSON parse failed, return as text
      }
    }
    
    // No JSON found - return raw text (Raph's way works!)
    return NextResponse.json({
      success: true,
      recipe: {
        title: query,
        description: "Recette générée par Groq",
        rawText: text,
      },
      source: 'groq',
      raw: text,
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
