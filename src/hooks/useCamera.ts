"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface UseCameraOptions {
  onError?: (error: string) => void;
}

export function useCamera(options?: UseCameraOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Check availability
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsAvailable(false);
      setError("Camera API not supported");
    } else {
      setIsAvailable(true);
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!isAvailable) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err: any) {
      let message = "Camera unavailable";
      if (err.name === "NotFoundError") message = "No camera found";
      else if (err.name === "NotAllowedError") message = "Camera permission denied";
      setError(message);
      options?.onError?.(message);
    }
  }, [isAvailable, options]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
        return dataUrl;
      }
    }
    return null;
  }, [stopCamera]);

  // Clear capture
  const clearCapture = useCallback(() => {
    setCapturedImage(null);
  }, []);

  // Load from file
  const loadFromFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    stream,
    capturedImage,
    error,
    isAvailable,
    startCamera,
    stopCamera,
    capturePhoto,
    clearCapture,
    loadFromFile,
  };
}
