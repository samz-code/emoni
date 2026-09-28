import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Building,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Globe,
  Handshake,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_TERMS,
  PARTNER_FIELDS,
  PARTNER_TYPES,
  errMsg,
  emptyToNull,
  hostname,
  isEmail,
  normalizeUrl,
  type PartnerProfile,
  type PartnerTerm,
} from "@/lib/partnersProgram";

/* ═══════════════════════════════════════════════════════════
   FORM STATE
═══════════════════════════════════════════════════════════ */
type FormState = {
  organization_name: string;
  contact_name: string;
  job_title: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  department: string;
  field: string;
  field_other: string;
  partnership_type: string;
  offering: string;
  message: string;
  agreed_terms: boolean;
  hp: string; // honeypot — real people never fill this
};

const EMPTY_FORM: FormState = {
  organization_name: "",
  contact_name: "",
  job_title: "",
  email: "",
  phone: "",
  website: "",
  country: "",
  department: "",
  field: "",
  field_other: "",
  partnership_type: "",
  offering: "",
  message: "",
  agreed_terms: false,
  hp: "",
};

const inputCls =
  "w-full px-4 py-2.5 border border-[#E8E2D6] dark:border-zinc-700 rounded-lg font-body text-sm bg-white dark:bg-zinc-900 text-[#1A1A16] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#007979]/30 focus:border-[#007979]";

