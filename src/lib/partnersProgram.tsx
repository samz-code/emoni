/* Shared types, constants and helpers for the Partners program
   (public Partners page + admin ManagePartners). */

export type PartnerProfile = {
  id?: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  category: string | null;
  tagline: string | null;
  background: string | null;
  offerings: string[];
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  partner_since: string | null;
  published: boolean;
  sort_order: number;
};

export type PartnerTerm = {
  id?: string;
  title: string;
  body: string;
  published: boolean;
  sort_order: number;
};

export type ApplicationStatus = "new" | "reviewing" | "approved" | "declined";

export type PartnerApplication = {
  id: string;
  organization_name: string;
  contact_name: string;
  job_title: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  country: string | null;
  department: string;
  field: string;
  partnership_type: string;
  offering: string;
  message: string | null;
  agreed_terms: boolean;
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: string;
};

export const APPLICATION_STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
];

export const PARTNER_TYPES = [
  "Technology / integration partner",
  "Referral partner",
  "Delivery / implementation partner",
  "Reseller",
  "Institutional / NGO collaboration",
  "Other",
];

export const PARTNER_FIELDS = [
  "Software & IT",
  "Finance & Microfinance",
  "Government & Public Sector",
  "Education & Training",
  "Health",
  "Retail & E-commerce",
  "Logistics & Travel",
  "Telecoms",
  "Marketing & Design",
  "NGO / Development",
  "Other",
];

export const DEFAULT_TERMS: PartnerTerm[] = [
  {
    title: "Shared goals",
    body: "Partners work with us toward a defined outcome: a joint product, a referral channel, an integration or a service delivered together. We agree on the goal in writing before any work starts.",
    published: true,
    sort_order: 0,
  },
  {
    title: "Verified organisation",
    body: "Applicants must be a registered business, institution or professional practice. We may ask for registration details and references during review.",
    published: true,
    sort_order: 1,
  },
  {
    title: "Clear roles",
    body: "Each side's responsibilities, deliverables and timelines are set out in a short partnership agreement.",
    published: true,
    sort_order: 2,
  },
  {
    title: "Fair commercial terms",
    body: "Revenue share, referral fees or cost sharing are agreed up front. No hidden fees, and no exclusivity unless both parties sign for it.",
    published: true,
    sort_order: 3,
  },
  {
    title: "Confidentiality & data",
    body: "Client information and any shared data stay confidential and are used only for the agreed work.",
    published: true,
    sort_order: 4,
  },
  {
    title: "Review & exit",
    body: "Applications are reviewed within 7 working days. Either side may end a partnership with 30 days' written notice.",
    published: true,
    sort_order: 5,
  },
];

/* ── helpers ─────────────────────────────────────────────── */
export const errMsg = (e: unknown, fallback: string) => {
  if (e && typeof e === "object" && "message" in e && typeof (e as any).message === "string") {
    const m = (e as any).message as string;
    const details = typeof (e as any).details === "string" && (e as any).details ? ` (${(e as any).details})` : "";
    return m + details;
  }
  return fallback;
};

export const emptyToNull = (v: string | null | undefined) => {
  const t = (v ?? "").trim();
  return t ? t : null;
};

export function normalizeUrl(value: string | null | undefined): string | null {
  const v = (value ?? "").trim();
  if (!v) return null;
  const withProtocol = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    new URL(withProtocol);
  } catch {
    throw new Error(`"${v}" is not a valid web address (e.g. https://example.com)`);
  }
  return withProtocol;
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const hostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export const linesToArray = (text: string) =>
  text
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

export const nextOrder = (rows: { sort_order: number }[]) =>
  rows.length ? Math.max(...rows.map((r) => Number(r.sort_order) || 0)) + 1 : 0;

export const emptyPartner = (sort_order: number): PartnerProfile => ({
  name: "",
  logo_url: null,
  website_url: null,
  linkedin_url: null,
  category: null,
  tagline: null,
  background: null,
  offerings: [],
  contact_person: null,
  contact_email: null,
  contact_phone: null,
  location: null,
  partner_since: null,
  published: true,
  sort_order,
});