CREATE TABLE IF NOT EXISTS public.industries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  tagline text NOT NULL DEFAULT '',
  hero_headline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  overview text NOT NULL DEFAULT '',
  hero_image_url text NOT NULL DEFAULT '',
  challenges text[] NOT NULL DEFAULT '{}',
  solutions text[] NOT NULL DEFAULT '{}',
  outcomes text[] NOT NULL DEFAULT '{}',
  use_cases jsonb NOT NULL DEFAULT '[]'::jsonb,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  service_slugs text[] NOT NULL DEFAULT '{}',
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT 'Talk to us about your project',
  cta_link text NOT NULL DEFAULT '/contact',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (length(trim(name)) > 0),
  CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

ALTER TABLE public.industries
  ADD COLUMN IF NOT EXISTS hero_headline text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS overview text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS outcomes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS use_cases jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS seo_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cta_label text NOT NULL DEFAULT 'Talk to us about your project',
  ADD COLUMN IF NOT EXISTS cta_link text NOT NULL DEFAULT '/contact';

ALTER TABLE public.industries
  ADD COLUMN IF NOT EXISTS hero_headline text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS overview text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS outcomes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS use_cases jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS seo_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cta_label text NOT NULL DEFAULT 'Talk to us about your project',
  ADD COLUMN IF NOT EXISTS cta_link text NOT NULL DEFAULT '/contact';

ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.industries TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.industries TO authenticated;

DROP POLICY IF EXISTS "Public can read published industries" ON public.industries;
CREATE POLICY "Public can read published industries"
  ON public.industries
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "Admins can manage industries" ON public.industries;
CREATE POLICY "Admins can manage industries"
  ON public.industries
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

INSERT INTO public.industries (
  name, slug, tagline, hero_headline, description, overview,
  challenges, solutions, outcomes, use_cases, faqs,
  seo_title, seo_description, service_slugs, sort_order, published
) VALUES

-- 1. Schools
(
  'Schools & Educational Institutions', 'schools-education',
  'Digital tools that make learning and administration easier to access.',
  'Websites and Digital Systems for Schools and Training Institutions in Kenya',
  'Schools, colleges and training institutions serve several audiences at once: prospective parents, current families, learners, teachers and administrators. Each group needs different information, and most of them reach it on a phone.',
  'We start by mapping who visits your digital channels and what each group is trying to do, whether that is checking fee structures, finding the admissions process, downloading a term calendar or contacting the right office. From there we plan a site and supporting workflows that keep information current, reduce repetitive calls to the front office and present your institution with the credibility it has earned. Everything is built mobile-first, loads quickly on typical Kenyan mobile connections and is set up so your own staff can update notices, news and documents without technical help.',
  ARRAY[
    'Out-of-date information: term dates, fee structures and notices change often, and a website that lags behind creates confusion and extra calls to the office.',
    'Unclear admissions journey: prospective parents struggle to find entry requirements, deadlines and how to apply, so enquiries go to competitors with clearer pages.',
    'Information scattered across channels: news lives on social media, documents on WhatsApp and forms on paper, with no single trusted source.',
    'Limited staff capacity: updating a website is rarely anyone''s full-time job, so content management has to be simple enough for a busy administrator.'
  ],
  ARRAY[
    'A structured, mobile-first school website with dedicated sections for admissions, academics, fees, calendar, news, gallery and contacts.',
    'A clear admissions and enquiry journey with online forms that route to the right person and send automatic acknowledgements.',
    'A central notices and downloads area for circulars, calendars, fee schedules and newsletters, so families always find the latest version in one place.',
    'Simple content management plus hands-on training so your team can publish updates confidently without calling a developer.'
  ],
  ARRAY[
    'Fewer repetitive calls and visits to the school office because answers are easy to find online',
    'More qualified admissions enquiries from parents who can see programmes, fees and process clearly',
    'A professional, consistent image that reflects the quality of teaching and facilities'
  ],
  '[
    {"title":"Admissions and enquiry forms","description":"Online application and enquiry forms that collect the right details, notify the admissions team and send an automatic confirmation to the parent."},
    {"title":"Parent communication hub","description":"A single place for term dates, newsletters, circulars and event announcements, reducing reliance on scattered messaging groups."},
    {"title":"Programme and course pages","description":"Clear pages for each level, course or programme covering entry requirements, duration, fees and outcomes."},
    {"title":"Staff and department directory","description":"A directory that points visitors to the right office, with contact details and responsibilities."}
  ]'::jsonb,
  '[
    {"question":"Can our staff update the website themselves?","answer":"Yes. We set up simple content management for notices, news, galleries and documents, and train your team so everyday updates do not need a developer."},
    {"question":"Can the website handle online applications?","answer":"Yes. We can build application and enquiry forms with email notifications, and connect them to spreadsheets or your existing admissions process."},
    {"question":"Will the site work well on mobile phones?","answer":"Every page is designed mobile-first and tested on common phone sizes, because most parents and learners will visit from a phone."}
  ]'::jsonb,
  'School Website Design in Kenya | Monawanka Consulting',
  'Mobile-friendly websites and digital workflows for schools, colleges and training institutions in Kenya, covering admissions, notices and parent communication.',
  ARRAY['web-development', 'process-automation', 'digital-consultancy'], 0, true
),

-- 2. Real estate
(
  'Real Estate', 'real-estate',
  'Property experiences that help people find the right information.',
  'Real Estate Website Design and Digital Systems in Kenya',
  'Property buyers, tenants and investors compare many options quickly. The agents and developers who present listings clearly and respond fast are the ones who convert interest into viewings.',
  'We design property websites around how people actually search: by location, price, type and size, with strong imagery and the details that matter up front. Behind the scenes we plan how enquiries are captured, who receives them and how quickly they are followed up, because a beautiful listing page loses its value if a lead waits two days for a reply. Whether you are an individual agent, a growing agency or a developer launching a new project, we build a presence that makes your properties easy to browse, easy to trust and easy to enquire about.',
  ARRAY[
    'Inconsistent listing presentation: photos, descriptions and details vary from listing to listing, making comparison difficult and the brand look unprofessional.',
    'Hard-to-search catalogues: visitors cannot filter by area, price or property type, so they leave before finding a match.',
    'Slow lead follow-up: enquiries arrive through calls, WhatsApp, email and forms with no single place to track them.',
    'Low trust online: buyers are cautious about fraud, so unclear ownership, missing details and weak branding reduce confidence.'
  ],
  ARRAY[
    'A structured property catalogue with filters for location, price, type and bedrooms, and consistent listing templates with gallery, map and key facts.',
    'Enquiry journeys with call, WhatsApp and form options on every listing, routing each lead to the responsible agent with an instant notification.',
    'Branding and marketing materials, including logos, brochures, social media templates and listing flyers, so every touchpoint looks consistent.',
    'Trust-building pages covering company profile, team, completed projects, process and clear contact and office details.'
  ],
  ARRAY[
    'Faster, more consistent response to prospects, leading to more viewings booked',
    'Listings that are easier to browse and compare on mobile',
    'A credible, recognisable brand that stands apart from informal listings'
  ],
  '[
    {"title":"Property catalogue","description":"Searchable listings with photo galleries, location maps, key features and a clear call to action on every page."},
    {"title":"Project launch pages","description":"Dedicated landing pages for new developments with unit types, pricing guidance, payment plan information and site visit booking."},
    {"title":"Lead capture and routing","description":"Forms and WhatsApp links that send each enquiry to the right agent and log it for follow-up."},
    {"title":"Marketing collateral","description":"Brochures, flyers and social media templates aligned to your brand for consistent campaigns."}
  ]'::jsonb,
  '[
    {"question":"Can you build a website where we can add and edit listings ourselves?","answer":"Yes. We set up an admin area where your team can add, edit and unpublish listings, upload photos and mark properties as sold or let."},
    {"question":"Can enquiries go straight to WhatsApp?","answer":"Yes. Every listing can include a WhatsApp button with a pre-filled message referencing the property, alongside call and form options."},
    {"question":"Do you design brochures and flyers too?","answer":"Yes. Our graphic design service covers brochures, listing flyers, signage concepts and social media templates that match your website."}
  ]'::jsonb,
  'Real Estate Website Design in Nairobi, Kenya | Monawanka Consulting',
  'Property websites, listing catalogues, lead capture and branding for real estate agents and developers in Kenya.',
  ARRAY['web-development', 'graphic-design', 'process-automation'], 1, true
),

