import { Bot, Context, InlineKeyboard, session, SessionFlavor } from 'grammy';
import { conversations, Conversation, ConversationFlavor, createConversation } from '@grammyjs/conversations';
import { env, hasSupabase } from './config';
import { supabase } from './supabase';
import { ABOUT_COVER_URL, ABOUT_TEXT, CATALOG_TYPES, FAQ_ITEMS, REVIEWS, STONE_THEMES, THEME_SUBOPTIONS } from './constants';
import { calculateLifePath, formatDateForPg } from './utils/lifePath';
import { extractTelegramError, isCaptionTooLongError, isParseModeError, sanitizeForHtml, truncateForCaption } from './utils/text';
import { OrderPayload, Product, Stone } from './types';
import { startApiServer } from './api/server';

type SessionData = {
  menuMessageId?: number;
  menuMessageType?: 'photo' | 'text';
  reviewsOffset?: number;
  lastTheme?: string | null;
  lastStones?: number[];
};
type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

if (!env.BOT_TOKEN) {
  console.error('BOT_TOKEN is missing in environment');
  process.exit(1);
}

if (!hasSupabase) {
  console.warn('Supabase is not configured. Bot will run in demo-only mode without persistence.');
}

const bot = new Bot<MyContext>(env.BOT_TOKEN);

bot.use(session({ initial: (): SessionData => ({}) }));
bot.use(conversations());
bot.use(createConversation(setBirthdateConversation, 'setBirthdate'));
bot.use(createConversation(stonePickerConversation, 'stonePicker'));
bot.use(createConversation(catalogConversation, 'catalog'));
bot.use(createConversation(customOrderConversation, 'customOrder'));

bot.catch(async (err) => {
  console.error('Bot error:', err);
  const ctx = err.ctx as MyContext | undefined;
  if (ctx && env.LOG_CHAT_ID) {
    try {
      await ctx.api.sendMessage(env.LOG_CHAT_ID, `⚠️ Ошибка: ${err.message}`);
    } catch (sendErr) {
      console.error('Failed to send log to LOG_CHAT_ID', sendErr);
    }
  }
});

bot.command('start', async (ctx) => {
  await ensureUser(ctx);
  await sendMainMenu(ctx);
});

bot.command('menu', async (ctx) => {
  await sendMainMenu(ctx);
});

bot.callbackQuery('nav:main', async (ctx) => {
  await ctx.answerCallbackQuery();
  await sendMainMenu(ctx);
});

bot.callbackQuery('main:stone', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.conversation.enter('stonePicker');
});

bot.callbackQuery('main:birthdate', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.conversation.enter('setBirthdate');
});

bot.callbackQuery('main:catalog', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.conversation.enter('catalog');
});

bot.callbackQuery('main:custom', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.conversation.enter('customOrder');
});

bot.callbackQuery('main:reviews', async (ctx) => {
  await ctx.answerCallbackQuery();
  await sendReviewsBatch(ctx, 0);
});

bot.callbackQuery('main:faq', async (ctx) => {
  await ctx.answerCallbackQuery();
  await sendFaqMenu(ctx);
});

bot.callbackQuery('main:consult', async (ctx) => {
  await ctx.answerCallbackQuery();
  const kb = new InlineKeyboard().text('Написать мастеру', 'main:custom').text('В меню', 'nav:main');
  await editMenu(ctx, 'Консультация\nЗадай вопрос — вернусь с ответом и рекомендациями.', kb);
});

bot.callbackQuery(/faq:(.+)/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const code = ctx.match![1];
  await sendFaqAnswer(ctx, code);
});

bot.callbackQuery(/reviews:more/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const offset = ctx.session.reviewsOffset ?? 0;
  await sendReviewsBatch(ctx, offset);
});

bot.callbackQuery('main:about', async (ctx) => {
  await ctx.answerCallbackQuery();
  const keyboard = new InlineKeyboard()
    .text('🧿 Подобрать камень', 'main:stone')
    .text('💎 Каталог', 'main:catalog')
    .row()
    .text('⬅️ Назад', 'nav:main');
  try {
    await ctx.replyWithPhoto(ABOUT_COVER_URL, { caption: ABOUT_TEXT, reply_markup: keyboard });
    return;
  } catch (err) {
    console.error('Failed to send about cover, fallback to text', err);
  }
  await editMenu(ctx, ABOUT_TEXT, keyboard);
});

bot.callbackQuery(/stone:details:(\d+)/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const stoneId = Number(ctx.match![1]);
  const stone = await getStoneById(stoneId);
  if (!stone) {
    await ctx.reply('Не нашла описание для этого камня.');
    return;
  }
  await sendStoneCard(ctx, stone, { theme: ctx.session.lastTheme });
});

bot.callbackQuery(/products:stone:(\d+)/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const stoneId = Number(ctx.match![1]);
  const products = await fetchProducts({ stoneId, limit: 5 });
  if (!products.length) {
    await editMenu(
      ctx,
      'Не нашла украшения по этим фильтрам\nДавай уточним или попробуем другой вариант.',
      buildNoResultsKeyboard(),
    );
    return;
  }
  for (const product of products) {
    await sendProductCard(ctx, product);
  }
});

bot.callbackQuery(/order:catalog:(\d+)/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const productId = Number(ctx.match![1]);
  await handleOrderCreation(ctx, { order_type: 'catalog', product_id: productId, status: 'new' });
});

bot.callbackQuery(/product:details:(\d+)/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const productId = Number(ctx.match![1]);
  const product = await getProductById(productId);
  if (!product) {
    await ctx.reply('Не нашла описание для этого украшения.');
    return;
  }
  await sendProductDetails(ctx, product);
});

