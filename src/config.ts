import dotenv from 'dotenv';

dotenv.config();

const trimmed = (val?: string) => (val ? val.trim() : undefined);

export const env = {
  BOT_TOKEN: trimmed(process.env.BOT_TOKEN),
  SUPABASE_URL: trimmed(process.env.SUPABASE_URL),
  SUPABASE_SERVICE_ROLE_KEY: trimmed(process.env.SUPABASE_SERVICE_ROLE_KEY),
  ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID ? Number(process.env.ADMIN_CHAT_ID) : undefined,
  LOG_CHAT_ID: process.env.LOG_CHAT_ID ? Number(process.env.LOG_CHAT_ID) : undefined,
  WEBAPP_URL: trimmed(process.env.WEBAPP_URL),
  API_PORT: process.env.API_PORT ? Number(process.env.API_PORT) : undefined,
  SUPABASE_ANON_KEY: trimmed(process.env.SUPABASE_ANON_KEY),
  ALLOW_DEV_INIT_DATA: process.env.ALLOW_DEV_INIT_DATA === 'true',
  DISABLE_API: process.env.DISABLE_API === 'true',
  ORDER_CHAT_ID: process.env.ORDER_CHAT_ID ? Number(process.env.ORDER_CHAT_ID) : 3662210811,
  WELCOME_PHOTO_FILE_ID: trimmed(process.env.WELCOME_PHOTO_FILE_ID),
  WELCOME_PHOTO_URL: trimmed(process.env.WELCOME_PHOTO_URL),
  WELCOME_CAPTION_SHORT: trimmed(process.env.WELCOME_CAPTION_SHORT),
  WELCOME_TEXT_FULL: trimmed(process.env.WELCOME_TEXT_FULL),
};

export const hasSupabase =
  Boolean(env.SUPABASE_URL) && Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
