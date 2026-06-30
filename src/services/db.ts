/**
 * Local Database Service using Dexie for offline-first capabilities
 */

import Dexie, { Table } from "dexie";
import { AlexaEvent, DesktopMacro, ChatMessage } from "../types";

export interface CachedAlexaEvent extends AlexaEvent {
  synced?: boolean;
  syncedAt?: string;
}

export interface CachedMacro extends DesktopMacro {
  synced?: boolean;
  syncedAt?: string;
  localOnly?: boolean;
}

export class EvBotDB extends Dexie {
  alexaEvents!: Table<CachedAlexaEvent>;
  macros!: Table<CachedMacro>;
  chatHistory!: Table<ChatMessage>;
  settings!: Table<any>;

  constructor() {
    super("EvBotDB");
    this.version(1).stores({
      alexaEvents: "++id, timestamp, status",
      macros: "++id, name, category",
      chatHistory: "++id, timestamp",
      settings: "key"
    });
  }
}

export const db = new EvBotDB();

/**
 * Sync manager for keeping local DB in sync with server
 */
export class SyncManager {
  private static syncInProgress = false;
  private static lastSyncTime = 0;
  private static syncInterval = 30000; // 30 seconds

  static async syncAlexaEvents(serverEvents: AlexaEvent[]): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const localEvents = await db.alexaEvents.toArray();
      const localIds = new Set(localEvents.map(e => e.id));

      // Add new events from server
      for (const event of serverEvents) {
        if (!localIds.has(event.id)) {
          await db.alexaEvents.add({
            ...event,
            synced: true,
            syncedAt: new Date().toISOString()
          });
        }
      }
    } finally {
      this.syncInProgress = false;
      this.lastSyncTime = Date.now();
    }
  }

  static async syncMacros(serverMacros: DesktopMacro[]): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const localMacros = await db.macros.toArray();
      const localIds = new Set(localMacros.map(m => m.id));

      // Add new macros from server
      for (const macro of serverMacros) {
        if (!localIds.has(macro.id)) {
          await db.macros.add({
            ...macro,
            synced: true,
            syncedAt: new Date().toISOString()
          });
        }
      }
    } finally {
      this.syncInProgress = false;
      this.lastSyncTime = Date.now();
    }
  }

  static shouldSync(): boolean {
    return Date.now() - this.lastSyncTime > this.syncInterval;
  }

  static async getUnsyncedData(): Promise<{
    events: CachedAlexaEvent[];
    macros: CachedMacro[];
  }> {
    const events = await db.alexaEvents.where("synced").notEqual(true).toArray();
    const macros = await db.macros.where("synced").notEqual(true).toArray();
    return { events, macros };
  }

  static async markAsSynced(eventIds: string[], macroIds: string[]): Promise<void> {
    const now = new Date().toISOString();

    for (const id of eventIds) {
      await db.alexaEvents.update(id, { synced: true, syncedAt: now });
    }

    for (const id of macroIds) {
      await db.macros.update(id, { synced: true, syncedAt: now });
    }
  }
}

/**
 * Storage helper for preferences
 */
export class PreferenceStore {
  private static prefix = "evbot_";

  static async get(key: string, defaultValue?: any): Promise<any> {
    const fullKey = `${this.prefix}${key}`;
    try {
      const value = await db.settings.get(fullKey);
      return value?.value ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static async set(key: string, value: any): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    await db.settings.put({ key: fullKey, value, timestamp: Date.now() });
  }

  static async remove(key: string): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    await db.settings.delete(fullKey);
  }

  static async clear(): Promise<void> {
    await db.settings.clear();
  }
}
