import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// ═══════════════════════════════════════════════════════════
// ChefAI Recipe API — SANS PROMPT + PARSER INTELLIGENT
// ═══════════════════════════════════════════════════════════

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Parser intelligent pour extraire les infos de la réponse
function parseRecipeFromText(text: string, query: string) {
  const lower = text.toLowerCase();
  
  // Extraire le titre (première ligne ou après "titre:", "recette:", etc.)
  let title = query;
  const titleMatch = text.match(/(?:titre|recette|title)[:\s]+([^\n]+)/i);
  if (titleMatch) title = titleMatch[1].trim();
  else {
    // Prendre la première phrase comme titre
    const firstLine = text.split('\n')[0];
    if (firstLine && firstLine.length < 100) title = firstLine.trim();
  }
  
  // Extraire les ingrédients
  const ingredients: string[] = [];
  const ingredientPatterns = [
    /ingrédients?\s*[:\n]([\s\S]+?)(?=préparation|instructions|étapes|prêt|préparer|$)/i,
    /pour les (?:boulettes|ingrédients|pâtes)\s*[:\n]([\s\S]+?)(?=préparation|instructions|étapes|pour|$)/i,
  ];
  
  for (const pattern of ingredientPatterns) {
    const match = text.match(pattern);
    if (match) {
      const lines = match[1].split('\n').map(l => l.trim()).filter(l => l.length > 2);
      for (const line of lines) {
        // Si la ligne ressemble à un ingrédient (commence par chiffre ou "-")
        if (/^[-•*]?\s*\d|^[-•*]/.test(line) || /\d+\s*(g|kg|ml|l|c\.|c\.à|unité|tranche)/i.test(line)) {
          ingredients.push(line.replace(/^[-•*]\s*/, ''));
          if (ingredients.length >= 15) break; // Max 15 ingrédients
        }
      }
      if (ingredients.length > 0) break;
    }
  }
  
  // Extraire les instructions/étapes
  const instructions: string[] = [];
  const instructionPatterns = [
    /(?:préparation|instructions|étapes|comment faire|préparer)\s*[:\n]([\s\S]+?)(?=astuces|conseils|notes|servir|$)/i,
    /(?:étape|step)\s*\d+[:\s]([\s\S]+?)(?=étape|astuces|conseils|servir|$)/i,
  ];
  
  for (const pattern of instructionPatterns) {
    const match = text.match(pattern);
    if (match) {
      const lines = match[1].split('\n').map(l => l.trim()).filter(l => l.length > 10);
      for (const line of lines) {
        // Accepter les lignes qui ressemblent à des étapes
        if (/\d/.test(line) || /(?:cuire|ajouter|mélanger|préparer|chauffer|retourner|servir)/i.test(line)) {
          instructions.push(line.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•*]\s*/, ''));
          if (instructions.length >= 12) break; // Max 12 étapes
        }
      }
      if (instructions.length > 0) break;
    }
  }
  
  // Extraire les astuces/conseils
  const tips: string[] = [];
  const tipsMatch = text.match(/(?:astuces?|conseils?|tips?)\s*[:\n]([\s\S]+?)(?=$)/i);
  if (tipsMatch) {
    const lines = tipsMatch[1].split('\n').map(l => l.trim()).filter(l => l.length > 5);
    for (const line of lines) {
      if (line.length > 10 && line.length < 200) {
        tips.push(line.replace(/^[-•*]\s*/, ''));
        if (tips.length >= 5) break;
      }
    }
  }
  
  // Extraire temps de préparation
  let prepTime = '15 min';
  const prepMatch = text.match(/préparation\s*[:\s]*(\d+)\s*(min|minutes?)/i);
  if (prepMatch) prepTime = `${prepMatch[1]} min`;
  
  // Extraire temps de cuisson
  let cookTime = '20 min';
  const cookMatch = text.match(/(?:cuisson|cuire)\s*[:\s]*(\d+)\s*(min|minutes?)/i);
  if (cookMatch) cookTime = `${cookMatch[1]} min`;
  
  // Extraire portions
  let servings = 4;
  const servMatch = text.match(/(?:portions?|personnes?|servings?)\s*[:\s]*(\d+)/i);
  if (servMatch) servings = parseInt(servMatch[1]);
  
  return {
    title,
    description: `Recette de ${title}`,
    prepTime,
    cookTime,
    servings,
    ingredients: ingredients.length > 0 ? ingredients : ['Ingrédients dans le texte'],
    instructions: instructions.length > 0 ? instructions : ['Voir le texte complet'],
    tips: tips.length > 0 ? tips : [],
    rawText: text,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, request: userRequest } = body;
    
    const query = [ingredients?.join(', '), userRequest].filter(Boolean).join(' - ');
    
    if (!query.trim()) {
      return NextResponse.json({ success: false, error: 'Décris ce que tu veux!' }, { status: 400 });
    }

    // APPEL GROQ SANS PROMPT (comme Raph a fait)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: query }],
      temperature: 0.9,
      max_tokens: 3000,
    });

    const text = completion.choices[0]?.message?.content || '';
    
    // Parser automatiquement la réponse
    const recipe = parseRecipeFromText(text, query);
    
    return NextResponse.json({
      success: true,
      recipe,
      source: 'groq',
      parsed: true,
      raw: text.substring(0, 500),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: 'Erreur' }, { status: 500 });
  }
}
