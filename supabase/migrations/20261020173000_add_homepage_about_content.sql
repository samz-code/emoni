CREATE TABLE IF NOT EXISTS public.homepage_about (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  background text NOT NULL DEFAULT '',
  education text[] NOT NULL DEFAULT '{}',
  soft_skills text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.homepage_shoutouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  information text,
  profile_url text,
  image_url text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_about ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_shoutouts ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.homepage_about TO anon, authenticated;
GRANT SELECT ON public.homepage_shoutouts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.homepage_about TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.homepage_shoutouts TO authenticated;

CREATE POLICY "Public can read homepage about"
  ON public.homepage_about
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage homepage about"
  ON public.homepage_about
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Public can read published homepage shoutouts"
  ON public.homepage_shoutouts
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Admins can manage homepage shoutouts"
  ON public.homepage_shoutouts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
