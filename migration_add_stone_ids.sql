-- Migration: Add stone_ids column to products table if it doesn't exist
-- Run this in Supabase SQL editor if you get "column stone_ids does not exist" error

-- Add the column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'stone_ids'
  ) THEN
    ALTER TABLE public.products ADD COLUMN stone_ids int[];
    CREATE INDEX IF NOT EXISTS products_stone_ids_idx ON public.products USING gin (stone_ids);
    RAISE NOTICE 'Added stone_ids column and index to products table';
  ELSE
    RAISE NOTICE 'Column stone_ids already exists';
  END IF;
END $$;






