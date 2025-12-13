# Sky Jewelry DB Notes

## Jyotish tables and indexes

- `jyotish_stones`: add `life_path int[]`, consider:
  ```sql
  alter table public.jyotish_stones add column if not exists life_path int[];
  create index if not exists jyotish_stones_life_path_idx on public.jyotish_stones using gin (life_path);
  ```
- `jyotish_themes`: ensure `numbers int[]`:
  ```sql
  create index if not exists jyotish_themes_numbers_idx on public.jyotish_themes using gin (numbers);
  ```
- `jyotish_stone_theme`: foreign keys to stones/themes + indexes:
  ```sql
  create index if not exists jyotish_stone_theme_theme_idx on public.jyotish_stone_theme(theme_code);
  create index if not exists jyotish_stone_theme_stone_idx on public.jyotish_stone_theme(stone_id);
  ```

## Orders vs custom requests

Custom заявки теперь пишутся в `orders` (order_type = 'custom').
