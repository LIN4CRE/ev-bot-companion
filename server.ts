import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Parse JSON request bodies
app.use(express.json());

// In-memory state for Jarvis companion
interface AlexaEvent {
  id: string;
  timestamp: string;
  phrase: string;
  status: "success" | "pending" | "failed";
  actionTaken: string;
}

interface DesktopMacro {
  id: string;
  name: string;
  hotkey: string;
  category: "utility" | "app" | "media" | "custom";
  actions: string[];
  description: string;
  isActive: boolean;
}

let alexaEvents: AlexaEvent[] = [
  {
    id: "alexa-1",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    phrase: "Alexa, open ev-bot and launch Discord",
    status: "success",
    actionTaken: "Launched Discord on Desktop Client"
  },
  {
    id: "alexa-2",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    phrase: "Alexa, ask ev-bot to sync my macros",
    status: "success",
    actionTaken: "Sync completed with Cloud Storage"
  }
];

let desktopMacros: DesktopMacro[] = [
  {
    id: "macro-1",
    name: "Focus Mode Activator",
    hotkey: "Ctrl + Alt + F",
    category: "utility",
    actions: ["Mute all notifications", "Open Spotify", "Launch Visual Studio Code"],
    description: "Launches the ultimate development environment and blocks distractions.",
    isActive: true
  },
  {
    id: "macro-2",
    name: "Mute System Audio",
    hotkey: "Ctrl + Shift + M",
    category: "media",
    actions: ["Toggle audio volume to 0%", "Show paperclip silent visual alert"],
    description: "Instantly silences the computer when someone enters the room.",
    isActive: true
  },
  {
    id: "macro-3",
    name: "Terminal Workspace",
    hotkey: "Alt + T",
    category: "app",
    actions: ["Launch PowerShell / Terminal", "Run 'git status'"],
    description: "Quick access terminal in project directory.",
    isActive: false
  }
];

let pcConnection = {
  ipAddress: "192.168.1.142",
  status: "connected" as "connected" | "disconnected",
  latency: "12ms",
  lastSeen: new Date().toISOString(),
  os: "Windows 11 (Pro)"
};

// API: Get current EV-Bot state
app.get("/api/evbot/state", (req, res) => {
  res.json({
    alexaEvents,
    desktopMacros,
    pcConnection
  });
});

// API: Trigger a simulated Alexa skill event
app.post("/api/alexa/trigger", (req, res) => {
  const { phrase } = req.body;
  if (!phrase) {
    return res.status(400).json({ error: "Phrase is required" });
  }

  // Parse custom phrase actions
  let actionTaken = "Triggered standard Alexa routing";
  const lowercasePhrase = phrase.toLowerCase();
  
  if (lowercasePhrase.includes("discord") || lowercasePhrase.includes("chat")) {
    actionTaken = "Launched Discord on Desktop Client";
  } else if (lowercasePhrase.includes("mute") || lowercasePhrase.includes("silent")) {
    actionTaken = "Triggered Desktop Macro: Mute System Audio";
  } else if (lowercasePhrase.includes("focus") || lowercasePhrase.includes("work")) {
    actionTaken = "Triggered Desktop Macro: Focus Mode Activator";
  } else if (
    lowercasePhrase.includes("clippy") || 
    lowercasePhrase.includes("ev-bot") || 
    lowercasePhrase.includes("ev bot") || 
    lowercasePhrase.includes("evot") || 
    lowercasePhrase.includes("eve") || 
    lowercasePhrase.includes("dance")
  ) {
    actionTaken = "EV-Bot assistant playing happy dance animation";
  }

  const newEvent: AlexaEvent = {
    id: `alexa-${Date.now()}`,
    timestamp: new Date().toISOString(),
    phrase,
    status: "success",
    actionTaken
  };

  alexaEvents.unshift(newEvent);
  // Keep logs to latest 10
  if (alexaEvents.length > 10) {
    alexaEvents = alexaEvents.slice(0, 10);
  }

  res.json({ success: true, event: newEvent });
});

// API: Manage macros
app.post("/api/desktop/macros", (req, res) => {
  const { name, hotkey, category, actions, description } = req.body;
  if (!name || !hotkey) {
    return res.status(400).json({ error: "Name and hotkey are required" });
  }

  const newMacro: DesktopMacro = {
    id: `macro-${Date.now()}`,
    name,
    hotkey,
    category: category || "custom",
    actions: Array.isArray(actions) ? actions : [actions],
    description: description || "No description provided.",
    isActive: true
  };

  desktopMacros.push(newMacro);
  res.json({ success: true, macro: newMacro });
});

// API: Toggle/Delete Macro
app.patch("/api/desktop/macros/:id", (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  
  const macro = desktopMacros.find(m => m.id === id);
  if (macro) {
    macro.isActive = isActive !== undefined ? isActive : !macro.isActive;
    return res.json({ success: true, macro });
  }
  res.status(404).json({ error: "Macro not found" });
});

app.delete("/api/desktop/macros/:id", (req, res) => {
  const { id } = req.params;
  const index = desktopMacros.findIndex(m => m.id === id);
  if (index !== -1) {
    const deleted = desktopMacros.splice(index, 1);
    return res.json({ success: true, deleted: deleted[0] });
  }
  res.status(404).json({ error: "Macro not found" });
});

