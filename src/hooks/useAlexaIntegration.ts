/**
 * React Hook for Alexa Integration
 * Manages Alexa service initialization, events, and state
 */

import React, { useEffect, useCallback, useRef } from "react";
import { AlexaService, AlexaSkillConfig } from "../services/alexaService";
import { CapacitorBridge, AppEvents } from "../services/capacitorBridge";
import { db, PreferenceStore } from "../services/db";

export interface UseAlexaIntegrationOptions {
  autoInitialize?: boolean;
  enableOfflineMode?: boolean;
  enableAutoSync?: boolean;
}

export function useAlexaIntegration(options: UseAlexaIntegrationOptions = {}) {
  const {
    autoInitialize = true,
    enableOfflineMode = true,
    enableAutoSync = true
  } = options;

  const isMountedRef = useRef(true);
  const isInitializedRef = useRef(false);

  /**
   * Initialize Alexa service
   */
  const initializeAlexa = useCallback(async (config: AlexaSkillConfig) => {
    if (isInitializedRef.current) return;

    try {
      await AlexaService.initialize(config);
      if (enableAutoSync) {
        AlexaService.syncPendingData();
      }
      isInitializedRef.current = true;
    } catch (error) {
      console.error("Failed to initialize Alexa service:", error);
    }
  }, [enableAutoSync]);

  /**
   * Trigger an Alexa skill action
   */
  const triggerAction = useCallback(async (phrase: string) => {
    try {
      const event = await AlexaService.triggerSkillAction(phrase);
      await CapacitorBridge.showToast(`Triggered: ${phrase}`);
      return event;
    } catch (error) {
      console.error("Failed to trigger action:", error);
      await CapacitorBridge.showToast("Failed to trigger action");
      throw error;
    }
  }, []);

  /**
   * Get all Alexa events
   */
  const getEvents = useCallback(async () => {
    try {
      return await AlexaService.getAllEvents();
    } catch (error) {
      console.error("Failed to get events:", error);
      return [];
    }
  }, []);

  /**
   * Create a desktop macro
   */
  const createMacro = useCallback(async (macro: any) => {
    try {
      const created = await AlexaService.createMacro(macro);
      await CapacitorBridge.showToast(`Macro created: ${macro.name}`);
      return created;
    } catch (error) {
      console.error("Failed to create macro:", error);
      await CapacitorBridge.showToast("Failed to create macro");
      throw error;
    }
  }, []);

  /**
   * Toggle macro state
   */
  const toggleMacro = useCallback(async (id: string, isActive: boolean) => {
    try {
      const updated = await AlexaService.toggleMacro(id, isActive);
      return updated;
    } catch (error) {
      console.error("Failed to toggle macro:", error);
      throw error;
    }
  }, []);

  /**
   * Delete a macro
   */
  const deleteMacro = useCallback(async (id: string) => {
    try {
      await AlexaService.deleteMacro(id);
      await CapacitorBridge.showToast("Macro deleted");
    } catch (error) {
      console.error("Failed to delete macro:", error);
      throw error;
    }
  }, []);

  /**
   * Get all macros
   */
  const getMacros = useCallback(async () => {
    try {
      return await AlexaService.getMacros();
    } catch (error) {
      console.error("Failed to get macros:", error);
      return [];
    }
  }, []);

  /**
   * Sync pending data with server
   */
  const syncData = useCallback(async () => {
    try {
      await AlexaService.syncPendingData();
      await CapacitorBridge.showToast("Data synced");
    } catch (error) {
      console.error("Failed to sync data:", error);
    }
  }, []);

  /**
   * Check if device is online
   */
  const isOnline = useCallback(() => {
    return AlexaService.isOnline();
  }, []);

  /**
   * Handle deep link execution
   */
  const handleDeepLink = useCallback((event: CustomEvent) => {
    const { macroId } = event.detail;
    if (macroId) {
      console.log("Executing macro from deep link:", macroId);
      CapacitorBridge.executeMacro(macroId, []).catch(console.error);
    }
  }, []);

  /**
   * Handle app state changes
   */
  const handleAppActive = useCallback(() => {
    if (enableAutoSync && AlexaService.isOnline()) {
      syncData();
    }
  }, [enableAutoSync, syncData]);

  // Initialize on mount
  useEffect(() => {
    isMountedRef.current = true;

    const init = async () => {
      if (autoInitialize) {
        // Try to load saved config
        const savedConfig = await PreferenceStore.get("alexaConfig");
        if (savedConfig) {
          await initializeAlexa(savedConfig);
        }

        // Initialize Capacitor bridge
        await CapacitorBridge.initialize();
      }

      // Register deep link listener
      window.addEventListener(AppEvents.EXECUTE_MACRO as any, handleDeepLink);
      window.addEventListener(AppEvents.APP_ACTIVE as any, handleAppActive);
    };

    init();

    return () => {
      isMountedRef.current = false;
      window.removeEventListener(AppEvents.EXECUTE_MACRO as any, handleDeepLink);
      window.removeEventListener(AppEvents.APP_ACTIVE as any, handleAppActive);
    };
  }, [autoInitialize, initializeAlexa, handleDeepLink, handleAppActive]);

  return {
    // Actions
    initializeAlexa,
    triggerAction,
    createMacro,
    toggleMacro,
    deleteMacro,
    syncData,

    // Getters
    getEvents,
    getMacros,
    isOnline,

    // Lifecycle
    isInitialized: isInitializedRef.current
  };
}

/**
 * Hook for offline support
 */
export function useOfflineSupport() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline };
}
