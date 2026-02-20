export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        {/* Animated chef hat */}
        <div className="relative">
          <div className="w-16 h-16 bg-orange-500 rounded-xl animate-pulse-glow flex items-center justify-center">
            <span className="text-3xl">🍳</span>
          </div>
          <div className="absolute -inset-2 bg-orange-500/20 rounded-xl animate-ping" />
        </div>
        
        {/* Loading text */}
        <div className="text-white/60 text-sm animate-pulse">
          Preparing your recipe...
        </div>
      </div>
    </div>
  );
}
