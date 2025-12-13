import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { env, hasSupabase } from '../config';
import { supabase } from '../supabase';
import { calculateLifePath } from '../utils/lifePath';
import { Product, Stone } from '../types';
import { validateInitData, TelegramUser } from './telegram';

type ApiUser = {
  id: string;
  telegram_id: number;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  birthdate?: string | null;
  life_path?: number | null;
  language_code?: string | null;
};

function getInitData(req: express.Request) {
  return (req.body?.telegram_init_data as string | undefined) ?? (req.headers['x-telegram-initdata'] as string | undefined);
}

async function ensureUser(telegramUser: TelegramUser | null, extra?: { birthdate?: string; life_path?: number | null }) {
  if (!supabase || !telegramUser) return null;
  const payload: Record<string, unknown> = {
    telegram_id: telegramUser.id,
    username: telegramUser.username,
    first_name: telegramUser.first_name,
    last_name: telegramUser.last_name,
    language_code: telegramUser.language_code,
  };
  if (extra?.birthdate) payload.birthdate = extra.birthdate;
  if (typeof extra?.life_path === 'number') payload.life_path = extra.life_path;

  const attempt = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'telegram_id' })
    .select('id, telegram_id, username, first_name, last_name, birthdate, life_path, language_code')
    .single();
  if (attempt.error) {
    console.error('ensureUser error', attempt.error);
    if (attempt.error.message?.includes('last_name')) {
      // fallback for schemas без колонки last_name
      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            telegram_id: telegramUser.id,
            username: telegramUser.username,
            first_name: telegramUser.first_name,
            language_code: telegramUser.language_code,
            ...(extra?.birthdate ? { birthdate: extra.birthdate } : {}),
            ...(typeof extra?.life_path === 'number' ? { life_path: extra.life_path } : {}),
          },
          { onConflict: 'telegram_id' },
        )
        .select('id, telegram_id, username, first_name, birthdate, life_path, language_code')
        .single();
      if (error) {
        console.error('ensureUser fallback error', error);
        return null;
      }
      return data as ApiUser;
    }
    return null;
  }
  return attempt.data as ApiUser;
}

async function getUserByTelegramId(telegramId: number): Promise<ApiUser | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('users')
    .select('id, telegram_id, username, first_name, last_name, birthdate, life_path, language_code')
    .eq('telegram_id', telegramId)
    .maybeSingle();
  if (error) {
    console.error('getUserByTelegramId error', error);
    return null;
  }
  return (data as ApiUser) ?? null;
}

async function fetchStones(theme: string | null, lifePath: number | null): Promise<Stone[]> {
  if (!supabase) return [];
  let query = supabase
    .from('jyotish_stones')
    .select('*, jyotish_stone_theme!inner(theme_code,intensity)');
  if (theme) {
    query = query.eq('jyotish_stone_theme.theme_code', theme);
  }
  if (lifePath) {
    query = query.or(`life_path.is.null,life_path.cs.{${lifePath}}`);
  }
  let { data, error } = await query.order('jyotish_stone_theme.intensity', { ascending: false }).limit(5);
  // Retry без фильтра life_path, если ничего не вернулось или колонка отсутствует
  if ((error || !data?.length) && lifePath) {
    console.warn('fetchStones retry without life_path filter');
    let retry = supabase
      .from('jyotish_stones')
      .select('*, jyotish_stone_theme!inner(theme_code,intensity)')
      .eq('is_active', true);
    if (theme) retry = retry.eq('jyotish_stone_theme.theme_code', theme);
    const retryRes = await retry.order('jyotish_stone_theme.intensity', { ascending: false }).limit(5);
    data = retryRes.data;
    error = retryRes.error;
  }
  if (error) {
    console.error('fetchStones error (jyotish)', error);
    return [];
  }
  return (data ?? []) as Stone[];
}

