/**
 * Capacitor Native Bridge
 * Handles communication between React and native Android/iOS code
 */

import { App } from "@capacitor/app";
import { Toast } from "@capacitor/toast";
import { Preferences } from "@capacitor/preferences";
import { Geolocation } from "@capacitor/geolocation";
import { AlexaEvent } from "../types";

export class CapacitorBridge {
  /**
   * Initialize native plugin listeners
   */
  static async initialize(): Promise<void> {
    // Listen for app state changes
    App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
        console.log("App became active");
        this.onAppActive();
      } else {
        console.log("App became inactive");
        this.onAppInactive();
      }
    });

    // Listen for app URL deep links (from Alexa skill)
    App.addListener("appUrlOpen", (event) => {
      console.log("App URL opened:", event.url);
      this.handleDeepLink(event.url);
    });

    // Listen for back button
    App.addListener("backButton", ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      }
    });
  }

  /**
   * Show native toast notification
   */
  static async showToast(message: string, duration: "short" | "long" = "short"): Promise<void> {
    await Toast.show({
      text: message,
      duration: duration === "short" ? 2000 : 3500,
      position: "bottom"
    });
  }

  /**
   * Save data to native preferences (secure storage on Android)
   */
  static async savePreference(key: string, value: string): Promise<void> {
    await Preferences.set({
      key,
      value
    });
  }

  /**
   * Get data from native preferences
   */
  static async getPreference(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  }

  /**
   * Remove preference
   */
  static async removePreference(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  /**
   * Get device location (for contextual Alexa commands)
   */
  static async getDeviceLocation(): Promise<{ lat: number; lng: number } | null> {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      return {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude
      };
    } catch (error) {
      console.warn("Failed to get location:", error);
      return null;
    }
  }

  /**
   * Handle deep links from Alexa skill
   * Example: evbot://action/macro/macro-1
   */
  private static handleDeepLink(url: string): void {
    try {
      const urlObj = new URL(url);

      if (urlObj.protocol === "evbot:") {
        const action = urlObj.pathname;

        // Handle different deep link types
        if (action.startsWith("//action/macro/")) {
          const macroId = action.split("/").pop();
          window.dispatchEvent(
            new CustomEvent("evbot:executeeMacro", { detail: { macroId } })
          );
        } else if (action.startsWith("//action/trigger")) {
          const phrase = urlObj.searchParams.get("phrase");
          if (phrase) {
            window.dispatchEvent(
              new CustomEvent("evbot:triggerSkill", { detail: { phrase } })
            );
          }
        }
      }
    } catch (error) {
      console.error("Failed to handle deep link:", error);
    }
  }

  /**
   * Called when app becomes active - sync with backend
   */
  private static onAppActive(): void {
    window.dispatchEvent(new CustomEvent("evbot:appActive"));
  }

  /**
   * Called when app becomes inactive - save state
   */
  private static onAppInactive(): void {
    window.dispatchEvent(new CustomEvent("evbot:appInactive"));
  }

  /**
   * Execute a macro via native Android action
   */
  static async executeMacro(macroId: string, actions: string[]): Promise<boolean> {
    try {
      // In a real implementation, this would call native Android code
      // For now, we simulate the execution
      console.log(`Executing macro ${macroId}:`, actions);
      await this.showToast(`Executing macro: ${macroId}`);
      return true;
    } catch (error) {
      console.error("Failed to execute macro:", error);
      return false;
    }
  }

  /**
   * Register device with Alexa service for push notifications
   */
  static async registerForPushNotifications(deviceId: string): Promise<void> {
    try {
      // Store device ID for push notifications
      await this.savePreference("evbot_device_id", deviceId);
      console.log("Registered device for push notifications:", deviceId);
    } catch (error) {
      console.error("Failed to register for push notifications:", error);
    }
  }

  /**
   * Get device information for telemetry
   */
  static async getDeviceInfo(): Promise<any> {
    return {
      platform: this._getPlatform(),
      userAgent: navigator.userAgent,
      onLine: navigator.onLine,
      timestamp: new Date().toISOString()
    };
  }

  private static _getPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("android")) return "android";
    if (userAgent.includes("iphone") || userAgent.includes("ipad")) return "ios";
    return "web";
  }
}

/**
 * Custom events for app communication
 */
export const AppEvents = {
  EXECUTE_MACRO: "evbot:executeMacro",
  TRIGGER_SKILL: "evbot:triggerSkill",
  APP_ACTIVE: "evbot:appActive",
  APP_INACTIVE: "evbot:appInactive"
};
