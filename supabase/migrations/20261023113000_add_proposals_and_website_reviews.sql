CREATE TABLE IF NOT EXISTS public.client_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_email text NOT NULL,
  company_name text,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  scope text NOT NULL DEFAULT '',
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_kes integer NOT NULL DEFAULT 0 CHECK (total_kes >= 0),
  payment_terms text NOT NULL DEFAULT '',
  validity_days integer NOT NULL DEFAULT 30 CHECK (validity_days > 0),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'changes_requested')),
  client_message text,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.website_review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_email text NOT NULL,
  website_url text NOT NULL,
  goals text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'reviewing', 'awaiting_payment', 'paid', 'complete')),
  fee_kes integer NOT NULL DEFAULT 0 CHECK (fee_kes >= 0),
  payment_instructions text NOT NULL DEFAULT '',
  payment_reference text,
  summary text NOT NULL DEFAULT '',
  working_well text[] NOT NULL DEFAULT '{}',
  needs_improvement text[] NOT NULL DEFAULT '{}',
  admin_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_review_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_proposals TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.website_review_requests TO authenticated;

CREATE POLICY "Admins can manage client proposals"
  ON public.client_proposals
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

CREATE POLICY "Admins can manage website review requests"
  ON public.website_review_requests
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

CREATE OR REPLACE FUNCTION public.create_website_review_request(
  p_client_name text,
  p_client_email text,
  p_website_url text,
  p_goals text DEFAULT ''
)
RETURNS TABLE (request_id uuid, access_token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_id uuid;
  new_token uuid;
BEGIN
  IF length(trim(p_client_name)) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'Enter your name.';
  END IF;
  IF length(trim(p_client_email)) NOT BETWEEN 3 AND 254
     OR trim(p_client_email) !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' THEN
    RAISE EXCEPTION 'Enter a valid email address.';
  END IF;
  IF length(trim(p_website_url)) > 2048
     OR trim(p_website_url) !~* '^https?://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'Enter a complete website URL starting with https:// or http://.';
  END IF;
  IF length(coalesce(p_goals, '')) > 2000 THEN
    RAISE EXCEPTION 'The project goals are too long.';
  END IF;

  INSERT INTO public.website_review_requests (client_name, client_email, website_url, goals)
  VALUES (trim(p_client_name), lower(trim(p_client_email)), trim(p_website_url), trim(coalesce(p_goals, '')))
  RETURNING id, public_token INTO new_id, new_token;

  RETURN QUERY SELECT new_id, new_token;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_website_review(p_token uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'client_name', client_name,
    'website_url', website_url,
    'goals', goals,
    'status', status,
    'fee_kes', fee_kes,
    'payment_instructions', payment_instructions,
    'payment_reference', payment_reference,
    'summary', CASE WHEN status = 'complete' THEN summary ELSE '' END,
    'working_well', CASE WHEN status = 'complete' THEN working_well ELSE '{}'::text[] END,
    'needs_improvement', CASE WHEN status = 'complete' THEN needs_improvement ELSE '{}'::text[] END,
    'created_at', created_at
  )
  FROM public.website_review_requests
  WHERE public_token = p_token;
$$;

CREATE OR REPLACE FUNCTION public.submit_review_payment_reference(p_token uuid, p_reference text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  changed integer;
BEGIN
  IF length(trim(p_reference)) NOT BETWEEN 3 AND 100 THEN
    RAISE EXCEPTION 'Enter a valid payment reference.';
  END IF;
  UPDATE public.website_review_requests
  SET payment_reference = trim(p_reference), updated_at = now()
  WHERE public_token = p_token
    AND status = 'awaiting_payment';
  GET DIAGNOSTICS changed = ROW_COUNT;
  RETURN changed = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_client_proposal(p_token uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'client_name', client_name,
    'company_name', company_name,
    'title', title,
    'summary', summary,
    'scope', scope,
    'line_items', line_items,
    'total_kes', total_kes,
    'payment_terms', payment_terms,
    'validity_days', validity_days,
    'status', status,
    'client_message', client_message,
    'accepted_at', accepted_at,
    'created_at', created_at
  )
  FROM public.client_proposals
  WHERE public_token = p_token AND status <> 'draft';
$$;

CREATE OR REPLACE FUNCTION public.respond_to_client_proposal(
  p_token uuid,
  p_response text,
  p_message text DEFAULT ''
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  changed integer;
BEGIN
  IF p_response NOT IN ('accepted', 'declined', 'changes_requested') THEN
    RAISE EXCEPTION 'Choose a valid proposal response.';
  END IF;
  IF length(coalesce(p_message, '')) > 3000 THEN
    RAISE EXCEPTION 'Your message is too long.';
  END IF;
  UPDATE public.client_proposals
  SET status = p_response,
      client_message = nullif(trim(coalesce(p_message, '')), ''),
      accepted_at = CASE WHEN p_response = 'accepted' THEN now() ELSE NULL END,
      updated_at = now()
  WHERE public_token = p_token
    AND status = 'sent'
    AND now() <= created_at + (validity_days || ' days')::interval;
  GET DIAGNOSTICS changed = ROW_COUNT;
  RETURN changed = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.create_website_review_request(text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_website_review(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_review_payment_reference(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_client_proposal(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.respond_to_client_proposal(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_website_review_request(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_website_review(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_review_payment_reference(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_client_proposal(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_client_proposal(uuid, text, text) TO anon, authenticated;