bot.callbackQuery(/order:custom:stone:(\d+)/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const stoneId = Number(ctx.match![1]);
  const comment = `Хочу индивидуальное украшение с камнем id=${stoneId}`;
  await handleOrderCreation(ctx, {
    order_type: 'custom',
    stones: [stoneId],
    status: 'new',
    comment,
  });
});

bot.start();
if (!env.DISABLE_API) {
  startApiServer().catch((err) => console.error('API server failed to start', err));
} else {
  console.log('API server disabled via DISABLE_API=true');
}

const MENU_INTRO = 'SKY Jewelry\nУкрашения с камнями, которые поддерживают твоё состояние.';
const WELCOME_CAPTION_LIMIT = 900;

const MAIN_MENU_ITEMS = [
  { label: 'Подобрать камень', action: 'main:stone' },
  { label: 'Каталог', action: 'main:catalog' },
  { label: 'Индивидуальное', action: 'main:custom' },
  { label: 'Отзывы', action: 'main:reviews' },
  { label: 'FAQ / Вопросы', action: 'main:faq' },
  { label: 'Консультация', action: 'main:consult' },
];

function buildMainMenuInline() {
  const kb = new InlineKeyboard();
  if (env.WEBAPP_URL) {
    kb.webApp('Открыть мини-апп', env.WEBAPP_URL).row();
  }
  MAIN_MENU_ITEMS.forEach((item, idx) => {
    kb.text(item.label, item.action);
    if (idx % 2 === 1) kb.row();
  });
  kb.row().text('В меню', 'nav:main');
  return kb;
}

function buildWelcomeCaption(override?: string) {
  const source = override ?? env.WELCOME_CAPTION_SHORT ?? MENU_INTRO;
  return truncateForCaption(source, WELCOME_CAPTION_LIMIT);
}

async function sendWelcomeLongText(ctx: MyContext) {
  const fullText = env.WELCOME_TEXT_FULL?.trim();
  if (!fullText) return;
  try {
    await ctx.reply(fullText, { parse_mode: 'HTML' });
    return;
  } catch (err) {
    console.error('Failed to send full welcome text', { error: extractTelegramError(err) || err });
    if (isParseModeError(err)) {
      await ctx.reply(sanitizeForHtml(fullText));
    }
  }
}

async function sendWelcome(ctx: MyContext, captionOverride?: string) {
  const caption = buildWelcomeCaption(captionOverride);
  const keyboard = buildMainMenuInline();
  const photoCandidates = [env.WELCOME_PHOTO_FILE_ID, env.WELCOME_PHOTO_URL, ABOUT_COVER_URL].filter(
    Boolean,
  ) as string[];
  let lastError: unknown = null;

  for (const photo of photoCandidates) {
    try {
      const sent = await ctx.replyWithPhoto(photo, {
        caption,
        parse_mode: 'HTML',
        reply_markup: keyboard,
      });
      ctx.session.menuMessageId = sent.message_id;
      ctx.session.menuMessageType = 'photo';
      await sendWelcomeLongText(ctx);
      return;
    } catch (err) {
      lastError = err;
      console.error('Failed to send welcome photo', { photo, error: extractTelegramError(err) || err });
      if (isParseModeError(err) || isCaptionTooLongError(err)) {
        try {
          const safeCaption = truncateForCaption(sanitizeForHtml(caption), WELCOME_CAPTION_LIMIT);
          const sent = await ctx.replyWithPhoto(photo, {
            caption: safeCaption,
            reply_markup: keyboard,
          });
          ctx.session.menuMessageId = sent.message_id;
          ctx.session.menuMessageType = 'photo';
          await sendWelcomeLongText(ctx);
          return;
        } catch (fallbackErr) {
          lastError = fallbackErr;
          console.error('Fallback welcome photo failed', {
            photo,
            error: extractTelegramError(fallbackErr) || fallbackErr,
          });
        }
      }
    }
  }

  console.error('All welcome photo attempts failed, falling back to text', {
    error: extractTelegramError(lastError) || lastError,
  });
  const sent = await ctx.reply(caption, { reply_markup: keyboard });
  ctx.session.menuMessageId = sent.message_id;
  ctx.session.menuMessageType = 'text';
  await sendWelcomeLongText(ctx);
  if (process.env.NODE_ENV !== 'production') {
    await ctx.reply('(Если не видно обложку — обновите Telegram)');
  }
}

async function editMenu(ctx: MyContext, text: string, keyboard?: InlineKeyboard) {
  const chatId = ctx.chat?.id ?? ctx.callbackQuery?.message?.chat.id;
  const messageId = ctx.session.menuMessageId ?? ctx.callbackQuery?.message?.message_id;
  if (ctx.callbackQuery?.message?.message_id && !ctx.session.menuMessageId) {
    ctx.session.menuMessageId = ctx.callbackQuery.message.message_id;
  }
  const isPhotoMessage =
    ctx.session.menuMessageType === 'photo' || Boolean(ctx.callbackQuery?.message && 'photo' in ctx.callbackQuery.message);
  if (ctx.callbackQuery?.message?.photo?.length && !ctx.session.menuMessageType) {
    ctx.session.menuMessageType = 'photo';
  }
  const options = keyboard ? { reply_markup: keyboard } : undefined;
  if (chatId && messageId) {
    if (isPhotoMessage) {
      const caption = truncateForCaption(text, WELCOME_CAPTION_LIMIT);
      if (text.length > caption.length) {
        const sent = await ctx.reply(text, options);
        ctx.session.menuMessageId = sent.message_id;
        ctx.session.menuMessageType = 'text';
        return;
      }
      try {
        await ctx.api.editMessageCaption(chatId, messageId, { caption, ...options });
        ctx.session.menuMessageType = 'photo';
        return;
      } catch (err) {
        console.error('Failed to edit menu caption, retrying as text', err);
        ctx.session.menuMessageType = 'text';
      }
    }
    try {
      await ctx.api.editMessageText(chatId, messageId, text, options);
      ctx.session.menuMessageType = 'text';
      ctx.session.menuMessageId = messageId;
      return;
    } catch (err) {
      console.error('Failed to edit menu, sending new message', err);
    }
  }
  const sent = await ctx.reply(text, options);
  ctx.session.menuMessageId = sent.message_id;
  ctx.session.menuMessageType = 'text';
}

