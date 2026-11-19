import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const OWNER = {
  company: "Emoni Digital Solutions",
  rep: "Samuel A. Emoni",
  email: "emonisamuel54@gmail.com",
  phone: "+254 727 492 545",
  whatsapp: "254727492545",
  site: "www.emonisamuel.co.ke",
  location: "Nairobi, Kenya",
};

export const TERMS_VERSION = "2026-11";

export const CONTRACT_SERVICES = [
  { name: "Digital consultancy", scope: "Strategic advice and a written roadmap for digital growth, tools and technology decisions." },
  { name: "Web development", scope: "Custom websites, web apps, e-commerce stores and SaaS platforms built, tested and launched." },
  { name: "Web design", scope: "Responsive, user-centred page layouts and UI/UX design, delivered as designs and a working build." },
  { name: "Payment integrations", scope: "M-Pesa (Daraja STK Push, C2B, B2C), card and bank gateways. The Client supplies valid Paybill/Till and API credentials." },
  { name: "API and system integration", scope: "Connecting the Client’s systems and third-party services through secure, documented APIs." },
  { name: "System design and architecture", scope: "Technical architecture, database design and scalability planning for new or existing systems." },
  { name: "Process automation", scope: "Automating repetitive business workflows, reports, notifications and approvals." },
  { name: "IT support and consulting", scope: "Technical support, troubleshooting, maintenance and IT advice, as scoped in this agreement." },
  { name: "Graphic design and branding", scope: "Logos, brand identity systems, brochures, creatives and print-ready materials." },
  { name: "Brand strategy", scope: "Positioning, messaging and brand guidelines for a consistent market presence." },
  { name: "Digital marketing", scope: "Planned online campaigns across search, social and email, with reporting on agreed measures." },
  { name: "Marketing plan", scope: "A written marketing plan covering audience, channels, budget, timeline and KPIs." },
  { name: "Social media", scope: "Account set-up and management, content calendars, posting and community engagement." },
  { name: "Content creation", scope: "Copywriting, graphics, photo and video content for web, social and campaigns." },
  { name: "SEO", scope: "Technical and on-page optimisation and keyword strategy. No specific ranking is guaranteed." },
  { name: "Media buying", scope: "Planning and purchasing paid media. Ad spend is paid by the Client and is separate from the fee." },
  { name: "Traditional marketing", scope: "Print, outdoor, radio and other offline marketing design and coordination." },
];

export const CONTRACT_ADDONS = [
  "Domain and hosting set-up",
  "Monthly maintenance and support",
  "Training and handover session",
  "Content and SEO set-up",
  "Priority delivery",
];

export const PAYMENT_METHODS = ["M-Pesa", "Bank transfer", "Card"];

