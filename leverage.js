export async function setLeverage(exchange, symbol, lev) {
  try {
    await exchange.setLeverage(lev, symbol);
  } catch (e) {
    console.log("Leverage set failed");
  }
}