async function sendMainMenu(ctx: MyContext, text?: string) {
  ctx.session.reviewsOffset = 0;
  if (!text) {
    await sendWelcome(ctx);
    return;
  }
  try {
    await editMenu(ctx, text, buildMainMenuInline());
  } catch (err) {
    console.error('Failed to send main menu', err);
  }
}

type DbUser = {
  id: string;
  birthdate?: string | null;
  life_path?: number | null;
};

async function ensureUser(ctx: MyContext, extra?: { birthdate?: string }) {
  if (!supabase || !ctx.from) return null;
  const payload = {
    telegram_id: ctx.from.id,
    username: ctx.from.username,
    first_name: ctx.from.first_name,
    last_name: ctx.from.last_name,
    language_code: ctx.from.language_code,
    birthdate: extra?.birthdate ?? null,
  };
  const { data, error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'telegram_id' })
    .select('id')
    .single();
  if (error) {
    console.error('Failed to upsert user', error);
    return null;
  }
  return data?.id ?? null;
}

function buildWebAppUrl(params?: Record<string, string | number | null | undefined>) {
  if (!env.WEBAPP_URL) return null;
  try {
    const url = new URL(env.WEBAPP_URL);
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
    return url.toString();
  } catch (err) {
    console.error('Failed to build webapp url', err);
    return env.WEBAPP_URL;
  }
}

async function getUserByTelegramId(ctx: MyContext): Promise<DbUser | null> {
  if (!supabase || !ctx.from) return null;
  const { data, error } = await supabase
    .from('users')
    .select('id, birthdate, life_path, last_name, first_name, username')
    .eq('telegram_id', ctx.from.id)
    .maybeSingle();
  if (error) {
    console.error('Failed to fetch user by telegram_id', error);
    return null;
  }
  return (data as DbUser) ?? null;
}

async function saveBirthdate(ctx: MyContext, birthdateIso: string, lifePath: number) {
  if (!supabase || !ctx.from) return;
  const base = {
    telegram_id: ctx.from.id,
    username: ctx.from.username,
    first_name: ctx.from.first_name,
    language_code: ctx.from.language_code,
  };
  try {
    const { error } = await supabase
      .from('users')
      .upsert({ ...base, birthdate: birthdateIso, life_path: lifePath }, { onConflict: 'telegram_id' });
    if (error) {
      console.error('Failed to upsert birthdate with life_path', error);
      // retry without life_path if column is missing
      const { error: retryError } = await supabase
        .from('users')
        .upsert({ ...base, birthdate: birthdateIso }, { onConflict: 'telegram_id' });
      if (retryError) {
        console.error('Failed to upsert birthdate retry', retryError);
      }
    }
  } catch (err) {
    console.error('Unexpected error saving birthdate', err);
  }
}

function parsePgDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month, day));
  if (Number.isNaN(date.getTime())) return null;
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) return null;
  return date;
}

function buildThemeKeyboard() {
  const kb = new InlineKeyboard();
  STONE_THEMES.forEach((theme, idx) => {
    kb.text(theme.label, `theme:${theme.code}`);
    if (idx % 2 === 1) kb.row();
  });
  kb.row().text('Пропустить', 'theme:skip').text('В меню', 'nav:main');
  return kb;
}

function buildSubthemeKeyboard(themeCode: string) {
  const suboptions = THEME_SUBOPTIONS[themeCode] ?? [];
  const kb = new InlineKeyboard();
  suboptions.forEach((opt, idx) => {
    kb.text(opt.label, `sub:${opt.code}`);
    if (idx % 2 === 1) kb.row();
  });
  kb.row().text('В меню', 'nav:main');
  return kb;
}

function buildYearRangeKeyboard() {
  const kb = new InlineKeyboard();
  const currentYear = new Date().getUTCFullYear();
  const startYear = 1960;
  const step = 5;
  const ranges: { start: number; end: number }[] = [];
  for (let y = startYear; y <= currentYear; y += step) {
    ranges.push({ start: y, end: Math.min(y + step - 1, currentYear) });
  }
  ranges.forEach((r, idx) => {
    kb.text(`${r.start}-${r.end}`, `bd:range:${r.start}-${r.end}`);
    if (idx % 2 === 1) kb.row();
  });
  kb.row().text('⬅️ В меню', 'nav:main');
  return kb;
}

function buildYearKeyboard(range: { start: number; end: number }) {
  const kb = new InlineKeyboard();
  let counter = 0;
  for (let y = range.start; y <= range.end; y++) {
    kb.text(String(y), `bd:year:${y}`);
    counter++;
    if (counter % 4 === 0) kb.row();
  }
  kb.row().text('⬅️ Диапазон', 'bd:back:range').text('⬅️ В меню', 'nav:main');
  return kb;
}

