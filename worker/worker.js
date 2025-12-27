import dotenv from "dotenv";
dotenv.config();

import { db } from "./db.js";
import { managePosition } from "./tradeEngine.js";
import { LOOP_INTERVAL } from "./config.js";

console.log("🚀 MASTER WORKER STARTED");

async function loop() {
  while (true) {
    try {
      const [sys] = await db.query("SELECT kill_switch FROM system");
      if (sys[0]?.kill_switch) {
        await sleep(3000);
        continue;
      }

      const [positions] = await db.query(
        "SELECT * FROM positions WHERE status='OPEN'"
      );

      for (const pos of positions) {
        await managePosition(pos);
      }
    } catch (e) {
      console.error("Worker error:", e.message);
    }

    await sleep(LOOP_INTERVAL);
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

loop();
