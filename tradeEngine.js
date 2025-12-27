import { calcPositionSize } from "./risk.js";

export async function executeTrade(exchange, signal, symbol) {
  const balance = (await exchange.fetchBalance()).USDT.free;
  const price = (await exchange.fetchTicker(symbol)).last;
  const qty = calcPositionSize(balance, price, 0.01);

  if (signal === "BUY")
    return exchange.createMarketBuyOrder(symbol, qty);

  if (signal === "SELL")
    return exchange.createMarketSellOrder(symbol, qty);
}
