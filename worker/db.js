import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

let connection;

async function initDB() {
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DB,
    });

    console.log("MySQL DB connected successfully");

  } catch (err) {
    console.error("MySQL connection failed:", err.message);
    process.exit(1);
  }
}

await initDB();

export async function saveTrade(pair, side, size, entry, pnl, status) {
  const q = "INSERT INTO trades(uid,pair,dir,size,entry,pnl,status) VALUES(1,?,?,?,?,?,?)";
  await connection.execute(q, [pair, side, size, entry, pnl, status]);
}

export async function updatePosition(pair, side, size, entry, now, pnl, trail) {
  const q = "REPLACE INTO positions(pair,uid,dir,size,entry,now,pnl,trail) VALUES(?,?,?,?,?,?,?,?)";
  await connection.execute(q, [pair, 1, side, size, entry, now, pnl, trail]);
}

export async function updateBalance(wallet, margin, util) {
  const q = "REPLACE INTO balance(uid,wallet,margin,util) VALUES(1,?,?,?)";
  await connection.execute(q, [wallet, margin, util]);
}

export { connection };
