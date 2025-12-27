import { tradeLoop } from "./tradeEngine.js";

const workers = new Map();

export function startUser(uid){
  if(workers.has(uid)) return;
  const intv = setInterval(()=>tradeLoop(uid), 3000);
  workers.set(uid,intv);
}

export function stopUser(uid){
  if(workers.has(uid)){
    clearInterval(workers.get(uid));
    workers.delete(uid);
  }
}