function buildMonthKeyboard() {
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  const kb = new InlineKeyboard();
  months.forEach((name, idx) => {
    const monthNum = (idx + 1).toString().padStart(2, '0');
    kb.text(name, `bd:month:${monthNum}`);
    if (idx % 4 === 3) kb.row();
  });
  kb.row().text('⬅️ В меню', 'nav:main');
  return kb;
}

function buildDayKeyboard(year: number, month: number) {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const kb = new InlineKeyboard();
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = d.toString().padStart(2, '0');
    kb.text(dayStr, `bd:day:${dayStr}`);
    if (d % 7 === 0) kb.row();
  }
  kb.row().text('⬅️ В меню', 'nav:main');
  return kb;
}

async function runBirthdateWizard(
  conversation: MyConversation,
  ctx: MyContext,
): Promise<{ date: Date; iso: string; lifePath: number; display: string } | null> {
  await editMenu(ctx, 'Выбери диапазон года рождения:', buildYearRangeKeyboard());
  let range: { start: number; end: number } | null = null;
  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;

  while (!year) {
    const update = await conversation.waitFor('callback_query:data');
    await update.answerCallbackQuery();
    const data = update.update.callback_query?.data ?? '';
    if (data === 'nav:main') return null;
    if (data.startsWith('bd:range:')) {
      const [, , payload] = data.split(':');
      const [startStr, endStr] = payload.split('-');
      range = { start: Number(startStr), end: Number(endStr) };
      await editMenu(ctx, 'Выбери точный год рождения:', buildYearKeyboard(range));
      break;
    }
  }

  while (!year) {
    const update = await conversation.waitFor('callback_query:data');
    await update.answerCallbackQuery();
    const data = update.update.callback_query?.data ?? '';
    if (data === 'nav:main') return null;
    if (data === 'bd:back:range') {
      await editMenu(ctx, 'Выбери диапазон года рождения:', buildYearRangeKeyboard());
      range = null;
      continue;
    }
    if (data.startsWith('bd:year:')) {
      year = Number(data.replace('bd:year:', ''));
    }
  }

  await editMenu(ctx, 'Выбери месяц рождения:', buildMonthKeyboard());
  while (!month) {
    const update = await conversation.waitFor('callback_query:data');
    await update.answerCallbackQuery();
    const data = update.update.callback_query?.data ?? '';
    if (data === 'nav:main') return null;
    if (data.startsWith('bd:month:')) {
      month = Number(data.replace('bd:month:', ''));
    }
  }

  await editMenu(ctx, 'Выбери день рождения:', buildDayKeyboard(year, month));
  while (!day) {
    const update = await conversation.waitFor('callback_query:data');
    await update.answerCallbackQuery();
    const data = update.update.callback_query?.data ?? '';
    if (data === 'nav:main') return null;
    if (data.startsWith('bd:day:')) {
      day = Number(data.replace('bd:day:', ''));
    }
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    await editMenu(ctx, 'Не смогла собрать дату, попробуй ещё раз.', buildYearRangeKeyboard());
    return null;
  }
  const iso = formatDateForPg(date);
  const lifePath = calculateLifePath(date);
  const display = `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`;
  return { date, iso, lifePath, display };
}

async function setBirthdateConversation(conversation: MyConversation, ctx: MyContext) {
  await ensureUser(ctx);
  const wizard = await runBirthdateWizard(conversation, ctx);
  if (!wizard) {
    await sendMainMenu(ctx);
    return;
  }
  await saveBirthdate(ctx, wizard.iso, wizard.lifePath);
  await sendMainMenu(
    ctx,
    `Дата рождения сохранена: ${wizard.display}\nЧисло пути: ${wizard.lifePath}\nТеперь я буду использовать её для подборов.`,
  );
}

