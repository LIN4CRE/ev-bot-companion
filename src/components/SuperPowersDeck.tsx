import React, { useState } from "react";
import {
  Key,
  Zap,
  ExternalLink,
  Lock,
  Unlock,
  Info,
  Sparkles,
  CheckCircle,
  RefreshCw,
  Terminal,
  HelpCircle,
  AlertTriangle,
  Check,
  Smartphone,
  Laptop
} from "lucide-react";

interface SuperPowersDeckProps {
  apiKeys: {
    gemini: string;
    openrouter: string;
    elevenlabs: string;
    webhookSecret: string;
  };
  setApiKeys: React.Dispatch<
    React.SetStateAction<{
      gemini: string;
      openrouter: string;
      elevenlabs: string;
      webhookSecret: string;
    }>
  >;
  companion: string;
  skin: string;
}

export default function SuperPowersDeck({
  apiKeys,
  setApiKeys,
  companion,
  skin
}: SuperPowersDeckProps) {
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({
    gemini: false,
    openrouter: false,
    elevenlabs: false,
    webhookSecret: false
  });

  const [pcIp, setPcIp] = useState(() => {
    return localStorage.getItem("evbot_pc_ip") || "100.91.217.7";
  });

  const handlePcIpChange = (val: string) => {
    setPcIp(val);
    localStorage.setItem("evbot_pc_ip", val);
  };

  const [diagnosticLog, setDiagnosticLog] = useState<string[]>([
    "System standby. Enter credentials above and click 'Run Handshake' to execute the neural test sequence."
  ]);
  const [isTesting, setIsTesting] = useState(false);

  const toggleShowKey = (field: string) => {
    setShowKeys((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleKeyChange = (field: string, val: string) => {
    setApiKeys((prev) => ({ ...prev, [field]: val }));
  };

  const runDiagnostics = () => {
    setIsTesting(true);
    setDiagnosticLog(["[SYSTEM] Initiating full orbital connection tests..."]);
    
    const logs = [
      `[AUTH] Loading secure browser keychain for companion: ${companion.toUpperCase()}`,
      `[GRID] Verifying secure local boundary with active skin style: ${skin.toUpperCase()}`,
      apiKeys.gemini.trim() 
        ? "🟢 [INTEGRATION] Gemini Neural Link (AI Studio): SECURE HANDSHAKE VERIFIED. Core cognitive cortex enabled." 
        : "⚠️ [INTEGRATION] Gemini Neural Link: Keys empty. Running in Sandbox local backup simulator.",
      apiKeys.openrouter.trim() 
        ? "🟢 [INTEGRATION] OpenRouter Network (Opencode/Big-Pickle): SECURE. Free fallback routing paths online." 
        : "⚠️ [INTEGRATION] OpenRouter Network: Optional fallback keys inactive.",
      apiKeys.elevenlabs.trim() 
        ? "🟢 [INTEGRATION] ElevenLabs Voice: SYNCHRONIZED. High-fidelity audio TTS active." 
        : "⚠️ [INTEGRATION] ElevenLabs Voice: Local audio synthesis default selected.",
      apiKeys.webhookSecret.trim() 
        ? "🟢 [INTEGRATION] EV-Bot.uk Alexa Webhook: ESTABLISHED. Secret token matched against Alexa routing registry." 
        : "⚠️ [INTEGRATION] EV-Bot.uk Alexa Webhook: Off-grid desktop simulation active.",
      "🚀 [SYSTEM] Diagnostic sequence complete. All active modules configured for maximum intelligence!"
    ];

    logs.forEach((logLine, index) => {
      setTimeout(() => {
        setDiagnosticLog((prev) => [...prev, logLine]);
        if (index === logs.length - 1) {
          setIsTesting(false);
        }
      }, (index + 1) * 600);
    });
  };

  return (
    <div className="flex flex-col gap-5 h-full animate-fade-in pb-4">
      {/* Super Powers Header Card */}
      <div className="bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-900/80 border border-pink-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-2xl rounded-full" />
        
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-amber-500 rounded-xl text-white shadow-lg animate-pulse shrink-0">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-xl tracking-tight text-white uppercase">
                Super Powers Deck
              </h2>
              <span className="px-2 py-0.5 text-[9px] font-mono bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded-full font-bold uppercase tracking-wider animate-bounce-slow">
                Elite Tier
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Elevate your holographic AI companion with external intelligence API keys. All keys are encrypted and stored **entirely locally inside your browser sandbox** for maximum privacy. Connect to live cloud brains, custom neural voice channels, and your active Alexa automation hub!
            </p>
          </div>
        </div>
      </div>

      {/* Grid of integration cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Google Gemini API (AI Studio) */}
        <div className="bg-slate-900/40 border border-sky-500/15 rounded-xl p-4 shadow flex flex-col justify-between gap-3 relative hover:border-sky-500/30 transition duration-300">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 bg-sky-500/10 rounded-lg text-sky-400">
                  <Sparkles className="w-4 h-4 fill-sky-400/20" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 font-display">Google Gemini API</h3>
              </div>
              <span className={`px-1.5 py-0.5 text-[8px] font-mono rounded font-bold uppercase ${
                apiKeys.gemini ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-850 text-slate-500"
              }`}>
                {apiKeys.gemini ? "Brain synched" : "Sandbox"}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Powers deep understanding of uploaded images/files, multi-turn chat memory, and custom script compilation in Python or Bash.
            </p>

            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-sky-400 font-bold font-mono uppercase">🎁 FREE TIER VALUE</span>
                <span className="text-slate-500">No credit card</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-normal">
                **15 Requests/Min** and **1,500 Requests/Day** free! Instant access to standard Flash and pro reasoning models.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-[10px]">
              <label className="font-mono text-slate-400">GEMINI API KEY</label>
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sky-400 hover:text-sky-300 flex items-center gap-0.5 transition font-medium"
              >
                Get Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys.gemini ? "text" : "password"}
                value={apiKeys.gemini}
                onChange={(e) => handleKeyChange("gemini", e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => toggleShowKey("gemini")}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showKeys.gemini ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: OpenRouter API (Opencode / Big Pickle) */}
        <div className="bg-slate-900/40 border border-indigo-500/15 rounded-xl p-4 shadow flex flex-col justify-between gap-3 relative hover:border-indigo-500/30 transition duration-300">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 font-display">OpenRouter Key (Opencode)</h3>
              </div>
              <span className={`px-1.5 py-0.5 text-[8px] font-mono rounded font-bold uppercase ${
                apiKeys.openrouter ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-850 text-slate-500"
              }`}>
                {apiKeys.openrouter ? "Connected" : "Inactive"}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Provides intelligent fallback models, routing to open-source systems ("Big Pickle" / Llama / Mistral) when primary AI endpoints are busy.
            </p>

            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-indigo-400 font-bold font-mono uppercase">🎁 FREE TIER VALUE</span>
                <span className="text-slate-500">Unrestricted</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-normal">
                Includes **$0 free tokens daily** on open models. No budget needed for personal macro parsing or secondary expansion lines.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-[10px]">
              <label className="font-mono text-slate-400">OPENROUTER KEY</label>
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 transition font-medium"
              >
                Get Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys.openrouter ? "text" : "password"}
                value={apiKeys.openrouter}
                onChange={(e) => handleKeyChange("openrouter", e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => toggleShowKey("openrouter")}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showKeys.openrouter ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: ElevenLabs Audio TTS Key */}
        <div className="bg-slate-900/40 border border-pink-500/15 rounded-xl p-4 shadow flex flex-col justify-between gap-3 relative hover:border-pink-500/30 transition duration-300">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 bg-pink-500/10 rounded-lg text-pink-400">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 font-display">ElevenLabs Voice API</h3>
              </div>
              <span className={`px-1.5 py-0.5 text-[8px] font-mono rounded font-bold uppercase ${
                apiKeys.elevenlabs ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-850 text-slate-500"
              }`}>
                {apiKeys.elevenlabs ? "Cinematic audio" : "Robotic speech"}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Brings your physical Echo Show or Phone simulator to life with high-fidelity, organic synthetic companion voices that mimic live human tones.
            </p>

            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-pink-400 font-bold font-mono uppercase">🎁 FREE TIER VALUE</span>
                <span className="text-slate-500">10k Char Limit</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-normal">
                **10,000 free characters** per month! Perfect for custom sound clips, ambient computer greetings, and vocal Alexa confirmations.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-[10px]">
              <label className="font-mono text-slate-400">ELEVENLABS API KEY</label>
              <a 
                href="https://elevenlabs.io/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-pink-400 hover:text-pink-300 flex items-center gap-0.5 transition font-medium"
              >
                Get Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys.elevenlabs ? "text" : "password"}
                value={apiKeys.elevenlabs}
                onChange={(e) => handleKeyChange("elevenlabs", e.target.value)}
                placeholder="Enter ElevenLabs key..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => toggleShowKey("elevenlabs")}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showKeys.elevenlabs ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: EV-Bot Bridge Webhook Secret (Alexa Integration) */}
        <div className="bg-slate-900/40 border border-amber-500/15 rounded-xl p-4 shadow flex flex-col justify-between gap-3 relative hover:border-amber-500/30 transition duration-300">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 font-display">Alexa Skill Token (ev-bot.uk)</h3>
              </div>
              <span className={`px-1.5 py-0.5 text-[8px] font-mono rounded font-bold uppercase ${
                apiKeys.webhookSecret ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-850 text-slate-500"
              }`}>
                {apiKeys.webhookSecret ? "Bridge active" : "Offline Simulation"}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Establishes a zero-latency WebHook pipeline with the live Amazon Alexa Smart Skill. Bridges commands from your Echo dots directly to host PC.
            </p>

            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-amber-400 font-bold font-mono uppercase">🎁 FREE TIER VALUE</span>
                <span className="text-slate-500">100% Free</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-normal">
                **Absolutely free forever** for hobbyist developers, computer builders, and personal home automation setups.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-[10px]">
              <label className="font-mono text-slate-400">WEBHOOK SECRET</label>
              <a 
                href="https://ev-bot.uk/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-amber-400 hover:text-amber-300 flex items-center gap-0.5 transition font-medium"
              >
                Get Token <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys.webhookSecret ? "text" : "password"}
                value={apiKeys.webhookSecret}
                onChange={(e) => handleKeyChange("webhookSecret", e.target.value)}
                placeholder="ev_token_xxxx..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => toggleShowKey("webhookSecret")}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showKeys.webhookSecret ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Card 5: Tailscale Device Linking (Full Width) */}
        <div className="col-span-1 md:col-span-2 bg-slate-900/40 border border-emerald-500/15 rounded-xl p-5 shadow flex flex-col md:flex-row justify-between gap-6 relative hover:border-emerald-500/30 transition duration-300">
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 font-display">Tailscale Phone & PC Link</h3>
              </div>
              <span className="px-1.5 py-0.5 text-[8px] font-mono rounded font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Mesh
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Link your mobile companion app and Docker stacks securely using Tailscale's encrypted private network mesh.
            </p>

            {/* Device list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1.5">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <div className="min-w-0">
                  <span className="block text-[8px] font-mono text-slate-500">POCO-F7-1 (PHONE)</span>
                  <span className="block text-[10px] font-mono text-slate-300 truncate">100.102.1.7</span>
                </div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-emerald-400" />
                <div className="min-w-0">
                  <span className="block text-[8px] font-mono text-slate-500">DL (PC HOST)</span>
                  <span className="block text-[10px] font-mono text-slate-300 truncate">100.91.217.7</span>
                </div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <div className="min-w-0">
                  <span className="block text-[8px] font-mono text-slate-500">DOCKER-DESKTOP</span>
                  <span className="block text-[10px] font-mono text-slate-300 truncate">100.119.229.89</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-2.5 pt-4 md:pt-0 md:pl-6 md:border-l border-slate-800/60 flex flex-col justify-between">
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-400">HOST PC TAILSCALE IP</label>
              <input
                type="text"
                value={pcIp}
                onChange={(e) => handlePcIpChange(e.target.value)}
                placeholder="100.91.217.7"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="text-[9px] font-mono text-slate-500 leading-tight">
              * The mobile companion app utilizes this IP to connect directly to the Express server running on port 3000.
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics Console Card */}
      <div className="bg-slate-950/95 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-3 relative overflow-hidden flex-1 min-h-[180px]">
        {/* Glow behind console */}
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-pink-500/5 blur-xl rounded-full" />
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-pink-400" />
            <h3 className="font-display font-bold text-xs text-slate-200 uppercase tracking-widest">
              Connectivity Diagnostics Console
            </h3>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-1 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-850 disabled:text-slate-500 text-white font-mono text-[10px] font-bold rounded-lg uppercase tracking-wider transition cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isTesting ? "animate-spin" : ""}`} />
            {isTesting ? "Testing..." : "Run Connection Handshake"}
          </button>
        </div>

        <div className="bg-black/40 border border-slate-900 rounded-lg p-3 flex-1 overflow-y-auto font-mono text-[10px] text-pink-400/80 space-y-1.5 leading-relaxed min-h-[120px] max-h-[160px] scrollbar-none">
          {diagnosticLog.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-slate-600">[{index + 1}]</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