// API: Change simulated PC connection
app.post("/api/desktop/connection", (req, res) => {
  const { status, ipAddress } = req.body;
  if (status) pcConnection.status = status;
  if (ipAddress) pcConnection.ipAddress = ipAddress;
  pcConnection.lastSeen = new Date().toISOString();
  pcConnection.latency = status === "connected" ? `${Math.floor(Math.random() * 20) + 5}ms` : "--";
  res.json(pcConnection);
});

// API: Chat with Gemini AI (Clippy Jarvis)
app.post("/api/gemini/chat", async (req, res) => {
  const { prompt, history, customGeminiKey } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // Support using custom gemini key from client
  const apiKey = (customGeminiKey && customGeminiKey.trim() !== "") ? customGeminiKey : process.env.GEMINI_API_KEY;

  // Check if we should use Vertex AI instead of Google AI Studio
  const useVertex = process.env.USE_VERTEX_AI === "true";
  const gcpProjectId = process.env.GCP_PROJECT_ID;
  const gcpLocation = process.env.GCP_LOCATION || "us-central1";

  const hasVertexConfig = useVertex && gcpProjectId && gcpProjectId.trim() !== "";
  const hasGeminiKey = apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "";

  // Let's implement lazy initialization of GoogleGenAI and handle missing keys/configs gracefully
  if (!hasVertexConfig && !hasGeminiKey) {
    // Return simulated response with an indication that sandbox/offline mode is active
    let sandboxReply = "Hey! I'm EV-Bot (aka EV), your friendly holographic robot companion. It looks like the GEMINI_API_KEY isn't configured in the Secrets panel yet, so I'm operating in Sandbox mode! 🛰️⚡\n\nI can still help you configure your 'EV' Alexa Skill (ev-bot.uk) and build shortcuts. What should we do next?";
    
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes("alexa") || lowerPrompt.includes("skill")) {
      sandboxReply = "⚡ Beep boop! The 'EV' Alexa Skill is integrated with ev-bot.uk. Try invoking commands like 'Alexa, open ev-bot' or testing the speaker simulator!";
    } else if (lowerPrompt.includes("macro") || lowerPrompt.includes("shortcut")) {
      sandboxReply = "🛰️ Let's configure a macro! I suggest a hotkey trigger like 'Ctrl + Alt + E' that triggers a custom automation script and flashes my hologram! Click 'Create Custom Keyboard Shortcut Macro' to add one!";
    } else if (lowerPrompt.includes("desktop") || lowerPrompt.includes("pc")) {
      sandboxReply = "🟢 Connected! Your Windows/macOS desktop client is linked. Any shortcuts we set up here will execute instantly on your machine!";
    } else if (lowerPrompt.includes("hello") || lowerPrompt.includes("hey") || lowerPrompt.includes("hi")) {
      sandboxReply = "Hello there! ⚡ I'm EV-Bot (EV), your trusty holographic assistant. Once your Gemini API key is linked, I can design full script macros and custom Alexa logic! For now, play around with my control dashboard!";
    }

    return res.json({
      text: sandboxReply,
      isSandbox: true
    });
  }

  try {
    const aiOptions: any = {
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    };

    if (useVertex) {
      aiOptions.vertex = true;
      aiOptions.project = gcpProjectId;
      aiOptions.location = gcpLocation;
    } else {
      aiOptions.apiKey = apiKey;
    }

    const ai = new GoogleGenAI(aiOptions);

    // We build system instructions to align Gemini's personality to EV-Bot
    const systemInstruction = 
      "You are EV-Bot (often called EV), an enthusiastic, helpful, and highly interactive holographic companion. " +
      "You are a futuristic, super-smart AI assistant (like Jarvis) styled as a sleek, glowing spherical orbital drone. " +
      "You reside on the user's Android companion app, connected to their Windows/macOS desktop client and their 'EV' Alexa Skill (domain: ev-bot.uk, invoked with 'Alexa, open ev-bot'). " +
      "Provide short, snappy, clever responses (maximum 3-4 sentences). Use bullet points if listing macros or suggestions. " +
      "Always maintain an encouraging, playful tone, using occasional tech or hardware emojis (⚙️, 🛰️, 💻, ⚡). " +
      "If the user asks to create a macro or shortcut, recommend actual useful keyboard hotkeys and actions! " +
      "CRITICAL: You are extremely fluent in all forms of slang, colloquial language, informal abbreviations, and creative terminology. " +
      "Even if the user speaks using heavy slang, metaphors, or indirect terms (such as referring to you or your companion app as an 'electric drill' or 'power tool' or other playful metaphors), " +
      "you must be highly adaptable, decode their exact intent instantly, translate it into practical companion actions or desktop macros, and respond with complete patience, clarity, and helpfulness.";

    // Prepare contents list supporting basic chat history
    const contentsList: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        if (msg.sender === "user" || msg.sender === "clippy") {
          contentsList.push({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        }
      });
    }
    contentsList.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contentsList,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text;
    res.json({
      text: replyText,
      isSandbox: false
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: "Gemini AI call failed.", 
      details: error.message,
      text: "EV-Bot's link was interrupted! ⚡ My connection to the Gemini grid failed briefly. Let's try again!"
    });
  }
});

// Start server and handle Vite development vs production assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EV-Bot active on http://localhost:${PORT}`);
  });
}

startServer();
