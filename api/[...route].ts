import { buildApiApp } from '../src/api/server';

// Reuse the Express app inside Vercel serverless so /api/* routes keep working.
const app = buildApiApp();

export default app;
