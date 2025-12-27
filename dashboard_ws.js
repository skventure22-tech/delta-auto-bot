import express from 'express';
import { db } from './db.js';

export const router = express.Router();

router.get('/status', async (req,res)=>{
  const [r] = await db.query(
    "SELECT trade_status FROM users WHERE role='user' LIMIT 1"
  );
  res.json(r[0]);
});
