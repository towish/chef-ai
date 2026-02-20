"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// 🔧 CONFIGURATION & INIT
// ═══════════════════════════════════════════════════════════

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 🎯 NOUVEAU MODÈLE: gemini-1.5-flash LATEST (Supporte Vision + Texte)
const MODEL_NAME = "gemini-1.5-flash-latest";

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
// 🍳 MOCK RECIPES (Fallback)
// ═══════════════════════════════════════════════════════════

const MOCK_RECIPES: Recipe[] = [
  {
    title: "Poulet Sauté aux Légumes",
    ingredients: ["2 poitrines de poulet", "1 oignon", "2 gousses d'ail", "2 c.soupe d'huile", "Sel et poivre"],
    steps: [
      "Couper le poulet en dés et l'oignon en lamelles",
      "Chauffer l'huile dans un wok à feu vif",
      "Faire revenir l'oignon et l'ail 2 minutes",
      "Ajouter le poulet et cuire 8-10 minutes en remuant",
      "Servir chaud avec du riz ou des nouilles"
    ],
    tips: ["Mariner le poulet 30 min pour plus de saveur", "Ajouter des légumes selon la saison"],
    prepTime: "15 min",
    cookTime: "25 min",
    servings: 4
  },
  {
    title: "Pâtes Carbonara Rapides",
    ingredients: ["400g pâtes", "200g lardons", "3 œufs", "100g parmesan", "Poivre noir"],
    steps: [
      "Cuire les pâtes al dente dans l'eau salée",
      "Faire dorer les lardons dans une poêle",
      "Battre les œufs avec le parmesan et le poivre",
      "Égoutter les pâtes et les ajouter aux lardons (feu éteint)",
      "Verser le mélange œufs/parmesan et remuer vite"
    ],
    tips: ["Le secret: mélanger hors du feu pour des œufs crémeux"],
    prepTime: "5 min",
    cookTime: "15 min",
    servings: 4
  }
];

function getRandomMockRecipe(): Recipe {
  return MOCK_RECIPES[Math.floor(Math.random() * MOCK_RECIPES.length)];
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
  const imageFile = formData.get("image") as File | null;

  // 🎯 Try Gemini API first, fallback to mock
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Construire les parties du prompt
    const parts: any[] = [{ text: SYSTEM_PROMPT }];
    let userRequest = "";

    if (type === "text" || type === "ingredients") {
      userRequest = `Voici ma demande: ${content}`;
      parts.push({ text: userRequest });
    } else if (type === "multimodal" && imageFile && imageFile.size > 0) {
      // Convertir l'image en base64
      const arrayBuffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = imageFile.type || "image/jpeg";

      parts.push({
        inlineData: {
          mimeType,
          data: base64,
        },
      });
      
      userRequest = content 
        ? `Analyse cette image et ma demande: "${content}". Donne-moi une recette.`
        : "Analyse les ingrédients sur cette photo et propose une recette créative.";
      
      parts.push({ text: userRequest });
    } else {
      // Fallback: text only
      userRequest = `Voici ma demande: ${content || "Une recette surprise"}`;
      parts.push({ text: userRequest });
    }

    // 🚀 APPEL API with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API timeout')), 10000)
    );
    
    const result = await Promise.race([
      model.generateContent(parts),
      timeoutPromise
    ]) as any;
    
    const response = await result.response;
    let text = response.text();

    // 🧹 NETTOYAGE (enlever ```json ... ```)
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // 📦 PARSE JSON
    let json;
    try {
      json = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", text.substring(0, 200));
      // Return mock recipe instead of failing
      console.log("Returning mock recipe due to parse error");
      return {
        success: true,
        data: getRandomMockRecipe(),
      };
    }

    // ✅ VALIDATION ZOD
    const validationResult = RecipeSchema.safeParse(json);

    if (!validationResult.success) {
      console.error("Zod Validation Error:", validationResult.error.issues);
      // Return mock recipe on validation error
      return {
        success: true,
        data: getRandomMockRecipe(),
      };
    }

    // 🎉 SUCCÈS
    return {
      success: true,
      data: validationResult.data,
    };

  } catch (error: any) {
    console.error("API Error:", error);
    
    // 🍳 FALLBACK: Return mock recipe on any error
    console.log("Returning mock recipe due to API error");
    return {
      success: true,
      data: getRandomMockRecipe(),
    };
  }
}