async function insertStoneRequest(params: {
  userId: string;
  birthdate: string;
  lifePath: number;
  theme: string;
  stones: number[];
  extraText?: string | null;
}) {
  if (!supabase) return;
  const payload = {
    user_id: params.userId,
    birthdate: params.birthdate,
    life_path: params.lifePath,
    theme: params.theme,
    selected_stones: params.stones,
    extra_text: params.extraText ?? null,
  };
  const { error } = await supabase.from('stone_requests').insert(payload);
  if (error) console.error('insertStoneRequest error', error);
}

async function fetchProducts(filters: { type?: string | null; stoneId?: number | null }): Promise<Product[]> {
  if (!supabase) return [];
  let query = supabase.from('products').select('*').eq('is_active', true);
  if (filters.type) {
    query = query.eq('type', filters.type);
  }
  if (filters.stoneId) {
    // Try 'stones' first (more likely to exist in older schemas), then fallback to 'stone_ids'
    query = query.overlaps('stones', [filters.stoneId]);
  }
  const { data, error } = await query.limit(30);
  if (error) {
    // If 'stones' column doesn't exist, try 'stone_ids' as fallback
    if (error.message?.includes('column "stones"') && filters.stoneId) {
      const fallbackQuery = supabase.from('products').select('*').eq('is_active', true);
      if (filters.type) {
        fallbackQuery.eq('type', filters.type);
      }
      const fallback = await fallbackQuery.overlaps('stone_ids', [filters.stoneId]).limit(30);
      if (fallback.error) {
        console.error('fetchProducts fallback error', fallback.error);
        return [];
      }
      return (fallback.data ?? []) as Product[];
    }
    console.error('fetchProducts error', error);
    return [];
  }
  return (data ?? []) as Product[];
}

async function createCustomRequest(params: {
  userId: string;
  stones?: number[] | null;
  type?: string | null;
  budget_from?: number | null;
  budget_to?: number | null;
  comment?: string | null;
}) {
  if (!supabase) return null;
  const payload = {
    user_id: params.userId,
    stones: params.stones ?? null,
    type: params.type ?? null,
    budget_from: params.budget_from ?? null,
    budget_to: params.budget_to ?? null,
    comment: params.comment ?? null,
  };
  const { data, error } = await supabase.from('custom_requests').insert(payload).select('id').single();
  if (error) {
    console.error('createCustomRequest error', error);
    return null;
  }
  return data;
}

function normalizeTelegramUser(validation: ReturnType<typeof validateInitData>): TelegramUser | null {
  if (!validation.ok) return null;
  return validation.data.user;
}

function formatSupabaseError(err: any): { message: string; status: number } {
  // Supabase PostgREST errors have a specific format
  console.error('Supabase error details:', {
    code: err?.code,
    message: err?.message,
    details: err?.details,
    hint: err?.hint,
  });
  
  if (err?.code === 'PGRST116' || err?.message?.includes('NOT_FOUND') || err?.code === '42P01') {
    return { message: 'Запрашиваемый ресурс не найден', status: 404 };
  }
  if (err?.code === '42703') {
    // Column does not exist
    return { message: 'Ошибка структуры базы данных. Обратитесь к администратору.', status: 500 };
  }
  if (err?.code === '23505') {
    return { message: 'Дублирующаяся запись', status: 409 };
  }
  if (err?.code === '23503') {
    return { message: 'Нарушение внешнего ключа', status: 400 };
  }
  if (err?.message) {
    return { message: err.message, status: 500 };
  }
  return { message: 'Внутренняя ошибка сервера', status: 500 };
}

async function sendOrderToTelegram(text: string) {
  const chatId = env.ORDER_CHAT_ID ?? 5035730676; // fallback на указанный групповой чат
  if (!env.BOT_TOKEN || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error('Failed to send order to Telegram', err);
  }
}

