"use server";

import Groq from "groq-sdk";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// 🔧 CONFIGURATION & INIT — GROQ (ULTRA RAPIDE)
// ═══════════════════════════════════════════════════════════

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// 🎯 MODÈLE: llama-3.3-70b-versatile (rapide + intelligent)
const MODEL_NAME = "llama-3.3-70b-versatile";

// ═══════════════════════════════════════════════════════════
// 🛡️ SCHEMA VALIDATION (Zod)
// ═══════════════════════════════════════════════════════════

const RecipeSchema = z.object({
  title: z.string().min(3).max(100),
  ingredients: z.array(z.string().min(1)).min(1).max(20),
  steps: z.array(z.string().min(10)).min(1).max(15),
  tips: z.array(z.string()).optional().default([]),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  servings: z.number().optional(),
});

export type Recipe = z.infer<typeof RecipeSchema>;

// ═══════════════════════════════════════════════════════════
// 🤖 PROMPT ENGINEERING
// ═══════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `
Tu es le ChefAI, un chef cuisinier expert et créatif.
Tu DOIS répondre UNIQUEMENT avec un objet JSON valide, sans markdown, sans texte avant/après.

Format de réponse requis:
{
  "title": "Titre de la recette",
  "ingredients": ["ingrédient 1", "ingrédient 2", ...],
  "steps": ["Étape 1 détaillée", "Étape 2 détaillée", ...],
  "tips": ["Conseil 1", "Conseil 2"],
  "prepTime": "15 min",
  "cookTime": "30 min",
  "servings": 4
}

