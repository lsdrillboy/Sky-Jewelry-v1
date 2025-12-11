import crypto from 'crypto';

export type TelegramUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
};

export type InitDataValidation =
  | { ok: true; data: { user: TelegramUser | null; auth_date?: number } }
  | { ok: false; error: string };

export function validateInitData(initData: string, botToken: string | undefined): InitDataValidation {
  if (!initData) return { ok: false, error: 'initData is empty' };
  if (!botToken) return { ok: false, error: 'BOT_TOKEN is missing' };

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, error: 'hash is missing in initData' };
  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  if (computedHash !== hash) return { ok: false, error: 'initData hash is not valid' };

  const userStr = params.get('user');
  const authDate = params.get('auth_date');
  const user = userStr ? (JSON.parse(userStr) as TelegramUser) : null;
  return { ok: true, data: { user, auth_date: authDate ? Number(authDate) : undefined } };
}