-- 3. Construction
(
  'Construction & Engineering', 'construction-engineering',
  'A clear digital presence for complex projects and technical expertise.',
  'Websites and Branding for Construction and Engineering Firms',
  'Clients choosing a contractor or engineering partner look for proof: completed projects, safety standards, certifications and a team that communicates clearly. Much of that proof is never seen online.',
  'We help construction and engineering firms translate technical capability into clear, credible digital communication. That means organising services by what clients are trying to achieve, presenting projects with context rather than just photos, and making compliance, registrations and safety commitments easy to find. We also build the supporting materials, such as company profiles, capability statements and proposal templates, so that tender submissions and client conversations are backed by a consistent professional identity.',
  ARRAY[
    'Technical services are hard to explain: clients from different backgrounds need plain-language descriptions alongside the technical detail.',
    'Project experience is under-presented: completed work sits in folders and phones instead of being showcased with scope, scale and outcome.',
    'Tender and proposal materials are inconsistent: documents are assembled from different templates for each submission.',
    'Enquiries are not routed well: general contact forms do not separate residential, commercial, government and partnership requests.'
  ],
  ARRAY[
    'Service pages structured by client need, with clear scope, process and typical project types for each discipline.',
    'A project portfolio with consistent case studies covering location, scope, timeline and result.',
    'A professional company profile, capability statement and proposal templates built from one brand system.',
    'Enquiry forms that capture project type, location, budget range and timeline so the right team can respond quickly.'
  ],
  ARRAY[
    'Stronger credibility with clients, consultants and tender evaluators',
    'More relevant enquiries with the information needed to respond properly',
    'Faster preparation of proposals using ready, consistent templates'
  ],
  '[
    {"title":"Capability and credentials pages","description":"Registrations, certifications, safety policies and equipment capability presented clearly for client due diligence."},
    {"title":"Project case studies","description":"Structured showcases with before and after photography, scope, challenges solved and project outcomes."},
    {"title":"Request a quote workflow","description":"A guided enquiry form that captures the details your estimators need before the first call."},
    {"title":"Company profile and templates","description":"A designed company profile, letterheads and proposal layouts that keep every document consistent."}
  ]'::jsonb,
  '[
    {"question":"Can the website show our past projects in detail?","answer":"Yes. We build a project portfolio with a consistent case study format, and give you an admin area to add new projects as they are completed."},
    {"question":"Can you help with our company profile for tenders?","answer":"Yes. We design company profiles and capability statements and can set up reusable proposal templates aligned to your brand."},
    {"question":"Can enquiries be separated by type of work?","answer":"Yes. Forms can route residential, commercial, industrial or partnership enquiries to different team members automatically."}
  ]'::jsonb,
  'Construction and Engineering Website Design | Monawanka Consulting',
  'Professional websites, project portfolios and brand materials for construction and engineering companies in Kenya and East Africa.',
  ARRAY['web-development', 'graphic-design', 'digital-consultancy'], 2, true
),

-- 4. Healthcare
(
  'Healthcare', 'healthcare',
  'Accessible digital experiences that help people find care information.',
  'Healthcare Website Design and Digital Workflows in Kenya',
  'People searching for a clinic, hospital or health programme want clear answers quickly: what services are offered, where to go, when it is open and how to make contact. Clarity matters even more when they are worried or in a hurry.',
  'We design healthcare websites and digital workflows that put practical information first. Services are grouped in plain language, locations and opening hours are easy to find, and calls to action are obvious on a small screen. For internal efficiency, we help plan enquiry and appointment request workflows so that front-desk teams spend less time on repetitive messages. We take care with tone, accessibility and privacy: our work focuses on public-facing information and enquiry handling, and we advise on sensible data practices for anything involving personal details.',
  ARRAY[
    'Services and locations are hard to find: visitors need to know what is offered, where, and at what times without searching through long pages.',
    'High volume of repetitive enquiries: front-desk teams answer the same questions about hours, fees and procedures repeatedly.',
    'Accessibility gaps: small text, low contrast and complex navigation exclude older users and people on low-end devices.',
    'Trust and tone: health websites need to feel professional, calm and reliable, with clear information about who is behind the service.'
  ],
  ARRAY[
    'Service pages written in plain language with clear sections for what is offered, who it is for, preparation and how to book or enquire.',
    'Location, hours and contact information presented prominently with map integration, click-to-call and WhatsApp options.',
    'Appointment request forms with email or message notifications, and automated acknowledgements to reduce manual back-and-forth.',
    'Accessible design with readable typography, strong contrast, mobile-first layouts and lightweight pages that load on slower connections.'
  ],
  ARRAY[
    'Fewer routine calls because key information is easy to find online',
    'Smoother appointment request handling for administrative staff',
    'A professional, trustworthy digital presence for patients and partners'
  ],
  '[
    {"title":"Service directory","description":"A searchable or well-organised list of departments and services with descriptions, preparation notes and contact routes."},
    {"title":"Appointment request form","description":"A simple form that captures preferred service, date and contact details and notifies the right team."},
    {"title":"Facility and branch pages","description":"Dedicated pages per branch with address, map, hours, services available and directions."},
    {"title":"Health awareness content","description":"A news or resources section for campaigns, outreach events and community health information."}
  ]'::jsonb,
  '[
    {"question":"Can patients request appointments through the website?","answer":"Yes. We can build appointment request forms that notify your team by email or message. Confirmation remains with your staff, so you keep control of scheduling."},
    {"question":"How do you handle sensitive information?","answer":"We keep public sites focused on general information and enquiry details, and we advise on minimising personal data collection and securing any forms."},
    {"question":"Will the site be easy to read for older users?","answer":"Yes. We use larger readable type, strong contrast and simple navigation so the site works for a wide range of users and devices."}
  ]'::jsonb,
  'Healthcare Website Design in Kenya | Monawanka Consulting',
  'Accessible websites and enquiry workflows for clinics, hospitals and health organisations in Kenya.',
  ARRAY['web-development', 'process-automation', 'digital-consultancy'], 3, true
),

