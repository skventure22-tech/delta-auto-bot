import ccxt from "ccxt";
import config from "../config.js";

(async () => {
  try {
    const ex = new ccxt.delta({
      apiKey: config.DELTA_API_KEY,
      secret: config.DELTA_API_SECRET
    });
    await ex.fetchBalance();
    console.log("API OK");
  } catch {
    console.log("API FAILED – disable trading");
  }
})();
