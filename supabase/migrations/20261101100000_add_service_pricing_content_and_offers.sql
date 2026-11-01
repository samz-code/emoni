ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS starting_price numeric(12, 2)
    CHECK (starting_price IS NULL OR starting_price >= 0),
  ADD COLUMN IF NOT EXISTS price_unit text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_headline text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_primary_label text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_primary_link text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_secondary_label text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_secondary_link text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pricing_packages jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pricing_addons jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS page_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS trust_metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS testimonials jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS review_rating numeric(2, 1)
    CHECK (review_rating IS NULL OR review_rating BETWEEN 0 AND 5),
  ADD COLUMN IF NOT EXISTS review_count integer NOT NULL DEFAULT 0
    CHECK (review_count >= 0),
  ADD COLUMN IF NOT EXISTS google_review_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS portfolio_heading text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS portfolio_intro text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS process_heading text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS portfolio_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS service_process_steps jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.services
SET starting_price = NULLIF(
      replace(substring(starting_from from '([0-9][0-9,]*(\.[0-9]+)?)'), ',', ''),
      ''
    )::numeric,
    price_unit = CASE
      WHEN starting_from ~* '(month|monthly|/mo)' THEN 'per month'
      WHEN starting_from ~* '(year|yearly|annual|/yr)' THEN 'per year'
      ELSE ''
    END
WHERE starting_price IS NULL
  AND starting_from ~ '[0-9]';

UPDATE public.services
SET hero_headline = 'Website Design in Nairobi, Kenya',
    hero_primary_label = 'Get a Free Website Quote',
    hero_primary_link = '/contact?service=web-design',
    hero_secondary_label = 'Chat on WhatsApp',
    hero_secondary_link = 'https://wa.me/254727492545?text=Hi%2C%20I%27d%20like%20a%20free%20website%20quote.',
    short_description = 'Website Design That Wins You Customers. Fast, mobile-friendly websites for Kenyan businesses, built to turn visitors into enquiries.',
    long_description = 'Your website works for you around the clock. It answers questions when you are busy, builds confidence before the first conversation and gives every other marketing channel, from social media to Google Ads, somewhere credible to send people. A weak website makes all of that marketing less effective.' || E'\n\n' ||
      'We design and build websites around how your customers make decisions. That means clear messaging, a structure that answers their questions in the right order, fast mobile performance and obvious ways to get in touch. Every site we build is responsive, search-friendly from day one and set up so your team can make everyday updates without calling us.',
    starting_from = 'KSh 26,000',
    starting_price = 26000,
    price_unit = '',
    trust_metrics = '[
      {"value":"15+","label":"websites built for Kenyan clients"},
      {"value":"Clear pricing","label":"written scope, no surprises"},
      {"value":"Fast reply","label":"within one working day"}
    ]'::jsonb,
    review_rating = 5.0,
    review_count = 3,
    portfolio_heading = 'Websites we''ve designed and built',
    portfolio_intro = 'Real websites for schools, NGOs, property firms, tour operators, shops and professional services across Kenya.',
    process_heading = 'How our website design process works',
    testimonials = '[
      {"quote":"Bravura did a great job designing our website. It looks clean, professional and is easy to use. They also listened to what we wanted.","author":"Stellar"},
      {"quote":"Bravura helped us set up our Google Ads campaigns. They explained everything clearly and made the whole process easy for us.","author":"Teddy Haggai"},
      {"quote":"Our old website was outdated and needed a fresh look. Bravura redesigned it, and we are very happy with how it turned out.","author":"np Graphy"}
    ]'::jsonb,
    pricing_packages = '[
      {"name":"Starter Website","description":"For small businesses that need a credible, professional online presence.","price":26000,"price_label":"one-off","featured":false,"includes":["Up to 5 pages","Mobile-responsive design","Contact form and WhatsApp button","Google Maps integration","Basic on-page SEO setup","Social media links","Four rounds of revisions"],"excludes":["Copywriting (available as an add-on)","E-commerce or booking features","Domain and hosting (quoted separately if needed)"]},
      {"name":"Business Website","description":"For growing companies that need more pages, a blog and stronger search foundations.","price":45000,"price_label":"one-off","featured":true,"includes":["Up to 10 pages","Custom design aligned to your brand","Blog or news section","Enquiry forms and WhatsApp integration","On-page SEO and Google Search Console setup","Google Analytics (GA4) setup","Content management training","Ten rounds of revisions"],"excludes":["E-commerce (quoted as an add-on)","Professional photography"]},
      {"name":"Custom Website","description":"For e-commerce stores, portals, multi-language sites and complex functionality.","price":null,"price_label":"Quotation based","featured":false,"includes":["Discovery and requirements workshop","Custom information architecture","E-commerce, booking or integrations as required","Performance and security hardening","Launch plan and post-launch support"],"excludes":[]}
    ]'::jsonb,
    pricing_addons = '[
      {"name":"Additional pages","description":"Extra pages beyond what your package includes.","price":2500},
      {"name":"Basic copywriting","description":"We write clear, customer-focused copy for your core pages.","price":8000},
      {"name":"Enhanced initial SEO","description":"Keyword mapping, on-page optimisation and Google Business Profile setup at launch.","price":10000},
      {"name":"Booking or appointment functionality","description":"Online booking or appointment request forms with email notifications.","price":12000},
      {"name":"E-commerce functionality","description":"Product catalogue, cart and checkout with M-Pesa or card payment integration.","price":35000},
      {"name":"Ongoing maintenance","description":"Updates, backups, security monitoring and small content changes each month.","price":3500}
    ]'::jsonb,
    page_sections = '[
      {"eyebrow":"Included as standard","title":"What is included in every website design project","description":"","items":["Mobile-friendly design that works on every phone","WhatsApp, call and quote buttons on every page","Fast loading and secure (SSL)","On-page SEO and Google Search Console setup","Google Analytics to see visitors and enquiries","Training so your team can update content"]},
      {"eyebrow":"Website design services we offer","title":"A website built for your kind of business","description":"","items":["Business website design","Corporate website development","E-commerce website development","School website design","Real estate website design","NGO website development","Landing page design","Website redesign"]}
    ]'::jsonb,
    portfolio_items = '[
      {"name":"Elserve Resource Limited","category":"Professional Services","image_url":"","live_url":""},
      {"name":"Love Concern Family","category":"NGO & Nonprofit","image_url":"","live_url":""},
      {"name":"Hornmed","category":"Healthcare & NGO","image_url":"","live_url":""},
      {"name":"Latitude Properties Ltd","category":"Real Estate","image_url":"","live_url":""},
      {"name":"White Horse Safaris","category":"Travel & Hospitality","image_url":"","live_url":""},
      {"name":"Ravishing Caterers","category":"Hospitality","image_url":"","live_url":""},
      {"name":"FreeWorld Bookings","category":"Travel & Hospitality","image_url":"","live_url":""},
      {"name":"Vitabu Online","category":"Retail & E-commerce","image_url":"","live_url":""},
      {"name":"Fermi Motors","category":"Automotive","image_url":"","live_url":""},
        {"name":"Angie''s Closet","category":"Fashion & Retail","image_url":"","live_url":""},
      {"name":"Voximart","category":"Retail & E-commerce","image_url":"","live_url":""},
      {"name":"Mokk Creations","category":"Fashion & Lifestyle","image_url":"","live_url":""}
    ]'::jsonb,
    service_process_steps = '[
      {"step_number":"01","title":"Discover","description":"A short call or meeting to understand your business, your customers and what this project needs to achieve."},
      {"step_number":"02","title":"Strategise","description":"We agree the scope, structure, timeline and price in writing, so you know exactly what you are getting."},
      {"step_number":"03","title":"Design & develop","description":"Our team creates the first version, working from your brand, your goals and the content we have gathered."},
      {"step_number":"04","title":"Review & refine","description":"You review the work and share feedback. We refine it within the agreed revision rounds until it is right."},
      {"step_number":"05","title":"Launch & support","description":"We deliver final files or take the project live, then stay available for questions, updates and next steps."}
    ]'::jsonb
