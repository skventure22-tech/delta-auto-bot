import express from 'express';
import { router as dashboardWS } from './dashboard_ws.js';
import { workerTick } from './worker.js';

const app = express();
app.use(express.json());

app.use('/api', dashboardWS);

app.get('/', (_,res)=>res.send('Delta Auto Bot Running'));

setInterval(()=>{
  workerTick({
    price: Math.random()*100,
    rsi: Math.random()*100,
    volatility: Math.random()*2
  });
}, 5000);

app.listen(process.env.PORT);