-- 5. Hospitality
(
  'Hotels & Restaurants', 'hotels-restaurants',
  'Useful online experiences for guests, diners and hospitality teams.',
  'Website Design and Branding for Hotels, Restaurants and Lodges',
  'Guests decide quickly and mostly on mobile. They want to see the rooms or the menu, check the location, understand the price range and make contact or book, all within a minute or two.',
  'We build hospitality websites that sell the experience first and make the practical details effortless. Rooms, menus, packages and offers are presented with strong visuals and clear information, and booking or enquiry options are never more than a tap away. We also design the brand materials that guests meet along the way, from menus and table cards to social media posts and promotional flyers, so that your online presence matches what guests find when they arrive. Where relevant, we integrate payment options such as M-Pesa and cards for deposits or online orders.',
  ARRAY[
    'Key details are buried: guests cannot quickly find rates, menus, check-in times, location or amenities.',
    'Booking friction: complicated forms or unanswered messages cause guests to book elsewhere.',
    'Inconsistent brand: menus, social media and signage each look different, weakening recognition.',
    'Seasonal promotion is manual: offers and events are announced ad hoc with no central, reusable format.'
  ],
  ARRAY[
    'Image-led pages for rooms, dining, events and experiences with clear pricing guidance and amenities.',
    'Simple booking and enquiry flows with WhatsApp, call and form options, plus automated confirmation messages.',
    'Payment integration for deposits, table reservations or online orders using M-Pesa and card options where appropriate.',
    'A cohesive brand toolkit covering menus, social templates, event flyers and signage designs.'
  ],
  ARRAY[
    'More direct bookings and enquiries from guests browsing on mobile',
    'A consistent brand that feels premium across print and digital',
    'Easier promotion of offers, events and seasonal menus'
  ],
  '[
    {"title":"Room and package showcase","description":"Detailed pages per room type or package with gallery, amenities, rates guidance and a direct enquiry button."},
    {"title":"Digital menus","description":"Mobile-friendly menus that are easy to update, with optional QR code access at the table."},
    {"title":"Events and offers","description":"Landing pages for weddings, conferences, seasonal packages and promotions that can be shared on social media."},
    {"title":"Deposit and payment collection","description":"M-Pesa and card payment integration for reservations, deposits or pre-orders."}
  ]'::jsonb,
  '[
    {"question":"Can guests book directly on the website?","answer":"Yes. Depending on your needs we can build enquiry forms, booking requests or full online booking with payments, and integrate with existing tools where possible."},
    {"question":"Can you accept M-Pesa payments?","answer":"Yes. Our payment integration service supports M-Pesa and card payments for deposits, orders and reservations."},
    {"question":"Can you design our menus and promotional materials?","answer":"Yes. We design print and digital menus, table cards, flyers and social media templates that match your brand."}
  ]'::jsonb,
  'Hotel and Restaurant Website Design in Kenya | Monawanka Consulting',
  'Mobile-friendly websites, booking flows, M-Pesa payments and brand design for hotels, restaurants and lodges in Kenya.',
  ARRAY['web-development', 'graphic-design', 'payment-integrations'], 4, true
),

