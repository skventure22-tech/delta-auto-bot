import WebSocket from "ws";
import dotenv from "dotenv";
dotenv.config();

export const prices = {};
let ws, pingInterval;

export function connectWS() {
  console.log("🟡 Delta WS connecting…");

  ws = new WebSocket(
    process.env.WS_BASE || "wss://api.delta.exchange/v2/websocket"
  );

  ws.on("open", () => {
    console.log("🟢 Delta WS connected");

    ws.send(JSON.stringify({
      type: "subscribe",
      payload: {
        channels: [
          "v2/ticker/BTCUSDT",
          "v2/ticker/ETHUSDT"
        ]
      }
    }));

    pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    }, 15000);
  });

  ws.on("message", (msg) => {
    try {
      const d = JSON.parse(msg.toString());
      if (d.symbol && d.mark_price) {
        prices[d.symbol] = Number(d.mark_price);
      }
    } catch {}
  });

  ws.on("close", () => {
    console.error("🔴 WS closed → reconnecting");
    cleanup();
    setTimeout(connectWS, 3000);
  });

  ws.on("error", () => ws.close());
}

function cleanup() {
  if (pingInterval) clearInterval(pingInterval);
}

connectWS();
