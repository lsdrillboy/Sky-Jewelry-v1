import { buildApiApp } from '../src/api/server';

// Vercel Node runtime оборачивает Express-приложение в handler автоматически.
// Никакого listen здесь не делаем.
const app = buildApiApp();
export default app;
