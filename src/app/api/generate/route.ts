import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ═══════════════════════════════════════════════════════════
// ChefAI Recipe Generation API
// ═══════════════════════════════════════════════════════════

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBwFcLaMtuhUXEih_zA8Ry4wWw2h-AMhzU';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: `You are ChefAI, a creative AI sous-chef. Generate detailed, delicious recipes.
      
Guidelines:
- Be creative but practical
- Include prep/cook times
- List all ingredients with measurements
- Clear step-by-step instructions
- Suggest variations
- Keep tone friendly and encouraging`
    });

    const prompt = `Create a recipe using these ingredients: ${ingredients.join(', ')}
${cuisine ? `Cuisine style: ${cuisine}` : ''}
${dietary ? `Dietary restrictions: ${dietary}` : ''}

Format the response as JSON:
{
  "title": "Recipe Name",
  "description": "Brief description",
  "prepTime": "15 min",
  "cookTime": "30 min",
  "servings": 4,
  "ingredients": ["1 cup ingredient", ...],
  "instructions": ["Step 1...", ...],
  "tips": ["Tip 1...", ...],
  "nutrition": {
    "calories": 350,
    "protein": "25g"
  }
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    let recipe;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      recipe = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: "Generated Recipe", instructions: text };
    } catch {
      recipe = { title: "Generated Recipe", instructions: text };
    }

    return NextResponse.json({
      success: true,
      recipe,
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
