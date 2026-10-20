ALTER TABLE public.homepage_about
  ADD COLUMN IF NOT EXISTS hard_skills text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS software jsonb NOT NULL DEFAULT '[]'::jsonb;