WHERE id = 'web-design'
  AND hero_headline = '';

CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL DEFAULT 'all'
    CHECK (target_type IN ('all', 'services', 'courses', 'service', 'course')),
  target_id text,
  enabled boolean NOT NULL DEFAULT false,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  currency text NOT NULL DEFAULT 'KES' CHECK (currency IN ('KES', 'USD')),
  discount_type text NOT NULL DEFAULT 'percentage'
    CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(12, 2) NOT NULL DEFAULT 0
    CHECK (discount_value >= 0 AND (discount_type <> 'percentage' OR discount_value <= 100)),
  starts_at timestamptz,
  ends_at timestamptz,
  show_on_home boolean NOT NULL DEFAULT false,
  banner_image_url text,
  banner_format text NOT NULL DEFAULT 'banner' CHECK (banner_format IN ('banner', 'flyer')),
  banner_alt text NOT NULL DEFAULT '',
  cta_text text NOT NULL DEFAULT 'View offer',
  cta_link text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at),
  CHECK (
    (target_type IN ('service', 'course') AND target_id IS NOT NULL AND target_id <> '')
    OR (target_type NOT IN ('service', 'course') AND target_id IS NULL)
  ),
  CHECK (NOT show_on_home OR (banner_image_url IS NOT NULL AND banner_image_url <> ''))
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.offers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.offers TO authenticated;

DROP POLICY IF EXISTS "Public can read enabled offers" ON public.offers;
CREATE POLICY "Public can read enabled offers"
  ON public.offers
  FOR SELECT
  TO anon, authenticated
  USING (enabled = true);

DROP POLICY IF EXISTS "Admins can manage offers" ON public.offers;
CREATE POLICY "Admins can manage offers"
  ON public.offers
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

GRANT INSERT ON public.website_review_requests TO authenticated;