async function stonePickerConversation(conversation: MyConversation, ctx: MyContext) {
  await ensureUser(ctx);
  const dbUser = await getUserByTelegramId(ctx);
  let birthdate: Date | null = parsePgDate(dbUser?.birthdate);
  let lifePath = dbUser?.life_path ?? null;

  if (!birthdate) {
    const wizard = await runBirthdateWizard(conversation, ctx);
    if (!wizard) {
      await sendMainMenu(ctx);
      return;
    }
    birthdate = wizard.date;
    lifePath = wizard.lifePath;
    await saveBirthdate(ctx, wizard.iso, wizard.lifePath);
    await editMenu(
      ctx,
      `Дата рождения сохранена: ${wizard.display}\nЧисло пути: ${wizard.lifePath}\n\nТеперь выбери тему запроса.`,
      buildThemeKeyboard(),
    );
  } else {
    if (!lifePath) {
      lifePath = calculateLifePath(birthdate);
      await saveBirthdate(ctx, formatDateForPg(birthdate), lifePath);
    }
    await editMenu(
      ctx,
      `Выбери тему\nЧто сейчас важнее всего?`,
      buildThemeKeyboard(),
    );
  }

  let themeCode: string | null = null;
  let themeLabel = 'без темы';
  let extraText: string | null = null;
  const themeUpdate = await conversation.waitFor(['callback_query:data', 'message:text']);
  if ('callback_query' in themeUpdate.update) {
    const data = themeUpdate.update.callback_query?.data;
    await themeUpdate.answerCallbackQuery();
    if (data === 'nav:main') {
      await sendMainMenu(ctx);
      return;
    }
    if (data === 'theme:skip') {
      themeCode = null;
      themeLabel = 'Без темы';
    } else if (data?.startsWith('theme:')) {
      const code = data.split(':')[1];
      const found = STONE_THEMES.find((item) => item.code === code);
      if (found) {
        themeCode = found.code;
        themeLabel = found.label;
      }
      const suboptions = THEME_SUBOPTIONS[code] ?? [];
      if (suboptions.length > 0) {
        await editMenu(
          ctx,
          'Что тебе ближе сейчас? Выбери вариант:',
          buildSubthemeKeyboard(code),
        );
        const subUpdate = await conversation.waitFor('callback_query:data');
        await subUpdate.answerCallbackQuery();
        const subData = subUpdate.update.callback_query?.data ?? '';
        if (subData === 'nav:main') {
          await sendMainMenu(ctx);
          return;
        }
        const chosen = suboptions.find((opt) => opt.code === subData.replace('sub:', ''));
        if (chosen) {
          extraText = chosen.extraText;
        }
      } else if (code === 'custom') {
        await editMenu(ctx, 'Опиши запрос словами:', new InlineKeyboard().text('⬅️ В меню', 'nav:main'));
        const customText = await conversation.waitFor('message:text');
        themeLabel = customText.message.text;
        extraText = customText.message.text;
      } else {
        extraText = `Тема: ${themeLabel}.`;
      }
    }
  } else if ('message' in themeUpdate.update) {
    themeLabel = themeUpdate.update.message?.text ?? 'свой запрос';
  }

  const stones = await fetchStones(themeCode, lifePath);
  if (!stones.length) {
    await editMenu(
      ctx,
      'Не нашла украшения по этим фильтрам\nДавай уточним или попробуем другой вариант.',
      buildNoResultsKeyboard('stone'),
    );
    return;
  }

  const selectedIds = stones.map((s) => s.id);
  ctx.session.lastTheme = themeCode ?? null;
  ctx.session.lastStones = selectedIds;
  await saveStoneRequest(ctx, {
    birthdate,
    lifePath,
    theme: themeCode ?? 'custom',
    selectedStones: selectedIds,
    extraText,
  });

  await editMenu(
    ctx,
    `Я подобрала ${stones.length} камн${stones.length === 1 ? 'ь' : stones.length < 5 ? 'я' : 'ей'}\nНажми на камень — покажу украшения и смысл.`,
    buildStoneResultsKeyboard(stones, themeCode ?? undefined),
  );
}

async function catalogConversation(conversation: MyConversation, ctx: MyContext) {
  await editMenu(ctx, 'Каталог\nВыбери тип или пропусти.', buildCatalogTypeKeyboard());
  const typeUpdate = await conversation.waitFor(['callback_query:data', 'message:text']);
  let pickedType: string | null = null;
  if ('callback_query' in typeUpdate.update) {
    await typeUpdate.answerCallbackQuery();
    const cbData = typeUpdate.update.callback_query?.data ?? '';
    if (cbData === 'nav:main') {
      await sendMainMenu(ctx);
      return;
    }
    const typeCode = cbData.replace('catalog_type:', '') ?? 'none';
    pickedType = typeCode === 'none' ? null : typeCode;
  }

  await editMenu(ctx, 'Выбери тему или пропусти.', buildThemeFilterKeyboard());
  const themeUpdate = await conversation.waitFor(['callback_query:data', 'message:text']);
  let pickedTheme: string | null = null;
  if ('callback_query' in themeUpdate.update) {
    await themeUpdate.answerCallbackQuery();
    const cbData = themeUpdate.update.callback_query?.data ?? '';
    if (cbData === 'nav:main') {
      await sendMainMenu(ctx);
      return;
    }
    const themeCode = cbData.replace('catalog_theme:', '') ?? 'none';
    pickedTheme = themeCode === 'none' ? null : themeCode;
  } else if ('message' in themeUpdate.update) {
    pickedTheme = themeUpdate.update.message?.text ?? null;
  }

  const products = await fetchProducts({ type: pickedType, theme: pickedTheme, limit: 10 });
  if (!products.length) {
    await editMenu(
      ctx,
      'Не нашла украшения по этим фильтрам\nДавай уточним или попробуем другой вариант.',
      buildNoResultsKeyboard(),
    );
    return;
  }

  for (const product of products) {
    await sendProductCard(ctx, product);
  }
  await editMenu(ctx, 'Каталог\nСмотреть ещё или перейти в мини-апп.', buildCatalogFollowUpKeyboard(pickedType, pickedTheme));
}

async function customOrderConversation(conversation: MyConversation, ctx: MyContext) {
  await editMenu(ctx, 'Индивидуальное украшение\nОтветь на пару вопросов — вернусь с предложением.');
  const themeMsg = await conversation.waitFor('message:text');
  const userTheme = themeMsg.message.text;

  await editMenu(ctx, 'На какую зону тела хочешь украшение?', buildZoneKeyboard());
  const zoneUpdate = await conversation.waitFor(['callback_query:data', 'message:text']);
  let zone = 'не указано';
  if ('callback_query' in zoneUpdate.update) {
    await zoneUpdate.answerCallbackQuery();
    const data = zoneUpdate.update.callback_query?.data ?? '';
    if (data === 'nav:main') {
      await sendMainMenu(ctx);
      return;
    }
    zone = data.replace('zone:', '') === 'skip' ? 'не указано' : data.replace('zone:', '');
  } else if ('message' in zoneUpdate.update) {
    zone = zoneUpdate.update.message?.text ?? 'не указано';
  }

  await editMenu(ctx, 'Напиши бюджет (например: 80-150 или просто число). Можно пропустить, отправив "-".');
  const budgetMsg = await conversation.waitFor('message:text');
  const { from, to } = parseBudget(budgetMsg.message.text);

  await editMenu(ctx, 'Есть ли камни, которые точно хочется или точно нет? Можно пропустить, отправив "-".');
  const stonesPrefMsg = await conversation.waitFor('message:text');
  const stonesPref = stonesPrefMsg.message.text;

  const comment = `Запрос: ${userTheme}\nЗона: ${zone}\nБюджет: ${from ?? '—'}-${to ?? '—'}\nПожелания по камням: ${stonesPref}`;

  await handleOrderCreation(ctx, {
    order_type: 'custom',
    comment,
    budget_from: from ?? undefined,
    budget_to: to ?? undefined,
    status: 'new',
  });
}

