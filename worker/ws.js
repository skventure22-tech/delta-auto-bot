import WebSocket from "ws";
import dotenv from "dotenv";
dotenv.config();

/**
 * Live price cache
 * prices = { BTCUSDT: 68000.5, ETHUSDT: 3500.2 }
 */
export const prices = {};

let ws;
let pingInterval;

/* ================= CONNECT WS ================= */
export function connectWS() {
  console.log("🟡 Delta WebSocket connecting...");

  ws = new WebSocket(process.env.WS_BASE || "wss://api.delta.exchange/v2/websocket");

  ws.on("open", () => {
    console.log("🟢 Delta WebSocket connected");

    /* Subscribe to BTC & ETH tickers */
    ws.send(JSON.stringify({
      type: "subscribe",
      payload: {
        channels: [
          "v2/ticker/BTCUSDT",
          "v2/ticker/ETHUSDT"
        ]
      }
    }));

    /* Keep-alive ping (Railway safe) */
    pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 15000);
  });

  /* ================= MESSAGE ================= */
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());

      // Delta ticker message
      if (data.symbol && data.mark_price) {
        prices[data.symbol] = Number(data.mark_price);
      }
    } catch (e) {
      // silently ignore malformed packets
    }
  });

  /* ================= CLOSE ================= */
  ws.on("close", () => {
    console.error("🔴 WebSocket closed. Reconnecting in 3s...");
    cleanup();
    setTimeout(connectWS, 3000);
  });

  /* ================= ERROR ================= */
  ws.on("error", (err) => {
    console.error("❌ WebSocket error:", err.message);
    ws.close();
  });
}

/* ================= CLEANUP ================= */
function cleanup() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
}

/* ================= START ================= */
connectWS();
