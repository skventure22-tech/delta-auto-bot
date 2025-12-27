export function calcPositionSize(balance, price, risk) {
  return (balance * risk) / price;
}
