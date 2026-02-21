import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function parseRecipeFromText(text: string, query: string) {
  const lower = text.toLowerCase();
  
  let title = query;
  const titleMatch = text.match(/(?:titre|recette|title)[:\s]+([^\n]+)/i);
  if (titleMatch) title = titleMatch[1].trim();
  else {
    const firstLine = text.split('\n')[0];
    if (firstLine && firstLine.length < 100) title = firstLine.trim();
  }
  
  const ingredients: string[] = [];
  const ingredientPatterns = [
    /ingredients?\s*[:\n]([\s\S]+?)(?=preparation|instructions|etapes|pret|preparer|$)/i,
    /pour les (?:boulettes|ingredients|pates)\s*[:\n]([\s\S]+?)(?=preparation|instructions|etapes|pour|$)/i,
  ];
  
  for (const pattern of ingredientPatterns) {
    const match = text.match(pattern);
    if (match) {
      const lines = match[1].split('\n').map(l => l.trim()).filter(l => l.length > 2);
      for (const line of lines) {
        if (/^[-*]?\s*\d|^[-*]/.test(line) || /\d+\s*(g|kg|ml|l|c\.|c\.a|unite|tranche)/i.test(line)) {
          ingredients.push(line.replace(/^[-*]\s*/, ''));
          if (ingredients.length >= 15) break;
        }
      }
      if (ingredients.length > 0) break;
    }
  }
  
  const instructions: string[] = [];
  const instructionPatterns = [
    /(?:preparation|instructions|etapes|comment faire|preparer)\s*[:\n]([\s\S]+?)(?=astuces|conseils|notes|servir|$)/i,
    /(?:etape|step)\s*\d+[:\s]([\s\S]+?)(?=etape|astuces|conseils|servir|$)/i,
  ];
  
  for (const pattern of instructionPatterns) {
    const match = text.match(pattern);
    if (match) {
      const lines = match[1].split('\n').map(l => l.trim()).filter(l => l.length > 10);
      for (const line of lines) {
        if (/\d/.test(line) || /(?:cuire|ajouter|melanger|preparer|chauffer|retourner|servir)/i.test(line)) {
          instructions.push(line.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*]\s*/, ''));
          if (instructions.length >= 12) break;
        }
      }
      if (instructions.length > 0) break;
    }
  }
  
  const tips: string[] = [];
  const tipsMatch = text.match(/(?:astuces?|conseils?|tips?)\s*[:\n]([\s\S]+?)(?=$)/i);
  if (tipsMatch) {
    const lines = tipsMatch[1].split('\n').map(l => l.trim()).filter(l => l.length > 5);
    for (const line of lines) {
      if (line.length > 10 && line.length < 200) {
        tips.push(line.replace(/^[-*]\s*/, ''));
        if (tips.length >= 5) break;
      }
    }
  }
  
  let prepTime = '15 min';
  const prepMatch = text.match(/preparation\s*[:\s]*(\d+)\s*(min|minutes?)/i);
  if (prepMatch) prepTime = `${prepMatch[1]} min`;
  
  let cookTime = '20 min';
  const cookMatch = text.match(/(?:cuisson|cuire)\s*[:\s]*(\d+)\s*(min|minutes?)/i);
  if (cookMatch) cookTime = `${cookMatch[1]} min`;
  
  let servings = 4;
  const servMatch = text.match(/(?:portions?|personnes?|servings?)\s*[:\s]*(\d+)/i);
  if (servMatch) servings = parseInt(servMatch[1]);
  
  return {
    title,
    description: `Recette de ${title}`,
    prepTime,
    cookTime,
    servings,
    ingredients: ingredients.length > 0 ? ingredients : ['Ingredients dans le texte'],
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
      return NextResponse.json({ success: false, error: 'Decris ce que tu veux!' }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: query }],
      temperature: 0.9,
      max_tokens: 3000,
    });

    const text = completion.choices[0]?.message?.content || '';
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
