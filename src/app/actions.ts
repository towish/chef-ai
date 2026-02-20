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

    // 🚀 APPEL API
    const result = await model.generateContent(parts);
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
      return {
        success: false,
        error: "Le chef a eu un souci de communication. Réessaie!",
      };
    }

    // ✅ VALIDATION ZOD
    const validationResult = RecipeSchema.safeParse(json);

    if (!validationResult.success) {
      console.error("Zod Validation Error:", validationResult.error.errors);
      return {
        success: false,
        error: "La recette n'est pas complète. Réessaie!",
      };
    }

    // 🎉 SUCCÈS
    return {
      success: true,
      data: validationResult.data,
    };

  } catch (error: any) {
    console.error("API Error:", error);
    
    // Gestion d'erreur spécifique
    if (error.message?.includes("404") || error.message?.includes("model")) {
      return {
        success: false,
        error: "Le modèle AI est momentanément indisponible. Réessaie dans 30s.",
      };
    }
    
    if (error.message?.includes("quota")) {
      return {
        success: false,
        error: "Limite de requêtes atteinte. Attends un instant.",
      };
    }

    return {
      success: false,
      error: "Erreur inattendue en cuisine. Réessaie!",
    };
  }
}
