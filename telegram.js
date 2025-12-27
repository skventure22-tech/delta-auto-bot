import fetch from 'node-fetch';
import cfg from './config.js';

export async function tg(msg){
  if(!cfg.TELEGRAM.token) return;

  const url = `https://api.telegram.org/bot${cfg.TELEGRAM.token}/sendMessage`;
  await fetch(url,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      chat_id: cfg.TELEGRAM.chat,
      text: msg
    })
  });
}
