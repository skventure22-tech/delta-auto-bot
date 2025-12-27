import { getSignal } from "./strategy.js";

export function backtest(candles) {
  let pnl = 0;
  for (let i = 50; i < candles.length; i++) {
    const sig = getSignal(candles.slice(0, i));
    if (sig === "BUY") pnl += 10;
    if (sig === "SELL") pnl -= 5;
  }
  return pnl;
}
