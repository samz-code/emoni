import { useMemo, useState } from "react";
import { Check, FilePlus2, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { DEPOSIT_OPTIONS, MIN_DEPOSIT_PERCENT, kes, useContractSettings } from "@/lib/contracts";
import { Field, Section, errMsg, inp, num } from "@/components/contracts/ui";

const empty = {
  client_name: "",
  company_name: "",
  client_email: "",
  client_phone: "",
  location: "",
  project_name: "",
  overview: "",
  goals: "",
  audience: "",
  features: "",
  tech: "",
  refs: "",
  budget: "",
  fee: "",
  payment_method: "",
  deposit_percent: 50,
  start_date: "",
  delivery_weeks: "4",
};

/** Admin form: prepare an agreement for a client, then share it as Word, PDF or WhatsApp. */
export default function AdminNewContract({ onCreated }: { onCreated: (id: string) => void }) {
  const qc = useQueryClient();
  const { data: cfg } = useContractSettings();
  const settings = cfg!;
  const [f, setF] = useState(empty);
  const [services, setServices] = useState<string[]>([]);
  const [addons, setAddons] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (list: string[], setList: (v: string[]) => void, v: string) =>
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const methods = settings.payment_methods;
  const paymentMethod = methods.includes(f.payment_method) ? f.payment_method : methods[0];
  const fee = num(f.fee);
  const deposit = Math.round(fee * f.deposit_percent) / 100;
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const validate = () => {
    if (f.client_name.trim().length < 2) return "Enter the client's full name.";
    if (f.client_phone.trim().length < 7) return "Enter the client's phone or WhatsApp number.";
    if (services.length < 1) return "Select at least one service.";
    if (f.project_name.trim().length < 2) return "Enter a project name.";
    if (fee <= 0) return "Enter the agreed project fee.";
    if (f.deposit_percent < MIN_DEPOSIT_PERCENT) return `Deposit must be at least ${MIN_DEPOSIT_PERCENT}%.`;
    if (!f.start_date) return "Choose a start date.";
    const w = Number(f.delivery_weeks);
    if (!Number.isInteger(w) || w < 1 || w > 104) return "Delivery must be between 1 and 104 weeks.";
    return null;
  };

  const submit = async () => {
    const problem = validate();
    if (problem) return setError(problem);
    setBusy(true);
    setError(null);
    try {
      const payload = {
        client_name: f.client_name.trim(),
        company_name: f.company_name.trim(),
        client_email: f.client_email.trim(),
        client_phone: f.client_phone.trim(),
        location: f.location.trim(),
        project_name: f.project_name.trim(),
        overview: f.overview.trim(),
        goals: f.goals.trim(),
        audience: f.audience.trim(),
        features: f.features.trim(),
        tech: f.tech.trim(),
        refs: f.refs.trim(),
        services: settings.services.filter((s) => services.includes(s.name)),
        addons,
        budget_kes: num(f.budget) || fee,
        fee_kes: fee,
        deposit_percent: f.deposit_percent,
        payment_method: paymentMethod,
        start_date: f.start_date,
        delivery_weeks: Number(f.delivery_weeks),
        terms_version: settings.terms_version,
        terms_snapshot: settings.terms,
      };
      const { data, error: rpcError } = await supabase.rpc("admin_create_service_contract", { p_data: payload });
      if (rpcError) throw rpcError;
      const row = (Array.isArray(data) ? data[0] : data) as { id: string } | undefined;
      if (!row?.id) throw new Error("The agreement was not saved. Try again.");
      await qc.invalidateQueries({ queryKey: ["admin-contracts"] });
      setF(empty);
      setServices([]);
      setAddons([]);
      onCreated(row.id);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Section id="n1" title="Client information" intro="Fill in what the client gave you. Only name and phone are required.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" required>
            <input className={inp} value={f.client_name} onChange={(e) => set("client_name", e.target.value)} />
          </Field>
          <Field label="Company or organisation">
            <input className={inp} value={f.company_name} onChange={(e) => set("company_name", e.target.value)} />
          </Field>
          <Field label="Email">
            <input type="email" className={inp} value={f.client_email} onChange={(e) => set("client_email", e.target.value)} />
          </Field>
          <Field label="Phone / WhatsApp" required>
            <input type="tel" className={inp} value={f.client_phone} onChange={(e) => set("client_phone", e.target.value)} placeholder="0712 345 678" />
          </Field>
          <Field label="Country and town">
            <input className={inp} value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Kenya, Nairobi" />
          </Field>
        </div>
      </Section>

      <Section id="n2" title="Project and services">
        <div className="grid gap-3 sm:grid-cols-2">
          {settings.services.map((s) => {
            const on = services.includes(s.name);
            return (
              <button
                type="button"
                key={s.name}
                onClick={() => toggle(services, setServices, s.name)}
                aria-pressed={on}
                className={`rounded-xl border p-3.5 text-left transition-colors ${
                  on ? "border-[#007979] bg-[#007979]/5" : "border-[#E8E2D6] hover:border-[#007979]/50"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-[#1A1A16]">
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? "border-[#007979] bg-[#007979] text-white" : "border-[#524646]/30"}`}>
                    {on && <Check size={12} />}
                  </span>
                  {s.name}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#524646]/80">{s.scope}</span>
              </button>
            );
          })}
        </div>
        <Field label="Project name" required>
          <input className={inp} value={f.project_name} onChange={(e) => set("project_name", e.target.value)} />
        </Field>
        <Field label="Project overview">
          <textarea rows={4} className={inp} value={f.overview} onChange={(e) => set("overview", e.target.value)} />
        </Field>
        <Field label="Goals and objectives">
          <textarea rows={3} className={inp} value={f.goals} onChange={(e) => set("goals", e.target.value)} />
        </Field>
        <Field label="Target audience and users">
          <textarea rows={3} className={inp} value={f.audience} onChange={(e) => set("audience", e.target.value)} />
        </Field>
        <Field label="Key features and deliverables">
          <textarea rows={3} className={inp} value={f.features} onChange={(e) => set("features", e.target.value)} />
        </Field>
        <Field label="Technical requirements and integrations">
          <textarea rows={3} className={inp} value={f.tech} onChange={(e) => set("tech", e.target.value)} />
        </Field>
        <Field label="Reference sites, links and brand assets">
          <textarea rows={3} className={inp} value={f.refs} onChange={(e) => set("refs", e.target.value)} />
        </Field>
        {settings.addons.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-[#1A1A16]">Optional add-ons</legend>
            <div className="flex flex-wrap gap-2">
              {settings.addons.map((a) => {
                const on = addons.includes(a);
                return (
                  <button
                    type="button"
                    key={a}
                    onClick={() => toggle(addons, setAddons, a)}
                    aria-pressed={on}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      on ? "border-[#007979] bg-[#007979] text-white" : "border-[#E8E2D6] text-[#524646] hover:border-[#007979]/50"
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}
      </Section>

      <Section id="n3" title="Fees and timeline">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Client budget (KES)" hint="Leave blank to use the project fee.">
            <input inputMode="numeric" className={inp} value={f.budget} onChange={(e) => set("budget", e.target.value)} />
          </Field>
          <Field label="Agreed project fee (KES)" required>
            <input inputMode="numeric" className={inp} value={f.fee} onChange={(e) => set("fee", e.target.value)} placeholder="120,000" />
          </Field>
          <Field label="Payment method">
            <select className={inp} value={paymentMethod} onChange={(e) => set("payment_method", e.target.value)}>
              {methods.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Deposit due on signing">
            <select className={inp} value={f.deposit_percent} onChange={(e) => set("deposit_percent", Number(e.target.value))}>
              {DEPOSIT_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}%
                </option>
              ))}
            </select>
          </Field>
          <Field label="Start date" required>
            <input type="date" min={today} className={inp} value={f.start_date} onChange={(e) => set("start_date", e.target.value)} />
          </Field>
          <Field label="Estimated delivery (weeks)">
            <input type="number" min={1} max={104} className={inp} value={f.delivery_weeks} onChange={(e) => set("delivery_weeks", e.target.value)} />
          </Field>
        </div>
        {fee > 0 && (
          <p className="rounded-lg bg-[#FFE2AF]/40 px-4 py-3 text-sm text-[#1A1A16]">
            Deposit on signing: <strong>{kes(deposit)}</strong>. Balance before delivery: <strong>{kes(fee - deposit)}</strong>.
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#007979] px-6 py-3.5 text-sm font-bold text-[#FFE2AF] transition-colors hover:bg-[#24B1B1] disabled:opacity-60"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <FilePlus2 size={18} />}
          {busy ? "Creating…" : "Create agreement"}
        </button>
        <p className="text-center text-xs text-[#524646]/60">
          After creating, you can download the Word or PDF copy or send it to the client on WhatsApp.
        </p>
      </Section>
    </div>
  );
}