export const CONTRACT_TERMS = [
  { title: "Definitions", body: `“Provider” means ${OWNER.company}, represented by ${OWNER.rep}. “Client” means the person or organisation named in this agreement. “Services” means the services selected by the Client, as described in the Scope. “Deliverables” means the work product resulting from the Services.` },
  { title: "Scope of services", body: "The Provider will deliver only the Services and Deliverables selected in this agreement. Anything outside that scope is a change request under Clause 4. Where the Client’s brief is silent, the Provider will apply reasonable professional standards." },
  { title: "Client responsibilities", body: "The Client will supply content, brand assets, credentials and feedback promptly, and will nominate one contact person who can approve work. Delays in providing these items extend the delivery timeline day for day and do not entitle the Client to a refund." },
  { title: "Change requests", body: "Requests outside the agreed scope will be quoted in writing and begin only after the Client approves the quote. Two (2) consolidated rounds of revisions are included per deliverable; further revisions are billed at the Provider’s prevailing hourly rate." },
  { title: "Fees and payment", body: "The Client will pay the agreed project fee in KES. The deposit stated in this agreement is due on signing and the project starts once it is received. The balance is due before final delivery, launch or source-code release. Payments may be made by M-Pesa, bank transfer or card against the Provider’s invoice. Overdue amounts attract interest of 1.5% per month, and the Provider may suspend work until payment is cleared. Third-party costs (domains, hosting, SMS, gateway fees, licences, stock assets, ad spend) are paid by the Client and are not included in the fee unless stated." },
  { title: "Deposit and refunds", body: "The deposit secures the Provider’s time and is non-refundable once work has started. If the Provider fails to deliver the agreed scope due to its own default, the Client is entitled to a refund of fees for work not delivered." },
  { title: "Timeline and delivery", body: "Delivery dates are estimates that depend on timely Client input. The Provider will notify the Client of any expected delay. Deliverables are treated as accepted if the Client raises no written objection within seven (7) days of delivery." },
  { title: "Intellectual property", body: "On receipt of full payment, ownership of the custom Deliverables transfers to the Client. Until then the Provider retains all rights and the Client has a limited licence to review the work. The Provider retains ownership of pre-existing tools, code libraries and know-how, and grants the Client a perpetual licence to use them as part of the Deliverables. Third-party and open-source components remain subject to their own licences." },
  { title: "Portfolio rights", body: "Unless the Client objects in writing, the Provider may display non-confidential elements of the finished work and the Client’s name in its portfolio and marketing." },
  { title: "Confidentiality", body: "Each party will keep the other’s non-public business, technical and financial information confidential, use it only for this engagement, and protect it with reasonable care. This obligation survives for three (3) years after termination." },
  { title: "Data protection", body: "Each party will comply with the Data Protection Act, 2019 of Kenya. Where the Provider processes personal data for the Client, it does so only on the Client’s instructions and with appropriate security safeguards. The Client is responsible for lawful collection of the data it supplies." },
  { title: "Warranties and limitation of liability", body: "The Provider warrants that the Services will be performed with reasonable skill and care and, for thirty (30) days after delivery, will fix reproducible defects free of charge. The Provider does not guarantee uninterrupted operation, search rankings, sales results or third-party service availability (including Safaricom, payment gateways and hosting providers). To the extent permitted by law, the Provider’s total liability is limited to the fees paid under this agreement and excludes indirect or consequential loss, including lost profit." },
  { title: "Client content", body: "The Client warrants that it owns or is licensed to use all content, logos and materials it supplies and will indemnify the Provider against third-party claims arising from them." },
  { title: "Termination", body: "Either party may terminate on fourteen (14) days’ written notice. Either party may terminate immediately for material breach that is not remedied within seven (7) days of notice. On termination the Client pays for all work completed and expenses incurred up to the termination date, and the Provider hands over completed work after payment." },
  { title: "Force majeure", body: "Neither party is liable for delay or failure caused by events beyond its reasonable control, including power or internet outages, natural disasters, government action or third-party platform failures." },
  { title: "Independent contractor", body: "The Provider is an independent contractor. Nothing in this agreement creates employment, partnership or agency, and the Provider may work for other clients provided confidentiality is observed." },
  { title: "Governing law and disputes", body: "This agreement is governed by the laws of the Republic of Kenya. The parties will first try to resolve any dispute through good-faith negotiation, then mediation, and failing that, through the courts of Nairobi, Kenya." },
  { title: "Electronic signature and entire agreement", body: "The parties agree that electronic signatures are valid and binding under Kenyan law. This agreement is the entire understanding between the parties and replaces earlier discussions. It may be amended only in writing signed by both parties. If any clause is unenforceable, the rest remains in force." },
];

export type ContractStatus = "signed" | "countersigned" | "cancelled";