async function fetchStones(theme: string | null, lifePath: number | null): Promise<Stone[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('jyotish_stone_theme')
    .select('intensity, theme_code, stone:stone_id(*)')
    .match(theme ? { theme_code: theme } : {})
    .order('intensity', { ascending: false })
    .limit(20);
  console.log('jyotish stones raw result', { rows: data?.length ?? 0, error });
  if (error) {
    console.error('Failed to fetch jyotish stones', error);
    return [];
  }
  const rows = (data ?? []).filter((row) => row.stone) as any[];
  const matchLifePath = (stoneLifePath: unknown[] | null | undefined, lp: number | null) => {
    if (!lp || !stoneLifePath) return false;
    return stoneLifePath.some((v) => Number(v) === Number(lp));
  };

  let filtered = rows;
  if (lifePath) {
    filtered = rows.filter((row) => matchLifePath(row.stone.life_path as any[], lifePath));
  }
  if (!filtered.length) {
    filtered = rows;
  }
  return filtered.slice(0, 5).map((row) => row.stone as Stone);
}

const TYPE_ALIASES: Record<string, string[]> = {
  bracelet: ['браслет', 'bracelet'],
  ring: ['кольц', 'ring'],
  necklace: ['колье', 'necklace'],
  talisman: ['талисман', 'talisman'],
};

function normalizeTypeTokens(value?: string | null): string[] {
  if (!value) return [];
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return [];
  if (TYPE_ALIASES[trimmed]) return TYPE_ALIASES[trimmed];
  if (trimmed.includes('браслет')) return TYPE_ALIASES.bracelet;
  if (trimmed.includes('кольц')) return TYPE_ALIASES.ring;
  if (trimmed.includes('колье')) return TYPE_ALIASES.necklace;
  if (trimmed.includes('талисман')) return TYPE_ALIASES.talisman;
  return [trimmed];
}

function applyTypeFilter(query: any, type?: string | null) {
  const tokens = normalizeTypeTokens(type)
    .map((token) => token.replace(/[%,]/g, '').trim())
    .filter(Boolean);
  if (!tokens.length) return query;
  const unique = Array.from(new Set(tokens));
  if (unique.length === 1) {
    return query.ilike('type', `%${unique[0]}%`);
  }
  return query.or(unique.map((token) => `type.ilike.%${token}%`).join(','));
}

async function fetchProducts(filters: {
  type?: string | null;
  theme?: string | null;
  stoneId?: number | null;
  limit?: number;
}): Promise<Product[]> {
  if (!supabase) return [];
  let query = supabase.from('products').select('*').eq('is_active', true);
  query = applyTypeFilter(query, filters.type);
  if (filters.theme) {
    query = query.overlaps('themes', [filters.theme]);
  }
  if (filters.stoneId) {
    query = query.overlaps('stones', [filters.stoneId]);
  }
  const { data, error } = await query.limit(filters.limit ?? 10);
  if (error) {
    console.error('Failed to fetch products', error);
    if (filters.stoneId && error.message?.includes('stones')) {
      let fallback = supabase.from('products').select('*').eq('is_active', true);
      fallback = applyTypeFilter(fallback, filters.type);
      if (filters.theme) fallback = fallback.overlaps('themes', [filters.theme]);
      const { data: alt, error: altError } = await fallback.overlaps('stone_ids', [filters.stoneId]).limit(filters.limit ?? 10);
      if (altError) {
        console.error('Fallback fetchProducts stone_ids failed', altError);
        return [];
      }
      return (alt ?? []) as Product[];
    }
    return [];
  }
  return (data ?? []) as Product[];
}

async function getProductById(id: number): Promise<Product | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) {
    console.error('Failed to fetch product by id', error);
    return null;
  }
  return data as Product;
}

async function sendStoneCard(ctx: MyContext, stone: Stone, opts?: { theme?: string | null }) {
  const webUrl = buildWebAppUrl({
    screen: 'catalog',
    stone_id: stone.id,
    theme: opts?.theme ?? ctx.session.lastTheme ?? undefined,
  });
  const keyboard = new InlineKeyboard().text('Показать украшения', `products:stone:${stone.id}`);
  if (webUrl) {
    keyboard.row().url('Открыть в мини-аппе', webUrl);
  }
  keyboard.row().text('Задать вопрос', 'main:consult').text('В меню', 'nav:main');

  const parts: string[] = [];

  parts.push(`${stone.name_ru}`);

  if (stone.description_short) {
    parts.push('');
    parts.push(shortenText(stone.description_short, 220));
  }

  if (stone.best_for || stone.description_long) {
    parts.push('');
    parts.push('Подходит, если:');
    const suitability = shortenText(stone.best_for ?? stone.description_long ?? '', 180);
    if (suitability) {
      parts.push(suitability);
    }
  }

  const text = parts.join('\n');
  if (stone.photo_url) {
    await ctx.replyWithPhoto(stone.photo_url, { caption: text, reply_markup: keyboard });
  } else {
    await ctx.reply(text, { reply_markup: keyboard });
  }
}

