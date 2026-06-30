export interface AlexaEvent {
  id: string;
  timestamp: string;
  phrase: string;
  status: "success" | "pending" | "failed";
  actionTaken: string;
}

export interface DesktopMacro {
  id: string;
  name: string;
  hotkey: string;
  category: "utility" | "app" | "media" | "custom";
  actions: string[];
  description: string;
  isActive: boolean;
}

export interface PCConnection {
  ipAddress: string;
  status: "connected" | "disconnected";
  latency: string;
  lastSeen: string;
  os: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "clippy";
  text: string;
  timestamp: Date;
  isSandbox?: boolean;
  attachment?: {
    name: string;
    type: "image" | "file";
    url?: string;
    size?: string;
  };
}

export type ClippySkin = "hologram" | "matrix" | "classic" | "cyber" | "alert";
export type CompanionId = "fox" | "cat" | "owl" | "robot" | "orb" | "ghost" | "plant" | "drone";
export type CompanionAccessory = "none" | "glasses" | "hat" | "bowtie" | "headphones" | "crown";

export interface ClippySkinConfig {
  id: ClippySkin;
  name: string;
  bgColor: string;
  accentColor: string;
  strokeColor: string;
  glowColor: string;
  particleColor: string;
}

export interface ResilienceTodo {
  id: string;
  text: string;
  description: string;
  category: "optimistic" | "zerolatency" | "autoretry" | "simulation" | "custom";
  completed: boolean;
  isSystem: boolean;
}