-- 6. Logistics
(
  'Logistics & Transport', 'logistics-transport',
  'Digital systems that make services, updates and enquiries easier to follow.',
  'Digital Systems and Websites for Logistics and Transport Companies',
  'Logistics customers care about reliability, coverage and communication. They want to know what you carry, where you operate, how to get a quote and how to follow up on a shipment without chasing.',
  'We help logistics and transport businesses explain their services clearly and reduce the operational friction behind customer communication. Our work starts with a review of how quote requests, bookings and status updates currently flow between customers, dispatchers and drivers. We then recommend and build practical improvements: clear service and coverage pages, structured quote request forms, and automated notifications that replace repeated manual follow-up. The goal is a business that looks dependable online and runs with fewer hand-offs behind the scenes.',
  ARRAY[
    'Services and coverage are unclear: customers cannot tell routes, vehicle types, capacity or cross-border capability at a glance.',
    'Quote requests lack detail: incomplete requests cause back-and-forth before a price can be given.',
    'Constant status enquiries: customers call to ask where a delivery is because updates are not proactive.',
    'Manual hand-offs between sales, dispatch and finance create delays and errors.'
  ],
  ARRAY[
    'Service, fleet and coverage pages that explain what you move, where, and how to request a quote.',
    'Structured quote request forms capturing pickup, destination, cargo type, weight and timeline.',
    'Workflow automation for confirmations, status notifications and internal task assignment.',
    'A review of your operations flow with prioritised recommendations for where digital tools save the most time.'
  ],
  ARRAY[
    'Fewer back-and-forth messages before quoting a job',
    'Reduced inbound status calls through proactive notifications',
    'Clearer internal hand-offs between sales, operations and finance'
  ],
  '[
    {"title":"Quote request portal","description":"A guided form that collects the information dispatchers need and sends it straight to the right team."},
    {"title":"Service and route pages","description":"Pages for each service line, such as local delivery, freight and cross-border, with clear coverage and requirements."},
    {"title":"Automated notifications","description":"Email or message confirmations when a request is received, accepted and completed."},
    {"title":"Operations workflow mapping","description":"A documented view of how jobs move through your business with recommendations for automation."}
  ]'::jsonb,
  '[
    {"question":"Can you build a tracking system?","answer":"We can scope this with you. Depending on your needs, options range from simple status update notifications to a custom tracking portal. We start with a consultation to decide what is practical."},
    {"question":"Can customers request quotes online?","answer":"Yes. We build structured quote forms that collect the key details and notify your team immediately."},
    {"question":"Can you automate internal tasks?","answer":"Yes. We map your process and automate repetitive steps such as confirmations, assignments and reminders."}
  ]'::jsonb,
  'Logistics Website and Workflow Automation in Kenya | Monawanka Consulting',
  'Websites, quote request systems and workflow automation for logistics and transport companies in Kenya and East Africa.',
  ARRAY['digital-consultancy', 'process-automation', 'web-development'], 5, true
),

-- 7. NGOs
(
  'NGOs & Nonprofits', 'ngos-nonprofits',
  'Digital platforms that communicate mission, programmes and impact.',
  'Website Development and Digital Strategy for NGOs and Nonprofits',
  'Donors, partners and communities judge an organisation by how clearly it explains its work and how openly it reports on results. Many nonprofits do important work but struggle to show it online with limited staff and budget.',
  'We help NGOs and nonprofits build a digital presence that is mission-led, transparent and manageable by a small team. We organise programme and impact information so that each audience, whether donor, partner, volunteer or beneficiary, can find what they need. Where fundraising or sign-ups matter, we make those journeys simple and connect them to the tools you already use. We also design reports, brochures and campaign materials so that your story is told consistently across channels.',
  ARRAY[
    'Impact is hard to demonstrate: results sit in reports that visitors never open.',
    'Multiple audiences with different needs: donors, partners, volunteers and communities each look for something different.',
    'Limited capacity: small teams cannot maintain a complex website or produce constant new content.',
    'Donation and volunteer journeys are unclear or rely on manual follow-up.'
  ],
  ARRAY[
    'Programme and impact pages that present goals, activities, locations and results in an accessible, visual format.',
    'Audience-based navigation guiding donors, partners, volunteers and beneficiaries to what is relevant to them.',
    'Donation, volunteer and partnership forms connected to your email, spreadsheets or payment tools, including M-Pesa where suitable.',
    'Brand and reporting materials, including annual report layouts, brochures and campaign graphics, built from one visual identity.'
  ],
  ARRAY[
    'A clearer, more credible story for donors and partners',
    'Simple journeys for supporters to give, volunteer or get in touch',
    'A website your team can maintain without specialist help'
  ],
  '[
    {"title":"Programme showcase","description":"Pages for each programme with objectives, locations, activities, beneficiaries reached and results."},
    {"title":"Donation and giving pages","description":"Clear ways to give, with M-Pesa and card options and a confirmation process that thanks and informs donors."},
    {"title":"Volunteer and partner sign-up","description":"Forms that collect interest and route it to the right coordinator."},
    {"title":"Annual report and brochure design","description":"Designed reports and printable materials that match your website and brand."}
  ]'::jsonb,
  '[
    {"question":"Can you integrate M-Pesa donations?","answer":"Yes. We can connect M-Pesa and card payment options to your giving pages, subject to the payment provider setup."},
    {"question":"Can our small team manage the site?","answer":"Yes. We design with maintainability in mind and train your team to publish news, stories and documents themselves."},
    {"question":"Can you help present our impact data?","answer":"Yes. We turn reports and figures into clear sections and visuals that donors and partners can understand quickly."}
  ]'::jsonb,
  'NGO and Nonprofit Website Development in Kenya | Monawanka Consulting',
  'Mission-led websites, donation journeys and brand materials for NGOs and nonprofits in Kenya and East Africa.',
  ARRAY['web-development', 'graphic-design', 'digital-consultancy'], 6, true
),

