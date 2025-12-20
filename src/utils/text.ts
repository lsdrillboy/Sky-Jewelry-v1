const DEFAULT_CAPTION_LIMIT = 900;

export function sanitizeForHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function truncateForCaption(text: string, limit = DEFAULT_CAPTION_LIMIT) {
  const normalized = text.trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit - 1).trim()}…`;
}

export function extractTelegramError(err: unknown): string {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object') {
    const desc = (err as any).description ?? (err as any).error ?? (err as any).error_message;
    if (typeof desc === 'string') return desc;
    const msg = (err as any).message;
    if (typeof msg === 'string') return msg;
  }
  return '';
}

export function isParseModeError(err: unknown) {
  const text = extractTelegramError(err).toLowerCase();
  return text.includes("can't parse entities") || text.includes('parse entity');
}

export function isCaptionTooLongError(err: unknown) {
  const text = extractTelegramError(err).toLowerCase();
  return text.includes('caption is too long') || text.includes('caption_length') || text.includes('caption too long');
}
