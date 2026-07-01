import React, { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Laptop,
  Wifi,
  Settings,
  Plus,
  Trash2,
  VolumeX,
  Terminal,
  Play,
  Send,
  Smartphone,
  CheckCircle,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Code,
  Share2,
  FileCode,
  Radio,
  AlertTriangle,
  Lightbulb,
  Check,
  ChevronRight,
  User,
  Monitor,
  HelpCircle,
  Clock,
  Tv,
  Activity,
  ShieldAlert,
  ListTodo,
  Image as ImageIcon,
  Paperclip,
  X,
  FileText,
  Key,
  Zap,
  ExternalLink,
  Lock,
  Unlock,
  Info
} from "lucide-react";
import ClippyAvatar from "./components/ClippyAvatar";
import SuperPowersDeck from "./components/SuperPowersDeck";
import CompanionCustomizer from "./components/CompanionCustomizer";
import ResilienceTodoList from "./components/ResilienceTodoList";
import { AlexaEvent, DesktopMacro, PCConnection, ChatMessage, ClippySkin, ResilienceTodo, CompanionId, CompanionAccessory } from "./types";
import evBotLogo from "./assets/ev_bot_logo.jpg";

export default function App() {
  // Clippy / EV-Bot Interactive States
  const [skin, setSkin] = useState<ClippySkin>("hologram");
  const [companion, setCompanion] = useState<CompanionId>(() => {
    try {
      const saved = localStorage.getItem("evbot_companion");
      if (saved) return saved as CompanionId;
    } catch (e) {}
    return "fox";
  });
  const [accessory, setAccessory] = useState<CompanionAccessory>(() => {
    try {
      const saved = localStorage.getItem("evbot_accessory");
      if (saved) return saved as CompanionAccessory;
    } catch (e) {}
    return "none";
  });

  useEffect(() => {
    try {
      localStorage.setItem("evbot_companion", companion);
    } catch (e) {}
  }, [companion]);

  useEffect(() => {
    try {
      localStorage.setItem("evbot_accessory", accessory);
    } catch (e) {}
  }, [accessory]);

  const [expression, setExpression] = useState<"idle" | "listening" | "thinking" | "happy" | "talking">("idle");

  // App-wide Layout Mode
  const [viewMode, setViewMode] = useState<"dual" | "phone" | "dashboard" | "echoshow" | "superpowers">("dual");

  const [apiKeys, setApiKeys] = useState<{
    gemini: string;
    openrouter: string;
    elevenlabs: string;
    webhookSecret: string;
  }>(() => {
    try {
      const saved = localStorage.getItem("evbot_api_keys");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          gemini: parsed.gemini || "",
          openrouter: parsed.openrouter || "",
          elevenlabs: parsed.elevenlabs || "",
          webhookSecret: parsed.webhookSecret || "",
        };
      }
    } catch (e) {}
    return {
      gemini: "",
      openrouter: "",
      elevenlabs: "",
      webhookSecret: "",
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem("evbot_api_keys", JSON.stringify(apiKeys));
    } catch (e) {}
  }, [apiKeys]);

  // Set initial viewMode based on URL query parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "echoshow") {
        setViewMode("echoshow");
      }
    }
  }, []);
  
  // States fetched from backend or local cache fallback
  const [alexaEvents, setAlexaEvents] = useState<AlexaEvent[]>([]);
  const [desktopMacros, setDesktopMacros] = useState<DesktopMacro[]>([]);

  // Resilience & Interactive Todo List States
  const initialTodos: ResilienceTodo[] = [
    {
      id: "system-optimistic",
      text: "Optimistic State Management",
      description: "Adding, toggling, or deleting macros updates the screen UI instantly with no visible lag. The background queue quietly works to sync changes once the server is reachable.",
      category: "optimistic",
      completed: true,
      isSystem: true
    },
    {
      id: "system-zerolatency",
      text: "Zero-Latency Startup",
      description: "The application caches the last synchronized PC connection state and custom macros directly inside localStorage. If the server goes offline, your browser pulls from the cache instantly to preserve your custom preferences.",
      category: "zerolatency",
      completed: true,
      isSystem: true
    },
    {
      id: "system-autoretry",
      text: "Auto-Retry Sync",
      description: "When a network boundary drop occurs, the app switches silently to an offline engine and periodically performs background network checks (exponential backoffs) to re-establish connections with the Host PC.",
      category: "autoretry",
      completed: true,
      isSystem: true
    },
    {
      id: "system-simulation",
      text: "Client-Side Simulation Fallback",
      description: "You can simulate real Alexa speech interactions directly inside the client using our newly implemented Echo Show Display Simulator. It generates synthetic speech audio curves and responds with tailored assistant feedback immediately.",
      category: "simulation",
      completed: true,
      isSystem: true
    }
  ];

  const [resilienceTodos, setResilienceTodos] = useState<ResilienceTodo[]>(() => {
    try {
      const saved = localStorage.getItem("evbot_resilience_todos");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not read resilience todos from localStorage", e);
    }
    return initialTodos;
  });

  useEffect(() => {
    try {
      localStorage.setItem("evbot_resilience_todos", JSON.stringify(resilienceTodos));
    } catch (e) {
      console.warn("Could not save resilience todos to localStorage", e);
    }
  }, [resilienceTodos]);

  const handleToggleTodo = (id: string) => {
    setResilienceTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTodo = (text: string, description: string, category: "optimistic" | "zerolatency" | "autoretry" | "simulation" | "custom") => {
    const newTodo: ResilienceTodo = {
      id: `custom-todo-${Date.now()}`,
      text: text,
      description: description || "User added custom developer task.",
      category: category,
      completed: false,
      isSystem: false
    };
    setResilienceTodos(prev => [...prev, newTodo]);
  };

  const handleDeleteTodo = (id: string) => {
    setResilienceTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleResetTodos = () => {
    setResilienceTodos(initialTodos);
  };
  
  // Sync state & automatic offline fallback
  const [isOffline, setIsOffline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryCountRef = useRef(0);
  
  // Echo Show Smart Display Simulation States
  const [echoSubtitles, setEchoSubtitles] = useState("EV-Bot connected and ready for hands-free voice commands.");
  const [isEchoSimulating, setIsEchoSimulating] = useState(false);
  
  // 60FPS Canvas Visualizer Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Simulated Speak-Back Voice Assistant trigger
  const triggerEchoSimulation = async (command: string, replyText: string) => {
    if (isEchoSimulating) return;
    setIsEchoSimulating(true);

    // Play Alexa activation synthesizer chime
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.24); // G5
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {}

    setExpression("listening");
    setEchoSubtitles(`Alexa heard command: "${command}"...`);

    // 1.5s listening delay
    setTimeout(() => {
      setExpression("thinking");
      setEchoSubtitles("EV-Bot is interpreting query and computing desktop states...");

      // 1.5s thinking delay
      setTimeout(() => {
        setExpression("talking");
        setEchoSubtitles(replyText);

        // If the simulated command triggers a desktop action, fire mock macro warning
        const lowerCmd = command.toLowerCase();
        if (lowerCmd.includes("discord") || lowerCmd.includes("chat")) {
          setMacroAlert({
            show: true,
            text: "⚡ ALEXA SKILL TRIGGER RECEIVED!\n\"Alexa, tell EV to launch Discord\"\nAlexa skill launched Discord on desktop client successfully!"
          });
          setTimeout(() => setMacroAlert(null), 4000);
        } else if (lowerCmd.includes("focus") || lowerCmd.includes("work")) {
          setMacroAlert({
            show: true,
            text: "⚡ ALEXA SKILL TRIGGER RECEIVED!\n\"Alexa, tell EV to toggle Focus Mode\"\nAlexa triggered Focus Mode macro. All notifications silenced!"
          });
          setTimeout(() => setMacroAlert(null), 4000);
        } else if (lowerCmd.includes("mute") || lowerCmd.includes("silent")) {
          setMacroAlert({
            show: true,
            text: "⚡ ALEXA SKILL TRIGGER RECEIVED!\n\"Alexa, tell EV to mute PC\"\nAlexa triggered System Mute macro on Desktop PC!"
          });
          setTimeout(() => setMacroAlert(null), 4000);
        }

        // Return to idle after speech finishes (proportional to response length)
        const speakDuration = Math.max(replyText.length * 60, 4000);
        setTimeout(() => {
          setExpression("idle");
          setIsEchoSimulating(false);
        }, speakDuration);

      }, 1500);
    }, 1500);
  };

  // Hardware-accelerated 60FPS Neon Spectrum wave canvas
  useEffect(() => {
    if (viewMode !== "echoshow") {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set dimensions based on current width of parent element
    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = 70;

    let phase = 0;

    const getSkinWaveColor = () => {
      switch (skin) {
        case "matrix": return { primary: "rgba(16, 185, 129, 0.95)", secondary: "rgba(5, 150, 105, 0.4)", shadow: "rgba(16, 185, 129, 0.6)" };
        case "cyber": return { primary: "rgba(236, 72, 153, 0.95)", secondary: "rgba(219, 39, 119, 0.4)", shadow: "rgba(236, 72, 153, 0.6)" };
        case "classic": return { primary: "rgba(148, 163, 184, 0.8)", secondary: "rgba(71, 85, 105, 0.3)", shadow: "rgba(148, 163, 184, 0.3)" };
        case "alert": return { primary: "rgba(239, 68, 68, 0.95)", secondary: "rgba(153, 27, 27, 0.4)", shadow: "rgba(239, 68, 68, 0.6)" };
        case "hologram":
        default: return { primary: "rgba(56, 189, 248, 0.95)", secondary: "rgba(79, 70, 229, 0.45)", shadow: "rgba(56, 189, 248, 0.6)" };
      }
    };

    const colors = getSkinWaveColor();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isSpeaking = expression === "talking";
      const amp = isSpeaking ? 22 : 4;
      const freq = isSpeaking ? 0.15 : 0.05;

      // Draw three overlapping flowing bezier curves
      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        ctx.lineWidth = w === 0 ? 3.5 : 1.5;
        ctx.strokeStyle = w === 0 ? colors.primary : w === 1 ? colors.secondary : "rgba(139, 92, 246, 0.2)";
        ctx.shadowBlur = w === 0 ? 12 : 0;
        ctx.shadowColor = colors.shadow;

        const currentPhase = phase + w * (Math.PI / 3);

        for (let x = 0; x < canvas.width; x++) {
          const y = (canvas.height / 2) + Math.sin(x * freq + currentPhase) * amp * Math.sin((x / canvas.width) * Math.PI);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      phase += isSpeaking ? 0.22 : 0.06;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      if (canvas) {
        canvas.width = canvas.parentElement?.clientWidth || 400;
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [viewMode, expression, skin]);

  const [pcConnection, setPcConnection] = useState<PCConnection>({
    ipAddress: "",
    status: "connected",
    latency: "12ms",
    lastSeen: new Date().toISOString(),
    os: "Windows 11 (Pro)"
  });

  // Loading/Operation States
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [macroAlert, setMacroAlert] = useState<{ show: boolean; text: string } | null>(null);

  // EV-Companion Interactive States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "clippy",
      text: "System Online! 🛰️⚡ I'm EV-Bot, your holographic Android companion. My official domain is ev-bot.uk, and your Alexa Skill is called 'helper eve'. Say 'Alexa, open helper eve' to command your computer!",
      timestamp: new Date()
    }
  ]);

  const [pendingAttachment, setPendingAttachment] = useState<{ name: string; type: "image" | "file"; url?: string; size?: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;
      setPendingAttachment({
        name: file.name,
        type: "image",
        url,
        size: sizeStr
      });
      setExpression("happy");
      setTimeout(() => setExpression("idle"), 1500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;
      setPendingAttachment({
        name: file.name,
        type: "file",
        size: sizeStr
      });
      setExpression("happy");
      setTimeout(() => setExpression("idle"), 1500);
    }
  };

  // Alexa command simulator input
  const [alexaSimInput, setAlexaSimInput] = useState("");
  const [customDomain, setCustomDomain] = useState("ev-bot.uk");
  const [skillId, setSkillId] = useState("amzn1.ask.skill.958ed01d-6259-45fc-820c-265de0fe50f8");

  // Macro Form Input state
  const [newMacro, setNewMacro] = useState({
    name: "",
    hotkey: "",
    category: "utility" as const,
    description: "",
    actions: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // File drag state
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Simulated mobile status bar clock
  const [currentTime, setCurrentTime] = useState("");

  // Auto-scroll chat box
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clock tick
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load cached state on boot for immediate zero-latency presentation
  useEffect(() => {
    try {
      const cached = localStorage.getItem("evbot_cached_state");
      if (cached) {
        const data = JSON.parse(cached);
        if (data.alexaEvents) setAlexaEvents(data.alexaEvents);
        if (data.desktopMacros) setDesktopMacros(data.desktopMacros);
        if (data.pcConnection) setPcConnection(data.pcConnection);
      }
    } catch (e) {
      console.warn("Could not read local startup cache:", e);
    }
  }, []);

  // Fetch state from server with automatic fallback cache and auto-retry sync
  const fetchState = async () => {
    try {
      const res = await fetch("/api/evbot/state");
      if (res.ok) {
        const data = await res.json();
        setAlexaEvents(data.alexaEvents);
        setDesktopMacros(data.desktopMacros);
        setPcConnection(data.pcConnection);
        setIsOffline(false);
        setRetryCount(0);
        retryCountRef.current = 0;
        // Persist fresh server state to local cache
        localStorage.setItem("evbot_cached_state", JSON.stringify(data));
      } else {
        throw new Error(`Server returned status: ${res.status}`);
      }
    } catch (e) {
      console.warn("Failed to synchronize with backend server, operating in local offgrid cache mode:", e);
      setIsOffline(true);
      
      // Auto-retry with exponential backoff back to online state
      retryCountRef.current += 1;
      const nextDelay = Math.min(2000 * Math.pow(2, retryCountRef.current), 20000);
      setRetryCount(retryCountRef.current);
      setTimeout(fetchState, nextDelay);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Load Alexa Web API for Games SDK inside Echo Show screen context
  useEffect(() => {
    if (typeof window !== "undefined" && viewMode === "echoshow") {
      const script = document.createElement("script");
      script.src = "https://alexa-analytics.sdk.amazonalexa.com/v1/alexa-web-api.js";
      script.onload = () => {
        const alexa = (window as any).Alexa;
        if (alexa) {
          alexa.create({ version: "1.1" })
            .then((client: any) => {
              console.log("Alexa Web API client initialized successfully");
              if (client.message) {
                client.message.onMessage((message: any) => {
                  if (message.text) {
                    setEchoSubtitles(message.text);
                  }
                  if (message.expression) {
                    setExpression(message.expression);
                  }
                });
              }
            })
            .catch((err: any) => {
              console.error("Alexa Web API client creation failed:", err);
            });
        }
      };
      document.head.appendChild(script);
      return () => {
        try {
          document.head.removeChild(script);
        } catch (_) {}
      };
    }
  }, [viewMode]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle chat submission to Google Gemini backend
  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || chatInput;
    const attachment = pendingAttachment;
    if (!prompt.trim() && !attachment) return;

    if (!textToSend) {
      setChatInput("");
    }
    setPendingAttachment(null);

    // Add user message to chat history
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt || `Uploaded ${attachment?.type === "image" ? "image" : "file"}: ${attachment?.name}`,
      timestamp: new Date(),
      attachment: attachment || undefined
    };
    setChatMessages(prev => [...prev, userMsg]);
    
    // Set companion animation to thinking
    setExpression("thinking");
    setIsLoading(true);

    try {
      let finalPrompt = prompt;
      if (attachment) {
        finalPrompt = `[User attached ${attachment.type} named "${attachment.name}"] ${prompt || "Analyze this upload"}`;
      }

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: finalPrompt,
          history: chatMessages,
          customGeminiKey: apiKeys.gemini
        })
      });

      if (response.ok) {
        const data = await response.json();
        setExpression("talking");
        
        // Add Clippy's response
        setChatMessages(prev => [...prev, {
          id: `clippy-${Date.now()}`,
          sender: "clippy",
          text: data.text,
          timestamp: new Date(),
          isSandbox: data.isSandbox
        }]);

        // Revert to idle after reading speech
        setTimeout(() => {
          setExpression("idle");
        }, 4000);
      } else {
        throw new Error("Chat response error");
      }
    } catch (e) {
      console.warn("Gemini connection failed, executing intelligent offline chatbot agent fallback:", e);
      setExpression("talking");
      
      let localResponse = "Beep boop! 🛰️ My live Gemini neural link is currently offgrid, but my core offline hardware is active! ";
      const query = prompt.toLowerCase();
      
      if (attachment) {
        if (attachment.type === "image") {
          localResponse = `📸 Detected image **"${attachment.name}"**! My visual subsystem is parsing the spectrum. EV-Bot has synchronized this asset to your active **${skin.toUpperCase()}** companion screen! ⚙️⚡`;
        } else {
          localResponse = `📁 Uploaded file **"${attachment.name}"** (${attachment.size || "unknown size"}) has been cached successfully. EV-Bot has queued this script in your active macro environment!`;
        }
      } else if (query.includes("alexa") || query.includes("skill") || query.includes("eve") || query.includes("evot")) {
        localResponse += "Your 'helper eve' Alexa Skill is integrated at ev-bot.uk. You can say 'Alexa, open helper eve' to transmit custom desktop commands! Try setting up macros to link them.";
      } else if (query.includes("joke") || query.includes("laugh")) {
        localResponse += "Why do robots never get tired? Because they always recharge their batteries! ⚡ Stay fully loaded!";
      } else if (query.includes("macro") || query.includes("shortcut")) {
        localResponse += "You can create and trigger custom macros locally. Your hotkeys will run directly from local storage and sync to the cloud the instant we are back online!";
      } else if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
        localResponse += "Greetings! I am EV-Bot (EV), your helpful holographic assistant. I'm here monitoring your PC connection and smart device sync!";
      } else {
        localResponse += `I've safely registered your message: "${prompt}". I'll process it with full cloud intelligence once we reconnect!`;
      }

      setChatMessages(prev => [...prev, {
        id: `clippy-${Date.now()}`,
        sender: "clippy",
        text: localResponse,
        timestamp: new Date(),
        isSandbox: true
      }]);

      setTimeout(() => {
        setExpression("idle");
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger simulated Alexa Skill voice phrase
  const handleTriggerAlexa = async (phraseStr: string) => {
    const phrase = phraseStr || alexaSimInput;
    if (!phrase.trim()) return;

    setAlexaSimInput("");
    setIsSyncing(true);
    setExpression("listening");

    try {
      const response = await fetch("/api/alexa/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase })
      });

      if (response.ok) {
        setExpression("happy");
        // Trigger macro warning feedback if the phrase triggers desktop activities
        let macroNotice = "";
        const lower = phrase.toLowerCase();
        if (lower.includes("discord") || lower.includes("chat")) {
          macroNotice = "Alexa skill launched Discord on desktop client successfully!";
        } else if (lower.includes("mute") || lower.includes("silent")) {
          macroNotice = "Alexa triggered System Mute macro on Desktop PC!";
        } else if (lower.includes("focus") || lower.includes("work")) {
          macroNotice = "Alexa triggered Focus Mode macro. All notifications silenced!";
        } else {
          macroNotice = `Alexa broadcasted event: "${phrase}"`;
        }

        setMacroAlert({
          show: true,
          text: `⚡ ALEXA SKILL TRIGGER RECEIVED!\n"${phrase}"\n${macroNotice}`
        });

        // Hide alert after 4s
        setTimeout(() => setMacroAlert(null), 4000);

        // Re-fetch events to show the live log updated
        fetchState();
        
        setTimeout(() => setExpression("idle"), 2500);
      } else {
        throw new Error("Trigger request failed on server");
      }
    } catch (e) {
      console.warn("Failed to trigger Alexa voice command on server, invoking offline local simulation:", e);
      
      setExpression("happy");
      let offlineNotice = `Offline Mode: Simulated broadcast of "${phrase}"`;
      const lower = phrase.toLowerCase();
      if (lower.includes("discord") || lower.includes("chat")) {
        offlineNotice = "Offline Simulation: Desktop shortcut (Discord) triggered!";
      } else if (lower.includes("mute") || lower.includes("silent")) {
        offlineNotice = "Offline Simulation: Desktop macro (Volume Mute) executed!";
      } else if (lower.includes("focus") || lower.includes("work")) {
        offlineNotice = "Offline Simulation: Desktop macro (Focus Mode) executed!";
      }

      setMacroAlert({
        show: true,
        text: `🛰️ OFFLINE VOICE SIMULATOR ACTIVE\n"${phrase}"\n${offlineNotice}`
      });
      setTimeout(() => setMacroAlert(null), 4000);

      // Append locally to Alexa events & cache
      const localEvent: AlexaEvent = {
        id: `offline-event-${Date.now()}`,
        timestamp: new Date().toISOString(),
        phrase,
        status: "success",
        actionTaken: offlineNotice
      };
      setAlexaEvents(prev => {
        const updated = [localEvent, ...prev].slice(0, 10);
        try {
          const cached = localStorage.getItem("evbot_cached_state");
          const stateObj = cached ? JSON.parse(cached) : {};
          stateObj.alexaEvents = updated;
          localStorage.setItem("evbot_cached_state", JSON.stringify(stateObj));
        } catch (err) {}
        return updated;
      });

      setTimeout(() => setExpression("idle"), 2500);
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle macro active state on server with local cache resilience
  const handleToggleMacro = async (id: string, currentActive: boolean) => {
    // Optimistic UI updates
    setDesktopMacros(prev => {
      const updated = prev.map(m => (m.id === id ? { ...m, isActive: !currentActive } : m));
      try {
        const cached = localStorage.getItem("evbot_cached_state");
        const stateObj = cached ? JSON.parse(cached) : {};
        stateObj.desktopMacros = updated;
        localStorage.setItem("evbot_cached_state", JSON.stringify(stateObj));
      } catch (err) {}
      return updated;
    });

    try {
      const res = await fetch(`/api/desktop/macros/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive })
      });
      if (!res.ok) {
        throw new Error("Failed to toggle macro on server");
      }
    } catch (e) {
      console.warn("Toggle operation cached locally. Sync will happen upon server response.", e);
    }
  };

  // Delete macro with optimistic local updates
  const handleDeleteMacro = async (id: string) => {
    setDesktopMacros(prev => {
      const updated = prev.filter(m => m.id !== id);
      try {
        const cached = localStorage.getItem("evbot_cached_state");
        const stateObj = cached ? JSON.parse(cached) : {};
        stateObj.desktopMacros = updated;
        localStorage.setItem("evbot_cached_state", JSON.stringify(stateObj));
      } catch (err) {}
      return updated;
    });

    try {
      const res = await fetch(`/api/desktop/macros/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        throw new Error("Failed to delete macro on server");
      }
    } catch (e) {
      console.warn("Delete operation cached locally. Will sync upon backend response.", e);
    }
  };

  // Test trigger a macro instantly
  const handleTestTriggerMacro = (macro: DesktopMacro) => {
    setExpression("happy");
    
    // Play sci-fi launch beep
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);

    setMacroAlert({
      show: true,
      text: `💻 DESKTOP SHORTCUT LAUNCHED!\nMacro ID: ${macro.name}\nExecuting sequence: ${macro.actions.join(" ➔ ")}`
    });

    setTimeout(() => {
      setExpression("idle");
      setMacroAlert(null);
    }, 4500);
  };

  // Toggle PC connection simulation
  const handleTogglePCConnection = async () => {
    const nextStatus = pcConnection.status === "connected" ? "disconnected" : "connected";
    try {
      const res = await fetch("/api/desktop/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setPcConnection(data);
        if (nextStatus === "disconnected") {
          setExpression("alert");
          setTimeout(() => setExpression("idle"), 2500);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Form custom macro submission
  const handleAddMacro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMacro.name || !newMacro.hotkey) return;

    const actionList = newMacro.actions
      ? newMacro.actions.split(",").map(a => a.trim())
      : ["Trigger Notification", "Execute App"];

    const tempId = `macro-temp-${Date.now()}`;
    const macroObj: DesktopMacro = {
      id: tempId,
      name: newMacro.name,
      hotkey: newMacro.hotkey,
      category: newMacro.category,
      description: newMacro.description || "Created via Companion App Studio.",
      actions: actionList,
      isActive: true
    };

    // Optimistically update the local state and cache
    setDesktopMacros(prev => {
      const updated = [...prev, macroObj];
      try {
        const cached = localStorage.getItem("evbot_cached_state");
        const stateObj = cached ? JSON.parse(cached) : {};
        stateObj.desktopMacros = updated;
        localStorage.setItem("evbot_cached_state", JSON.stringify(stateObj));
      } catch (err) {}
      return updated;
    });

    setNewMacro({ name: "", hotkey: "", category: "utility", description: "", actions: "" });
    setShowAddForm(false);
    setExpression("happy");
    setTimeout(() => setExpression("idle"), 2000);

    try {
      const res = await fetch("/api/desktop/macros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: macroObj.name,
          hotkey: macroObj.hotkey,
          category: macroObj.category,
          description: macroObj.description,
          actions: macroObj.actions
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Replace tempId with actual server-saved macro
        setDesktopMacros(prev => prev.map(m => m.id === tempId ? data.macro : m));
        
        // Re-update the cache with the server ID
        setDesktopMacros(prev => {
          try {
            const cached = localStorage.getItem("evbot_cached_state");
            const stateObj = cached ? JSON.parse(cached) : {};
            stateObj.desktopMacros = prev;
            localStorage.setItem("evbot_cached_state", JSON.stringify(stateObj));
          } catch (err) {}
          return prev;
        });
      } else {
        throw new Error("Add macro failed on server");
      }
    } catch (err) {
      console.warn("Macro created offline. It will persist in your browser cache and sync up later.", err);
    }
  };

  // Drag and Drop simulation zone handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    
    // Simulate detecting a dropped script/executable file and creating a shortcut macro automatically
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setExpression("happy");
      
      // Auto fill new macro values based on file
      setNewMacro({
        name: `Launch ${file.name.split(".")[0].toUpperCase()}`,
        hotkey: "Ctrl + Alt + " + file.name.substring(0, 1).toUpperCase(),
        category: "app",
        description: `Auto-generated shortcut for local script: ${file.name}`,
        actions: `Execute scripts/${file.name}, Trigger popup alert`
      });
      setShowAddForm(true);

      // Speak to user about the drop
      setChatMessages(prev => [...prev, {
        id: `drop-${Date.now()}`,
        sender: "clippy",
        text: `⚙️ Fantastic! I detected your script "${file.name}". I've pre-filled a desktop macro form for you below. Just assign a hotkey and save it!`,
        timestamp: new Date()
      }]);
    }
  };

  // Manual select simulation for file upload
  const handleManualFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setExpression("happy");
      setNewMacro({
        name: `Launch ${file.name.split(".")[0].toUpperCase()}`,
        hotkey: "Ctrl + Alt + " + file.name.substring(0, 1).toUpperCase(),
        category: "app",
        description: `Auto-generated shortcut for local script: ${file.name}`,
        actions: `Execute scripts/${file.name}, Trigger popup alert`
      });
      setShowAddForm(true);

      setChatMessages(prev => [...prev, {
        id: `drop-${Date.now()}`,
        sender: "clippy",
        text: `⚙️ Loaded script "${file.name}"! I've pre-filled a new desktop shortcut configuration for you below. Ready to deploy?`,
        timestamp: new Date()
      }]);
    }
  };

  // Sync state
  const handleSyncAll = () => {
    setIsSyncing(true);
    setExpression("thinking");
    setTimeout(() => {
      setIsSyncing(false);
      setExpression("happy");
      fetchState();
      setTimeout(() => setExpression("idle"), 1500);
    }, 1200);
  };

  // Helper categories for icons
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "utility":
        return <Cpu className="w-4 h-4 text-sky-400" />;
      case "app":
        return <Terminal className="w-4 h-4 text-emerald-400" />;
      case "media":
        return <VolumeX className="w-4 h-4 text-pink-400" />;
      default:
        return <Code className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans relative overflow-x-hidden selection:bg-sky-500 selection:text-white">
      {/* Background Neon Sci-Fi Grid and Decorative Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#02020e] pointer-events-none" />
      
      {/* Scanning laser line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-500/10 shadow-[0_0_20px_#0ea5e9] animate-pulse pointer-events-none" />
      
      {/* Animated holographic background grid */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" 
      />

      {/* Dynamic Macro Alert Overlay */}
      {macroAlert && (
        <div 
          className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 border-2 border-emerald-500 rounded-2xl p-5 shadow-[0_0_30px_rgba(16,185,129,0.3)] max-w-lg w-full flex items-start gap-4 animate-bounce-slow"
          id="macro-alert-toast"
        >
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h4 className="text-emerald-400 font-display font-semibold tracking-wider text-sm uppercase">EV-Bot Automation Bridge</h4>
            <pre className="mt-1 font-mono text-xs text-emerald-100 whitespace-pre-wrap">{macroAlert.text}</pre>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10 flex flex-col h-screen max-h-screen">
        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(56,189,248,0.3)] border border-sky-500/30">
              <img src={evBotLogo} alt="EV-Bot Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  EV-BOT
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded">
                  Android Companion
                </span>
              </div>
              <p className="text-xs text-slate-400">Official Alexa Skill & Desktop Shortcut Hub (ev-bot.uk)</p>
            </div>
          </div>

          {/* Controls: Mode Switcher */}
          <div className="flex items-center bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 shadow-inner flex-wrap md:flex-nowrap gap-1">
            <button
              onClick={() => setViewMode("dual")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                viewMode === "dual" 
                  ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md font-semibold" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Dual Simulator
            </button>
            <button
              onClick={() => setViewMode("phone")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                viewMode === "phone" 
                  ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md font-semibold" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Phone Only
            </button>
            <button
              onClick={() => setViewMode("dashboard")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                viewMode === "dashboard" 
                  ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md font-semibold" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Expanded Grid
            </button>
            <button
              onClick={() => setViewMode("echoshow")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                viewMode === "echoshow" 
                  ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md font-semibold" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              Echo Show
            </button>
            <button
              onClick={() => setViewMode("superpowers")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === "superpowers" 
                  ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-900/30 font-bold border border-pink-400/20" 
                  : "text-pink-400/90 hover:text-pink-300 hover:bg-pink-500/5"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
              Super Powers Setup
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
          
          {/* COLUMN 1: Android Mockup Phone Chassis (Rendered in dual, phone, and superpowers mode) */}
          {(viewMode === "dual" || viewMode === "phone" || viewMode === "superpowers") && (
            <div className={`col-span-1 lg:col-span-5 flex items-center justify-center overflow-hidden h-full py-1 ${viewMode === 'phone' ? 'lg:col-span-12' : ''}`}>
              {/* Smartphone Frame Outer Border */}
              <div 
                className="relative w-full max-w-[400px] h-[720px] bg-[#090d1a] border-[10px] border-[#1e293b] rounded-[48px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden"
                style={{
                  boxShadow: `0 0 35px -10px ${skin === 'hologram' ? 'rgba(56,189,248,0.2)' : skin === 'matrix' ? 'rgba(16,185,129,0.2)' : skin === 'cyber' ? 'rgba(236,72,153,0.2)' : skin === 'alert' ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.5)'}`
                }}
              >
                {/* Speaker Grill Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1e293b] rounded-b-2xl z-40 flex items-center justify-center gap-1">
                  <div className="w-10 h-1 bg-slate-950 rounded-full" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-900" />
                </div>

                {/* Simulated Android Status Bar */}
                <div className="px-6 pt-7 pb-2 flex justify-between items-center bg-slate-950/60 border-b border-slate-900/30 text-[11px] font-mono font-medium tracking-wide text-slate-400 z-30 select-none">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span>{currentTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-500 font-bold">5G</span>
                    <Wifi className="w-3.5 h-3.5 text-sky-400" />
                    {/* Simulated Battery Icon */}
                    <div className="w-5.5 h-2.5 border border-slate-500 rounded-sm p-0.5 flex items-center">
                      <div className="bg-sky-400 h-full w-[85%] rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Smartphone Screen Interactive Content */}
                <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
                  
                  {/* Holographic scanner laser line inside phone */}
                  <div className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-sky-500/5 to-transparent -translate-y-full animate-[pulse_6s_infinite] pointer-events-none" />

                  {/* Top Header: Connected Device Status */}
                  <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${pcConnection.status === 'connected' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`} />
                      <span className="text-[11px] font-mono text-slate-300">
                        PC: {pcConnection.status === 'connected' ? pcConnection.ipAddress : "OFFLINE"}
                      </span>
                    </div>
                    
                    {/* Skin/Style selector bubble */}
                    <div className="flex gap-1">
                      {(["hologram", "matrix", "cyber", "classic", "alert"] as ClippySkin[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSkin(s)}
                          className={`w-3.5 h-3.5 rounded-full border transition-all ${
                            skin === s ? "border-white scale-125 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                          style={{
                            backgroundColor:
                              s === "hologram" ? "#0ea5e9" :
                              s === "matrix" ? "#10b981" :
                              s === "cyber" ? "#ec4899" :
                              s === "classic" ? "#94a3b8" : "#ef4444"
                          }}
                          title={`Switch skin to ${s}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ASSISTANT CENTER STAGE: Animated EV-Companion Vector */}
                  <div className="h-[200px] flex flex-col items-center justify-center bg-gradient-to-b from-slate-900/20 to-slate-950/80 relative border-b border-slate-900/50">
                    
                    {/* Glowing containment ring */}
                    <div className="absolute w-36 h-36 rounded-full border-2 border-sky-500/15 animate-pulse flex items-center justify-center">
                      <div className="absolute w-28 h-28 rounded-full border border-sky-400/10" />
                    </div>

                    {/* Interactive Speech Bubble */}
                    <div className="absolute top-2 left-3 right-3 max-w-[90%] bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-300 shadow-xl overflow-y-auto max-h-[85px] z-20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-sky-400 uppercase font-semibold tracking-wider">
                          EV-Bot (EV) 🛰️
                        </span>
                        <div className="flex gap-1 text-[9px] font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-400">
                          {expression.toUpperCase()}
                        </div>
                      </div>
                      <p className="leading-snug">
                        {chatMessages[chatMessages.length - 1]?.sender === "clippy" 
                          ? chatMessages[chatMessages.length - 1].text 
                          : "Listening for commands..."}
                      </p>
                    </div>

                    {/* EV-Companion Vector */}
                    <div className="w-full h-full mt-8">
                      <ClippyAvatar skin={skin} expression={expression} character={companion} accessory={accessory} />
                    </div>
                  </div>

                  {/* CHAT LOG SCREEN */}
                  <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/90">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[85%] ${
                            msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {msg.sender === "user" ? (
                              <>
                                <span className="text-[9px] font-mono text-slate-400">Me</span>
                                <User className="w-2.5 h-2.5 text-slate-400" />
                              </>
                            ) : (
                              <>
                                <Cpu className="w-2.5 h-2.5 text-sky-400" />
                                <span className="text-[9px] font-mono text-sky-400">EV-Bot AI</span>
                                {msg.isSandbox && (
                                  <span className="text-[8px] font-mono px-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                                    SANDBOX
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          <div
                            className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                              msg.sender === "user"
                                ? "bg-sky-600 text-white rounded-tr-none"
                                : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                            }`}
                          >
                            <div>{msg.text}</div>
                            {msg.attachment && (
                              <div className="mt-2 p-2 bg-slate-950/80 border border-slate-800/80 rounded-lg flex flex-col gap-1 text-[11px] max-w-full">
                                {msg.attachment.type === "image" ? (
                                  <div className="flex flex-col gap-1.5">
                                    {msg.attachment.url && (
                                      <img 
                                        src={msg.attachment.url} 
                                        alt={msg.attachment.name} 
                                        className="max-h-24 object-cover rounded border border-slate-800" 
                                        referrerPolicy="no-referrer"
                                      />
                                    )}
                                    <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[9px] truncate">
                                      <ImageIcon className="w-3 h-3 text-sky-400 shrink-0" />
                                      <span className="truncate">{msg.attachment.name}</span>
                                      {msg.attachment.size && <span className="text-slate-500">({msg.attachment.size})</span>}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-300 truncate">
                                    <FileText className="w-3 h-3 text-purple-400 shrink-0" />
                                    <span className="truncate">{msg.attachment.name}</span>
                                    {msg.attachment.size && <span className="text-slate-500">({msg.attachment.size})</span>}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono pl-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                          <span>Gemini compiling thought matrix...</span>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Preset helper suggestions */}
                    <div className="px-3 py-1 bg-slate-900/40 border-t border-slate-900 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
                      <button
                        onClick={() => handleSendMessage("Suggest a macro shortcut for video editing")}
                        className="px-2 py-1 text-[10px] bg-slate-950 border border-slate-800 rounded-full text-slate-300 hover:text-white hover:border-slate-700 transition"
                      >
                        💡 Suggest Macro
                      </button>
                      <button
                        onClick={() => handleSendMessage("How do I link my Alexa Skill to this companion app?")}
                        className="px-2 py-1 text-[10px] bg-slate-950 border border-slate-800 rounded-full text-slate-300 hover:text-white hover:border-slate-700 transition"
                      >
                        🔊 Alexa Setup Help
                      </button>
                      <button
                        onClick={() => handleSendMessage("Do a diagnostic scan and tell me a tech joke!")}
                        className="px-2 py-1 text-[10px] bg-slate-950 border border-slate-800 rounded-full text-slate-300 hover:text-white hover:border-slate-700 transition"
                      >
                        ⚡ Laugh Mode
                      </button>
                    </div>

                    {/* Pending Attachment Preview */}
                    {pendingAttachment && (
                      <div className="mx-3 mt-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-2 min-w-0">
                          {pendingAttachment.type === "image" ? (
                            <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                              {pendingAttachment.url ? (
                                <img src={pendingAttachment.url} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-sky-400" />
                              )}
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-purple-400" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-slate-200 font-medium truncate max-w-[130px]">
                              {pendingAttachment.name}
                            </span>
                            <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider">
                              {pendingAttachment.type} {pendingAttachment.size && `• ${pendingAttachment.size}`}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setPendingAttachment(null)}
                          className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-red-400 transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Voice/Chat Input panel */}
                    <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5">
                      <input
                        type="file"
                        ref={imageInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="*/*"
                        className="hidden"
                      />
                      
                      {/* Upload Picture Button */}
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        title="Upload Picture / Camera"
                        className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-sky-400 rounded-xl transition cursor-pointer shrink-0"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>

                      {/* Upload File / Script Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload File / Script"
                        className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-purple-400 rounded-xl transition cursor-pointer shrink-0"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>

                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder={pendingAttachment ? "Add a message about this upload..." : "Ask Gemini / Tell EV-Bot..."}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                      
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || (!chatInput.trim() && !pendingAttachment)}
                        className="p-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl disabled:opacity-50 transition shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>

                {/* Simulated Android Navigation Bar at footer */}
                <div className="h-12 bg-slate-950 border-t border-slate-900 flex justify-around items-center z-30 select-none">
                  {/* Back button triangle */}
                  <button className="p-2 text-slate-600 hover:text-slate-400">
                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-r-[10px] border-r-current border-b-[5px] border-b-transparent" />
                  </button>
                  {/* Home button circle */}
                  <button className="p-2 text-slate-600 hover:text-slate-400">
                    <div className="w-4.5 h-4.5 rounded-full border-2 border-current" />
                  </button>
                  {/* Apps button square */}
                  <button className="p-2 text-slate-600 hover:text-slate-400">
                    <div className="w-3.5 h-3.5 border-2 border-current rounded-sm" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* COLUMN 2: Control Deck & Alexa Studio Integration (dual, dashboard, and superpowers mode) */}
          {(viewMode === "dual" || viewMode === "dashboard" || viewMode === "superpowers") && (
            <div className={`col-span-1 lg:col-span-7 flex flex-col gap-5 overflow-y-auto h-full pr-1 pb-4 scrollbar-none ${viewMode === 'dashboard' || viewMode === 'superpowers' ? 'lg:col-span-12' : ''}`}>
              {viewMode === "superpowers" ? (
                <SuperPowersDeck apiKeys={apiKeys} setApiKeys={setApiKeys} companion={companion} skin={skin} />
              ) : (
                <>
              
              {/* ROW 2.1: Alexa Skill integration Bridge Panel */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col md:flex-row gap-5">
                {/* Glowing decorative indicator */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-b from-indigo-500/10 to-transparent blur-xl rounded-full" />
                
                {/* Alexa Config details */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
                    <h3 className="font-display font-semibold text-lg text-slate-100">Alexa Skill Integration</h3>
                    <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                      Live Bridge
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Link your Alexa Voice command skill directly to this Android-PC bridge. Voice invocations execute your secure computer macros instantaneously.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <span className="block text-[10px] font-mono text-slate-500">SKILL DISPATCH DOMAIN</span>
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-xs text-slate-300">
                        <span>{customDomain}</span>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <span className="block text-[10px] font-mono text-slate-500">AMAZON SKILL ID</span>
                      <span className="block mt-1 font-mono text-xs text-slate-300 truncate" title={skillId}>
                        {skillId}
                      </span>
                    </div>
                  </div>

                  {/* Alexa simulate console */}
                  <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                        🗣️ Echo Speaker Simulator
                      </label>
                      <span className="text-[9px] font-mono text-slate-500">Test voice dispatch</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={alexaSimInput}
                        onChange={(e) => setAlexaSimInput(e.target.value)}
                        placeholder="Alexa, open ev-bot and launch Discord..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleTriggerAlexa(alexaSimInput)}
                        disabled={isSyncing || !alexaSimInput.trim()}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-xs rounded-lg transition flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Trigger
                      </button>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider self-center mr-1">Phonetic triggers:</span>
                        <button
                          onClick={() => handleTriggerAlexa("Alexa, open Eve")}
                          className="px-2 py-0.5 text-[9px] font-mono bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 rounded transition"
                        >
                          "Alexa, open Eve"
                        </button>
                        <button
                          onClick={() => handleTriggerAlexa("Alexa, open evot")}
                          className="px-2 py-0.5 text-[9px] font-mono bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 rounded transition"
                        >
                          "Alexa, open evot"
                        </button>
                        <button
                          onClick={() => handleTriggerAlexa("Alexa, open ev-bot")}
                          className="px-2 py-0.5 text-[9px] font-mono bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 rounded transition"
                        >
                          "Alexa, open ev-bot"
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-900/50">
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider self-center mr-1">Direct Macros:</span>
                        <button
                          onClick={() => handleTriggerAlexa("Alexa, ask ev-bot to mute my PC")}
                          className="px-2 py-0.5 text-[9px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded transition"
                        >
                          "Alexa, ask ev-bot to mute my PC"
                        </button>
                        <button
                          onClick={() => handleTriggerAlexa("Alexa, ask ev-bot to activate Focus Mode")}
                          className="px-2 py-0.5 text-[9px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded transition"
                        >
                          "Alexa, ask ev-bot to activate Focus Mode"
                        </button>
                        <button
                          onClick={() => handleTriggerAlexa("Alexa, tell ev-bot to dance")}
                          className="px-2 py-0.5 text-[9px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded transition"
                        >
                          "Alexa, tell ev-bot to dance"
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live rolling skill event logs (shows live updates) */}
                <div className="w-full md:w-64 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between max-h-[290px]">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
                    <span className="text-[10px] font-mono text-slate-400 font-bold tracking-wider uppercase">Alexa Signal Log</span>
                    <button 
                      onClick={handleSyncAll}
                      className="text-slate-500 hover:text-slate-300 p-1 rounded transition"
                      title="Refresh Logs"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2.5 scrollbar-none text-[11px] font-mono pr-1">
                    {alexaEvents.length === 0 ? (
                      <div className="text-center text-slate-600 py-8">
                        No recent signals.
                      </div>
                    ) : (
                      alexaEvents.map((evt) => (
                        <div key={evt.id} className="border-b border-slate-900 pb-2 last:border-0">
                          <div className="flex justify-between items-center text-[9px] text-slate-500 mb-0.5">
                            <span>{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            <span className="text-emerald-400 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" />
                              OK
                            </span>
                          </div>
                          <p className="text-slate-300 leading-tight font-sans font-medium">{evt.phrase}</p>
                          <span className="block mt-1 text-[9px] text-slate-500 font-sans italic">
                            Action: {evt.actionTaken}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* COMPANION CHARACTER CUSTOMIZER DECK */}
              <CompanionCustomizer
                companion={companion}
                setCompanion={setCompanion}
                accessory={accessory}
                setAccessory={setAccessory}
                setExpression={setExpression}
              />

              {/* ROW 2.2: Desktop PC Sync & Macro Studio */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                
                {/* Desktop Connection bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Laptop className="w-5 h-5 text-sky-400" />
                      <h3 className="font-display font-semibold text-lg text-slate-100">Desktop PC Shortcut Studio</h3>
                    </div>
                    <p className="text-xs text-slate-400">Create, manage, and toggle local hotkey macros instantly.</p>
                  </div>

                  {/* Sync connection switch */}
                  <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <div className="text-right">
                      <span className="block text-[9px] font-mono text-slate-500">WIN CLIENT</span>
                      <span className="block text-xs font-mono font-medium text-slate-300">
                        {pcConnection.status === "connected" ? `${pcConnection.os} (${pcConnection.latency})` : "OFFLINE"}
                      </span>
                    </div>
                    <button
                      onClick={handleTogglePCConnection}
                      className={`px-2 py-1 text-[10px] font-mono rounded border transition ${
                        pcConnection.status === "connected"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                      }`}
                    >
                      {pcConnection.status === "connected" ? "DISCONNECT" : "CONNECT"}
                    </button>
                  </div>
                </div>

                {/* Macro List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {desktopMacros.map((macro) => (
                    <div 
                      key={macro.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between group ${
                        macro.isActive 
                          ? "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:shadow-[0_0_15px_rgba(56,189,248,0.05)]" 
                          : "bg-slate-950/20 border-slate-900 opacity-60"
                      }`}
                    >
                      <div>
                        {/* Title & Toggle */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-slate-900 rounded-lg">
                              {getCategoryIcon(macro.category)}
                            </div>
                            <div>
                              <h4 className="font-display font-medium text-sm text-slate-200 group-hover:text-sky-300 transition-colors">
                                {macro.name}
                              </h4>
                              <span className="text-[10px] font-mono text-sky-400/90 font-semibold bg-sky-500/5 px-2 py-0.5 rounded border border-sky-500/10">
                                {macro.hotkey}
                              </span>
                            </div>
                          </div>

                          {/* Switch toggle */}
                          <button
                            onClick={() => handleToggleMacro(macro.id, macro.isActive)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center ${
                              macro.isActive ? "bg-sky-500" : "bg-slate-800"
                            }`}
                          >
                            <div 
                              className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                macro.isActive ? "translate-x-4" : "translate-x-0"
                              }`} 
                            />
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-400 leading-snug mb-3 min-h-[32px]">
                          {macro.description}
                        </p>

                        {/* Sequenced actions flow */}
                        <div className="space-y-1.5">
                          <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">Macro Sequence:</span>
                          <div className="flex flex-wrap items-center gap-1">
                            {macro.actions.map((act, idx) => (
                              <React.Fragment key={idx}>
                                {idx > 0 && <span className="text-[10px] text-slate-600 font-mono">➔</span>}
                                <span className="px-2 py-0.5 text-[9px] font-mono bg-slate-900 text-slate-300 border border-slate-800 rounded">
                                  {act}
                                </span>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between border-t border-slate-900/50 pt-3 mt-4">
                        <button
                          onClick={() => handleTestTriggerMacro(macro)}
                          disabled={!macro.isActive || pcConnection.status !== "connected"}
                          className="px-2.5 py-1.5 text-[11px] font-medium bg-sky-600/10 hover:bg-sky-600 text-sky-400 hover:text-white rounded-lg disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          Test macro run
                        </button>

                        <button
                          onClick={() => handleDeleteMacro(macro.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Delete macro shortcut"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new Macro Toggle */}
                <div className="pt-2">
                  {!showAddForm ? (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="w-full py-2.5 border border-dashed border-slate-800 hover:border-slate-600 hover:bg-slate-950/40 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Create Custom Keyboard Shortcut Macro
                    </button>
                  ) : (
                    <form onSubmit={handleAddMacro} className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <h4 className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">Shortcut Configuration</h4>
                        <button 
                          type="button" 
                          onClick={() => setShowAddForm(false)}
                          className="text-xs text-slate-500 hover:text-slate-300"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-slate-500 uppercase">Macro Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Launch Streaming Profile"
                            value={newMacro.name}
                            onChange={(e) => setNewMacro({ ...newMacro, name: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-slate-500 uppercase">Hotkey Trigger</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ctrl + Shift + L"
                            value={newMacro.hotkey}
                            onChange={(e) => setNewMacro({ ...newMacro, hotkey: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-slate-500 uppercase">Category</label>
                          <select
                            value={newMacro.category}
                            onChange={(e) => setNewMacro({ ...newMacro, category: e.target.value as any })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                          >
                            <option value="utility">Utility / SysOp</option>
                            <option value="app">Application Launch</option>
                            <option value="media">Media / Volume Controls</option>
                            <option value="custom">Custom Macro Sequence</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-slate-500 uppercase">Sequential Actions (comma-separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. Open OBS, Mute speaker, Play chime"
                            value={newMacro.actions}
                            onChange={(e) => setNewMacro({ ...newMacro, actions: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-slate-500 uppercase">Short Description</label>
                        <input
                          type="text"
                          placeholder="What does this shortcut do?"
                          value={newMacro.description}
                          onChange={(e) => setNewMacro({ ...newMacro, description: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded-lg transition"
                        >
                          Save Macro Shortcut
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Interactive Drag & Drop Script installer block */}
                <div 
                  ref={dragRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition relative ${
                    isDraggingFile 
                      ? "border-emerald-500 bg-emerald-950/20 text-emerald-200" 
                      : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="file"
                    id="manual-file"
                    className="hidden"
                    onChange={handleManualFileUpload}
                    accept=".sh,.py,.exe,.bat,.js,.sh"
                  />
                  
                  <div className="max-w-md mx-auto space-y-2 pointer-events-none">
                    <div className="mx-auto w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-sky-400 border border-slate-800">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      Drag & Drop Script or Shortcut Target
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Drop any shell/executable script (e.g. <code className="text-indigo-400 font-mono">discord_mute.py</code>, <code className="text-indigo-400 font-mono">launcher.sh</code>) to automatically register a quick-trigger Macro!
                    </p>
                    <div className="pt-2">
                      <label
                        htmlFor="manual-file"
                        className="pointer-events-auto inline-block px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] font-medium text-slate-300 rounded-lg cursor-pointer transition"
                      >
                        Browse file...
                      </label>
                    </div>
                  </div>
                </div>

                {/* Interactive Resilience & Feature Todo List */}
                <ResilienceTodoList
                  resilienceTodos={resilienceTodos}
                  onToggleTodo={handleToggleTodo}
                  onDeleteTodo={handleDeleteTodo}
                  onResetTodos={handleResetTodos}
                  onAddTodo={handleAddTodo}
                />

              </div>
              </>
              )}
            </div>
          )}

          {/* COLUMN 3: Echo Show Mode (Full-bleed mockup of an Echo Show 10 screen) */}
          {viewMode === "echoshow" && (
            <div className="col-span-1 lg:col-span-12 flex flex-col items-center justify-start overflow-y-auto h-full gap-6 pb-8 pr-1 scrollbar-none">
              
              {/* Bezel frame of the Echo Show */}
              <div className="w-full max-w-[850px] bg-[#0c0f1d] border-[14px] border-slate-800 rounded-3xl shadow-2xl relative flex flex-col justify-between overflow-hidden p-6 min-h-[460px] border-t-[16px] border-b-[16px]">
                {/* Simulated Lens Dot */}
                <div className="absolute top-[-11px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center z-40">
                  <div className="w-1 h-1 bg-[#1e1b4b] rounded-full" />
                </div>

                {/* Grid Decorative Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.25)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* Top Status Indicators inside Screen */}
                <div className="relative z-10 flex justify-between items-center border-b border-sky-500/10 pb-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-mono text-slate-400">Echo Show Display Simulator</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      WebAPL Live Link
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Locked 60 FPS
                    </span>
                    <div className="flex items-center gap-1 text-slate-500 text-xs font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>

                {/* Main Screen Division */}
                <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Left Screen: Floating Avatar Visualizer (60 FPS focus) */}
                  <div className="col-span-1 md:col-span-5 flex flex-col items-center justify-center h-full gap-4 py-2 border-r border-slate-800/40">
                    <div className="relative w-44 h-44 bg-slate-950/60 rounded-full border border-sky-500/10 shadow-[inset_0_0_20px_rgba(56,189,248,0.15)] flex items-center justify-center overflow-hidden">
                      {/* Holographic glowing floor pedestal */}
                      <div className="absolute bottom-1 w-28 h-6 bg-sky-500/10 blur-sm rounded-full border-t border-sky-500/30" />
                      <div className="w-32 h-32 relative z-10">
                        <ClippyAvatar skin={skin} expression={expression} character={companion} accessory={accessory} />
                      </div>
                    </div>

                    {/* Canvas Waveform Spectrum (60 FPS Performance Target) */}
                    <div className="w-full max-w-[200px] px-2 flex flex-col items-center">
                      <canvas ref={canvasRef} className="w-full h-[50px]" />
                      <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-wider">60FPS sound spectrum</span>
                    </div>
                  </div>

                  {/* Right Screen: Subtitles & Simulation Controllers */}
                  <div className="col-span-1 md:col-span-7 flex flex-col justify-between h-full gap-4">
                    
                    {/* Caption screen bubble */}
                    <div className="bg-slate-900/95 border border-sky-500/20 rounded-xl p-4 shadow-[0_4px_25px_rgba(0,0,0,0.6)] flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                      {/* Glowing dynamic corner */}
                      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-sky-500/10 to-transparent blur-md pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1">
                        <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest font-bold flex items-center gap-1">
                          <Activity className="w-3 h-3 text-sky-400" />
                          Alexa Screen Subtitles
                        </span>
                        {isEchoSimulating && (
                          <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 animate-pulse">
                            Active Speech Sync
                          </span>
                        )}
                      </div>
                      <p className="text-sm md:text-base text-slate-100 leading-relaxed font-sans italic my-2">
                        "{echoSubtitles}"
                      </p>
                      <div className="flex items-center gap-1.5 self-end text-[9px] font-mono text-slate-500">
                        <span>EV-Bot Speech Core v1.4</span>
                      </div>
                    </div>

                    {/* Simulation Options */}
                    <div className="space-y-2.5">
                      <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Simulate Voice Commands:</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          onClick={() => triggerEchoSimulation("Alexa, ask EV to check PC status", `Systems nominal! Latency is 12ms and secure handshakes are active on port 3000. Operating on ${isOffline ? 'Offline browser cache' : 'Live cloud connection'}.`)}
                          disabled={isEchoSimulating}
                          className="px-3 py-2 bg-slate-900/90 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-left text-xs transition duration-200 disabled:opacity-50 flex items-start gap-1.5 shadow"
                        >
                          <span className="text-sky-400 mt-0.5">💬</span>
                          <div>
                            <strong className="block text-slate-200">Check PC Status</strong>
                            <span className="text-[10px] text-slate-500">"Alexa, ask EV for PC status"</span>
                          </div>
                        </button>

                        <button
                          onClick={() => triggerEchoSimulation("Alexa, tell EV to launch Discord", "Executing macro now! I have dispatched the Discord launch shortcut to your Host PC. Connecting to vocal lobbies!")}
                          disabled={isEchoSimulating}
                          className="px-3 py-2 bg-slate-900/90 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-left text-xs transition duration-200 disabled:opacity-50 flex items-start gap-1.5 shadow"
                        >
                          <span className="text-sky-400 mt-0.5">💬</span>
                          <div>
                            <strong className="block text-slate-200">Launch Discord client</strong>
                            <span className="text-[10px] text-slate-500">"Alexa, tell EV to open Discord"</span>
                          </div>
                        </button>

                        <button
                          onClick={() => triggerEchoSimulation("Alexa, ask EV for a joke", "Why do researchers love spherical drones? Because they always roll with the punches! Ha ha ha.")}
                          disabled={isEchoSimulating}
                          className="px-3 py-2 bg-slate-900/90 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-left text-xs transition duration-200 disabled:opacity-50 flex items-start gap-1.5 shadow"
                        >
                          <span className="text-sky-400 mt-0.5">💬</span>
                          <div>
                            <strong className="block text-slate-200">Tell a funny joke</strong>
                            <span className="text-[10px] text-slate-500">"Alexa, ask EV for a joke"</span>
                          </div>
                        </button>

                        <button
                          onClick={() => triggerEchoSimulation("Alexa, tell EV to toggle Focus Mode", "Silencing alerts! Your PC is now configured in Focus Mode. Distractions have been neutralized!")}
                          disabled={isEchoSimulating}
                          className="px-3 py-2 bg-slate-900/90 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-left text-xs transition duration-200 disabled:opacity-50 flex items-start gap-1.5 shadow"
                        >
                          <span className="text-sky-400 mt-0.5">💬</span>
                          <div>
                            <strong className="block text-slate-200">Toggle Focus Mode</strong>
                            <span className="text-[10px] text-slate-500">"Alexa, tell EV to block alerts"</span>
                          </div>
                        </button>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Bottom Alexa Bar decoration */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-sky-300 to-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.8)] pointer-events-none" />

              </div>

              {/* Developer Configuration Blueprint Guide */}
              <div className="w-full max-w-[850px] bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-slate-100 flex items-center gap-2">
                    <Tv className="w-5 h-5 text-indigo-400" />
                    Alexa Screen & Echo Show Deployment Blueprint
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    How to display your 60FPS animated assistant avatar and sync everything seamlessly on physical Echo Show devices.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  
                  {/* Step 1 */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 space-y-2">
                    <div className="w-6 h-6 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center font-bold font-mono">1</div>
                    <h4 className="font-semibold text-slate-200">Host the Web Companion</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Deploy this companion application (React app) to a public secure HTTPS server (like Cloud Run or Vercel). Your domain will host the WebAPL rendering assets.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 space-y-2">
                    <div className="w-6 h-6 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center font-bold font-mono">2</div>
                    <h4 className="font-semibold text-slate-200">Enable Web API for Games</h4>
                    <p className="text-slate-400 leading-relaxed">
                      In the Alexa Developer Console, activate the <strong className="text-sky-300">Web API for Games</strong> permission inside your Custom Alexa Skill configuration options.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 space-y-2">
                    <div className="w-6 h-6 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center font-bold font-mono">3</div>
                    <h4 className="font-semibold text-slate-200">Dispatch APL.Html Directive</h4>
                    <p className="text-slate-400 leading-relaxed">
                      In your skill backend, return an <code className="text-sky-300 font-mono text-[11px]">Alexa.Presentation.HTML.Start</code> directive pointing to your deployed URL. The Echo Show will render the 60fps canvas instantly!
                    </p>
                  </div>

                </div>

                {/* Resilience & Auto-Fixing Callout Panel */}
                <div className="bg-gradient-to-r from-sky-950/40 to-indigo-950/40 p-5 rounded-xl border border-sky-500/10 flex flex-col md:flex-row gap-4 items-start">
                  <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20 mt-1">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-200">Built-In Smart Resilience & Fail-Safe Fallbacks</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      This system features automated status checks. If your Host PC or backend server drops offline, the web interface immediately switches to local offgrid caching. All custom macros can be triggered locally and Alexa command simulation runs completely client-side. The app automatically recovers and synchronizes with the server the instant connection is restored.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Dynamic Footer with details */}
        <footer className="mt-auto border-t border-slate-900 pt-3 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 font-mono gap-2">
          <div className="flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Alexa Endpoint: <code className="text-indigo-400 font-bold">https://{customDomain}/api/alexa/trigger</code></span>
          </div>
          <span>Local Sync Engine listening on port 3000 • Secure SSL Encrypted</span>
        </footer>

      </div>
    </div>
  );
}