-- 8. Startups
(
  'Startups & SMEs', 'startups-smes',
  'Practical digital foundations for growing teams and new ventures.',
  'Digital Foundations for Startups and Growing Businesses',
  'Early-stage and growing businesses have limited time and budget, and every shilling spent on digital needs to earn its place. The risk is either under-building, which hurts credibility, or over-building, which wastes runway.',
  'We help startups and SMEs decide what to build now, what to postpone and what to avoid altogether. We begin with a short consultation to understand your customers, offer and stage, then agree a practical roadmap: usually a clear website, a consistent brand and a few well-chosen automations that remove repetitive work. Everything we build is designed to grow with you, so the first version is solid and the next steps are already mapped.',
  ARRAY[
    'Unclear priorities: with many options available, teams spend on tools that do not move the business forward.',
    'Weak first impression: an informal or inconsistent brand makes it harder to win trust from customers and partners.',
    'Manual processes: lead tracking, invoicing and follow-up happen across chats and spreadsheets.',
    'Limited technical capacity: there is no in-house team to build, maintain or choose technology.'
  ],
  ARRAY[
    'A digital roadmap that sequences website, branding, systems and automation by impact and budget.',
    'A customer-focused website with clear messaging, strong calls to action and basic SEO foundations.',
    'A brand identity covering logo, colours, typography and templates for social media, proposals and documents.',
    'Automation of repetitive tasks such as lead capture, follow-up, reporting and notifications.'
  ],
  ARRAY[
    'A clear plan that avoids wasted spend on unnecessary tools',
    'A professional presence that helps win first customers and partners',
    'Less manual admin as the business scales'
  ],
  '[
    {"title":"Digital roadmap","description":"A prioritised plan covering what to build, in what order and at what cost, based on your goals."},
    {"title":"Launch website","description":"A focused website that explains your offer and captures leads from day one."},
    {"title":"Brand starter kit","description":"Logo, colour palette, typography and core templates to look consistent from the start."},
    {"title":"Lead and workflow automation","description":"Automated lead capture, follow-up and internal notifications to save time."}
  ]'::jsonb,
  '[
    {"question":"We are early stage. What should we build first?","answer":"Usually a clear website and a consistent brand, plus one or two automations for your most repetitive tasks. A short consultation helps us confirm the right starting point."},
    {"question":"Can the solution grow as we grow?","answer":"Yes. We plan for extension from the beginning so you can add features such as e-commerce, booking or integrations later."},
    {"question":"Do you work with limited budgets?","answer":"Yes. Our packages have clear pricing, and we help you phase work so that each step delivers value."}
  ]'::jsonb,
  'Digital Solutions for Startups and SMEs in Kenya | Monawanka Consulting',
  'Practical websites, branding and automation for startups and growing businesses in Kenya, with clear pricing and phased roadmaps.',
  ARRAY['digital-consultancy', 'web-development', 'process-automation'], 7, true
),

