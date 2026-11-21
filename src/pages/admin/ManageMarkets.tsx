import { useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown, ArrowLeft, ArrowUp, Copy, Download, ExternalLink, Eye, EyeOff, Loader2, Pencil, Plus, Save, Search, Trash2, X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MARKETS } from "@/lib/seoMarkets";
import { fromRow, toRow, type MarketRow } from "@/lib/markets";
import { useServiceMenu } from "@/lib/serviceMenu";
import { MarketFlags } from "@/components/Flag";

type Pair = { heading: string; text: string };
type Faq = { q: string; a: string };

const errMsg = (e: unknown) => (e as { message?: string })?.message || "Something went wrong. Try again.";
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const blank = (): MarketRow => ({
  slug: "",
  country: "",
  flags: [],
  title: "",
  description: "",
  h1: "",
  intro: "",
  primaryKeyword: "",
  secondaryKeywords: [],
  currency: "USD",
  challengesHeading: "",
  challenges: [{ heading: "", text: "" }],
  whyWorkWithMe: [{ heading: "", text: "" }],
  deliverables: [{ heading: "", text: "" }],
  workingModel: { heading: "How we would work together", text: "" },
  costOfWaiting: "",
  faqs: [{ q: "", a: "" }],
  popularServices: [],
  whatsappMessage: "",
  published: true,
  sortOrder: 0,
});

const inp =
  "w-full rounded-lg border border-[#E8E2D6] bg-white px-3.5 py-2.5 text-sm text-[#1A1A16] focus:border-[#007979] focus:outline-none focus:ring-2 focus:ring-[#007979]/30";
const btn =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors disabled:opacity-60";
const primary = `${btn} bg-[#007979] text-white hover:bg-[#24B1B1]`;
const outline = `${btn} border border-[#E8E2D6] text-[#524646] hover:bg-[#FBF9F5]`;

/* ───────────── small form helpers ───────────── */

