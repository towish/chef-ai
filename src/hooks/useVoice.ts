"use client";

import { useState, useCallback } from "react";

interface UseVoiceOptions {
  onResult?: (transcript: string) => void;
  lang?: string;
}

export function useVoice(options?: UseVoiceOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);

  const startListening = useCallback(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = options?.lang || "fr-CA";

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);
      options?.onResult?.(text);
    };

    recognition.onerror = (event: any) => {
      console.error("Voice error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  }, [options]);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
