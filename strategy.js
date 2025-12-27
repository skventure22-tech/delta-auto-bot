export function ema(prices, period) {
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

export function rsi(prices, period = 14) {
  let gains = 0, losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    diff >= 0 ? gains += diff : losses -= diff;
  }
  return 100 - (100 / (1 + gains / losses));
}

export function getSignal(candles) {
  const closes = candles.map(c => c[4]);
  const fast = ema(closes.slice(-20), 9);
  const slow = ema(closes.slice(-20), 21);
  const r = rsi(closes);

  if (fast > slow && r < 70) return "BUY";
  if (fast < slow && r > 30) return "SELL";
  return "HOLD";
}
