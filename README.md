# Sky Jewelry · Bot + WebApp

Telegram-бот и mini-app в одном репозитории: подбор камней, каталог украшений, заявки и Supabase-бэкенд.

## Что добавлено
- Telegram WebApp (React + Vite) с экранами: прелоадер, обложка, главное меню, дата рождения, подбор камня, каталог, индивидуальный запрос, справочник камней.
- API-слой на Express (`src/api/server.ts`) с проверкой Telegram `initData`, работающий рядом с ботом.
- Кнопка `web_app` в меню бота, которая открывает мини-приложение.

## Стек
- Node.js + TypeScript
- grammY + `@grammyjs/conversations`
- Express для REST API
- Supabase (`@supabase/supabase-js`)
- React + Vite для WebApp

## Запуск
1. Скопируйте `.env.example` в `.env` и заполните:
   - `BOT_TOKEN`
   - `WEBAPP_URL` — прод-домен мини-аппа
   - `API_PORT` — порт API/статик-сервера (по умолчанию 3000)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
   - `ADMIN_CHAT_ID`, `LOG_CHAT_ID` (опционально)
   - `ALLOW_DEV_INIT_DATA=true` чтобы тестировать без Telegram initData локально
2. Установите зависимости: `npm install`
3. Dev-бандл бота + API: `npm run dev`  
   Продакшен: `npm run build && npm start` (Express отдаёт API и собранный webapp из `webapp/dist`)
4. WebApp отдельно (Vite):
   - `npm run dev:webapp` (Vite на 5173, API на 3000 — задайте `VITE_API_URL=http://localhost:3000`)
   - `npm run build:webapp` (выкладка в `webapp/dist`)

## Продакшен сценарий: Vercel + бот отдельно
- В Vercel деплойте репозиторий: статика webapp и API живут там (используется `vercel.json`).
- На Vercel задайте переменные: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, опционально `ALLOW_DEV_INIT_DATA`, `ADMIN_CHAT_ID`, `LOG_CHAT_ID`. `BOT_TOKEN` на Vercel не обязателен, если бот живёт отдельно.
- Бот запускайте на VPS/Render/Railway: `npm install && npm run build && DISABLE_API=true BOT_TOKEN=... WEBAPP_URL=https://<ваш-vercel> SUPABASE_*=<из Vercel> npm start`.
- В webapp укажите `VITE_API_URL=https://<ваш-vercel>` (или через настройки окружения Vercel для сборки).

## Структура
- `src/index.ts` — бот (grammY) + запуск API-сервера
- `src/api/server.ts` — маршруты `/api/auth/init`, `/api/user/update`, `/api/stone-picker`, `/api/products`, `/api/stones`, `/api/custom-request`
- `src/api/telegram.ts` — валидация `initData` WebApp
- `src/constants.ts`, `src/types.ts`, `src/utils/lifePath.ts` — общие данные и утилиты
- `webapp/` — мини-приложение (React + Vite), компоненты экранов и API-клиент
- `supabase_schema.sql` — актуальная схема (users c life_path, stones, products со stone_ids, stone_requests, orders, custom_requests)

## API кратко
- `POST /api/auth/init` — проверка `telegram_init_data`, upsert пользователя, отдаёт профиль.
- `POST /api/user/update` — сохраняет `birthdate`, пересчитывает `life_path`.
- `POST /api/stone-picker` — тема → подбор камней (с учётом `life_path`), запись в `stone_requests`.
- `GET /api/products` — фильтр `stone_id`, `type`.
- `GET /api/stones` — список/поиск камней.
- `POST /api/custom-request` — заявка на индивидуальное украшение (`custom_requests`).

## Примечания
- Если Supabase не настроен, API отдаёт 503, бот работает в демо (без сохранения).
- В Telegram меню бот показывает кнопку WebApp (`WEBAPP_URL`).
- Для dev-режима WebApp можно передавать `VITE_DEV_INIT_DATA` или включить `ALLOW_DEV_INIT_DATA`, чтобы работать без подписи Telegram.
