// Bridge between Next.js route handlers and the WebSocket server in `server.js`.
// Both sides share a single EventEmitter placed on globalThis by server.js.
// Emitting "broadcast" here pushes a JSON payload to every connected client.

import { EventEmitter } from "events";

type GlobalWithBus = typeof globalThis & { __gf_notification_bus__?: EventEmitter };

function getBus(): EventEmitter {
  const g = globalThis as GlobalWithBus;
  if (!g.__gf_notification_bus__) {
    g.__gf_notification_bus__ = new EventEmitter();
    g.__gf_notification_bus__.setMaxListeners(1000);
  }
  return g.__gf_notification_bus__;
}

export function broadcastNotification(payload: unknown): void {
  getBus().emit("broadcast", payload);
}
