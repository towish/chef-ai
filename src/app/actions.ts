"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "You are a professional chef. Create a delicious recipe based on the user's request. Return ONLY valid JSON with no markdown formatting. Structure: { \"title\": string, \"ingredients\": string[], \"steps\": string[], \"tips\": string[] }."
});

export type Recipe = {
  title: string;
  ingredients: string[];
  steps: string[];
  tips: string[];
};

export async function generateRecipe(formData: FormData) {
  try {
    const promptType = formData.get("type") as string;
    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File | null;

    let parts: any[] = [];

    if (promptType === "text") {
      parts.push(`Request: ${content}`);
    } else if (promptType === "ingredients") {
      parts.push(`Ingredients available: ${content}. assume basic pantry items.`);
    } else if (promptType === "image" && imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: imageFile.type,
        },
      });
      parts.push("Identify ingredients and generate a recipe.");
    } else {
      throw new Error("Invalid input type");
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown if present
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const recipe = JSON.parse(text) as Recipe;
    return { success: true, data: recipe };

  } catch (error) {
    console.error("Gemini Error:", error);
    return { success: false, error: "Failed to generate recipe." };
  }
}
