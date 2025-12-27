import WebSocket from "ws";
import dotenv from "dotenv";
dotenv.config();

let ws;

function connectWS() {
  console.log("WebSocket connecting...");
  ws = new WebSocket(process.env.WS_BASE);

  ws.on("open", () => {
    console.log("WebSocket connected");
    // Keepalive ping to avoid sleep/disconnect
    setInterval(() => ws.ping(), 10000);
  });

  ws.on("message", (msg) => {
    console.log("WS:", msg.toString());
  });

  ws.on("close", () => {
    console.error("WebSocket closed, reconnecting in 5s...");
    setTimeout(connectWS, 5000);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
  });
}

connectWS();

export { ws, connectWS };