-- 9. Law firms
(
  'Law Firms & Advocates', 'law-firms-advocates',
  'Professional digital experiences built around clarity and confidence.',
  'Website Design and Branding for Law Firms and Advocates',
  'Prospective clients often research several firms before making contact. They are looking for evidence of expertise, a clear explanation of how the firm can help and a simple way to take the first step.',
  'We design law firm websites that convey authority without jargon. Practice areas are explained in plain language, with the people behind them presented clearly, so visitors understand how you can help and who they will work with. We keep the tone measured and professional, structure content for easy reading on mobile and make contact options obvious. We also develop the identity materials that clients see in practice, such as letterheads, business cards and presentation templates, so that every interaction reflects the firm''s standards. Our work follows applicable professional rules on advertising by advocates, and we recommend you confirm requirements with your regulatory body.',
  ARRAY[
    'Practice areas are described in technical terms that prospective clients do not search for or understand.',
    'Credibility is hard to show: clients want to see experience, team background and professionalism before making contact.',
    'Mobile experience is neglected: many clients first visit from a phone and leave if the site is hard to read.',
    'Brand materials are inconsistent across the website, documents and correspondence.'
  ],
  ARRAY[
    'Practice area pages written in plain language, covering common situations, process and what to expect.',
    'Team and firm profile pages that present qualifications, experience and approach in a professional tone.',
    'Discreet, easy-to-use contact and consultation request forms with clear office details and map.',
    'A refined identity system covering logo, stationery, email signatures and document templates.'
  ],
  ARRAY[
    'Greater confidence from prospective clients before they make contact',
    'More relevant consultation requests',
    'A consistent, professional identity across all client touchpoints'
  ],
  '[
    {"title":"Practice area pages","description":"Clear explanations of each area of law with typical scenarios, process overview and when to seek advice."},
    {"title":"Team profiles","description":"Professional profiles for advocates and staff covering background, specialisation and contact details."},
    {"title":"Consultation request form","description":"A simple, confidential enquiry form that captures the nature of the matter and preferred contact method."},
    {"title":"Insights and articles","description":"A section for explanatory articles that demonstrate expertise and help clients searching for answers."}
  ]'::jsonb,
  '[
    {"question":"Can you write the practice area content?","answer":"We can structure and edit your content for clarity, and offer copywriting as an add-on. Your team should review all legal content for accuracy."},
    {"question":"Is the contact form confidential?","answer":"We use secure forms and advise on minimising the details collected online. We recommend clients share sensitive information only after engagement."},
    {"question":"Can you design our stationery and templates?","answer":"Yes. We design letterheads, business cards, email signatures and document templates aligned to your brand."}
  ]'::jsonb,
  'Law Firm Website Design in Nairobi, Kenya | Monawanka Consulting',
  'Professional websites and brand identity for law firms and advocates in Kenya, with clear practice area pages and consultation request flows.',
  ARRAY['web-development', 'graphic-design', 'digital-consultancy'], 8, true
),

-- 10. Political campaigns
(
  'Political Campaigns & Leaders', 'political-campaigns-leaders',
  'Clear, accessible communication for campaigns and public leadership.',
  'Websites and Communication Materials for Campaigns and Public Leaders',
  'Campaigns and public leaders need to share priorities, activities and public information in a form that is easy to find, easy to share and consistent across channels.',
  'We provide digital and design services for campaigns and leaders, focused on clear presentation and organised information. This includes websites and landing pages that explain priorities, biography, activities and ways to get in touch, along with reusable graphics and templates for consistent communication. We also help plan content structures so that updates, events and public notices are easy to publish and find. We build communication tools only; we do not create misleading content, and we expect all material to comply with applicable electoral and advertising laws.',
  ARRAY[
    'Information is scattered across social media posts, making it hard for supporters and the public to find priorities and updates.',
    'Inconsistent visual identity weakens recognition across posters, social media and printed materials.',
    'Time pressure: campaigns need to publish quickly and cannot wait on slow production cycles.',
    'Mobile reach: most audiences access information on phones with limited data, so pages must be light and quick.'
  ],
  ARRAY[
    'A campaign or leader website with sections for biography, priorities, events, news and contact.',
    'Reusable graphic templates for social media, posters and printed material that keep the look consistent.',
    'A content structure for publishing updates, event listings and public notices quickly.',
    'Forms and automation for events sign-ups, volunteer interest and public enquiries routed to the right team.'
  ],
  ARRAY[
    'One reliable home for priorities, events and public information',
    'A recognisable, consistent look across channels',
    'Faster publishing of updates with reusable templates'
  ],
  '[
    {"title":"Campaign website","description":"A clear site covering biography, priorities, events, news and ways to get involved."},
    {"title":"Event and sign-up pages","description":"Landing pages and forms for rallies, forums and volunteer sign-ups."},
    {"title":"Graphic template kit","description":"Social media, poster and flyer templates that can be reused quickly with new messages."},
    {"title":"Public information hub","description":"A central place for updates, statements and downloadable documents."}
  ]'::jsonb,
  '[
    {"question":"Do you write campaign messaging?","answer":"We structure and present your content. Messaging and its accuracy remain the responsibility of the campaign."},
    {"question":"Can you work within tight timelines?","answer":"We scope realistic timelines at the start and prioritise the essential pages and templates first, so you can launch quickly and expand."},
    {"question":"Do you follow electoral rules?","answer":"We expect all material to comply with applicable laws and regulations, and recommend campaigns confirm requirements with the relevant authorities."}
  ]'::jsonb,
  'Campaign and Leader Website Design in Kenya | Monawanka Consulting',
  'Websites, graphic templates and communication tools for campaigns and public leaders in Kenya.',
  ARRAY['web-development', 'graphic-design', 'process-automation'], 9, true
),

