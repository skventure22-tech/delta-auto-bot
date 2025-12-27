/**
 * Delta Auto Bot – Production Worker
 * Phase-1 Core Engine (Railway Ready)
 * Author: Bharat / SurgiTech
 */

require("dotenv").config();
const axios = require("axios");
const WebSocket = require("ws");
const db = require("../db");          // existing db.js
const { calcQty } = require("../risk"); // existing risk.js

// ================= CONFIG =================
const PAIRS = ["BTCUSDT", "ETHUSDT"];
const MAX_LOSS = -300;
const TAKE_PROFIT = 600;
const TRAIL_START = 300;
const WICK_LIMIT = 1.2; // %

const REST = process.env.REST_BASE;
const WS_URL = process.env.WS_BASE;

// =========================================
let prices = {};
let positions = {};
let ws;

// ================= WEBSOCKET ==============
function startWS() {
  ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    console.log("🟢 Delta WS Connected");
    PAIRS.forEach(p =>
      ws.send(JSON.stringify({ type: "subscribe", payload: { channels: [`v2/ticker/${p}`] } }))
    );
  });

  ws.on("message", msg => {
    try {
      const data = JSON.parse(msg);
      if (data.symbol && data.mark_price) {
        prices[data.symbol] = parseFloat(data.mark_price);
      }
    } catch {}
  });

  ws.on("close", () => {
    console.log("🔴 WS Disconnected. Reconnecting...");
    setTimeout(startWS, 3000);
  });

  ws.on("error", () => ws.close());
}

// ================= HELPERS =================
async function hasOpenPosition(pair) {
  const [r] = await db.query(
    "SELECT * FROM positions WHERE pair=? AND status='OPEN' LIMIT 1",
    [pair]
  );
  return r.length > 0;
}

async function placeOrder(pair, side, qty) {
  console.log(`📥 ORDER ${side} ${pair} QTY=${qty}`);
  // 👉 Actual Delta REST order call here
}

async function closePosition(pair, pnl) {
  console.log(`📤 EXIT ${pair} PNL=${pnl}`);
  await db.query(
    "UPDATE positions SET status='CLOSED', pnl=? WHERE pair=? AND status='OPEN'",
    [pnl, pair]
  );
}

// ================= ENGINE ==================
async function tradeLoop() {
  while (true) {
    try {
      // 🔴 KILL SWITCH
      if (process.env.KILL_SWITCH === "ON") {
        console.log("🚨 KILL SWITCH ACTIVE");
        for (const p of PAIRS) await closePosition(p, 0);
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }

      for (const pair of PAIRS) {
        const price = prices[pair];
        if (!price) continue;

        // One position rule
        if (await hasOpenPosition(pair)) continue;

        // Dummy candle wick check (replace with real candle if needed)
        const wickPct = Math.random() * 2;
        if (wickPct > WICK_LIMIT) {
          console.log(`⚠️ Skip ${pair} (High volatility)`);
          continue;
        }

        const qty = calcQty(price, 300);
        await placeOrder(pair, "BUY", qty);

        await db.query(
          "INSERT INTO positions (pair, entry_price, qty, status) VALUES (?,?,?, 'OPEN')",
          [pair, price, qty]
        );
      }

      // ========== POSITION MONITOR ==========
      const [open] = await db.query(
        "SELECT * FROM positions WHERE status='OPEN'"
      );

      for (const pos of open) {
        const ltp = prices[pos.pair];
        if (!ltp) continue;

        const pnl = (ltp - pos.entry_price) * pos.qty;

        if (pnl <= MAX_LOSS) await closePosition(pos.pair, pnl);
        else if (pnl >= TAKE_PROFIT) await closePosition(pos.pair, pnl);
        else if (pnl >= TRAIL_START) {
          console.log(`🔁 Trailing Active ${pos.pair} PNL=${pnl}`);
        }
      }

    } catch (e) {
      console.error("❌ Engine Error:", e.message);
    }

    await new Promise(r => setTimeout(r, 5000));
  }
}

// ================= START ===================
(async () => {
  console.log("🚀 Delta Auto Bot – Worker Started");
  startWS();
  tradeLoop();
})();
