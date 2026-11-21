import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import {
  DEFAULT_CONTRACT_SETTINGS,
  saveContractSettings,
  useContractSettings,
  type ContractSettings,
  type Owner,
} from "@/lib/contracts";
import { Field, Section, errMsg, inp } from "@/components/contracts/ui";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const iconBtn = "rounded-md p-1.5 text-[#524646] hover:bg-[#007979]/10 disabled:opacity-30";

function StringList({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  addLabel: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={inp}
            value={it}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
          />
          <button type="button" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))} className={`${iconBtn} text-red-600`}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#007979] hover:text-[#EC5B38]">
        <Plus size={15} /> {addLabel}
      </button>
    </div>
  );
}

/** Admin editor for everything shown on the public agreement form and printed in agreements. */
export default function ContractContentEditor() {
  const qc = useQueryClient();
  const q = useContractSettings();
  const [draft, setDraft] = useState<ContractSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!draft && q.data && !q.isPlaceholderData) setDraft(clone(q.data));
  }, [q.data, q.isPlaceholderData, draft]);

  if (!draft) {
    return (
      <p className="flex items-center gap-2 py-10 text-sm">
        <Loader2 size={16} className="animate-spin" /> Loading content…
      </p>
    );
  }

  const up = (patch: Partial<ContractSettings>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const setOwner = (k: keyof Owner, v: string) => up({ owner: { ...draft.owner, [k]: v } });

  const moveTerm = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= draft.terms.length) return;
    const t = [...draft.terms];
    [t[i], t[j]] = [t[j], t[i]];
    up({ terms: t });
  };

  const save = async () => {
    setMsg(null);
    const services = draft.services.map((s) => ({ name: s.name.trim(), scope: s.scope.trim() })).filter((s) => s.name);
    const terms = draft.terms.map((t) => ({ title: t.title.trim(), body: t.body.trim() })).filter((t) => t.title && t.body);
    const methods = draft.payment_methods.map((m) => m.trim()).filter(Boolean);
    if (!services.length) return setMsg({ ok: false, text: "Add at least one service." });
    if (!terms.length) return setMsg({ ok: false, text: "Add at least one term." });
    if (!methods.length) return setMsg({ ok: false, text: "Add at least one payment method." });

    const saved = q.data!;
    const termsChanged = JSON.stringify(terms) !== JSON.stringify(saved.terms);
    const version =
      termsChanged && draft.terms_version === saved.terms_version
        ? new Date().toISOString().slice(0, 10)
        : draft.terms_version.trim() || saved.terms_version;

    const next: ContractSettings = {
      owner: draft.owner,
      services,
      terms,
      payment_methods: methods,
      addons: draft.addons.map((a) => a.trim()).filter(Boolean),
      terms_version: version,
    };
    setBusy(true);
    try {
      await saveContractSettings(next);
      qc.setQueryData(["contract-settings"], next);
      setDraft(clone(next));
      setMsg({ ok: true, text: "Saved. The client form and new documents now use this content." });
    } catch (e) {
      setMsg({ ok: false, text: errMsg(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Section id="c1" title="Business details" intro="Shown in the agreement header, parties table, footer and WhatsApp messages.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Business name"><input className={inp} value={draft.owner.company} onChange={(e) => setOwner("company", e.target.value)} /></Field>
          <Field label="Representative"><input className={inp} value={draft.owner.rep} onChange={(e) => setOwner("rep", e.target.value)} /></Field>
          <Field label="Email"><input className={inp} value={draft.owner.email} onChange={(e) => setOwner("email", e.target.value)} /></Field>
          <Field label="Phone (as displayed)"><input className={inp} value={draft.owner.phone} onChange={(e) => setOwner("phone", e.target.value)} /></Field>
          <Field label="WhatsApp number" hint="Digits only with country code, e.g. 254727492545."><input className={inp} value={draft.owner.whatsapp} onChange={(e) => setOwner("whatsapp", e.target.value)} /></Field>
          <Field label="Website"><input className={inp} value={draft.owner.site} onChange={(e) => setOwner("site", e.target.value)} /></Field>
          <Field label="Location"><input className={inp} value={draft.owner.location} onChange={(e) => setOwner("location", e.target.value)} /></Field>
        </div>
      </Section>

      <Section id="c2" title="Services" intro="The scope text becomes part of each agreement.">
        {draft.services.map((s, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-[#E8E2D6] p-3.5">
            <div className="flex gap-2">
              <input
                className={inp}
                placeholder="Service name"
                value={s.name}
                onChange={(e) => up({ services: draft.services.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })}
              />
              <button type="button" aria-label="Remove service" onClick={() => up({ services: draft.services.filter((_, j) => j !== i) })} className={`${iconBtn} text-red-600`}>
                <Trash2 size={16} />
              </button>
            </div>
            <textarea
              rows={2}
              className={inp}
              placeholder="What is included"
              value={s.scope}
              onChange={(e) => up({ services: draft.services.map((x, j) => (j === i ? { ...x, scope: e.target.value } : x)) })}
            />
          </div>
        ))}
        <button type="button" onClick={() => up({ services: [...draft.services, { name: "", scope: "" }] })} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#007979] hover:text-[#EC5B38]">
          <Plus size={15} /> Add service
        </button>
      </Section>

      <Section id="c3" title="Add-ons and payment methods">
        <div>
          <p className="mb-2 text-sm font-medium text-[#1A1A16]">Optional add-ons</p>
          <StringList items={draft.addons} onChange={(addons) => up({ addons })} addLabel="Add add-on" />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-[#1A1A16]">Payment methods</p>
          <StringList items={draft.payment_methods} onChange={(payment_methods) => up({ payment_methods })} addLabel="Add payment method" />
        </div>
      </Section>

      <Section id="c4" title="Terms and conditions" intro="Signed agreements keep the exact terms they were signed with. Changes here only affect new agreements.">
        <Field label="Terms version" hint="Updated automatically to today's date when you change the terms.">
          <input className={inp} value={draft.terms_version} onChange={(e) => up({ terms_version: e.target.value })} />
        </Field>
        {draft.terms.map((t, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-[#E8E2D6] p-3.5">
            <div className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-sm font-bold text-[#EC5B38]">{i + 1}.</span>
              <input
                className={inp}
                placeholder="Clause title"
                value={t.title}
                onChange={(e) => up({ terms: draft.terms.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })}
              />
              <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => moveTerm(i, -1)} className={iconBtn}><ArrowUp size={16} /></button>
              <button type="button" aria-label="Move down" disabled={i === draft.terms.length - 1} onClick={() => moveTerm(i, 1)} className={iconBtn}><ArrowDown size={16} /></button>
              <button type="button" aria-label="Remove clause" onClick={() => up({ terms: draft.terms.filter((_, j) => j !== i) })} className={`${iconBtn} text-red-600`}><Trash2 size={16} /></button>
            </div>
            <textarea
              rows={4}
              className={inp}
              placeholder="Clause text"
              value={t.body}
              onChange={(e) => up({ terms: draft.terms.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)) })}
            />
          </div>
        ))}
        <button type="button" onClick={() => up({ terms: [...draft.terms, { title: "", body: "" }] })} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#007979] hover:text-[#EC5B38]">
          <Plus size={15} /> Add clause
        </button>
      </Section>

      {msg && (
        <p role="alert" className={`rounded-lg px-4 py-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </p>
      )}
      <div className="sticky bottom-3 flex flex-wrap gap-2 rounded-xl border border-[#E8E2D6] bg-white/95 p-3 shadow-sm backdrop-blur">
        <button type="button" onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-[#007979] px-5 py-2.5 text-sm font-bold text-[#FFE2AF] hover:bg-[#24B1B1] disabled:opacity-60">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save content
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Load the built-in defaults into this form? Nothing changes until you press Save.")) setDraft(clone(DEFAULT_CONTRACT_SETTINGS));
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-[#E8E2D6] px-4 py-2.5 text-sm font-medium text-[#524646] hover:bg-[#FBF9F5]"
        >
          <RotateCcw size={15} /> Reset to defaults
        </button>
      </div>
    </div>
  );
}