async function sendProductCard(ctx: MyContext, product: Product) {
  const webUrl = buildWebAppUrl({
    screen: 'catalog',
    product_id: product.id,
    stone_id: product.stones?.[0] ?? product.stone_ids?.[0],
    type: product.type,
  });

  const keyboard = new InlineKeyboard();
  if (webUrl) {
    keyboard.url('Смотреть в мини-аппе', webUrl).row();
  }
  keyboard.text('Заказать / Написать', `order:catalog:${product.id}`);
  keyboard.text('Ещё варианты', 'main:catalog').row();
  keyboard.text('В меню', 'nav:main');

  const summary =
    product.description && product.description.length > 0
      ? shortenText(product.description, 140)
      : 'Описание появится позже.';

  const text = [
    `${product.name}`,
    summary,
    product.price_min ? `Цена: ${formatPriceRange(product.price_min, product.price_max, product.currency)}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  if (product.main_photo_url || product.photo_url) {
    const photo = product.main_photo_url ?? product.photo_url!;
    await ctx.replyWithPhoto(photo, { caption: text, reply_markup: keyboard });
  } else {
    await ctx.reply(text, { reply_markup: keyboard });
  }
}

async function sendProductDetails(ctx: MyContext, product: Product) {
  const webUrl = buildWebAppUrl({
    screen: 'catalog',
    product_id: product.id,
    stone_id: product.stones?.[0] ?? product.stone_ids?.[0],
    type: product.type,
  });
  const keyboard = new InlineKeyboard();
  if (webUrl) {
    keyboard.url('Смотреть в мини-аппе', webUrl).row();
  }
  keyboard.text('Заказать / Написать', `order:catalog:${product.id}`).text('В меню', 'nav:main');

  const text = [
    `${product.name}`,
    product.description ?? '',
    product.themes?.length ? `Темы: ${product.themes.join(', ')}` : '',
    product.stones?.length ? `Камни: ${product.stones.join(', ')}` : '',
    product.price_min ? `Цена: ${formatPriceRange(product.price_min, product.price_max, product.currency)}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  if (product.main_photo_url) {
    await ctx.replyWithPhoto(product.main_photo_url, { caption: text, reply_markup: keyboard });
  } else {
    await ctx.reply(text, { reply_markup: keyboard });
  }
}

async function handleOrderCreation(ctx: MyContext, payload: OrderPayload) {
  if (!supabase) {
    await ctx.reply('База данных недоступна. Напиши мастеру напрямую @skyjewelry, чтобы оформить заявку.');
    return;
  }
  const userId = await ensureUser(ctx);
  if (!userId) {
    await ctx.reply('Не удалось сохранить пользователя. Попробуй позже.');
    return;
  }
  const insertPayload = {
    user_id: userId,
    status: payload.status ?? 'new',
    ...payload,
  };
  const { data, error } = await supabase.from('orders').insert(insertPayload).select('id').single();
  if (error) {
    console.error('Failed to insert order', error);
    await ctx.reply('Не получилось создать заявку. Попробуй позже или напиши мастеру напрямую.');
    return;
  }
  const summary = [
    'Новая заявка создана ✅',
    payload.order_type === 'catalog' && payload.product_id ? `Украшение ID: ${payload.product_id}` : '',
    payload.comment ? payload.comment : '',
  ]
    .filter(Boolean)
    .join('\n');
  await ctx.reply(summary);
  await sendMainMenu(ctx);

  await sendAdminLog(
    ctx,
    `🛎 Заявка #${data?.id ?? ''}\nТип: ${payload.order_type}\nПользователь: ${formatUser(ctx)}\n${payload.comment ?? ''}${
      payload.product_id ? `\nproduct_id=${payload.product_id}` : ''
    }`,
  );
}

async function saveStoneRequest(
  ctx: MyContext,
  params: { birthdate: Date; lifePath: number; theme: string; selectedStones: number[]; extraText?: string | null },
) {
  if (!supabase) return;
  const userId = await ensureUser(ctx, { birthdate: formatDateForPg(params.birthdate) });
  if (!userId) return;
  const payload = {
    user_id: userId,
    birthdate: formatDateForPg(params.birthdate),
    life_path: params.lifePath,
    theme: params.theme,
    selected_stones: params.selectedStones,
    extra_text: params.extraText ?? null,
  };
  console.log('stone_requests insert payload', payload);
  const { data, error } = await supabase
    .from('stone_requests')
    .insert(payload)
    .select('id')
    .single();
  console.log('stone_requests insert result', { data, error });
  if (error) {
    console.error('Failed to insert stone request', error);
  }
}

function buildCatalogTypeKeyboard() {
  const kb = new InlineKeyboard();
  CATALOG_TYPES.forEach((item, idx) => {
    kb.text(item.label, `catalog_type:${item.code}`);
    if (idx % 2 === 1) kb.row();
  });
  kb.row().text('Пропустить', 'catalog_type:none').text('В меню', 'nav:main');
  return kb;
}

function buildThemeFilterKeyboard() {
  const kb = new InlineKeyboard();
  STONE_THEMES.filter((item) => item.code !== 'custom').forEach((item, idx) => {
    kb.text(item.label, `catalog_theme:${item.code}`);
    if (idx % 2 === 1) kb.row();
  });
  kb.row().text('Пропустить', 'catalog_theme:none').text('В меню', 'nav:main');
  return kb;
}

function buildZoneKeyboard() {
  return new InlineKeyboard()
    .text('Рука', 'zone:hand')
    .text('Шея', 'zone:neck')
    .row()
    .text('Палец', 'zone:ring')
    .text('Талисман', 'zone:talisman')
    .row()
    .text('Пропустить', 'zone:skip')
    .row()
    .text('В меню', 'nav:main');
}

function buildStoneResultsKeyboard(stones: Stone[], theme?: string) {
  const kb = new InlineKeyboard();
  stones.forEach((stone, idx) => {
    kb.text(stone.name_ru, `stone:details:${stone.id}`);
    if (idx % 2 === 1) kb.row();
  });
  const webUrl = buildWebAppUrl({
    screen: 'catalog',
    theme: theme ?? undefined,
    stone_id: stones[0]?.id,
  });
  if (webUrl) {
    kb.row().url('Открыть в мини-аппе', webUrl);
  }
  kb.row().text('Изменить фильтры', 'main:stone').text('В меню', 'nav:main');
  return kb;
}

function buildNoResultsKeyboard(context: 'catalog' | 'stone' = 'catalog') {
  const changeAction = context === 'stone' ? 'main:stone' : 'main:catalog';
  const kb = new InlineKeyboard()
    .text('Изменить фильтры', changeAction)
    .text('Сбросить', changeAction)
    .row()
    .text('Перейти в каталог', 'main:catalog')
    .text('Индивидуальный запрос', 'main:custom')
    .row()
    .text('В меню', 'nav:main');
  return kb;
}

function buildCatalogFollowUpKeyboard(type?: string | null, theme?: string | null) {
  const kb = new InlineKeyboard();
  const url = buildWebAppUrl({ screen: 'catalog', type: type ?? undefined, theme: theme ?? undefined });
  if (url) {
    kb.webApp('Открыть в мини-аппе', url).row();
  }
  kb.text('Изменить фильтры', 'main:catalog').text('В меню', 'nav:main');
  return kb;
}

function buildFaqKeyboard() {
  const kb = new InlineKeyboard();
  FAQ_ITEMS.forEach((item, idx) => {
    kb.text(item.label, `faq:${item.code}`);
    if (idx % 2 === 1) kb.row();
  });
  kb.row().text('В меню', 'nav:main');
  return kb;
}

function parseBudget(input: string): { from: number | null; to: number | null } {
  const normalized = input.trim();
  if (normalized === '-' || normalized === '') return { from: null, to: null };
  const match = normalized.match(/(\d+(?:[.,]\d+)?)[^\d]+(\d+(?:[.,]\d+)?)/);
  if (match) {
    return {
      from: Number(match[1].replace(',', '.')),
      to: Number(match[2].replace(',', '.')),
    };
  }
  const single = normalized.match(/(\d+(?:[.,]\d+)?)/);
  if (single) {
    const value = Number(single[1].replace(',', '.'));
    return { from: value, to: value };
  }
  return { from: null, to: null };
}

function formatPriceRange(min: number, max?: number | null, currency?: string | null) {
  const curr = currency ?? 'USD';
  if (max && max !== min) return `${min}–${max} ${curr}`;
  return `${min} ${curr}`;
}

function narrowText(text: string) {
  return text
    .split('.')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((sentence) => `${sentence}.`)
    .join('\n\n');
}

function shortenText(text: string, maxLength: number) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}…`;
}

async function sendReviewsBatch(ctx: MyContext, offset = 0) {
  const start = offset % REVIEWS.length;
  const batch = REVIEWS.slice(start, start + 3);
  if (!batch.length) {
    await sendMainMenu(ctx, 'Отзывы скоро появятся.');
    return;
  }
  const text = ['Отзывы', 'Реальные истории клиентов.', '', ...batch.map((r) => `• ${r}`)].join('\n');
  const kb = new InlineKeyboard()
    .text('Показать ещё', 'reviews:more')
    .text('Оставить отзыв', 'main:consult')
    .row()
    .text('В меню', 'nav:main');
  await editMenu(ctx, text, kb);
  const nextOffset = start + batch.length >= REVIEWS.length ? 0 : start + batch.length;
  ctx.session.reviewsOffset = nextOffset;
}

async function sendFaqMenu(ctx: MyContext) {
  await editMenu(ctx, 'Вопросы / FAQ\nВыбери категорию.', buildFaqKeyboard());
}

async function sendFaqAnswer(ctx: MyContext, code: string) {
  const item = FAQ_ITEMS.find((faq) => faq.code === code);
  if (!item) {
    await sendFaqMenu(ctx);
    return;
  }
  await editMenu(ctx, `${item.label}\n${item.answer}`, buildFaqKeyboard());
}

async function getStoneById(id: number): Promise<Stone | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('stones').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('Failed to fetch stone by id', error);
    return null;
  }
  return (data as Stone) ?? null;
}

async function sendAdminLog(ctx: MyContext, text: string) {
  if (!env.ADMIN_CHAT_ID) return;
  try {
    await ctx.api.sendMessage(env.ADMIN_CHAT_ID, text);
  } catch (error) {
    console.error('Failed to send admin log', error);
  }
}

function formatUser(ctx: MyContext) {
  if (!ctx.from) return 'неизвестный пользователь';
  const username = ctx.from.username ? `@${ctx.from.username}` : '';
  return `${ctx.from.first_name} ${username} (id: ${ctx.from.id})`;
}

async function sendAboutCover(ctx: MyContext) {
  try {
    await ctx.replyWithPhoto(ABOUT_COVER_URL, { caption: ABOUT_TEXT });
  } catch (err) {
    console.error('Failed to send cover intro', err);
    await ctx.reply(ABOUT_TEXT);
  }
}
