CREATE TABLE IF NOT EXISTS public.popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  activity_tag text,
  placement text NOT NULL CHECK (placement IN ('banner', 'modal')),
  display_mode text NOT NULL CHECK (display_mode IN ('text', 'image', 'image_text')),
  variant text NOT NULL CHECK (variant IN ('amber', 'sky', 'emerald', 'rose', 'indigo', 'orange')),
  title text,
  body text,
  image_url text,
  cta_label text,
  cta_href text,
  secondary_label text,
  secondary_href text,
  audience text NOT NULL DEFAULT 'guests' CHECK (audience IN ('guests', 'customers', 'everyone')),
  page_scope text NOT NULL DEFAULT '*',
  frequency text NOT NULL DEFAULT 'session' CHECK (frequency IN ('always', 'session', 'daily', 'once')),
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.popups ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.popups TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.popups TO authenticated;

CREATE POLICY "Public can read active popups"
  ON public.popups
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage popups"
  ON public.popups
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

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('popup-images', 'popup-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Public can read popup images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'popup-images');

CREATE POLICY "Admins can upload popup images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'popup-images'
    AND (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admins can update popup images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'popup-images'
    AND (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'popup-images'
    AND (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admins can delete popup images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'popup-images'
    AND (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
      OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );
