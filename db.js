import mysql from 'mysql2/promise';
import cfg from './config.js';

export const db = await mysql.createPool({
  host: cfg.DB.host,
  user: cfg.DB.user,
  password: cfg.DB.pass,
  database: cfg.DB.name,
  waitForConnections: true
});
