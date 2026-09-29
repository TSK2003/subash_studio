import { useEffect, useRef } from "react";
import { API_BASE } from "../lib/api.js";

/**
 * useRealtimeSync
 * Establishes a single shared Server-Sent Events (SSE) connection.
 * Listens for backend DATA_CHANGED notifications and triggers targeted updates.
 *
 * Features:
 * - Automatic reconnection with exponential backoff (2s up to 16s).
 * - Recovery synchronization: calls onReconnectSync when connection re-opens after disconnect.
 * - Clean event listener and connection lifecycle management.
 */
export function useRealtimeSync({ onDataChanged, onReconnectSync, enabled = true }) {
  const onDataChangedRef = useRef(onDataChanged);
  const onReconnectSyncRef = useRef(onReconnectSync);
  const hadErrorRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);
  const retryDelayRef = useRef(2000);

  useEffect(() => {
    onDataChangedRef.current = onDataChanged;
  }, [onDataChanged]);

  useEffect(() => {
    onReconnectSyncRef.current = onReconnectSync;
  }, [onReconnectSync]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.EventSource) {
      return;
    }

    let eventSource = null;
    let isMounted = true;

    function connect() {
      if (!isMounted) return;

      const sseUrl = `${API_BASE}/api/realtime`;
      try {
        eventSource = new EventSource(sseUrl);

        eventSource.onopen = () => {
          if (!isMounted) return;
          retryDelayRef.current = 2000; // Reset backoff delay on successful connection

          if (hadErrorRef.current) {
            console.log("[Realtime] Reconnected to server. Performing recovery synchronization...");
            if (typeof onReconnectSyncRef.current === "function") {
              onReconnectSyncRef.current();
            }
            hadErrorRef.current = false;
          } else {
            console.log("[Realtime] Connected to real-time event stream.");
          }
        };

        // Listen for the custom DATA_CHANGED event
        eventSource.addEventListener("DATA_CHANGED", (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data && typeof onDataChangedRef.current === "function") {
              onDataChangedRef.current(data);
            }
          } catch (err) {
            console.error("[Realtime] Failed to parse DATA_CHANGED event:", err);
          }
        });

        // Also handle generic message in case server sends it as default event
        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data && data.type === "DATA_CHANGED" && typeof onDataChangedRef.current === "function") {
              onDataChangedRef.current(data);
            }
          } catch {
            // Heartbeat/ping or non-json message, ignore safely
          }
        };

        eventSource.onerror = () => {
          if (!isMounted) return;
          console.warn("[Realtime] Connection error or disconnected. Scheduling reconnect...");
          hadErrorRef.current = true;

          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          // Reconnect with exponential backoff (2s, 4s, 8s, max 16s)
          const delay = retryDelayRef.current;
          retryDelayRef.current = Math.min(delay * 2, 16000);

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        };
      } catch (err) {
        console.error("[Realtime] Error initializing EventSource:", err);
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }, [enabled]);
}

export default useRealtimeSync;
