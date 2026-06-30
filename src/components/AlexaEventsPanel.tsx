/**
 * Enhanced Alexa Events Panel Component
 * Displays and manages Alexa skill events with real-time updates
 */

import React, { useState, useEffect } from "react";
import {
  Radio,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";
import { AlexaEvent } from "../types";
import { useAlexaIntegration, useOfflineSupport } from "../hooks";

interface AlexaEventsPanelProps {
  onActionTriggered?: (phrase: string) => void;
}

export default function AlexaEventsPanel({ onActionTriggered }: AlexaEventsPanelProps) {
  const [events, setEvents] = useState<AlexaEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [customPhrase, setCustomPhrase] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const {
    triggerAction,
    getEvents,
    syncData,
    isOnline: isAlexaOnline
  } = useAlexaIntegration({ autoInitialize: true });

  const { isOnline } = useOfflineSupport();

  // Load events on mount and set up refresh interval
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const fetchedEvents = await getEvents();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();

    // Refresh every 10 seconds
    const interval = setInterval(loadEvents, 10000);
    return () => clearInterval(interval);
  }, [getEvents]);

  // Handle trigger custom phrase
  const handleTriggerPhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhrase.trim()) return;

    setIsExecuting(true);
    try {
      await triggerAction(customPhrase);
      setCustomPhrase("");
      onActionTriggered?.(customPhrase);

      // Refresh events
      const updated = await getEvents();
      setEvents(updated);
    } catch (error) {
      console.error("Failed to trigger phrase:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle sync
  const handleSync = async () => {
    setLoading(true);
    try {
      await syncData();
      const updated = await getEvents();
      setEvents(updated);
    } finally {
      setLoading(false);
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Radio className="w-4 h-4 text-blue-500" />;
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Alexa Events</h3>
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            isOnline
              ? "bg-green-500/20 text-green-300"
              : "bg-red-500/20 text-red-300"
          }`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
        <button
          onClick={handleSync}
          disabled={loading}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          title="Sync with server"
        >
          <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Trigger Custom Phrase */}
      <form onSubmit={handleTriggerPhrase} className="flex gap-2">
        <input
          type="text"
          value={customPhrase}
          onChange={(e) => setCustomPhrase(e.target.value)}
          placeholder="Say something to Alexa..."
          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          disabled={isExecuting || !isOnline}
        />
        <button
          type="submit"
          disabled={!customPhrase.trim() || isExecuting || !isOnline}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {isExecuting ? "..." : "Send"}
        </button>
      </form>

      {/* Events List */}
      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>No Alexa events yet</p>
            <p className="text-sm mt-1">Events will appear here as you interact with Alexa</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:border-slate-600 transition-colors"
            >
              {/* Status Icon */}
              <div className="mt-1">{getStatusIcon(event.status)}</div>

              {/* Event Details */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{event.phrase}</p>
                <p className="text-sm text-slate-300 line-clamp-2">{event.actionTaken}</p>
                <p className="text-xs text-slate-400 mt-1">{formatTime(event.timestamp)}</p>
              </div>

              {/* Status Badge */}
              <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                event.status === "success"
                  ? "bg-green-500/20 text-green-300"
                  : event.status === "failed"
                  ? "bg-red-500/20 text-red-300"
                  : "bg-yellow-500/20 text-yellow-300"
              }`}>
                {event.status}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Empty State with Suggestions */}
      {events.length === 0 && !loading && (
        <div className="bg-slate-700/30 p-4 rounded-lg border border-dashed border-slate-600">
          <p className="text-sm text-slate-300 font-medium mb-2">💡 Try saying:</p>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• "Open ev-bot and launch Discord"</li>
            <li>• "Ask ev-bot to sync my macros"</li>
            <li>• "Execute focus mode"</li>
            <li>• "List my macros"</li>
          </ul>
        </div>
      )}
    </div>
  );
}
