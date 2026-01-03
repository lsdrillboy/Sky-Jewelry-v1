import type { Locale } from '../i18n';
import type { Stone } from '../types';
import { stoneTranslations } from '../data/stone-translations';

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

const CHAKRA_TRANSLATIONS: Record<string, string> = {
  '\u041c\u0443\u043b\u0430\u0434\u0445\u0430\u0440\u0430': 'Muladhara',
  '\u0421\u0432\u0430\u0434\u0445\u0438\u0441\u0442\u0430\u043d\u0430': 'Svadhisthana',
  '\u041c\u0430\u043d\u0438\u043f\u0443\u0440\u0430': 'Manipura',
  '\u0410\u043d\u0430\u0445\u0430\u0442\u0430': 'Anahata',
  '\u0412\u0438\u0448\u0443\u0434\u0445\u0430': 'Vishuddha',
  '\u0410\u0434\u0436\u043d\u0430': 'Ajna',
  '\u0421\u0430\u0445\u0430\u0441\u0440\u0430\u0440\u0430': 'Sahasrara',
  '\u0412\u0441\u0435': 'All',
};

const PLANET_TRANSLATIONS: Record<string, string> = {
  '\u0421\u043e\u043b\u043d\u0446\u0435': 'Sun',
  '\u041b\u0443\u043d\u0430': 'Moon',
  '\u041c\u0430\u0440\u0441': 'Mars',
  '\u041c\u0435\u0440\u043a\u0443\u0440\u0438\u0439': 'Mercury',
  '\u042e\u043f\u0438\u0442\u0435\u0440': 'Jupiter',
  '\u0412\u0435\u043d\u0435\u0440\u0430': 'Venus',
  '\u0421\u0430\u0442\u0443\u0440\u043d': 'Saturn',
  '\u0423\u0440\u0430\u043d': 'Uranus',
  '\u041d\u0435\u043f\u0442\u0443\u043d': 'Neptune',
  '\u041f\u043b\u0443\u0442\u043e\u043d': 'Pluto',
  '\u0412\u0441\u0435': 'All',
  '\u0412\u0441\u0435\u0020\u043f\u043b\u0430\u043d\u0435\u0442\u044b': 'All planets',
};

function pickLocalized(locale: Locale, enValue?: string | null, ruValue?: string | null) {
  if (locale === 'en') return enValue ?? ruValue;
  return ruValue ?? enValue;
}

export function getStoneName(stone: Stone, locale: Locale) {
  return pickLocalized(locale, stone.name_en, stone.name_ru) ?? '';
}

export function getStoneDescriptionShort(stone: Stone, locale: Locale) {
  const fallbackEn = stoneTranslations[stone.id]?.short ?? null;
  return pickLocalized(locale, stone.description_short_en ?? fallbackEn, stone.description_short);
}

export function getStoneDescriptionLong(stone: Stone, locale: Locale) {
  const fallbackEn = stoneTranslations[stone.id]?.long ?? null;
  return pickLocalized(locale, stone.description_long_en ?? fallbackEn, stone.description_long);
}

export function getStoneChakraLabel(value: string, locale: Locale) {
  if (locale !== 'en') return value;
  return CHAKRA_TRANSLATIONS[value] ?? value;
}

export function getStonePlanetLabel(value: string, locale: Locale) {
  if (locale !== 'en') return value;
  return PLANET_TRANSLATIONS[value] ?? value;
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
