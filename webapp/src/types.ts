export type User = {
  id: string;
  telegram_id?: number;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  birthdate?: string | null;
  life_path?: number | null;
  language?: string | null;
  photo_url?: string | null;
};

export type Stone = {
  id: number;
  name_ru: string;
  description_short?: string | null;
  description_long?: string | null;
  photo_url?: string | null;
  themes?: string[] | null;
  zodiac?: string[] | null;
  life_path?: number[] | null;
  chakra?: string[] | null;
  planet?: string[] | null;
  planets?: string[] | null;
  element?: string | null;
  color?: string | null;
};

export type Product = {
  id: number;
  name: string;
  description?: string | null;
  price?: number | null;
  price_min?: number | null;
  price_max?: number | null;
  currency?: string | null;
  photo_url?: string | null;
  main_photo_url?: string | null;
  stones?: number[] | null;
  stone_ids?: number[] | null;
  themes?: string[] | null;
  type?: string | null;
};

export type StonePickerResult = {
  life_path: number | null;
  theme: string;
  stones: Stone[];
};

export type Theme = {
  code: string;
  label: string;
  description?: string | null;
  numbers?: number[] | null;
};

export type CustomRequestPayload = {
  stones?: number[];
  type?: string;
  budget_from?: number | null;
  budget_to?: number | null;
  comment?: string;
};

export type Screen =
  | 'cover'
  | 'main'
  | 'birthdate'
  | 'profile'
  | 'stone'
  | 'catalog'
  | 'custom'
  | 'library'
  | 'history'
  | 'favorites'
  | 'reviews';
