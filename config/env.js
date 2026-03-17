import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const {
  PORT,
  NODE_ENV,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ARCJET_ENV,
  ARCJET_KEY,
  SERVER_URL,
  EMAIL_PASSWORD,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  FRONTEND_URL,
} = process.env;
