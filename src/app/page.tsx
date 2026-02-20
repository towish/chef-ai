"use client";

import { useState, useEffect } from "react";
import { generateRecipe, type Recipe } from "./actions";
import { useCamera, useVoice } from "@/hooks";
import { 
  ChefHat, Camera, Mic, MicOff, Loader2, RefreshCcw, 
  Utensils, X, Sparkles, Scan, AlignLeft, Upload
} from "lucide-react";
import clsx from "clsx";

export default function Home() {
  const [mode, setMode] = useState<"scan" | "text">("text");
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🎯 HOOKS
  const camera = useCamera({ onError: setError });
  const voice = useVoice({ 
    onResult: (text) => setTextInput(prev => prev + " " + text),
    lang: "fr-CA"
  });

  // 📸 Start camera on scan mode
  useEffect(() => {
    if (mode === "scan" && !camera.capturedImage && !camera.stream && !camera.error) {
      camera.startCamera();
    }
  }, [mode, camera.capturedImage, camera.stream, camera.error, camera]);

  // 🚀 Generate Recipe
  const handleGenerate = async () => {
    if (mode === "text" && !textInput.trim()) return;
    if (mode === "scan" && !camera.capturedImage) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      if (mode === "text") {
        formData.append("type", "text");
        formData.append("content", textInput);
      } else {
        // Scan mode - use text description only (Groq doesn't support images)
        formData.append("type", "text");
        formData.append("content", voice.transcript || "Recette surprise avec les ingrédients détectés");
      }

      const result = await generateRecipe(formData);

      if (result.success && result.data) {
        setRecipe(result.data);
      } else {
        setError(result.error || "Erreur inconnue");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setRecipe(null);
    camera.clearCapture();
    setTextInput("");
    voice.resetTranscript();
    setError(null);
  };

  // ═══════════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <main className="fixed inset-0 bg-black text-white font-sans">
      <canvas ref={camera.canvasRef} className="hidden" />

      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        {mode === "scan" && !camera.capturedImage ? (
          camera.error ? (
            <div className="flex flex-col items-center justify-center h-full bg-neutral-950 space-y-4">
              <div className="bg-neutral-800 p-4 rounded-full">
                <Camera className="w-8 h-8 text-neutral-600" />
              </div>
              <p className="text-neutral-400">{camera.error}</p>
              <label className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload Photo
                <input type="file" accept="image/*" className="hidden" 
                  onChange={(e) => e.target.files?.[0] && camera.loadFromFile(e.target.files[0])} />
              </label>
              <button onClick={() => setMode("text")} className="text-orange-500 text-sm underline">
                Switch to Text Mode
              </button>
            </div>
          ) : (
            <>
              <video ref={camera.videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-[20px] border-black/40 pointer-events-none">
                <div className="w-full h-full border border-white/10 relative">
                  <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-orange-500/80 rounded-tr-3xl"></div>
                  <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-orange-500/80 rounded-bl-3xl"></div>
                </div>
              </div>
            </>
          )
        ) : mode === "scan" && camera.capturedImage ? (
          <div className="w-full h-full">
            <img src={camera.capturedImage} alt="Captured" className="w-full h-full object-cover blur-sm opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-full bg-neutral-950 flex items-center justify-center">
            <div className="absolute w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px]" />
          </div>
        )}
      </div>

      {/* UI LAYER */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        
        {/* HEADER */}
        <header className="p-4 flex justify-between items-center pointer-events-auto bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 p-1.5 rounded-lg shadow-lg shadow-orange-500/20">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-widest uppercase">Chef<span className="text-orange-500">AI</span></span>
          </div>

          {!recipe && (
            <div className="flex bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-1.5">
              <button onClick={() => { setMode("scan"); camera.startCamera(); }}
                className={clsx("px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all",
                  mode === "scan" ? "bg-white text-black" : "text-white hover:bg-white/20")}>
                <Scan className="w-4 h-4" /> Scan
              </button>
              <button onClick={() => { setMode("text"); camera.stopCamera(); }}
                className={clsx("px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all",
                  mode === "text" ? "bg-white text-black" : "text-white hover:bg-white/20")}>
                <AlignLeft className="w-4 h-4" /> Texte
              </button>
            </div>
          )}

          {recipe && (
            <button onClick={resetAll} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
              <X className="w-5 h-5" />
            </button>
          )}
        </header>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col pointer-events-auto overflow-y-auto">
          {recipe ? (
            <div className="p-4 md:p-8 max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-10 fade-in">
              <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-2xl md:text-3xl font-bold text-orange-500 mb-2">{recipe.title}</h2>
                {recipe.prepTime && recipe.cookTime && (
                  <div className="flex gap-4 text-xs text-neutral-500 mb-4">
                    <span>⏱️ Prep: {recipe.prepTime}</span>
                    <span>🍳 Cook: {recipe.cookTime}</span>
                    {recipe.servings && <span>👥 {recipe.servings} servings</span>}
                  </div>
                )}
                <div className="h-1 w-16 bg-orange-500/50 rounded-full mb-6" />

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Ingredients</h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredients.map((ing, i) => (
                        <span key={i} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm text-neutral-200">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Instructions</h3>
                    <ol className="space-y-4">
                      {recipe.steps.map((step, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs font-bold border border-orange-500/20">
                            {i + 1}
                          </span>
                          <p className="text-neutral-300 text-sm leading-relaxed">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                  
                  {recipe.tips && recipe.tips.length > 0 && (
                    <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1 text-orange-400">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-bold text-xs uppercase">Chef's Secret</span>
                      </div>
                      <p className="text-orange-200/70 text-xs italic">"{recipe.tips[0]}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center p-6">
              {mode === "text" && (
                <div className="w-full max-w-md animate-in zoom-in-95 fade-in">
                  <div className="bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-1 shadow-2xl">
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Décris ta recette idéale... (ex: Lasagne maison, Burger smash...)"
                      className="w-full bg-transparent text-white p-6 text-lg placeholder:text-neutral-600 outline-none resize-none h-48 rounded-2xl"
                      autoFocus
                    />
                    <div className="flex justify-between items-center p-3 border-t border-white/5 bg-black/20 rounded-b-2xl">
                      <button onClick={voice.startListening}
                        className={clsx("p-3 rounded-full transition-all",
                          voice.isListening ? "bg-red-500 text-white animate-pulse" : "text-neutral-400 hover:text-white hover:bg-white/10")}>
                        {voice.isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                      <button onClick={handleGenerate} disabled={!textInput.trim() || loading}
                        className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-neutral-200 transition disabled:opacity-50 flex items-center gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Cook
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {mode === "scan" && !camera.capturedImage && !camera.error && (
                <div className="mt-auto pb-32 text-center space-y-1 drop-shadow-lg">
                  <p className="text-white/80 font-medium text-lg">Pointe vers tes ingrédients</p>
                  <p className="text-white/50 text-sm">ou dis-moi ce que tu veux cuisiner</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-center text-sm pointer-events-auto animate-in slide-in-from-bottom-4">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">Fermer</button>
          </div>
        )}

        {/* SCAN CONTROLS */}
        {!recipe && mode === "scan" && !camera.error && (
          <div className="p-8 pb-12 flex justify-center items-center gap-10 pointer-events-auto bg-gradient-to-t from-black via-black/80 to-transparent">
            {camera.capturedImage && (
              <button onClick={() => { camera.clearCapture(); camera.startCamera(); voice.resetTranscript(); }}
                className="p-4 rounded-full bg-neutral-800/80 text-white backdrop-blur-md hover:bg-neutral-700 transition">
                <RefreshCcw className="w-6 h-6" />
              </button>
            )}

            {loading ? (
              <div className="w-20 h-20 rounded-full border-4 border-white/20 border-t-orange-500 animate-spin" />
            ) : camera.capturedImage ? (
              <button onClick={handleGenerate}
                className="w-20 h-20 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:scale-105 transition active:scale-95">
                <Utensils className="w-8 h-8" />
              </button>
            ) : (
              <button onClick={camera.capturePhoto}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 hover:bg-white/20 transition active:scale-95">
                <div className="w-16 h-16 rounded-full bg-white" />
              </button>
            )}

            {!camera.capturedImage && (
              <button onClick={voice.startListening}
                className={clsx("p-4 rounded-full backdrop-blur-md transition",
                  voice.isListening ? "bg-red-500 text-white animate-pulse" : "bg-neutral-800/80 text-white hover:bg-neutral-700")}>
                {voice.isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
// rebuild Fri Feb 20 16:38:22 EST 2026
