import 'dotenv/config';

export default {
  PORT: process.env.PORT || 3000,

  DB: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    name: process.env.DB_NAME
  },

  DELTA: {
    key: process.env.DELTA_KEY,
    secret: process.env.DELTA_SECRET
  },

  TELEGRAM: {
    token: process.env.TG_TOKEN,
    chat: process.env.TG_CHAT_ID
  }
};