export interface ServiceContract {
  id?: string;
  reference: string;
  access_token: string;
  status: ContractStatus;
  is_read?: boolean;
  whatsapp_notified?: boolean;
  admin_notes?: string | null;
  client_name: string;
  company_name: string | null;
  client_email: string;
  client_phone: string;
  kra_pin: string | null;
  location: string;
  project_name: string;
  overview: string;
  goals: string | null;
  audience: string | null;
  features: string | null;
  tech: string | null;
  refs: string | null;
  services: { name: string; scope: string }[];
  addons: string[];
  budget_kes: number;
  fee_kes: number;
  deposit_percent: number;
  payment_method: string;
  start_date: string;
  delivery_weeks: number;
  signature_data: string;
  signature_kind: "draw" | "type" | "upload";
  signed_name: string;
  terms_version: string;
  terms_snapshot: { title: string; body: string }[];
  signed_at: string;
  countersigned_at: string | null;
  created_at: string;
}

export const kes = (n: number | string) => "KES " + Number(n || 0).toLocaleString("en-KE");
export const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export type Row = [string, string];

/** Plain-text rows shared by the on-screen agreement and the Word export. */
export function contractRows(c: ServiceContract) {
  const fee = Number(c.fee_kes);
  const deposit = Math.round(fee * c.deposit_percent) / 100;
  const parties: Row[] = [
    ["Provider", `${OWNER.company}, represented by ${OWNER.rep}, ${OWNER.location}`],
    ["Client", c.client_name + (c.company_name ? `, ${c.company_name}` : "")],
    ["Contact", `${c.client_email} · ${c.client_phone}`],
    ["Location", c.location],
  ];
  if (c.kra_pin) parties.push(["KRA PIN / ID", c.kra_pin]);

  const project: Row[] = [["Project", c.project_name], ["Overview", c.overview]];
  const optional: Row[] = [
    ["Goals", c.goals ?? ""], ["Target audience", c.audience ?? ""],
    ["Features and deliverables", c.features ?? ""], ["Technical requirements", c.tech ?? ""],
    ["References", c.refs ?? ""],
  ];
  project.push(...optional.filter((r) => r[1]));
  project.push(["Services", c.services.map((s) => `${s.name}: ${s.scope}`).join("\n\n")]);
  if (c.addons?.length) project.push(["Add-ons", c.addons.join(", ")]);

  const fees: Row[] = [
    ["Client budget", kes(c.budget_kes)],
    ["Agreed project fee", kes(fee)],
    [`Deposit (${c.deposit_percent}%) on signing`, kes(deposit)],
    ["Balance before delivery", kes(fee - deposit)],
    ["Payment method", c.payment_method],
    ["Start date", fmtDate(c.start_date + "T00:00")],
    ["Estimated delivery", `${c.delivery_weeks} weeks from start, subject to Client input`],
  ];
  return { parties, project, fees };
}

/** Kenyan number -> international digits for wa.me links. */
export function waDigits(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("254")) return d;
  if (d.startsWith("0")) return "254" + d.slice(1);
  if (d.length === 9) return "254" + d;
  return d;
}

export const waLink = (digits: string, text: string) =>
  `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;

/** Message sent to Samuel's WhatsApp when a client signs. */
export function ownerMessage(c: ServiceContract, origin: string) {
  return [
    `New signed contract ${c.reference}`,
    `Client: ${c.client_name}${c.company_name ? ` (${c.company_name})` : ""}`,
    `Phone: ${c.client_phone}`,
    `Project: ${c.project_name}`,
    `Services: ${c.services.map((s) => s.name).join(", ")}`,
    `Budget: ${kes(c.budget_kes)} | Fee: ${kes(c.fee_kes)} (deposit ${c.deposit_percent}%)`,
    `View: ${origin}/contract/${c.access_token}`,
    `Admin: ${origin}/admin/contracts`,
  ].join("\n");
}

/** Unread contract count for the admin sidebar badge. */
export function useUnreadContracts() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const { count: n } = await supabase
        .from("service_contracts").select("id", { count: "exact", head: true }).eq("is_read", false);
      if (active) setCount(n ?? 0);
    };
    void load();
    const channel = supabase
      .channel(`contracts-unread-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "service_contracts" }, () => void load())
      .subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, []);
  return count;
}
