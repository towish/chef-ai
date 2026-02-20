import { ChefHat, Sparkles, Camera, Mic, TrendingDown } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About — ChefAI",
  description: "Learn about ChefAI, your AI-powered kitchen assistant.",
};

const features = [
  {
    icon: Camera,
    title: "Scan & Cook",
    description: "Point your camera at ingredients and get instant recipe suggestions.",
  },
  {
    icon: Mic,
    title: "Voice Control",
    description: "Talk to your AI sous-chef hands-free while you cook.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Recipes",
    description: "Get personalized recipes based on what you have, not what you need to buy.",
  },
  {
    icon: TrendingDown,
    title: "Price Hunter",
    description: "Compare grocery prices across stores to save money.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">Chef<span className="text-orange-500">AI</span></span>
        </Link>
        <Link href="/" className="text-sm text-white/60 hover:text-white transition">
          ← Back to Kitchen
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span className="text-orange-400 text-sm font-medium">AI-Powered Cooking</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Your Personal <span className="text-orange-500">AI Sous-Chef</span>
        </h1>
        
        <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
          ChefAI uses advanced multimodal AI to help you cook smarter. 
          Scan ingredients, get recipes, compare prices — all powered by Gemini AI.
        </p>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition"
            >
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-white/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Built With</h2>
          <div className="flex flex-wrap gap-3">
            {["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Gemini AI", "Turbopack"].map((tech) => (
              <span
                key={tech}
                className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-white/40 text-sm">
        <p>Made with 🧡 by DubzzGoat • OpenClaw Night Shift 2026</p>
      </footer>
    </div>
  );
}
