import type { Locale } from '../i18n';
import type { Stone } from '../types';

export function normalizeToArray(value?: string[] | string | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      /* fallthrough */
    }
    return value
      .split(/[;,]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

export function normalizeToNumberArray(value?: number[] | string | null): number[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'number');
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((v) => typeof v === 'number');
    } catch {
      /* fallthrough */
    }
    return value
      .split(/[;,]/)
      .map((v) => Number(v.trim()))
      .filter((v) => Number.isFinite(v));
  }
  return [];
}

export type NormalizedStone = Stone & {
  chakra_list: string[];
  planet_list: string[];
  life_path_list: number[];
};

function pickLocalized(locale: Locale, enValue?: string | null, ruValue?: string | null) {
  if (locale === 'en') return enValue ?? ruValue;
  return ruValue ?? enValue;
}

export function getStoneName(stone: Stone, locale: Locale) {
  return pickLocalized(locale, stone.name_en, stone.name_ru) ?? '';
}

export function getStoneDescriptionShort(stone: Stone, locale: Locale) {
  return pickLocalized(locale, stone.description_short_en, stone.description_short);
}

export function getStoneDescriptionLong(stone: Stone, locale: Locale) {
  return pickLocalized(locale, stone.description_long_en, stone.description_long);
}

export function normalizeStone(stone: Stone): NormalizedStone {
  const chakra_list = normalizeToArray(stone.chakra);
  const planetCandidates = stone.planet ?? stone.planets;
  const planet_list = normalizeToArray(planetCandidates);
  const life_path_list = normalizeToNumberArray(stone.life_path);
  return {
    ...stone,
    chakra_list,
    planet_list,
    life_path_list,
  };
}
