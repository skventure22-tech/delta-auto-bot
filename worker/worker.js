import crypto from "crypto";
import WebSocket from "ws";
import fetch from "node-fetch";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const WS_URL = process.env.WS_BASE;
const REST_URL = process.env.REST_BASE;

let db;

// Initialize MySQL connection
async function initDB(){
  while(true){
    try{
      db = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB,
      });
      console.log("MySQL Connected");
      break;
    }catch(e){
      console.error("DB connect failed → retrying 5s:", e.message);
      await new Promise(r=>setTimeout(r,5000));
    }
  }
}
await initDB();

// HMAC Sign for Delta API
function sign(method, endpoint, body=""){
  const ts = Date.now().toString();
  const msg = ts + method.toUpperCase() + endpoint + body;
  const sig = crypto.createHmac("sha256", process.env.DELTA_API_SECRET).update(msg).digest("hex");
  return {"api-key":process.env.DELTA_API_KEY, "timestamp":ts, "signature":sig, "Content-Type":"application/json"};
}

// Fetch Latest Price (LTP)
async function getLTP(pair){
  try{
    const r = await fetch(REST_URL + "/tickers/" + pair);
    const j = await r.json();
    return parseFloat(j.result.close);
  }catch{
    return 0;
  }
}

// Check volatility for 1-minute candle wick > 1.2%
async function isVolSafe(pair){
  try{
    const r = await fetch(REST_URL + "/history/candles?symbol="+pair+"&resolution=1m&limit=1");
    const c = (await r.json()).result[0];
    const wick = Math.abs(c.high - c.low) / c.low * 100;
    return wick < 1.2;
  }catch{
    return false;
  }
}

// Place Market Order (BUY/SELL/EXIT)
async function placeOrder(pair, side, size, leverage){
  try{
    const endpoint = "/orders";
    const payload = { product_id: pair, size, side: side.toLowerCase(), order_type: "market", leverage };
    const headers = sign("POST", endpoint, JSON.stringify(payload));
    await fetch(REST_URL + endpoint, {method:"POST", headers, body: JSON.stringify(payload)});
    console.log("Order placed:", pair, side, size, "Lev:", leverage);
  }catch(e){
    console.error("Order failed:", e.message);
  }
}

// Close Position via market exit
async function closePosition(pair){
  try{
    const endpoint = "/positions/close";
    const payload = { product_id: pair };
    const headers = sign("POST", endpoint, JSON.stringify(payload));
    await fetch(REST_URL + endpoint, {method:"POST", headers, body: JSON.stringify(payload)});
  }catch{}
}

// Save logs in DB
async function logTrade(uid, pair, event, details){
  try{
    await db.execute("INSERT INTO trade_logs(uid,pair,event,details) VALUES(?,?,?,?)", [uid,pair,event,details]);
  }catch{}
}

// Main trading loop
async function tradingLoop(){
  const PAIRS = ["BTCUSD", "ETHUSD"];

  while(true){
    for(const pair of PAIRS){

      // Skip entry if volatility is high
      if(!(await isVolSafe(pair))){
        continue;
      }

      const price = await getLTP(pair);
      if(price <= 0) continue;

      const size = 0.01; // Example sizing (later upgradeable)
      const leverage = price > 50000 ? 100 : 50; // governance demo

      // Entry BUY
      await placeOrder(pair, "BUY", size, leverage);
      await logTrade(1, pair, "BUY", "Auto entry executed");

      // Monitor P/L
      const entry = price;
      const now   = price + (Math.random()*400 - 200); // simulated move
      const pnl   = (now - entry) * size;

      // Trailing stop logic
      let trailStatus = "-";
      if(pnl >= 300 && pnl < 600) trailStatus = "ACTIVE";

      // SL HIT
      if(pnl <= -300){
        await closePosition(pair);
        await logTrade(1, pair, "SL HIT", "Loss exceeded -300, exited");
        trailStatus = "-";
      }

      // TP HIT
      if(pnl >= 600){
        await closePosition(pair);
        await logTrade(1, pair, "TP HIT", "Profit reached +600, exited");
        trailStatus = "-";
      }

      // Update DB position snapshot
      try{
        await db.execute("REPLACE INTO positions(product_id,uid,direction,size,entry_price,current_price,unrealized_pnl,trailing_stop_status) VALUES(?,?,?,?,?,?,?,?)",
        [pair,1,"BUY",size,price,now,pnl.toFixed(2),trailStatus]);
      }catch{}
    }

    await new Promise(r=>setTimeout(r,5000));
  }
}

// Start WebSocket stable feed
function startWS(){
  let ws;
  function connect(){
    console.log("WS connecting...");
    ws = new WebSocket(WS_URL);
    ws.on("open", ()=>console.log("WS Connected"));
    ws.on("message", m=>console.log("WS:",m.toString()));
    ws.on("close", ()=>{console.error("WS Closed → retry 5s"); setTimeout(connect,5000);});
    ws.on("error", e=>console.error("WS error:",e.message));
  }
  connect();
}
startWS();

// Run trading engine
tradingLoop();
