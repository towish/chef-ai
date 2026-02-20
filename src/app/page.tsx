"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { generateRecipe, type Recipe } from "./actions";
import { 
  ChefHat, 
  Camera, 
  Mic, 
  MicOff, 
  Loader2, 
  RefreshCcw, 
  Utensils, 
  X,
  Sparkles,
  AlignLeft,
  Scan,
  Keyboard
} from "lucide-react";
import clsx from "clsx";

export default function Home() {
  const [mode, setMode] = useState<"scan" | "text">("scan");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Initialize Camera (Only in Scan Mode)
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function initCamera() {
      if (mode !== "scan" || capturedImage || recipe) return;

      try {
        currentStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" }, 
          audio: false 
        });
        setStream(currentStream);
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
        setCameraError(null);
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError("Camera access denied.");
      }
    }

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode, capturedImage, recipe]);

  // Voice Recognition
  const toggleListening = useCallback(() => {
    // ... (Garder la logique existante)
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice recognition not supported.");
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      if (mode === "text") {
        setTextInput(prev => prev + " " + transcriptText);
      } else {
        setTranscript(transcriptText);
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, [isListening, mode]);

  // Capture Image
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(dataUrl);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setRecipe(null);
    setError(null);
    setTranscript("");
  };

  // Submit Logic
  const handleGenerate = async () => {
    if (mode === "scan" && !capturedImage && !transcript) return;
    if (mode === "text" && !textInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      if (mode === "text") {
        formData.append("type", "text");
        formData.append("content", textInput);
      } else {
        formData.append("type", "multimodal");
        formData.append("content", transcript);
        if (capturedImage) {
          const response = await fetch(capturedImage);
          const blob = await response.blob();
          formData.append("image", blob, "capture.jpg");
        }
      }

      const res = await generateRecipe(formData);

      if (res.success && res.data) {
        setRecipe(res.data);
      } else {
        setError(res.error || "Failed to generate recipe.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setRecipe(null);
    setCapturedImage(null);
    setTranscript("");
    setTextInput("");
    setError(null);
  };

  return (
    <main className="fixed inset-0 bg-black text-white overflow-hidden flex flex-col font-sans">
      <canvas ref={canvasRef} className="hidden" />

      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        {mode === "scan" ? (
          !capturedImage ? (
            <>
              {cameraError ? (
                <div className="flex items-center justify-center h-full bg-neutral-900 text-neutral-500">
                  <p>{cameraError}</p>
                </div>
              ) : (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              )}
              {/* Viewfinder */}
              <div className="absolute inset-0 border-[20px] border-black/40 pointer-events-none">
                <div className="w-full h-full border border-white/10 relative">
                  <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-orange-500/80 rounded-tr-3xl"></div>
                  <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-orange-500/80 rounded-bl-3xl"></div>
                </div>
              </div>
            </>
          ) : (
            <div className="relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover blur-sm opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
            </div>
          )
        ) : (
          // Text Mode Background
          <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
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

          {/* MODE SWITCHER */}
          {!recipe && (
            <div className="flex bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-1">
              <button 
                onClick={() => setMode("scan")}
                className={clsx(
                  "px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all",
                  mode === "scan" ? "bg-white text-black shadow-sm" : "text-neutral-400 hover:text-white"
                )}
              >
                <Scan className="w-3 h-3" /> Scan
              </button>
              <button 
                onClick={() => setMode("text")}
                className={clsx(
                  "px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all",
                  mode === "text" ? "bg-white text-black shadow-sm" : "text-neutral-400 hover:text-white"
                )}
              >
                <AlignLeft className="w-3 h-3" /> Text
              </button>
            </div>
          )}

          {recipe && (
             <button onClick={resetAll} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
               <X className="w-5 h-5" />
             </button>
          )}
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col pointer-events-auto overflow-y-auto">
          
          {recipe ? (
            // RECIPE DISPLAY
            <div className="p-4 md:p-8 max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-10 fade-in duration-500">
              <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-2xl md:text-3xl font-bold text-orange-500 mb-2">{recipe.title}</h2>
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
                   
                   {recipe.tips.length > 0 && (
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
            // EMPTY STATE / TEXT INPUT
            <div className="flex-1 flex flex-col justify-center items-center p-6">
              
              {mode === "text" && (
                <div className="w-full max-w-md animate-in zoom-in-95 fade-in duration-300">
                  <div className="bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-1 shadow-2xl">
                    <textarea
                      ref={textInputRef}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="What are you craving? (e.g. 'Spicy pasta with shrimp')"
                      className="w-full bg-transparent text-white p-6 text-lg md:text-xl placeholder:text-neutral-600 outline-none resize-none h-48 rounded-2xl"
                      autoFocus
                    />
                    <div className="flex justify-between items-center p-3 border-t border-white/5 bg-black/20 rounded-b-2xl">
                       <button 
                        onClick={toggleListening}
                        className={clsx(
                          "p-3 rounded-full transition-all",
                          isListening ? "bg-red-500 text-white" : "text-neutral-400 hover:text-white hover:bg-white/10"
                        )}
                       >
                         {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                       </button>
                       
                       <button
                         onClick={handleGenerate}
                         disabled={!textInput.trim() || loading}
                         className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                       >
                         {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                         Cook
                       </button>
                    </div>
                  </div>
                  <p className="text-center text-neutral-500 text-xs mt-6">
                    Tip: Be specific about flavors and dietary restrictions.
                  </p>
                </div>
              )}

              {/* SCAN MODE HINTS (Only visible when idle) */}
              {mode === "scan" && !capturedImage && (
                <div className="mt-auto pb-32 text-center space-y-1 drop-shadow-lg">
                  <p className="text-white/80 font-medium text-lg tracking-tight">Point at ingredients</p>
                  <p className="text-white/50 text-sm">or just say what you want</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER CONTROLS (SCAN MODE ONLY) */}
        {!recipe && mode === "scan" && (
          <div className="p-8 pb-12 flex justify-center items-center gap-10 pointer-events-auto bg-gradient-to-t from-black via-black/80 to-transparent">
             {/* Retake */}
             {(capturedImage || transcript) && (
                <button onClick={retakePhoto} className="p-4 rounded-full bg-neutral-800/80 text-white backdrop-blur-md hover:bg-neutral-700 transition">
                  <RefreshCcw className="w-6 h-6" />
                </button>
             )}

             {/* Shutter / Generate */}
             {loading ? (
               <div className="w-20 h-20 rounded-full border-4 border-white/20 border-t-orange-500 animate-spin" />
             ) : (
                capturedImage ? (
                  <button onClick={handleGenerate} className="w-20 h-20 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:scale-105 transition active:scale-95">
                    <Utensils className="w-8 h-8" />
                  </button>
                ) : (
                  <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 hover:bg-white/20 transition active:scale-95">
                    <div className="w-16 h-16 rounded-full bg-white" />
                  </button>
                )
             )}

             {/* Voice */}
             {!capturedImage && (
               <button onClick={toggleListening} className={clsx("p-4 rounded-full backdrop-blur-md transition", isListening ? "bg-red-500 text-white animate-pulse" : "bg-neutral-800/80 text-white hover:bg-neutral-700")}>
                 {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
               </button>
             )}
          </div>
        )}
      </div>
    </main>
  );
}
