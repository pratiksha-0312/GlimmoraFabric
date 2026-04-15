// Custom Next.js server with WebSocket support for /ws/notifications.
// Spec: P2-F01 real-time notification bell.

const { createServer } = require("node:http");
const { EventEmitter } = require("node:events");
const next = require("next");
const { WebSocketServer } = require("ws");

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const bus = new EventEmitter();
bus.setMaxListeners(1000);
globalThis.__gf_notification_bus__ = bus;

app.prepare().then(() => {
  const upgradeHandler = app.getUpgradeHandler();

  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "hello", ts: Date.now() }));

    const onBroadcast = (payload) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(payload));
      }
    };
    bus.on("broadcast", onBroadcast);

    ws.on("close", () => {
      bus.off("broadcast", onBroadcast);
    });

    ws.on("error", () => {
      bus.off("broadcast", onBroadcast);
    });
  });

  httpServer.on("upgrade", (req, socket, head) => {
    if (req.url === "/ws/notifications") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
      return;
    }
    // Forward all other upgrades (Next HMR, etc.) to Next.
    upgradeHandler(req, socket, head);
  });

  httpServer.listen(port, () => {
    console.log(
      `> Ready on http://localhost:${port} (${dev ? "development" : "production"}) — WS /ws/notifications`
    );
  });
});
