import express from "express";
import helmet from "helmet";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
// Default to localhost only; override with CORS_ORIGIN env var in production.
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Maximum characters accepted in a single /api/gemini/chat prompt.
const MAX_PROMPT_LENGTH = 8000;

app.use(helmet());
app.use(express.json());

const ALLOWED_ORIGINS = CORS_ORIGIN.split(",").map(s => s.trim());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin) && !ALLOWED_ORIGINS.includes("*")) {
    return res.status(403).json({ error: "Origin not allowed" });
  }
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.header("Access-Control-Allow-Origin", allowedOrigin || CORS_ORIGIN);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Short-path aliases → full backend paths (for App.tsx relative API calls)
const PATH_MAP: Record<string, string> = {
  "/evbot": "/api/v1/evbot",
  "/alexa": "/api/v1/evbot/alexa",
  "/desktop": "/api/v1/evbot",
};

app.use("/api", async (req, res, next) => {
  if (req.path === "/gemini/chat" && req.method === "POST") return next();

  // Pass /v1/... directly to the backend (health checks, direct v1 calls from AlexaService)
  if (req.path.startsWith("/v1/")) {
    try {
      const opts: RequestInit = { method: req.method, headers: { "Content-Type": "application/json" } };
      if (["POST", "PATCH", "PUT"].includes(req.method) && req.body) opts.body = JSON.stringify(req.body);
      const backendRes = await fetch(`${BACKEND_URL}/api${req.path}`, opts);
      const data = await backendRes.json();
      return res.status(backendRes.status).json(data);
    } catch {
      return res.status(502).json({ error: "Backend unavailable", detail: `Could not reach ${BACKEND_URL}` });
    }
  }

  for (const [prefix, mapped] of Object.entries(PATH_MAP)) {
    if (req.path.startsWith(prefix)) {
      const backendPath = req.path.replace(prefix, mapped);
      try {
        const opts: RequestInit = { method: req.method, headers: { "Content-Type": "application/json" } };
        if (["POST", "PATCH", "PUT"].includes(req.method) && req.body) opts.body = JSON.stringify(req.body);
        const backendRes = await fetch(`${BACKEND_URL}${backendPath}`, opts);
        const data = await backendRes.json();
        return res.status(backendRes.status).json(data);
      } catch {
        return res.status(502).json({ error: "Backend unavailable", detail: `Could not reach ${BACKEND_URL}` });
      }
    }
  }
  res.status(404).json({ error: "Unknown API path" });
});

app.post("/api/gemini/chat", async (req, res) => {
  const { prompt, history, customGeminiKey } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });
  if (typeof prompt !== "string" || prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: `Prompt must be a string of at most ${MAX_PROMPT_LENGTH} characters` });
  }
  if (customGeminiKey !== undefined && (typeof customGeminiKey !== "string" || customGeminiKey.length > 512)) {
    return res.status(400).json({ error: "customGeminiKey must be a string of at most 512 characters" });
  }
  if (history !== undefined && !Array.isArray(history)) {
    return res.status(400).json({ error: "history must be an array" });
  }

  const apiKey = (customGeminiKey && customGeminiKey.trim() !== "") ? customGeminiKey : process.env.GEMINI_API_KEY;
  const useVertex = process.env.USE_VERTEX_AI === "true";
  const gcpProjectId = process.env.GCP_PROJECT_ID;
  const gcpLocation = process.env.GCP_LOCATION || "us-central1";
  const hasVertexConfig = useVertex && gcpProjectId && gcpProjectId.trim() !== "";
  const hasGeminiKey = apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "";

  if (!hasVertexConfig && !hasGeminiKey) {
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
    return res.json({ text: sandboxReply, isSandbox: true });
  }

  try {
    const aiOptions: any = { httpOptions: { headers: { "User-Agent": "aistudio-build" } } };
    if (useVertex) {
      aiOptions.vertex = true;
      aiOptions.project = gcpProjectId;
      aiOptions.location = gcpLocation;
    } else {
      aiOptions.apiKey = apiKey;
    }
    const ai = new GoogleGenAI(aiOptions);
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

    const contentsList: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        if (msg.sender === "user" || msg.sender === "clippy") {
          contentsList.push({ role: msg.sender === "user" ? "user" : "model", parts: [{ text: msg.text }] });
        }
      });
    }
    contentsList.push({ role: "user", parts: [{ text: prompt }] });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contentsList,
      config: { systemInstruction, temperature: 0.7 },
    });

    res.json({ text: response.text, isSandbox: false });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Gemini AI call failed.",
      details: error.message,
      text: "EV-Bot's link was interrupted! ⚡ My connection to the Gemini grid failed briefly. Let's try again!"
    });
  }
});

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
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`EV-Bot active on http://localhost:${PORT}`));
}

startServer();