/* ═══════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════ */
export default function Partners() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const partnersQ = useQuery({
    queryKey: ["partner-profiles-public"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_profiles")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PartnerProfile[];
    },
  });

  const termsQ = useQuery({
    queryKey: ["partner-terms-public"],
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_terms")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PartnerTerm[];
    },
  });

  const partners = partnersQ.data ?? [];
  const terms = termsQ.data && termsQ.data.length > 0 ? termsQ.data : DEFAULT_TERMS;

  const categories = useMemo(() => {
    const set = new Set<string>();
    partners.forEach((p) => p.category && set.add(p.category));
    return ["All", ...Array.from(set)];
  }, [partners]);

  const visible = activeCategory === "All" ? partners : partners.filter((p) => p.category === activeCategory);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main className="min-h-screen bg-[#FBF9F5] dark:bg-zinc-950 text-[#524646] dark:text-zinc-100 transition-colors duration-300">
      {/* ── Header ── */}
      <section className="bg-[hsl(var(--forest))] text-white py-16 md:py-24 border-b border-[hsl(var(--cream))/0.2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl leading-tight">
            The organisations we build with
          </h1>
          <p className="font-body text-sm sm:text-base text-white/80 max-w-2xl mt-4 leading-relaxed">
            These are our partners: what each one does, how to reach them, and where to find them online. If your
            organisation would like to join, read the terms below and send us an application.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => scrollTo("apply")}
              className="inline-flex items-center gap-2 bg-[#FFE2AF] text-[#007979] px-6 py-3 rounded-full font-bold text-sm hover:bg-white transition-colors"
            >
              Apply to partner <ArrowUpRight size={16} />
            </button>
            <button
              onClick={() => scrollTo("terms")}
              className="inline-flex items-center gap-2 border border-white/40 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-white/10 transition-colors"
            >
              Read the terms
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        {/* ── Directory ── */}
        <section aria-labelledby="directory-heading">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 id="directory-heading" className="font-display text-2xl md:text-3xl font-bold text-[#1A1A16] dark:text-white">
                Our partners
              </h2>
              {partners.length > 0 && (
                <p className="font-body text-sm text-[#524646]/70 dark:text-zinc-400 mt-1">
                  {partners.length} active {partners.length === 1 ? "partner" : "partners"}
                </p>
              )}
            </div>

            {categories.length > 2 && (
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter partners by category">
                {categories.map((c) => (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={activeCategory === c}
                    onClick={() => setActiveCategory(c)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      activeCategory === c
                        ? "bg-[#007979] text-[#FFE2AF] border-[#007979]"
                        : "bg-white dark:bg-zinc-900 text-[#524646] dark:text-zinc-300 border-[#E8E2D6] dark:border-zinc-700 hover:border-[#007979]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {partnersQ.isPending ? (
            <div className="space-y-6" aria-hidden>
              {[0, 1].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-[#E8E2D6]/50 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : partnersQ.isError ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm text-red-800">
              <p className="font-bold">Partners could not be loaded</p>
              <p className="mt-1">{errMsg(partnersQ.error, "Unknown error")}</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-dashed border-[#E8E2D6] dark:border-zinc-700 rounded-2xl p-10 text-center">
              <p className="font-display text-lg text-[#1A1A16] dark:text-white">No partners listed yet</p>
              <p className="font-body text-sm text-[#524646]/70 dark:text-zinc-400 mt-1">
                Be the first. Send us an application below.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {visible.map((p) => (
                <PartnerCard key={p.id ?? p.name} partner={p} />
              ))}
            </div>
          )}
        </section>

        {/* ── Terms ── */}
        <section id="terms" aria-labelledby="terms-heading" className="scroll-mt-24">
          <h2 id="terms-heading" className="font-display text-2xl md:text-3xl font-bold text-[#1A1A16] dark:text-white">
            How to partner with us
          </h2>
          <p className="font-body text-sm text-[#524646]/70 dark:text-zinc-400 mt-1 max-w-2xl">
            Every partnership starts from these terms. By applying you confirm you have read them.
          </p>

          <ol className="mt-8 grid gap-4 md:grid-cols-2">
            {terms.map((t, i) => (
              <li
                key={t.id ?? t.title}
                className="bg-white dark:bg-zinc-900 border border-[#E8E2D6] dark:border-zinc-800 rounded-xl p-5 flex gap-4"
              >
                <span
                  aria-hidden
                  className="shrink-0 w-8 h-8 rounded-full bg-[#007979] text-[#FFE2AF] font-display text-sm font-bold flex items-center justify-center"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-[#1A1A16] dark:text-white">{t.title}</h3>
                  <p className="font-body text-sm leading-relaxed mt-1 text-[#524646] dark:text-zinc-400">{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Application ── */}
        <section id="apply" aria-labelledby="apply-heading" className="scroll-mt-24">
          <ApplicationForm terms={terms} />
        </section>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   PARTNER CARD
═══════════════════════════════════════════════════════════ */
function PartnerCard({ partner: p }: { partner: PartnerProfile }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(p.logo_url) && !logoFailed;
  const hasContact = p.contact_person || p.contact_email || p.contact_phone || p.location;

  return (
    <motion.article
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-zinc-900 border border-[#E8E2D6] dark:border-zinc-800 rounded-2xl overflow-hidden grid md:grid-cols-[300px_1fr]"
    >
      {/* Logo panel */}
      <div className="bg-[#FBF9F5] dark:bg-zinc-800/60 border-b md:border-b-0 md:border-r border-[#E8E2D6] dark:border-zinc-800 flex flex-col items-center justify-center gap-4 p-8 min-h-[220px]">
        {p.website_url ? (
          <a
            href={p.website_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${p.name}`}
            className="w-full h-40 flex items-center justify-center"
          >
            <LogoOrFallback name={p.name} url={showLogo ? p.logo_url : null} onError={() => setLogoFailed(true)} />
          </a>
        ) : (
          <div className="w-full h-40 flex items-center justify-center">
            <LogoOrFallback name={p.name} url={showLogo ? p.logo_url : null} onError={() => setLogoFailed(true)} />
          </div>
        )}
        {p.category && (
          <span className="text-xs font-bold bg-[#007979]/10 text-[#007979] px-3 py-1 rounded-full text-center">
            {p.category}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-6 md:p-8 flex flex-col gap-5 min-w-0">
        <header>
          <h3 className="font-display text-2xl font-bold text-[#1A1A16] dark:text-white">{p.name}</h3>
          {p.tagline && <p className="font-body text-sm text-[#007979] dark:text-[#FFE2AF] mt-1">{p.tagline}</p>}
          {p.partner_since && (
            <p className="font-body text-xs text-[#524646]/60 dark:text-zinc-500 mt-1">Partner since {p.partner_since}</p>
          )}
        </header>

        {p.background && (
          <div>
            <h4 className="font-body text-sm font-bold text-[#1A1A16] dark:text-white mb-1">Background</h4>
            <p className="font-body text-sm leading-relaxed text-[#524646] dark:text-zinc-400 max-w-prose whitespace-pre-line">
              {p.background}
            </p>
          </div>
        )}

        {p.offerings.length > 0 && (
          <div>
            <h4 className="font-body text-sm font-bold text-[#1A1A16] dark:text-white mb-2">What they offer</h4>
            <ul className="flex flex-wrap gap-2">
              {p.offerings.map((o) => (
                <li
                  key={o}
                  className="text-xs font-body px-3 py-1.5 rounded-lg bg-[#FBF9F5] dark:bg-zinc-800 border border-[#E8E2D6] dark:border-zinc-700"
                >
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(hasContact || p.website_url || p.linkedin_url) && (
          <div className="border-t border-[#E8E2D6] dark:border-zinc-800 pt-5 grid gap-4 sm:grid-cols-2">
            {hasContact && (
              <div>
                <h4 className="font-body text-sm font-bold text-[#1A1A16] dark:text-white mb-2">Contact</h4>
                <ul className="space-y-1.5 font-body text-sm">
                  {p.contact_person && (
                    <li className="flex items-center gap-2">
                      <User size={14} className="text-[#007979] shrink-0" /> {p.contact_person}
                    </li>
                  )}
                  {p.contact_email && (
                    <li className="flex items-center gap-2 min-w-0">
                      <Mail size={14} className="text-[#007979] shrink-0" />
                      <a href={`mailto:${p.contact_email}`} className="hover:underline truncate">
                        {p.contact_email}
                      </a>
                    </li>
                  )}
                  {p.contact_phone && (
                    <li className="flex items-center gap-2">
                      <Phone size={14} className="text-[#007979] shrink-0" />
                      <a href={`tel:${p.contact_phone.replace(/\s+/g, "")}`} className="hover:underline">
                        {p.contact_phone}
                      </a>
                    </li>
                  )}
                  {p.location && (
                    <li className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#007979] shrink-0" /> {p.location}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {(p.website_url || p.linkedin_url) && (
              <div>
                <h4 className="font-body text-sm font-bold text-[#1A1A16] dark:text-white mb-2">Online</h4>
                <ul className="space-y-1.5 font-body text-sm">
                  {p.website_url && (
                    <li className="flex items-center gap-2 min-w-0">
                      <Globe size={14} className="text-[#007979] shrink-0" />
                      <a
                        href={p.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline truncate"
                        title={p.website_url}
                      >
                        {hostname(p.website_url)}
                      </a>
                    </li>
                  )}
                  {p.linkedin_url && (
                    <li className="flex items-center gap-2 min-w-0">
                      <Linkedin size={14} className="text-[#007979] shrink-0" />
                      <a
                        href={p.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline truncate"
                        title={p.linkedin_url}
                      >
                        LinkedIn
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {p.website_url && (
          <a
            href={p.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start inline-flex items-center gap-2 bg-[#007979] text-[#FFE2AF] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#24B1B1] transition-colors"
          >
            Visit website <ExternalLink size={14} />
          </a>
        )}
      </div>
    </motion.article>
  );
}

function LogoOrFallback({ name, url, onError }: { name: string; url: string | null; onError: () => void }) {
  if (url) {
    return (
      <img
        src={url}
        alt={`${name} logo`}
        loading="lazy"
        decoding="async"
        onError={onError}
        className="max-h-full max-w-full object-contain"
      />
    );
  }
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Building size={44} className="text-[#007979]/60" />
      <span className="font-display text-lg font-bold text-[#1A1A16] dark:text-white leading-tight">{name}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   APPLICATION FORM
═══════════════════════════════════════════════════════════ */
function ApplicationForm({ terms }: { terms: PartnerTerm[] }) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = useMutation<void, unknown, FormState>({
    mutationFn: async (f) => {
      if (f.hp) return; // bot: pretend success

      const required: [string, string][] = [
        [f.organization_name, "Organisation name"],
        [f.contact_name, "Contact person"],
        [f.email, "Email"],
        [f.department, "Department"],
        [f.partnership_type, "Partnership type"],
        [f.offering, "What you can offer"],
      ];
      for (const [value, label] of required) {
        if (!value.trim()) throw new Error(`${label} is required`);
      }
      const field = f.field === "Other" ? f.field_other.trim() : f.field;
      if (!field) throw new Error(f.field === "Other" ? "Describe your field of work" : "Field of work is required");
      if (!isEmail(f.email)) throw new Error("Enter a valid email address");
      if (!f.agreed_terms) throw new Error("You need to accept the partnership terms");

      const { error } = await supabase.from("partner_applications").insert({
        organization_name: f.organization_name.trim(),
        contact_name: f.contact_name.trim(),
        job_title: emptyToNull(f.job_title),
        email: f.email.trim().toLowerCase(),
        phone: emptyToNull(f.phone),
        website: normalizeUrl(f.website),
        country: emptyToNull(f.country),
        department: f.department.trim(),
        field,
        partnership_type: f.partnership_type,
        offering: f.offering.trim(),
        message: emptyToNull(f.message),
        agreed_terms: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setFormError(null);
      setSubmitted(true);
      setForm(EMPTY_FORM);
    },
    onError: (e) => setFormError(errMsg(e, "Could not send your application")),
  });

  if (submitted) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-emerald-200 rounded-2xl p-10 text-center" role="status">
        <CheckCircle2 className="mx-auto text-emerald-500" size={40} />
        <h2 className="font-display text-2xl font-bold text-[#1A1A16] dark:text-white mt-4">Application received</h2>
        <p className="font-body text-sm text-[#524646] dark:text-zinc-400 mt-2 max-w-md mx-auto">
          Thank you. We review applications within 7 working days and will reply to the email you provided.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-bold text-[#007979] hover:underline"
        >
          Send another application
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-[#E8E2D6] dark:border-zinc-800 rounded-2xl p-6 md:p-10">
      <div className="flex items-start gap-3 mb-8">
        <Handshake className="text-[#007979] mt-1 shrink-0" size={28} />
        <div>
          <h2 id="apply-heading" className="font-display text-2xl md:text-3xl font-bold text-[#1A1A16] dark:text-white">
            Apply to partner with us
          </h2>
          <p className="font-body text-sm text-[#524646]/70 dark:text-zinc-400 mt-1 max-w-xl">
            Tell us who you are and what we could do together. Fields marked * are required.
          </p>
        </div>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setFormError(null);
          submit.mutate(form);
        }}
        className="space-y-8"
      >
        {/* honeypot */}
        <div className="hidden" aria-hidden>
          <label>
            Leave this empty
            <input tabIndex={-1} autoComplete="off" value={form.hp} onChange={(e) => set("hp", e.target.value)} />
          </label>
        </div>

        <fieldset className="space-y-4">
          <legend className="font-display text-lg font-bold text-[#1A1A16] dark:text-white mb-2">Your organisation</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Organisation name *" value={form.organization_name} onChange={(v) => set("organization_name", v)} autoComplete="organization" />
            <FormField label="Website" value={form.website} onChange={(v) => set("website", v)} placeholder="example.com" autoComplete="url" />
            <FormField label="Department *" value={form.department} onChange={(v) => set("department", v)} placeholder="e.g. Partnerships, IT, Operations" />
            <FormField label="Country" value={form.country} onChange={(v) => set("country", v)} autoComplete="country-name" />
            <div>
              <Label>Field of work *</Label>
              <select value={form.field} onChange={(e) => set("field", e.target.value)} className={inputCls}>
                <option value="">Select a field</option>
                {PARTNER_FIELDS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            {form.field === "Other" && (
              <FormField label="Describe your field *" value={form.field_other} onChange={(v) => set("field_other", v)} />
            )}
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-display text-lg font-bold text-[#1A1A16] dark:text-white mb-2">Contact person</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full name *" value={form.contact_name} onChange={(v) => set("contact_name", v)} autoComplete="name" />
            <FormField label="Job title" value={form.job_title} onChange={(v) => set("job_title", v)} autoComplete="organization-title" />
            <FormField label="Email *" type="email" value={form.email} onChange={(v) => set("email", v)} autoComplete="email" />
            <FormField label="Phone" type="tel" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+254 …" autoComplete="tel" />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-display text-lg font-bold text-[#1A1A16] dark:text-white mb-2">The partnership</legend>
          <div>
            <Label>Partnership type *</Label>
            <select value={form.partnership_type} onChange={(e) => set("partnership_type", e.target.value)} className={inputCls}>
              <option value="">Select a type</option>
              {PARTNER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <FormField
            label="What your organisation can offer *"
            value={form.offering}
            onChange={(v) => set("offering", v)}
            multiline
            placeholder="Services, products, audience, funding, technical capacity…"
          />
          <FormField
            label="Anything else we should know"
            value={form.message}
            onChange={(v) => set("message", v)}
            multiline
            placeholder="Goals, timeline, existing work with us…"
          />
        </fieldset>

        <label className="flex items-start gap-3 font-body text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.agreed_terms}
            onChange={(e) => set("agreed_terms", e.target.checked)}
            className="mt-1 rounded border-[#E8E2D6] accent-[#007979]"
          />
          <span>
            I have read the {terms.length} partnership terms above and my organisation agrees to them.
          </span>
        </label>

        {formError && (
          <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submit.isPending}
          className="inline-flex items-center gap-2 bg-[#007979] text-[#FFE2AF] px-7 py-3 rounded-full text-sm font-bold hover:bg-[#24B1B1] transition-colors disabled:opacity-60"
        >
          {submit.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {submit.isPending ? "Sending…" : "Send application"}
        </button>
      </form>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block font-body text-xs font-bold text-[#524646]/80 dark:text-zinc-400 mb-1.5">{children}</label>;
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className={multiline ? "sm:col-span-2" : ""}>
      <Label>{label}</Label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={inputCls + " resize-y"}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={inputCls}
        />
      )}
    </div>
  );
}