-- Schema for Sky Jewelry bot (run in Supabase SQL editor with service_role).

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null,
  username text,
  first_name text,
  language_code text,
  birthdate date,
  life_path int,
  gender text check (gender in ('male', 'female', 'unknown')) default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_telegram_id_key unique (telegram_id)
);
create index if not exists users_telegram_id_idx on public.users(telegram_id);

-- Stones
create table if not exists public.stones (
  id serial primary key,
  name_ru text not null,
  name_en text,
  slug text not null unique,
  description_short text,
  description_long text,
  themes text[],
  zodiac text[],
  life_path int[],
  chakra text[],
  element text,
  color text,
  photo_url text,
  intensity int,
  contraindications text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists stones_themes_idx on public.stones using gin (themes);
create index if not exists stones_life_path_idx on public.stones using gin (life_path);
create index if not exists stones_zodiac_idx on public.stones using gin (zodiac);

-- Products
create table if not exists public.products (
  id serial primary key,
  name text not null,
  type text not null,
  stones int[],
  description text,
  themes text[],
  price_min numeric,
  price_max numeric,
  currency text,
  main_photo_url text,
  photos text[],
  stone_ids int[],
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists products_themes_idx on public.products using gin (themes);
create index if not exists products_stones_idx on public.products using gin (stones);
create index if not exists products_stone_ids_idx on public.products using gin (stone_ids);
create index if not exists products_type_idx on public.products(type);

-- Stone requests
create table if not exists public.stone_requests (
  id serial primary key,
  user_id uuid references public.users(id) on delete set null,
  birthdate date,
  life_path int,
  theme text,
  extra_text text,
  selected_stones int[],
  created_at timestamptz not null default now()
);
create index if not exists stone_requests_user_idx on public.stone_requests(user_id);

-- Orders
create table if not exists public.orders (
  id serial primary key,
  user_id uuid references public.users(id) on delete set null,
  order_type text not null check (order_type in ('catalog', 'custom', 'consultation', 'question')),
  product_id int references public.products(id) on delete set null,
  stones int[],
  budget_from numeric,
  budget_to numeric,
  comment text,
  contact text,
  status text not null default 'new' check (status in ('new','in_progress','done','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);

-- Timestamp update trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

-- Custom requests (WebApp individual forms)
create table if not exists public.custom_requests (
  id serial primary key,
  user_id uuid references public.users(id) on delete set null,
  stones int[],
  type text,
  budget_from numeric,
  budget_to numeric,
  comment text,
  created_at timestamptz not null default now()
);
create index if not exists custom_requests_user_idx on public.custom_requests(user_id);
