ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS full_description text,
  ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.graphic_designs
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS full_description text,
  ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}';