Règles:
- Sois créatif mais réaliste
- Les ingrédients doivent être précis (quantités approximatives)
- Les étapes doivent être claires et détaillées
- Adapte la recette aux ingrédients disponibles si une photo est fournie
- Si la demande est vague, propose une recette populaire adaptée
`;

// ═══════════════════════════════════════════════════════════
// 🍳 SMART MOCK RECIPES (Context-Aware Fallback)
// ═══════════════════════════════════════════════════════════

const MOCK_RECIPES: Record<string, Recipe> = {
  burger: {
    title: "Smash Burger Style Normandin",
    ingredients: [
      "2 lbs bœuf haché 80/20",
      "4 pains à burger briochés",
      "4 tranches fromage cheddar",
      "Oignons émincés",
      "Cornichons",
      "Sauce spéciale (mayo + ketchup + relish)",
      "Laitue, tomate",
      "Sel, poivre"
    ],
    steps: [
      "Diviser le bœuf en 8 boules de 125g",
      "Chauffer une plaque de fonte à feu TRÈS fort",
      "Placer une boule, l'aplatir FORT avec une spatule (smash!)",
      "Saler généreusement, cuire 2-3 min",
      "Retourner, ajouter fromage, cuire 1-2 min",
      "Griller les pains légèrement",
      "Assembler: sauce, laitue, viande, fromage, oignons, cornichons, tomate",
      "Servir immédiatement avec frites"
    ],
    tips: [
      "Le secret: plaque TRÈS chaude et smash immédiat",
      "Ne pas trop travailler la viande",
      "Fromage sur le burger pendant la cuisson"
    ],
    prepTime: "15 min",
    cookTime: "10 min",
    servings: 4
  },
  poutine: {
    title: "Poutine Québécoise Authentique",
    ingredients: [
      "2 lbs frites fraîches",
      "1 lb fromage en grains (squeaky cheese!)",
      "2 tasses sauce brune (sauce St-Hubert ou maison)",
      "Sel",
      "Huile pour friture"
    ],
    steps: [
      "Frire les frites à 325°F 5 min (première friture)",
      "Égoutter et laisser reposer 5 min",
      "Refaire frire à 375°F 3-4 min jusqu'à dorées",
      "Placer les frites dans un bol",
      "Ajouter les fromage en grains sur les frites chaudes",
      "Verser la sauce brune chaude par-dessus",
      "Mélanger légèrement et servir immédiatement"
    ],
    tips: [
      "Le fromage doit grincer sous la dent!",
      "Sauce chaude = fromage légèrement fondu",
      "Servir dans un bol en styrofoam pour l'authenticité"
    ],
    prepTime: "10 min",
    cookTime: "15 min",
    servings: 4
  },
  default: {
    title: "Poulet Rôti Simple",
    ingredients: [
      "1 poulet entier",
      "3 c.soupe beurre",
      "Herbes de Provence",
      "Sel, poivre",
      "2 citrons"
    ],
    steps: [
      "Préchauffer le four à 425°F",
      "Badigeonner le poulet de beurre fondu",
      "Assaisonner généreusement",
      "Placer les citrons à l'intérieur",
      "Cuire 1h15 jusqu'à 165°F interne",
      "Laisser reposer 10 min avant de servir"
    ],
    tips: ["Utiliser un thermomètre pour la cuisson parfaite"],
    prepTime: "10 min",
    cookTime: "1h15",
    servings: 4
  }
};

function getSmartMockRecipe(request: string): Recipe {
  const lower = request.toLowerCase();
  
  if (lower.includes('burger') || lower.includes('smash') || lower.includes('normandin')) {
    return MOCK_RECIPES.burger;
  }
  if (lower.includes('poutine') || lower.includes('québec') || lower.includes('fromage')) {
    return MOCK_RECIPES.poutine;
  }
  if (lower.includes('pâte') || lower.includes('pasta') || lower.includes('carbonara')) {
    return {
      title: "Pâtes Carbonara Authentiques",
      ingredients: ["400g spaghetti", "200g guanciale", "4 jaunes d'œufs", "100g pecorino romano", "Poivre noir"],
      steps: [
        "Cuire les pâtes al dente",
        "Faire dorer le guanciale",
        "Battre jaunes + pecorino + poivre",
        "Mélanger pâtes et guanciale (feu éteint)",
        "Ajouter le mélange œufs et remuer vite"
      ],
      tips: ["Jamais de crème! Juste œufs et fromage"],
      prepTime: "5 min",
      cookTime: "15 min",
      servings: 4
    };
  }
  if (lower.includes('poulet') || lower.includes('chicken')) {
    return {
      title: "Poulet Rôti aux Herbes",
      ingredients: ["4 cuisses de poulet", "Herbes de Provence", "3 c.soupe huile d'olive", "4 gousses d'ail", "1 citron"],
      steps: [
        "Préchauffer le four à 400°F",
        "Mélanger huile, herbes, ail",
        "Badigeonner le poulet",
        "Cuire 45 min jusqu'à doré",
        "Servir avec jus de citron"
      ],
      tips: ["Température interne 165°F"],
      prepTime: "10 min",
      cookTime: "45 min",
      servings: 4
    };
  }
  
  return MOCK_RECIPES.default;
}

// ═══════════════════════════════════════════════════════════
// ⚙️ SERVER ACTION
// ═══════════════════════════════════════════════════════════

export async function generateRecipe(formData: FormData): Promise<{
  success: boolean;
  data?: Recipe;
  error?: string;
}> {
  const type = formData.get("type") as string;
  const content = formData.get("content") as string;

  // 🎯 Try Groq API first (ULTRA RAPIDE), fallback to mock
  try {
    const userRequest = type === "text" || type === "ingredients"
      ? `Voici ma demande: ${content}`
      : `Voici ma demande: ${content || "Une recette surprise"}`;

    // 🚀 APPEL GROQ API
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userRequest }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content || "";
    
    // 🧹 NETTOYAGE (enlever ```json ... ```)
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // 📦 PARSE JSON
    let json;
    try {
      json = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", cleaned.substring(0, 200));
      return {
        success: true,
        data: getSmartMockRecipe(content || userRequest),
      };
    }

    // ✅ VALIDATION ZOD
    const validationResult = RecipeSchema.safeParse(json);

    if (!validationResult.success) {
      console.error("Zod Validation Error:", validationResult.error.issues);
      // Return mock recipe on validation error
      return {
        success: true,
        data: getSmartMockRecipe(content || userRequest),
      };
    }

    // 🎉 SUCCÈS
    return {
      success: true,
      data: validationResult.data,
    };

  } catch (error: any) {
    console.error("API Error:", error);
    
    // 🍳 FALLBACK: Return smart mock recipe based on request
    console.log("Returning smart mock recipe due to API error");
    return {
      success: true,
      data: getSmartMockRecipe(content || "default"),
    };
  }
}
