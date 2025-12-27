import WebSocket from "ws";

export function startWS(symbol, onPrice) {
  const ws = new WebSocket("wss://socket.delta.exchange");

  ws.on("open", () => {
    ws.send(JSON.stringify({
      type: "subscribe",
      payload: { channels: [{ name: "ticker", symbols: [symbol] }] }
    }));
  });

  ws.on("message", msg => {
    const data = JSON.parse(msg);
    if (data.type === "ticker") onPrice(data.price);
  });
}