-- 11. Corporate branding
(
  'Corporate Branding', 'corporate-branding',
  'Consistent brand systems for organisations across every touchpoint.',
  'Corporate Branding and Brand Identity Design in Kenya',
  'A brand is the sum of what people see and experience: your logo, colours, documents, website, signage and how you communicate. When these elements differ from one another, the organisation looks less established than it is.',
  'We design brand identity systems that are practical to use, not just attractive to look at. After understanding your organisation, audience and positioning, we develop or refine your logo, colour palette, typography and visual style, then apply them across the materials your team uses every day. We document the rules in brand guidelines and supply ready-to-use templates, so staff and partners can produce consistent materials without a designer each time. Where you already have a brand, we audit what exists and align it, rather than starting over unnecessarily.',
  ARRAY[
    'Inconsistent use of logo, colours and fonts across departments and suppliers.',
    'Outdated or improvised identity that no longer reflects the organisation''s size or ambition.',
    'No guidelines: staff and partners guess how to use the brand, producing variable results.',
    'Disconnection between print, website and social media, so the brand feels different in each place.'
  ],
  ARRAY[
    'Brand discovery and positioning workshop to define personality, audience and visual direction.',
    'Logo and identity system design with primary and secondary marks, colour palette, typography and graphic elements.',
    'Brand guidelines and templates for stationery, presentations, proposals, social media and email.',
    'Alignment of the website and digital channels with the new identity for a consistent experience.'
  ],
  ARRAY[
    'A recognisable identity that reflects the organisation''s standard',
    'Faster, easier production of consistent materials by internal teams',
    'Greater trust from customers, partners and investors'
  ],
  '[
    {"title":"Logo and identity design","description":"A complete mark set with colour, typography and supporting graphic elements, delivered in all needed file formats."},
    {"title":"Brand guidelines","description":"A clear document that explains how to use the identity correctly across print and digital."},
    {"title":"Stationery and templates","description":"Letterheads, business cards, presentation decks, proposals and email signatures ready for daily use."},
    {"title":"Brand audit and alignment","description":"A review of existing materials with recommendations to bring everything into line."}
  ]'::jsonb,
  '[
    {"question":"Can you refresh our existing brand instead of replacing it?","answer":"Yes. We can audit what you have, keep the elements that work and modernise or align the rest."},
    {"question":"What files will we receive?","answer":"You receive your logo in the formats you need for print and digital, plus brand guidelines and editable templates where agreed."},
    {"question":"Can you apply the new brand to our website?","answer":"Yes. We can update or rebuild your website to match the identity so everything works together."}
  ]'::jsonb,
  'Corporate Branding and Brand Identity Design in Kenya | Monawanka Consulting',
  'Logo design, brand guidelines and consistent templates for organisations in Kenya, aligned across print and digital channels.',
  ARRAY['graphic-design', 'web-development', 'digital-consultancy'], 10, true
)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  hero_headline = EXCLUDED.hero_headline,
  description = EXCLUDED.description,
  overview = EXCLUDED.overview,
  challenges = EXCLUDED.challenges,
  solutions = EXCLUDED.solutions,
  outcomes = EXCLUDED.outcomes,
  use_cases = EXCLUDED.use_cases,
  faqs = EXCLUDED.faqs,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  service_slugs = EXCLUDED.service_slugs,
  sort_order = EXCLUDED.sort_order,
  published = EXCLUDED.published,
  updated_at = now();