/**
 * Alexa Setup Configuration Component
 * Allows users to configure their Alexa skill connection
 */

import React, { useState, useEffect } from "react";
import { Settings, X, Check, AlertCircle, Loader } from "lucide-react";
import { useAlexaIntegration } from "../hooks";
import { PreferenceStore } from "../services/db";

interface AlexaSetupProps {
  onClose?: () => void;
  onConfigured?: () => void;
}

export default function AlexaSetup({ onClose, onConfigured }: AlexaSetupProps) {
  const [endpoint, setEndpoint] = useState("");
  const [skillId, setSkillId] = useState("evbot");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { initializeAlexa } = useAlexaIntegration();

  // Load saved config on mount
  useEffect(() => {
    const loadSavedConfig = async () => {
      try {
        const saved = await PreferenceStore.get("alexaConfig");
        if (saved) {
          setEndpoint(saved.endpoint || "");
          setSkillId(saved.skillId || "evbot");
          setApiKey(saved.apiKey || "");
        }
      } catch (error) {
        console.error("Failed to load saved config:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedConfig();
  }, []);

  // Validate endpoint
  const validateEndpoint = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith("https://") || url.startsWith("http://");
    } catch {
      return false;
    }
  };

  // Handle save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!endpoint.trim()) {
      setError("Endpoint URL is required");
      return;
    }

    if (!validateEndpoint(endpoint)) {
      setError("Invalid endpoint URL");
      return;
    }

    setLoading(true);

    try {
      // Test connection to endpoint
      const response = await fetch(`${endpoint}/api/v1/health`, {
        method: "GET",
        headers: apiKey ? { "Authorization": `Bearer ${apiKey}` } : {}
      });

      if (!response.ok) {
        throw new Error(`Connection failed: HTTP ${response.status}`);
      }

      // Save configuration
      const config = {
        endpoint,
        skillId,
        apiKey: apiKey || undefined
      };

      await initializeAlexa(config);
      await PreferenceStore.set("alexaConfig", config);

      setSuccess(true);
      setTimeout(() => {
        onConfigured?.();
        onClose?.();
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 rounded-lg border border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Alexa Setup</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Backend Endpoint */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Backend Endpoint <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://your-backend.example.com"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            disabled={loading}
          />
          <p className="text-xs text-slate-400 mt-1">
            e.g., https://ev-bot-backend.onrender.com
          </p>
        </div>

        {/* Skill ID */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Alexa Skill ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
            placeholder="amzn1.ask.skill.xxxxx"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            disabled={loading}
          />
          <p className="text-xs text-slate-400 mt-1">
            Find this in your Alexa Skills configuration
          </p>
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            API Key <span className="text-slate-400">(Optional)</span>
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Your API key (if required)"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            disabled={loading}
          />
          <p className="text-xs text-slate-400 mt-1">
            Leave empty if your backend doesn't require authentication
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-300">Configuration saved successfully!</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Config
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-dashed border-slate-600">
        <p className="text-xs font-medium text-slate-300 mb-2">📝 Setup Instructions:</p>
        <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
          <li>Deploy the EV-Bot backend to a public URL</li>
          <li>Configure your Alexa skill with the backend endpoint</li>
          <li>Enter your backend endpoint URL above</li>
          <li>Click "Save Config" to connect</li>
        </ol>
      </div>
    </div>
  );
}
