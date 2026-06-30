/**
 * Alexa Integration Service
 * Handles communication with EV-Bot Alexa Skill
 */

import { db, SyncManager, PreferenceStore } from "./db";
import { AlexaEvent, DesktopMacro } from "../types";

export interface AlexaSkillConfig {
  skillId: string;
  endpoint: string; // e.g., https://ev-bot-backend.onrender.com
  apiKey?: string;
}

export class AlexaService {
  private static config: AlexaSkillConfig | null = null;
  private static syncInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize Alexa service with backend endpoint
   */
  static async initialize(config: AlexaSkillConfig): Promise<void> {
    this.config = config;
    await PreferenceStore.set("alexaConfig", config);
    this.startAutoSync();
  }

  /**
   * Get current Alexa configuration
   */
  static async getConfig(): Promise<AlexaSkillConfig | null> {
    if (this.config) return this.config;

    const saved = await PreferenceStore.get("alexaConfig");
    if (saved) {
      this.config = saved;
      this.startAutoSync();
    }
    return saved;
  }

  /**
   * Trigger an Alexa skill action
   */
  static async triggerSkillAction(phrase: string): Promise<AlexaEvent> {
    const config = await this.getConfig();
    if (!config) {
      throw new Error("Alexa service not configured");
    }

    try {
      const response = await fetch(`${config.endpoint}/api/alexa/trigger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.apiKey && { "Authorization": `Bearer ${config.apiKey}` })
        },
        body: JSON.stringify({ phrase })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const event = data.event;

      // Save to local DB
      await db.alexaEvents.add({
        ...event,
        synced: true,
        syncedAt: new Date().toISOString()
      });

      return event;
    } catch (error) {
      // Save as pending sync if offline
      const event: AlexaEvent = {
        id: `local-${Date.now()}`,
        timestamp: new Date().toISOString(),
        phrase,
        status: "pending",
        actionTaken: "Pending - offline mode"
      };

      await db.alexaEvents.add({
        ...event,
        synced: false
      });

      console.error("Failed to trigger Alexa action:", error);
      throw error;
    }
  }

  /**
   * Get all Alexa events (synced with server)
   */
  static async getAllEvents(limit: number = 50): Promise<AlexaEvent[]> {
    const config = await this.getConfig();

    // Try to fetch from server
    if (config) {
      try {
        const response = await fetch(
          `${config.endpoint}/api/evbot/state`,
          config.apiKey ? { headers: { "Authorization": `Bearer ${config.apiKey}` } } : {}
        );

        if (response.ok) {
          const data = await response.json();
          await SyncManager.syncAlexaEvents(data.alexaEvents);
          return data.alexaEvents.slice(0, limit);
        }
      } catch (error) {
        console.warn("Failed to fetch from server, using local cache:", error);
      }
    }

    // Fall back to local DB
    return db.alexaEvents
      .orderBy("timestamp")
      .reverse()
      .limit(limit)
      .toArray();
  }

  /**
   * Create a desktop macro
   */
  static async createMacro(macro: Omit<DesktopMacro, "id">): Promise<DesktopMacro> {
    const config = await this.getConfig();

    try {
      const response = await fetch(`${config?.endpoint}/api/desktop/macros`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config?.apiKey && { "Authorization": `Bearer ${config.apiKey}` })
        },
        body: JSON.stringify(macro)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const createdMacro = data.macro;

      await db.macros.add({
        ...createdMacro,
        synced: true,
        syncedAt: new Date().toISOString()
      });

      return createdMacro;
    } catch (error) {
      console.error("Failed to create macro:", error);
      throw error;
    }
  }

  /**
   * Update macro toggle state
   */
  static async toggleMacro(id: string, isActive: boolean): Promise<DesktopMacro> {
    const config = await this.getConfig();

    try {
      const response = await fetch(`${config?.endpoint}/api/desktop/macros/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(config?.apiKey && { "Authorization": `Bearer ${config.apiKey}` })
        },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const updatedMacro = data.macro;

      await db.macros.update(id, {
        isActive: updatedMacro.isActive,
        synced: true,
        syncedAt: new Date().toISOString()
      });

      return updatedMacro;
    } catch (error) {
      console.error("Failed to toggle macro:", error);
      throw error;
    }
  }

  /**
   * Delete a macro
   */
  static async deleteMacro(id: string): Promise<void> {
    const config = await this.getConfig();

    try {
      const response = await fetch(`${config?.endpoint}/api/desktop/macros/${id}`, {
        method: "DELETE",
        headers: config?.apiKey ? { "Authorization": `Bearer ${config.apiKey}` } : {}
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await db.macros.delete(id);
    } catch (error) {
      console.error("Failed to delete macro:", error);
      throw error;
    }
  }

  /**
   * Get all macros
   */
  static async getMacros(): Promise<DesktopMacro[]> {
    const config = await this.getConfig();

    // Try to fetch from server
    if (config) {
      try {
        const response = await fetch(
          `${config.endpoint}/api/evbot/state`,
          config.apiKey ? { headers: { "Authorization": `Bearer ${config.apiKey}` } } : {}
        );

        if (response.ok) {
          const data = await response.json();
          await SyncManager.syncMacros(data.desktopMacros);
          return data.desktopMacros;
        }
      } catch (error) {
        console.warn("Failed to fetch macros from server, using local cache:", error);
      }
    }

    // Fall back to local DB
    return db.macros.toArray();
  }

  /**
   * Sync unsync data with server
   */
  static async syncPendingData(): Promise<void> {
    const config = await this.getConfig();
    if (!config) return;

    const { events, macros } = await SyncManager.getUnsyncedData();

    if (events.length === 0 && macros.length === 0) {
      return; // Nothing to sync
    }

    try {
      // Retry pending events
      for (const event of events) {
        try {
          await this.triggerSkillAction(event.phrase);
        } catch {
          // Continue on failure
        }
      }

      // Mark as synced
      const eventIds = events.filter(e => e.id).map(e => e.id);
      const macroIds = macros.filter(m => m.id).map(m => m.id);
      await SyncManager.markAsSynced(eventIds, macroIds);
    } catch (error) {
      console.error("Failed to sync pending data:", error);
    }
  }

  /**
   * Start automatic sync every 30 seconds
   */
  private static startAutoSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      if (SyncManager.shouldSync()) {
        this.syncPendingData().catch(console.error);
      }
    }, 30000);
  }

  /**
   * Stop auto sync
   */
  static stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Check if device is online
   */
  static isOnline(): boolean {
    return typeof navigator !== "undefined" && navigator.onLine;
  }
}