export function buildApiApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get(['/health', '/api/health'], (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/auth/init', async (req, res) => {
    if (!hasSupabase) return res.status(503).json({ error: 'Supabase not configured' });
    const initData = getInitData(req);
    const validation = validateInitData(initData ?? '', env.BOT_TOKEN);
    if (!validation.ok && !env.ALLOW_DEV_INIT_DATA) {
      return res.status(401).json({ error: validation.error });
    }
    const tgUser = normalizeTelegramUser(validation) ?? {
      id: 0,
      username: 'demo',
      first_name: 'Sky Guest',
      language_code: 'ru',
    };
    try {
      const user = await ensureUser(tgUser);
      return res.json({ user });
    } catch (err) {
      console.error('auth/init error', err);
      return res.status(500).json({ error: 'failed to upsert user' });
    }
  });

  app.post('/api/user/update', async (req, res) => {
    if (!hasSupabase) return res.status(503).json({ error: 'Supabase not configured' });
    const { birthdate } = req.body as { telegram_init_data?: string; birthdate?: string };
    if (!birthdate) return res.status(400).json({ error: 'birthdate is required' });
    // Проверка формата YYYY-MM-DD, чтобы не писать некорректную дату
    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthdate);
    if (!isoMatch) {
      console.error('user/update invalid birthdate format', birthdate);
      return res.status(400).json({ error: 'birthdate_format_invalid' });
    }
    const parsed = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) {
      console.error('user/update failed to parse birthdate', birthdate);
      return res.status(400).json({ error: 'birthdate_invalid' });
    }
    const initData = getInitData(req);
    const validation = validateInitData(initData ?? '', env.BOT_TOKEN);
    if (!validation.ok && !env.ALLOW_DEV_INIT_DATA) {
      return res.status(401).json({ error: validation.error });
    }
    const tgUser = normalizeTelegramUser(validation);
    if (!tgUser && !env.ALLOW_DEV_INIT_DATA) return res.status(401).json({ error: 'initData invalid' });

    const lifePath = calculateLifePath(new Date(birthdate));
    try {
      const user = await ensureUser(
        tgUser ?? { id: 0, username: 'demo', first_name: 'Sky Guest' },
        { birthdate, life_path: lifePath },
      );
      return res.json({ user });
    } catch (err) {
      console.error('user/update error', err);
      return res.status(500).json({
        error: 'failed_to_save_birthdate',
        detail: process.env.NODE_ENV !== 'production' ? String(err) : undefined,
      });
    }
  });

  app.post('/api/stone-picker', async (req, res) => {
    try {
      if (!hasSupabase) return res.status(503).json({ error: 'Supabase not configured' });
      const { theme } = req.body as { telegram_init_data?: string; theme?: string };
      if (!theme) return res.status(400).json({ error: 'theme is required' });

      const initData = getInitData(req);
      const validation = validateInitData(initData ?? '', env.BOT_TOKEN);
      if (!validation.ok && !env.ALLOW_DEV_INIT_DATA) {
        return res.status(401).json({ error: validation.error });
      }
      const tgUser = normalizeTelegramUser(validation);
      if (!tgUser && !env.ALLOW_DEV_INIT_DATA) return res.status(401).json({ error: 'initData invalid' });
      const user = tgUser ? await getUserByTelegramId(tgUser.id) : null;
      const birthdate = user?.birthdate;
      if (!birthdate) {
        return res.status(400).json({ error: 'birthdate_missing' });
      }
      const lifePath = user?.life_path ?? calculateLifePath(new Date(birthdate));
      const stones = await fetchStones(theme, lifePath);
      if (tgUser && user?.id) {
        await insertStoneRequest({
          userId: user.id,
          birthdate,
          lifePath,
          theme,
          stones: stones.map((s) => s.id),
        });
      }
      return res.json({
        life_path: lifePath,
        theme,
        stones,
      });
    } catch (err) {
      console.error('stone-picker error', err);
      const { message, status } = formatSupabaseError(err);
      return res.status(status).json({ error: message });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      if (!hasSupabase) return res.status(503).json({ error: 'Supabase not configured' });
      const stoneId = req.query.stone_id ? Number(req.query.stone_id) : null;
      const type = req.query.type ? String(req.query.type) : null;
      const products = await fetchProducts({ stoneId, type });
      return res.json({ products });
    } catch (err) {
      console.error('GET /api/products error', err);
      const { message, status } = formatSupabaseError(err);
      return res.status(status).json({ error: message });
    }
  });

  app.get('/api/stones', async (req, res) => {
    if (!hasSupabase) return res.status(503).json({ error: 'Supabase not configured' });
    const search = req.query.search ? String(req.query.search) : null;
    const theme = req.query.theme ? String(req.query.theme) : null;
    const client = supabase!;
    let query = client.from('stones').select('*').eq('is_active', true).limit(40);
    if (search) {
      query = query.ilike('name_ru', `%${search}%`);
    }
    if (theme) {
      query = query.overlaps('themes', [theme]);
    }
    const { data, error } = await query;
    if (error) {
      console.error('GET /api/stones error', error);
      return res.status(500).json({ error: 'failed to fetch stones' });
    }
    return res.json({ stones: (data ?? []) as Stone[] });
  });

  app.post('/api/custom-request', async (req, res) => {
    try {
      if (!hasSupabase) return res.status(503).json({ error: 'Supabase not configured' });
      const allowAnonymous = env.ALLOW_DEV_INIT_DATA || !env.BOT_TOKEN;
      const payload = req.body as {
        telegram_init_data?: string;
        stones?: number[];
        type?: string;
        budget_from?: number;
        budget_to?: number;
        comment?: string;
      };
      const initData = getInitData(req);
      const validation = validateInitData(initData ?? '', env.BOT_TOKEN);
      if (!validation.ok && !allowAnonymous) {
        return res.status(401).json({ error: validation.error });
      }
      const tgUser = normalizeTelegramUser(validation);
      if (!tgUser && !allowAnonymous) return res.status(401).json({ error: 'initData invalid' });
      const user = await ensureUser(tgUser ?? { id: 0, username: 'demo', first_name: 'Sky Guest' });
      if (!user) return res.status(500).json({ error: 'failed to upsert user' });
      const record = await createCustomRequest({
        userId: user.id,
        stones: payload.stones ?? [],
        type: payload.type ?? null,
        budget_from: payload.budget_from ?? null,
        budget_to: payload.budget_to ?? null,
        comment: payload.comment ?? null,
      });
      const textLines = [
        '🪡 Новая заявка на индивидуальное украшение',
        `Имя: ${user.first_name ?? '—'}`,
        `Фамилия: ${user.last_name ?? '—'}`,
        `Username: ${user.username ? '@' + user.username : '—'}`,
        `Telegram ID: ${tgUser?.id ?? '—'}`,
        `Тип: ${payload.type ?? '—'}`,
        `Камни: ${payload.stones?.length ? payload.stones.join(', ') : '—'}`,
        `Бюджет: от ${payload.budget_from ?? '—'} до ${payload.budget_to ?? '—'}`,
        `Комментарий: ${payload.comment ?? '—'}`,
      ].join('\n');
      await sendOrderToTelegram(textLines);
      return res.json({ ok: true, id: record?.id ?? null });
    } catch (err) {
      console.error('custom-request error', err);
      const { message, status } = formatSupabaseError(err);
      return res.status(status).json({ error: message });
    }
  });

  const distPath = path.join(process.cwd(), 'webapp', 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/.*/, (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler for unhandled errors
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    const { message, status } = formatSupabaseError(err);
    return res.status(status).json({ error: message });
  });

  return app;
}

export async function startApiServer() {
  const app = buildApiApp();
  const port = env.API_PORT ?? 3000;
  await new Promise<void>((resolve) => {
    app.listen(port, () => {
      console.log(`API server listening on http://0.0.0.0:${port}`);
      resolve();
    });
  });
}
