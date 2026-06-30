import React from "react";
import { Sparkles } from "lucide-react";
import { CompanionId, CompanionAccessory } from "../types";

interface CompanionCustomizerProps {
  companion: CompanionId;
  setCompanion: (id: CompanionId) => void;
  accessory: CompanionAccessory;
  setAccessory: (id: CompanionAccessory) => void;
  setExpression: (expr: "idle" | "listening" | "thinking" | "happy" | "talking") => void;
}

export default function CompanionCustomizer({
  companion,
  setCompanion,
  accessory,
  setAccessory,
  setExpression
}: CompanionCustomizerProps) {
  
  const characters = [
    { id: "fox" as CompanionId, name: "Fox 🦊", blurb: "A clever, warm fox with a swishy tail." },
    { id: "cat" as CompanionId, name: "Cat 🐱", blurb: "A cool, curious cat with perky ears." },
    { id: "owl" as CompanionId, name: "Owl 🦉", blurb: "A wise night owl, great for focus." },
    { id: "robot" as CompanionId, name: "Robot 🤖", blurb: "A friendly service robot with antenna." },
    { id: "orb" as CompanionId, name: "AI Orb 🔮", blurb: "An abstract AI orb of pure energy." },
    { id: "ghost" as CompanionId, name: "Ghost 👻", blurb: "A cute, floaty ghost companion." },
    { id: "plant" as CompanionId, name: "Plant 🌱", blurb: "A calm plant that grows with focus." },
    { id: "drone" as CompanionId, name: "Drone 🛸", blurb: "A floating holographic helper drone." }
  ];

  const bios = [
    { id: "fox", text: "A clever, warm fox with a swishy tail. They will wag their tail and look around alertly when commands are sent." },
    { id: "cat", text: "A cool, curious cat with perky ears and fine whiskers. Enjoys listening to commands and wiggling their ears." },
    { id: "owl", text: "A wise night owl with expressive golden rings. Perfect for study, coding, and high-productivity sessions." },
    { id: "robot", text: "A friendly service robot with neon ears and antennas. Their screen layout communicates dynamic statuses." },
    { id: "orb", text: "An abstract AI orb of pure energy with orbiting satellite rings. Pulsates and glows dynamically based on connection latency." },
    { id: "ghost", text: "A cute, floating ghost companion that bobs up and down gently. Keeps your screen layout feeling cozy and magical." },
    { id: "plant", text: "A calm little plant growing in a terracotta pot. It responds silently with cute, leaf-fluttering interactions." },
    { id: "drone", text: "A floating holographic helper drone with rotating propellers. Perfect for futuristic sci-fi aesthetic enthusiasts." }
  ];

  const accessories = [
    { id: "none" as CompanionAccessory, name: "None ❌" },
    { id: "glasses" as CompanionAccessory, name: "Glasses 👓" },
    { id: "hat" as CompanionAccessory, name: "Fedora 🎩" },
    { id: "bowtie" as CompanionAccessory, name: "Bowtie 🎀" },
    { id: "headphones" as CompanionAccessory, name: "Headphones 🎧" },
    { id: "crown" as CompanionAccessory, name: "Crown 👑" }
  ];

  const handleCharSelect = (id: CompanionId) => {
    setCompanion(id);
    setExpression("happy");
    setTimeout(() => setExpression("idle"), 1500);
  };

  const handleAccessorySelect = (id: CompanionAccessory) => {
    setAccessory(id);
    setExpression("happy");
    setTimeout(() => setExpression("idle"), 1500);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <div className="p-2 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 text-sky-400 border border-sky-500/20 rounded-xl">
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-base text-slate-100">
            EV-Companion Customizer
          </h3>
          <p className="text-xs text-slate-400">Choose your digital AI companion animal, sci-fi orb, or robot and accessorize.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Character Selection Cards */}
        <div className="md:col-span-8 space-y-3">
          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Select Active Companion</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {characters.map((char) => (
              <button
                key={char.id}
                onClick={() => handleCharSelect(char.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  companion === char.id
                    ? "bg-gradient-to-b from-sky-500/10 to-indigo-500/5 border-sky-500/50 shadow-[0_0_12px_rgba(56,189,248,0.15)] scale-[1.02]"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80"
                }`}
                title={char.blurb}
              >
                <span className="text-sm font-semibold text-slate-100">{char.name}</span>
                <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-wider">
                  {companion === char.id ? "ACTIVE" : "SELECT"}
                </span>
              </button>
            ))}
          </div>
          
          {/* Selected Companion Detail Info */}
          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Companion Bio:</span>{" "}
            {bios.find((b) => b.id === companion)?.text}
          </div>
        </div>

        {/* Right Column: Accessory Selection */}
        <div className="md:col-span-4 space-y-3">
          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Accessorize Your Companion</span>
          <div className="grid grid-cols-2 gap-2">
            {accessories.map((acc) => (
              <button
                key={acc.id}
                onClick={() => handleAccessorySelect(acc.id)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  accessory === acc.id
                    ? "bg-gradient-to-b from-purple-500/10 to-indigo-500/5 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80"
                }`}
              >
                <span className="text-xs font-semibold text-slate-200">{acc.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
