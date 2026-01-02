const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const ROOT_DIR = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(ROOT_DIR, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const REPLACEMENTS = new Map([
  ['\u2018', "'"],
  ['\u2019', "'"],
  ['\u201C', '"'],
  ['\u201D', '"'],
  ['\u2013', '-'],
  ['\u2014', '-'],
  ['\u2212', '-'],
  ['\u2022', '-'],
  ['\u2E3B', '---'],
  ['\u2E3A', '--'],
  ['\u2026', '...'],
  ['\u00A0', ' '],
  ['\u202F', ' '],
]);

const normalizeAscii = (value) => {
  if (!value) return value;
  let text = value;
  for (const [from, to] of REPLACEMENTS.entries()) {
    text = text.split(from).join(to);
  }
  return text;
};

const cleanupLine = (value) => {
  if (!value) return value;
  let text = normalizeAscii(value);
  text = text.replace(/\t+/g, '');
  text = text.replace(/^\s*[\u2022-]\s*\u2022\s*/, '- ');
  text = text.replace(/^\s*\u2022\s*/, '- ');
  if (text.trim() === '---' || text.trim() === '--') return '';
  return text;
};

const hasLetters = (value) => /[A-Za-z\u0410-\u042f\u0430-\u044f]/.test(value);
const hasCyrillic = (value) => /[\u0410-\u042f\u0430-\u044f]/.test(value);
const BLANK_TOKEN = '__BLANK__';

const isHeadingLine = (value) => {
  if (!value) return false;
  if (!hasLetters(value)) return false;
  return value === value.toUpperCase();
};

const buildChunks = (lines, maxLen) => {
  const chunks = [];
  let current = [];
  let length = 0;

  lines.forEach((line) => {
    const nextLength = length + line.length + (current.length ? 1 : 0);
    if (current.length && nextLength > maxLen) {
      chunks.push(current);
      current = [line];
      length = line.length;
      return;
    }
    current.push(line);
    length = nextLength;
  });

  if (current.length) chunks.push(current);
  return chunks;
};

const translateText = async (text, attempt = 1) => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) {
    if (attempt >= 3) {
      throw new Error(`Translate request failed: ${response.status}`);
    }
    await sleep(300 * attempt);
    return translateText(text, attempt + 1);
  }
  const data = await response.json();
  const translated = Array.isArray(data?.[0]) ? data[0].map((item) => item?.[0] ?? '').join('') : '';
  return normalizeAscii(translated);
};

const translateLines = async (lines) => {
  const prepared = lines.map((line) => (line.trim() ? line : BLANK_TOKEN));
  const chunks = buildChunks(prepared, 3000);
  const translatedLines = [];

  for (const chunk of chunks) {
    const translatedText = await translateText(chunk.join('\n'));
    const translatedChunkLines = translatedText.split('\n');
    const fallbackNeeded = translatedChunkLines.length !== chunk.length;

    for (let idx = 0; idx < chunk.length; idx += 1) {
      const original = chunk[idx];
      if (original === BLANK_TOKEN) {
        translatedLines.push('');
        continue;
      }
      let line = fallbackNeeded ? await translateText(original) : translatedChunkLines[idx] ?? '';
      line = cleanupLine(line);
      if (hasCyrillic(line)) {
        line = cleanupLine(await translateText(original));
      }
      translatedLines.push(isHeadingLine(original.trim()) ? line.toUpperCase() : line);
    }
    await sleep(180);
  }

  return normalizeAscii(translatedLines.join('\n'));
};

const run = async () => {
  const { data, error } = await supabase
    .from('jyotish_stones')
    .select('id, description_short, description_long')
    .order('id', { ascending: true });

  if (error) throw error;

  const translations = {};
  for (const stone of data ?? []) {
    const shortText = stone.description_short ? normalizeAscii(await translateText(stone.description_short)) : null;
    const longText = stone.description_long
      ? normalizeAscii(await translateLines(String(stone.description_long).split('\n')))
      : null;
    translations[stone.id] = {
      short: shortText,
      long: longText,
    };
    await sleep(150);
  }

  const outputPath = path.join(ROOT_DIR, 'webapp', 'src', 'data', 'stone-translations.ts');
  const payload = `export const stoneTranslations: Record<number, { short: string | null; long: string | null }> = ${JSON.stringify(
    translations,
    null,
    2,
  )};\n`;
  fs.writeFileSync(outputPath, payload, 'utf8');

  console.log(`Wrote ${Object.keys(translations).length} translations to ${outputPath}`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
