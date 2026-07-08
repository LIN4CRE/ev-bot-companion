# EV-Bot Companion

The Android/web client for **EV-Bot** ("EV") — a holographic AI companion character that bridges a phone, a desktop PC, and an Amazon Alexa custom skill. **"EV" here is the assistant's name, not "electric vehicle."**

This repo is the companion app itself: a React/Vite web UI wrapped with Capacitor into an Android app, plus a small Express server that serves it and proxies API calls. It is one piece of a larger system — the Alexa skill backend and the Windows/macOS "desktop client" it talks to live in separate services/repos (reached over the network via `BACKEND_URL`), not in this repository.

## What it actually does

- **Animated companion avatar** ("Clippy"-style) with 8 selectable characters (fox, cat, owl, robot, orb, ghost, plant, drone), optional accessories, and 5 visual "skins" (hologram, matrix, cyber, classic, alert), each with its own neon color theme and an animated canvas waveform.
- **Gemini-powered chat**: `server.ts` exposes `POST /api/gemini/chat`, which calls Google's Gemini API (`@google/genai`) with a fixed "EV-Bot" persona/system prompt. If no `GEMINI_API_KEY` (or per-user key) is configured, it falls back to a scripted "Sandbox mode" chatbot instead of failing.
- **Alexa skill integration**: the UI documents and simulates the real-world "EV" Alexa Skill hosted at `ev-bot.uk` ("Alexa, open ev-bot" / "Alexa, tell EV to launch Discord"). `AlexaSetup.tsx` lets a user point the app at their backend endpoint + skill ID + API key; `alexaService.ts` calls `/api/v1/evbot/...` REST endpoints and subscribes to Server-Sent Events for live event/macro updates.
- **Desktop macros/shortcuts**: users can create, toggle, and delete hotkey-triggered "macros" (e.g. mute PC, launch Discord, toggle Focus Mode) meant to run on a connected Windows/macOS desktop client. All macro/event changes are applied optimistically in the UI and cached locally.
- **Offline-first architecture**: `src/services/db.ts` uses Dexie (IndexedDB) to cache Alexa events, macros, and chat history locally, with a `SyncManager` that reconciles unsynced data with the backend once connectivity returns, and automatic exponential-backoff retry in `App.tsx` if the backend is unreachable.
- **Multiple UI layouts**: "Dual Simulator" (phone + dashboard side by side), "Phone Only," "Expanded Grid" dashboard, an "Echo Show" mode that simulates an Alexa smart-display experience (including loading Amazon's real Alexa Web API for Games SDK and a synthesized voice-activation chime via the Web Audio API), and a "Super Powers Setup" panel for configuring optional integrations.
- **Super Powers Deck**: a settings panel for optional API keys (Gemini, OpenRouter, ElevenLabs voice) and an Alexa webhook secret, stored client-side only, plus a scripted "handshake diagnostics" log for testing which integrations are active.
- **Tailscale phone-link support**: when running as a native Android app, the user enters their PC's Tailscale IP and the app talks directly to the desktop's companion server over the tailnet (`getApiUrl` in `App.tsx`); CORS defaults in `server.ts` are pre-seeded with example Tailscale addresses.
- **Native Android shell (Capacitor)**: app id `uk.evbot.mobile`, with a home-screen widget (`EVWidgetProvider.java`), app shortcuts, deep-link handling for `evbot://` URLs (e.g. from the Alexa skill), native toast notifications, geolocation, and secure preference storage (`src/services/capacitorBridge.ts`).
- **Security hardening in the server**: `server.ts` uses Helmet, an explicit CORS origin allow-list, request-size/prompt-length validation, and only proxies known path prefixes to the backend.

## Tech stack

- React 19 + TypeScript, built with Vite 6 and Tailwind CSS 4
- Express 4 (dev server + production static server + API proxy), Helmet, dotenv
- Google Gen AI SDK (`@google/genai`) for Gemini chat (supports Vertex AI as an alternative to AI Studio keys)
- Capacitor 6 (Android target) with App, Geolocation, Preferences, Toast plugins
- Dexie (IndexedDB) for offline local storage
- `lucide-react` icons, `motion` (Framer Motion) for animation
- Docker (Node 20 Alpine) for containerized deployment

## Setup

**Prerequisites:** Node.js, npm. For Android builds: Android Studio / SDK and the Capacitor Android CLI.

```bash
npm install
```

Create a `.env` (see `.env.example`) with at least:

```env
GEMINI_API_KEY="your-gemini-api-key"   # optional — app runs in "Sandbox mode" without it
APP_URL="..."                          # optional; used for self-referential links
USE_VERTEX_AI=false                    # set true to use Vertex AI instead of an AI Studio key
GCP_PROJECT_ID=
GCP_LOCATION=us-central1
# GOOGLE_APPLICATION_CREDENTIALS=      # only needed off-GCP with Vertex AI
```

The server also reads these (not in `.env.example`, but used in `server.ts`):

```env
PORT=3000                   # server port
BACKEND_URL=http://localhost:8000   # URL of the separate EV-Bot backend/Alexa-skill service
CORS_ORIGIN=http://localhost:3000,... # comma-separated allow-list
GEMINI_MODEL=gemini-2.5-flash
```

Run:

```bash
npm run dev          # starts the Express + Vite dev server (tsx server.ts) on :3000
npm run build         # builds the web bundle and bundles server.ts to dist/server.cjs
npm start             # runs the production build (node dist/server.cjs)
npm run lint          # tsc --noEmit
```

### Android (Capacitor)

```bash
npm run cap:add:android     # one-time: add the android platform
npm run android:build       # build web assets, sync, and build the Android app
npm run android:dev         # sync and open the project in Android Studio
```

### Docker

```bash
docker build -t evbot-companion .
docker run -p 3000:3000 --env-file .env evbot-companion
```

## Notes

Without a reachable backend (`BACKEND_URL`) and Alexa skill deployment, the app still runs and is fully interactive, but Alexa events/macros operate purely in a local, simulated/offline mode rather than driving a real desktop PC.
