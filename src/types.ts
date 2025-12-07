export type Stone = {
  id: number;
  name_ru: string;
  name_en?: string | null;
  slug: string;
  description_short?: string | null;
  description_long?: string | null;
  themes?: string[] | null;
  zodiac?: string[] | null;
  life_path?: number[] | null;
  chakra?: string[] | null;
  element?: string | null;
  color?: string | null;
  photo_url?: string | null;
  intensity?: number | null;
  contraindications?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  how_to_use?: string | null;
  best_for?: string | null;
  affirmation?: string | null;
};

export type Product = {
  id: number;
  name: string;
  type: string;
  price?: number | null;
  stones?: number[] | null;
  stone_ids?: number[] | null;
  description?: string | null;
  themes?: string[] | null;
  price_min?: number | null;
  price_max?: number | null;
  currency?: string | null;
  photo_url?: string | null;
  main_photo_url?: string | null;
  photos?: string[] | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

export type OrderPayload = {
  order_type: 'catalog' | 'custom' | 'consultation' | 'question';
  product_id?: number | null;
  stones?: number[] | null;
  budget_from?: number | null;
  budget_to?: number | null;
  comment?: string | null;
  contact?: string | null;
  status?: 'new' | 'in_progress' | 'done' | 'cancelled';
};
