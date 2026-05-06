// Real-time notifications channel — /ws/notifications.
//
// Why a separate file? The WebSocket endpoint authenticates via query
// parameters (token + tenant_id), not headers, because browsers don't allow
// custom headers on the initial WS upgrade request. This module handles that
// + reconnect-with-backoff so consumers just call `connect(...)` and listen
// for events.

import { tenantStorage } from "./tenant-storage";
import { tokenStorage } from "./token-storage";

declare const process: { env: Record<string, string | undefined> } | undefined;

function getBaseUrl(): string {
  const env =
    typeof process !== "undefined" && process?.env
      ? process.env.NEXT_PUBLIC_API_BASE_URL
      : undefined;
  return (env ?? "http://localhost:8000").replace(/\/+$/, "");
}

function toWsUrl(httpUrl: string): string {
  if (httpUrl.startsWith("https://")) return "wss://" + httpUrl.slice(8);
  if (httpUrl.startsWith("http://")) return "ws://" + httpUrl.slice(7);
  return httpUrl;
}

export type NotificationSocketState = "connecting" | "open" | "closed";

export interface NotificationSocket {
  /** Cleanly close the socket and stop reconnect attempts. */
  close(): void;
  /** Current connection state. */
  state(): NotificationSocketState;
}

export interface ConnectOptions {
  /** Override the active tenant. Defaults to `tenantStorage.get()`. */
  tenantId?: string;
  /** Override the access token. Defaults to `tokenStorage.getAccessToken()`. */
  token?: string;
  /** Called for every parsed JSON message from the server. */
  onMessage: (message: unknown) => void;
  /** Optional state-change hook (connecting → open → closed). */
  onStateChange?: (state: NotificationSocketState) => void;
  /** Optional error hook. */
  onError?: (err: Event) => void;
  /** Disable auto-reconnect. Default: enabled with exponential backoff. */
  autoReconnect?: boolean;
}

/**
 * Connect to the notifications WebSocket channel.
 *
 * The server authenticates the upgrade via `?token=<jwt>&tenant_id=<uuid>`
 * (close code 4401 if either is invalid). On unexpected disconnect we
 * reconnect with exponential backoff capped at 30s.
 *
 *   const socket = connectNotificationSocket({
 *     onMessage: (msg) => store.addNotification(msg),
 *     onStateChange: setStatus,
 *   });
 *   // later...
 *   socket.close();
 */
export function connectNotificationSocket(opts: ConnectOptions): NotificationSocket {
  if (typeof window === "undefined" || typeof WebSocket === "undefined") {
    // SSR / non-browser environment — return a no-op handle.
    return {
      close: () => {},
      state: () => "closed",
    };
  }

  const tenant = opts.tenantId ?? tenantStorage.get();
  const token = opts.token ?? tokenStorage.getAccessToken();

  if (!tenant || !token) {
    opts.onStateChange?.("closed");
    throw new Error("notification-socket: tenant id or access token is missing");
  }

  const wsBase = toWsUrl(getBaseUrl());
  const url = `${wsBase}/ws/notifications?token=${encodeURIComponent(token)}&tenant_id=${encodeURIComponent(tenant)}`;

  let ws: WebSocket | null = null;
  let state: NotificationSocketState = "closed";
  let attempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let manualClose = false;
  const autoReconnect = opts.autoReconnect ?? true;

  const setState = (next: NotificationSocketState) => {
    state = next;
    opts.onStateChange?.(next);
  };

  const open = () => {
    if (manualClose) return;
    setState("connecting");
    try {
      ws = new WebSocket(url);
    } catch (err) {
      opts.onError?.(err as unknown as Event);
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      attempt = 0;
      setState("open");
    };

    ws.onmessage = (event) => {
      let parsed: unknown = event.data;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        // not JSON — pass through the raw string
      }
      opts.onMessage(parsed);
    };

    ws.onerror = (event) => {
      opts.onError?.(event);
    };

    ws.onclose = (event) => {
      setState("closed");
      // 4401 = auth failed at the gateway; don't reconnect.
      if (event.code === 4401 || manualClose || !autoReconnect) return;
      scheduleReconnect();
    };
  };

  const scheduleReconnect = () => {
    attempt += 1;
    const delay = Math.min(30_000, 500 * 2 ** Math.min(attempt, 6));
    reconnectTimer = setTimeout(open, delay);
  };

  open();

  return {
    close: () => {
      manualClose = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    },
    state: () => state,
  };
}
