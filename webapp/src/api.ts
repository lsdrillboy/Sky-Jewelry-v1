import type { CustomRequestPayload, Product, Stone, StonePickerResult, User } from './types';

const defaultHost = `${window.location.protocol}//${window.location.host}`;
const devFallback = window.location.port === '5173' ? 'http://localhost:3000' : defaultHost;
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || devFallback;

async function apiRequest<T>(path: string, initData?: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(initData ? { 'X-Telegram-InitData': initData } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Ошибка ${response.status}`;
    try {
      const text = await response.text();
      // Try to parse as JSON first
      try {
        const json = JSON.parse(text);
        if (json.error && typeof json.error === 'string') {
          errorMessage = json.error;
        } else {
          errorMessage = text || errorMessage;
        }
      } catch {
        // If not JSON, use the text as-is, but clean up Supabase error format
        if (text.includes('NOT_FOUND') || text.includes('Code:')) {
          errorMessage = 'Запрашиваемый ресурс не найден';
        } else if (text) {
          errorMessage = text;
        }
      }
    } catch {
      // If reading response fails, use default message
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

export async function initSession(initData: string): Promise<{ user: User }> {
  return apiRequest('/api/auth/init', initData, {
    method: 'POST',
    body: JSON.stringify({ telegram_init_data: initData }),
  });
}

export async function updateBirthdate(initData: string, birthdate: string): Promise<{ user: User }> {
  return apiRequest('/api/user/update', initData, {
    method: 'POST',
    body: JSON.stringify({ telegram_init_data: initData, birthdate }),
  });
}

export async function pickStone(initData: string, theme: string): Promise<StonePickerResult> {
  return apiRequest('/api/stone-picker', initData, {
    method: 'POST',
    body: JSON.stringify({ telegram_init_data: initData, theme }),
  });
}

export async function getProducts(
  initData: string,
  params: { stone_id?: number; type?: string | null } = {},
): Promise<{ products: Product[] }> {
  const search = new URLSearchParams();
  if (params.stone_id) search.set('stone_id', String(params.stone_id));
  if (params.type) search.set('type', params.type);
  const qs = search.toString();
  return apiRequest(`/api/products${qs ? `?${qs}` : ''}`, initData);
}

export async function getStones(
  initData: string,
  params: { search?: string; theme?: string } = {},
): Promise<{ stones: Stone[] }> {
  const search = new URLSearchParams();
  if (params.search) search.set('search', params.search);
  if (params.theme) search.set('theme', params.theme);
  const qs = search.toString();
  return apiRequest(`/api/stones${qs ? `?${qs}` : ''}`, initData);
}

export async function submitCustomRequest(
  initData: string,
  payload: CustomRequestPayload,
): Promise<{ ok: true }> {
  return apiRequest('/api/custom-request', initData, {
    method: 'POST',
    body: JSON.stringify({ telegram_init_data: initData, ...payload }),
  });
}