function Field({
  label, hint, count, max, children,
}: { label: string; hint?: string; count?: number; max?: number; children: ReactNode }) {
  const over = max !== undefined && count !== undefined && count > max;
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-[#1A1A16]">{label}</span>
        {max !== undefined && count !== undefined && (
          <span className={`text-[11px] ${over ? "font-bold text-red-600" : "text-[#524646]/60"}`}>
            {count}/{max}
          </span>
        )}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[#524646]/60">{hint}</span>}
    </label>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-[#E8E2D6] bg-white p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold text-[#1A1A16]">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-[#524646]/70">{subtitle}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Repeater for { heading, text } rows (challenges, reasons, deliverables). */
function PairList({
  items, onChange, addLabel, headingLabel = "Heading", textLabel = "Text",
}: { items: Pair[]; onChange: (v: Pair[]) => void; addLabel: string; headingLabel?: string; textLabel?: string }) {
  const set = (i: number, patch: Partial<Pair>) => onChange(items.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-[#E8E2D6] bg-[#FBF9F5] p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-[#524646]/60">#{i + 1}</span>
            <div className="flex gap-1">
              <button type="button" aria-label="Move up" onClick={() => onChange(move(items, i, -1))} className="rounded p-1 hover:bg-white"><ArrowUp size={14} /></button>
              <button type="button" aria-label="Move down" onClick={() => onChange(move(items, i, 1))} className="rounded p-1 hover:bg-white"><ArrowDown size={14} /></button>
              <button type="button" aria-label="Remove" onClick={() => onChange(items.filter((_, k) => k !== i))} className="rounded p-1 text-red-600 hover:bg-white"><X size={14} /></button>
            </div>
          </div>
          <div className="space-y-2.5">
            <input className={inp} placeholder={headingLabel} value={it.heading} onChange={(e) => set(i, { heading: e.target.value })} />
            <textarea className={inp} rows={3} placeholder={textLabel} value={it.text} onChange={(e) => set(i, { text: e.target.value })} />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { heading: "", text: "" }])} className={outline}>
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}

function FaqList({ items, onChange }: { items: Faq[]; onChange: (v: Faq[]) => void }) {
  const set = (i: number, patch: Partial<Faq>) => onChange(items.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-[#E8E2D6] bg-[#FBF9F5] p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-[#524646]/60">#{i + 1}</span>
            <div className="flex gap-1">
              <button type="button" aria-label="Move up" onClick={() => onChange(move(items, i, -1))} className="rounded p-1 hover:bg-white"><ArrowUp size={14} /></button>
              <button type="button" aria-label="Move down" onClick={() => onChange(move(items, i, 1))} className="rounded p-1 hover:bg-white"><ArrowDown size={14} /></button>
              <button type="button" aria-label="Remove" onClick={() => onChange(items.filter((_, k) => k !== i))} className="rounded p-1 text-red-600 hover:bg-white"><X size={14} /></button>
            </div>
          </div>
          <div className="space-y-2.5">
            <input className={inp} placeholder="Question" value={it.q} onChange={(e) => set(i, { q: e.target.value })} />
            <textarea className={inp} rows={3} placeholder="Answer" value={it.a} onChange={(e) => set(i, { a: e.target.value })} />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { q: "", a: "" }])} className={outline}>
        <Plus size={14} /> Add question
      </button>
    </div>
  );
}

/* ───────────── editor ───────────── */

function MarketEditor({
  initial, onCancel, onSaved,
}: { initial: MarketRow; onCancel: () => void; onSaved: () => void }) {
  const [m, setM] = useState<MarketRow>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!initial.id || !!initial.slug);
  const serviceMenu = useServiceMenu();

  const patch = (v: Partial<MarketRow>) => setM((prev) => ({ ...prev, ...v }));

  // Service chips: ids come from the service links (/what-i-do#id)
  const serviceOptions = useMemo(() => {
    const fromMenu = serviceMenu.map((s) => ({ id: s.href.split("#")[1] ?? "", label: s.label })).filter((s) => s.id);
    const known = new Set(fromMenu.map((s) => s.id));
    const extras = m.popularServices.filter((id) => id && !known.has(id)).map((id) => ({ id, label: id }));
    return [...fromMenu, ...extras];
  }, [serviceMenu, m.popularServices]);

  const toggleService = (id: string) =>
    patch({ popularServices: m.popularServices.includes(id) ? m.popularServices.filter((x) => x !== id) : [...m.popularServices, id] });

  const validate = () => {
    if (!m.country.trim()) return "Country or region name is required.";
    if (!m.slug.trim()) return "URL slug is required.";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(m.slug.trim())) return "Slug can only use lowercase letters, numbers and hyphens.";
    if (!m.title.trim()) return "SEO title is required.";
    if (!m.h1.trim()) return "Page heading (H1) is required.";
    return null;
  };

  const save = async () => {
    const problem = validate();
    if (problem) return setError(problem);
    setBusy(true);
    setError(null);
    const payload = toRow(m);
    const { error: e } = m.id
      ? await supabase.from("markets").update(payload).eq("id", m.id)
      : await supabase.from("markets").insert(payload);
    setBusy(false);
    if (e) return setError(e.code === "23505" ? "That slug is already used by another market." : e.message);
    onSaved();
  };

  const flagCodes = m.flags.map((f) => f.trim().toLowerCase()).filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E2D6] bg-[#FBF9F5]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#007979]">
          <ArrowLeft size={15} /> Back to markets
        </button>
        <div className="flex items-center gap-2">
          <label className="mr-2 inline-flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={m.published} onChange={(e) => patch({ published: e.target.checked })} className="h-4 w-4 accent-[#007979]" />
            Published
          </label>
          <button type="button" onClick={save} disabled={busy} className={primary}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save market
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="space-y-6">
        <Card title="Basics" subtitle="Who this page is for and where it lives.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Country or region">
              <input
                className={inp}
                value={m.country}
                placeholder="United Kingdom"
                onChange={(e) => patch({ country: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
              />
            </Field>
            <Field label="URL slug" hint={`Page address: /markets/${m.slug || "your-slug"}`}>
              <input
                className={inp}
                value={m.slug}
                placeholder="united-kingdom"
                onChange={(e) => { setSlugTouched(true); patch({ slug: slugify(e.target.value) }); }}
              />
            </Field>
            <Field label="Flag codes" hint="Two-letter country codes separated by commas, e.g. gb or ke,ug,tz,rw">
              <input className={inp} value={m.flags.join(",")} placeholder="gb" onChange={(e) => patch({ flags: e.target.value.split(",") })} />
              {flagCodes.length > 0 && (
                <span className="mt-2 block"><MarketFlags codes={flagCodes} size={32} /></span>
              )}
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Currency">
                <input className={inp} value={m.currency} placeholder="USD" onChange={(e) => patch({ currency: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="Order" hint="Lower shows first">
                <input className={inp} type="number" value={m.sortOrder} onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })} />
              </Field>
            </div>
          </div>
        </Card>

        <Card title="Search & sharing" subtitle="What appears on Google and when the page is shared.">
          <Field label="SEO title" count={m.title.length} max={60}>
            <input className={inp} value={m.title} onChange={(e) => patch({ title: e.target.value })} />
          </Field>
          <Field label="Meta description" count={m.description.length} max={155}>
            <textarea className={inp} rows={3} value={m.description} onChange={(e) => patch({ description: e.target.value })} />
          </Field>
          <Field label="Main keyword">
            <input className={inp} value={m.primaryKeyword} onChange={(e) => patch({ primaryKeyword: e.target.value })} />
          </Field>
          <Field label="Other keywords" hint="One per line">
            <textarea className={inp} rows={3} value={m.secondaryKeywords.join("\n")} onChange={(e) => patch({ secondaryKeywords: e.target.value.split("\n") })} />
          </Field>
        </Card>

        <Card title="Hero" subtitle="The first thing visitors read.">
          <Field label="Page heading (H1)">
            <input className={inp} value={m.h1} onChange={(e) => patch({ h1: e.target.value })} />
          </Field>
          <Field label="Introduction">
            <textarea className={inp} rows={4} value={m.intro} onChange={(e) => patch({ intro: e.target.value })} />
          </Field>
          <Field label="WhatsApp pre-filled message" hint="Sent when a visitor taps Book a free call.">
            <input className={inp} value={m.whatsappMessage} onChange={(e) => patch({ whatsappMessage: e.target.value })} />
          </Field>
        </Card>

        <Card title="The problem" subtitle="Why this market needs to hire someone. Use problems they really face.">
          <Field label="Section heading">
            <input className={inp} value={m.challengesHeading} onChange={(e) => patch({ challengesHeading: e.target.value })} />
          </Field>
          <PairList items={m.challenges} onChange={(challenges) => patch({ challenges })} addLabel="Add problem" headingLabel="Problem" />
        </Card>

        <Card title="What waiting costs" subtitle="The cost of doing nothing or doing it badly.">
          <Field label="Paragraph">
            <textarea className={inp} rows={4} value={m.costOfWaiting} onChange={(e) => patch({ costOfWaiting: e.target.value })} />
          </Field>
        </Card>

        <Card title="Why work with you" subtitle="Three works best.">
          <PairList items={m.whyWorkWithMe} onChange={(whyWorkWithMe) => patch({ whyWorkWithMe })} addLabel="Add reason" />
        </Card>

        <Card title="What they get" subtitle="Concrete deliverables.">
          <PairList items={m.deliverables} onChange={(deliverables) => patch({ deliverables })} addLabel="Add deliverable" />
        </Card>

        <Card title="How you would work together" subtitle="Time zone, communication and payment for this market.">
          <Field label="Heading">
            <input className={inp} value={m.workingModel.heading} onChange={(e) => patch({ workingModel: { ...m.workingModel, heading: e.target.value } })} />
          </Field>
          <Field label="Text">
            <textarea className={inp} rows={4} value={m.workingModel.text} onChange={(e) => patch({ workingModel: { ...m.workingModel, text: e.target.value } })} />
          </Field>
        </Card>

        <Card title="Common questions" subtitle="Also published as FAQ rich results for Google.">
          <FaqList items={m.faqs} onChange={(faqs) => patch({ faqs })} />
        </Card>

        <Card title="Popular services" subtitle="Shown first in the services list on this page.">
          <div className="flex flex-wrap gap-2">
            {serviceOptions.length === 0 && <p className="text-sm text-[#524646]/60">No services found.</p>}
            {serviceOptions.map((s) => {
              const on = m.popularServices.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  aria-pressed={on}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${on ? "bg-[#007979] text-white" : "bg-white text-[#524646] ring-1 ring-[#E8E2D6] hover:ring-[#007979]/50"}`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6 flex justify-end gap-2 pb-8">
        <button type="button" onClick={onCancel} className={outline}>Cancel</button>
        <button type="button" onClick={save} disabled={busy} className={primary}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save market
        </button>
      </div>
    </div>
  );
}

/* ───────────── list page ───────────── */

export default function ManageMarkets() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<MarketRow | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const list = useQuery<MarketRow[]>({
    queryKey: ["admin-markets"],
    queryFn: async () => {
      const { data, error: e } = await supabase
        .from("markets")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (e) throw e;
      return (data ?? []).map(fromRow);
    },
  });

  const refresh = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["admin-markets"] }),
      qc.invalidateQueries({ queryKey: ["markets"] }),
    ]);
  };

  const items = list.data ?? [];
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter((m) => [m.country, m.slug, m.title].some((v) => v.toLowerCase().includes(q))) : items;
  }, [items, search]);

  const togglePublished = async (m: MarketRow) => {
    if (!m.id) return;
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.from("markets").update({ published: !m.published }).eq("id", m.id);
    setBusy(false);
    if (e) return setError(e.message);
    await refresh();
  };

  const remove = async (m: MarketRow) => {
    if (!m.id || !window.confirm(`Delete the ${m.country} page? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.from("markets").delete().eq("id", m.id);
    setBusy(false);
    if (e) return setError(e.message);
    await refresh();
  };

  const duplicate = (m: MarketRow) =>
    setEditing({ ...m, id: undefined, slug: `${m.slug}-copy`, country: `${m.country} (copy)`, published: false });

  const importDefaults = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const rows = MARKETS.map((m, i) => toRow({ ...m, published: true, sortOrder: i }));
    const { error: e } = await supabase.from("markets").upsert(rows, { onConflict: "slug", ignoreDuplicates: true });
    setBusy(false);
    if (e) return setError(e.message);
    setNotice("Default markets imported. Existing markets with the same slug were left untouched.");
    await refresh();
  };

  if (editing) {
    return (
      <MarketEditor
        initial={editing}
        onCancel={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null);
          setNotice("Market saved.");
          await refresh();
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A1A16]">Markets</h1>
          <p className="text-sm text-[#524646]/70">Country landing pages shown at /markets/your-slug. Changes go live immediately.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.length === 0 && !list.isPending && (
            <button type="button" onClick={importDefaults} disabled={busy} className={outline}>
              <Download size={14} /> Import default markets
            </button>
          )}
          <button type="button" onClick={() => { setNotice(null); setEditing(blank()); }} className={primary}>
            <Plus size={14} /> New market
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="mb-4 rounded-lg bg-[#007979]/10 px-4 py-3 text-sm text-[#007979]">{notice}</p>}

      <div className="relative mb-4 max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#524646]/40" />
        <input className={`${inp} pl-9`} placeholder="Search by country, slug or title" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {list.isPending && (
        <p className="flex items-center gap-2 py-10 text-sm"><Loader2 size={16} className="animate-spin" /> Loading…</p>
      )}
      {list.isError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {errMsg(list.error)} If the markets table does not exist yet, run markets.sql in the Supabase SQL editor.
        </p>
      )}

      {!list.isPending && !list.isError && visible.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#E8E2D6] bg-white px-4 py-12 text-center text-sm text-[#524646]/70">
          {items.length === 0
            ? "No markets yet. Create one, or import the default markets to start from the existing pages."
            : "No markets match your search."}
        </div>
      )}

      <ul className="space-y-3">
        {visible.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-[#E8E2D6] bg-white p-4">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <span className="shrink-0"><MarketFlags codes={m.flags} size={32} /></span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1A1A16]">{m.country}</p>
                <p className="truncate text-xs text-[#524646]/70">/markets/{m.slug} · {m.currency}</p>
              </div>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${m.published ? "bg-[#007979]/10 text-[#007979]" : "bg-amber-100 text-amber-700"}`}>
              {m.published ? "Published" : "Draft"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => { setNotice(null); setEditing(m); }} className={primary}><Pencil size={13} /> Edit</button>
              <button type="button" disabled={busy} onClick={() => togglePublished(m)} className={outline}>
                {m.published ? <><EyeOff size={13} /> Unpublish</> : <><Eye size={13} /> Publish</>}
              </button>
              <a href={`/markets/${m.slug}`} target="_blank" rel="noopener noreferrer" className={outline}><ExternalLink size={13} /> View</a>
              <button type="button" onClick={() => duplicate(m)} className={outline}><Copy size={13} /> Duplicate</button>
              <button type="button" disabled={busy} onClick={() => remove(m)} className={`${btn} text-red-600 hover:bg-red-50`}><Trash2 size={13} /> Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}