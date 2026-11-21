import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Download, Eraser, FileSignature, Loader2, MessageCircle, PenLine, Type, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { downloadContractDocx } from "@/lib/contractDocx";
import { DEPOSIT_OPTIONS, MIN_DEPOSIT_PERCENT, OWNER, kes, ownerMessage, useContractSettings, waLink, type ServiceContract } from "@/lib/contracts";
import { Field, Section, errMsg, inp, num } from "@/components/contracts/ui";

/* ───────── helpers ───────── */
function loadImage(src: string) {
  return new Promise<HTMLImageElement>((ok, bad) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = () => bad(new Error("Could not read that image."));
    i.src = src;
  });
}

async function shrink(src: string, type: "image/png" | "image/jpeg", quality = 0.8, maxW = 700) {
  const img = await loadImage(src);
  const k = Math.min(1, maxW / img.naturalWidth);
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(img.naturalWidth * k));
  c.height = Math.max(1, Math.round(img.naturalHeight * k));
  const x = c.getContext("2d")!;
  x.fillStyle = "#fff";
  x.fillRect(0, 0, c.width, c.height);
  x.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL(type, quality);
}

function typedSignature(name: string) {
  const c = document.createElement("canvas");
  c.width = 700;
  c.height = 200;
  const x = c.getContext("2d")!;
  x.fillStyle = "#fff";
  x.fillRect(0, 0, 700, 200);
  x.fillStyle = "#1B2F4A";
  x.font = "64px 'Segoe Script','Brush Script MT','Snell Roundhand',cursive";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(name, 350, 100, 660);
  return c.toDataURL("image/png");
}

function SignaturePad({ onChange }: { onChange: (d: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);

  useEffect(() => {
    const c = ref.current!;
    const ratio = window.devicePixelRatio || 1;
    const r = c.getBoundingClientRect();
    c.width = r.width * ratio;
    c.height = r.height * ratio;
    const x = c.getContext("2d")!;
    x.scale(ratio, ratio);
    x.lineWidth = 2.4;
    x.lineCap = "round";
    x.lineJoin = "round";
    x.strokeStyle = "#1B2F4A";
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    ref.current!.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = pos(e);
    const x = ref.current!.getContext("2d")!;
    x.beginPath();
    x.moveTo(p.x, p.y);
    x.lineTo(p.x + 0.1, p.y + 0.1);
    x.stroke();
    dirty.current = true;
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const p = pos(e);
    const x = ref.current!.getContext("2d")!;
    x.lineTo(p.x, p.y);
    x.stroke();
  };
  const up = async () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (dirty.current) onChange(await shrink(ref.current!.toDataURL("image/png"), "image/png"));
  };
  const clear = () => {
    const c = ref.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    dirty.current = false;
    onChange(null);
  };

  return (
    <div>
      <canvas
        ref={ref}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        className="h-44 w-full cursor-crosshair rounded-lg border border-dashed border-[#007979]/50 bg-[#FBF9F5]"
        style={{ touchAction: "none" }}
      />
      <div className="mt-2 flex items-center justify-between text-xs text-[#524646]/70">
        <span>Sign here with your finger, stylus or mouse</span>
        <button type="button" onClick={clear} className="inline-flex items-center gap-1 font-medium text-[#007979] hover:text-[#EC5B38]">
          <Eraser size={14} /> Clear
        </button>
      </div>
    </div>
  );
}

/* ───────── page ───────── */
const emptyForm = {
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

type SigKind = "draw" | "type" | "upload";

export default function ContractForm() {
  const { data: cfg } = useContractSettings();
  const settings = cfg!; // placeholder defaults are always available
  const [f, setF] = useState(emptyForm);
  const [services, setServices] = useState<string[]>([]);
  const [addons, setAddons] = useState<string[]>([]);
  const [agree, setAgree] = useState([false, false, false]);
  const [sigKind, setSigKind] = useState<SigKind>("draw");
  const [drawn, setDrawn] = useState<string | null>(null);
  const [typedName, setTypedName] = useState("");
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<ServiceContract | null>(null);

  const set = <K extends keyof typeof emptyForm>(k: K, v: (typeof emptyForm)[K]) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (list: string[], setList: (v: string[]) => void, v: string) =>
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const methods = settings.payment_methods;
  const paymentMethod = methods.includes(f.payment_method) ? f.payment_method : methods[0];
  const fee = num(f.fee);
  const deposit = Math.round(fee * f.deposit_percent) / 100;
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const typedPng = useMemo(() => (typedName.trim().length > 1 ? typedSignature(typedName.trim()) : null), [typedName]);
  const signature = sigKind === "draw" ? drawn : sigKind === "type" ? typedPng : uploaded;

  const onUpload = async (file?: File) => {
    if (!file) return;
    setError(null);
    try {
      if (!file.type.startsWith("image/")) throw new Error("Upload a PNG or JPG image.");
      const raw = await new Promise<string>((ok, bad) => {
        const r = new FileReader();
        r.onload = () => ok(String(r.result));
        r.onerror = () => bad(new Error("Could not read that file."));
        r.readAsDataURL(file);
      });
      setUploaded(await shrink(raw, "image/jpeg", 0.8, 600));
    } catch (e) {
      setUploaded(null);
      setError(errMsg(e));
    }
  };

  const validate = () => {
    if (f.client_name.trim().length < 2) return "Enter your full name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.client_email.trim())) return "Enter a valid email address.";
    if (f.client_phone.trim().length < 7) return "Enter your phone or WhatsApp number.";
    if (f.location.trim().length < 2) return "Enter your country and town.";
    if (services.length < 1) return "Select at least one service.";
    if (f.project_name.trim().length < 2) return "Enter a project name.";
    if (f.overview.trim().length < 10) return "Add a project overview (at least 10 characters).";
    if (num(f.budget) <= 0) return "Enter your budget.";
    if (fee <= 0) return "Enter the agreed project fee.";
    if (f.deposit_percent < MIN_DEPOSIT_PERCENT) return `Deposit must be at least ${MIN_DEPOSIT_PERCENT}%.`;
    if (!f.start_date) return "Choose a start date.";
    const w = Number(f.delivery_weeks);
    if (!Number.isInteger(w) || w < 1 || w > 104) return "Delivery must be between 1 and 104 weeks.";
    if (!agree.every(Boolean)) return "Tick all three confirmations under Terms and conditions.";
    if (sigKind === "type" && typedName.trim().length < 2) return "Type your full name to sign.";
    if (!signature) return "Add your signature.";
    if (signature.length > 590000) return "That signature image is too large. Use a smaller image or draw it.";
    return null;
  };

  const submit = async () => {
    const problem = validate();
    if (problem) return setError(problem);
    setBusy(true);
    setError(null);
    try {
      const picked = settings.services.filter((s) => services.includes(s.name));
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
        services: picked,
        addons,
        budget_kes: num(f.budget),
        fee_kes: fee,
        deposit_percent: f.deposit_percent,
        payment_method: paymentMethod,
        start_date: f.start_date,
        delivery_weeks: Number(f.delivery_weeks),
        signature_data: signature as string,
        signature_kind: sigKind,
        signed_name: sigKind === "type" ? typedName.trim() : f.client_name.trim(),
        terms_version: settings.terms_version,
        terms_snapshot: settings.terms,
      };

      const { data, error: rpcError } = await supabase.rpc("submit_service_contract", { p_data: payload });
      if (rpcError) throw rpcError;
      const row = (Array.isArray(data) ? data[0] : data) as { contract_reference: string; contract_token: string } | undefined;
      if (!row?.contract_reference) throw new Error("The agreement was not saved. Try again.");

      setDone({
        reference: row.contract_reference,
        access_token: row.contract_token,
        status: "signed",
        client_name: payload.client_name,
        company_name: payload.company_name || null,
        client_email: payload.client_email,
        client_phone: payload.client_phone,
        kra_pin: null,
        location: payload.location,
        project_name: payload.project_name,
        overview: payload.overview,
        goals: payload.goals || null,
        audience: payload.audience || null,
        features: payload.features || null,
        tech: payload.tech || null,
        refs: payload.refs || null,
        services: picked,
        addons,
        budget_kes: payload.budget_kes,
        fee_kes: payload.fee_kes,
        deposit_percent: payload.deposit_percent,
        payment_method: payload.payment_method,
        start_date: payload.start_date,
        delivery_weeks: payload.delivery_weeks,
        signature_data: payload.signature_data,
        signature_kind: sigKind,
        signed_name: payload.signed_name,
        terms_version: settings.terms_version,
        terms_snapshot: settings.terms,
        signed_at: new Date().toISOString(),
        countersigned_at: null,
        created_at: new Date().toISOString(),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  /* ───── success ───── */
  if (done) {
    const link = `${window.location.origin}/contract/${done.access_token}`;
    return (
      <main className="min-h-screen bg-[#FBF9F5] px-4 py-12 font-body text-[#524646]">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#E8E2D6] bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#007979]/10 text-[#007979]">
            <Check size={28} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-[#1A1A16]">Agreement signed</h1>
          <p className="mt-2 text-sm">
            Reference <strong className="text-[#1A1A16]">{done.reference}</strong>. Send it to {OWNER.rep} on WhatsApp so work can
            start, then save your copy.
          </p>

          <div className="mt-6 space-y-3">
            <a
              href={waLink(OWNER.whatsapp, ownerMessage(done, window.location.origin))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-bold text-white hover:brightness-95"
            >
              <MessageCircle size={18} /> Send to {OWNER.rep.split(" ")[0]} on WhatsApp
            </a>
            <button
              type="button"
              onClick={() => downloadContractDocx(done).catch((e) => setError(errMsg(e)))}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#007979] px-5 py-3 text-sm font-bold text-[#FFE2AF] hover:bg-[#24B1B1]"
            >
              <Download size={18} /> Download Word copy
            </button>
            <a
              href={`${link}?print=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-[#007979] px-5 py-3 text-sm font-bold text-[#007979] hover:bg-[#007979]/5"
            >
              <FileSignature size={18} /> Save as PDF
            </a>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 rounded-lg border border-[#E8E2D6] px-5 py-3 text-sm font-bold text-[#524646] hover:bg-[#FBF9F5]"
            >
              <ArrowLeft size={18} /> Back to website
            </Link>
          </div>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <p className="mt-6 break-all text-xs text-[#524646]/60">
            Your private link (keep it): <a className="underline" href={link}>{link}</a>
          </p>
        </div>
      </main>
    );
  }

  /* ───── form ───── */
  const nav = [
    ["s1", "Details"],
    ["s2", "Services"],
    ["s3", "Fees"],
    ["s4", "Terms"],
    ["s5", "Sign"],
  ];

  return (
    <main className="min-h-screen bg-[#FBF9F5] font-body text-[#524646]">
      <header className="relative overflow-hidden bg-[#007979] px-4 py-10 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/pattern.webp')", opacity: 0.05 }}
        />
        <div className="relative mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <img src="/whitelogo.png" alt={OWNER.company} className="h-12 w-auto object-contain" />
            <Link
              to="/"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <ArrowLeft size={15} /> Back to website
            </Link>
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold sm:text-4xl">Client service agreement</h1>
          <p className="mt-2 max-w-xl text-sm text-[#FFE2AF]">
            Review the scope, confirm the terms and sign online. Your signed copy is ready to save as a PDF the moment you finish.
          </p>
        </div>
      </header>

      <nav className="sticky top-0 z-20 border-b border-[#E8E2D6] bg-[#FBF9F5]/95 backdrop-blur">
        <ul className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 py-2 text-sm">
          {nav.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="block whitespace-nowrap rounded-full px-3.5 py-1.5 font-medium text-[#007979] hover:bg-[#007979]/10">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Section id="s1" title="Your details" intro="Who is entering into this agreement.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" required>
              <input className={inp} value={f.client_name} onChange={(e) => set("client_name", e.target.value)} autoComplete="name" />
            </Field>
            <Field label="Company or organisation">
              <input className={inp} value={f.company_name} onChange={(e) => set("company_name", e.target.value)} autoComplete="organization" />
            </Field>
            <Field label="Email" required>
              <input type="email" className={inp} value={f.client_email} onChange={(e) => set("client_email", e.target.value)} autoComplete="email" />
            </Field>
            <Field label="Phone / WhatsApp" required>
              <input type="tel" className={inp} value={f.client_phone} onChange={(e) => set("client_phone", e.target.value)} placeholder="0712 345 678" autoComplete="tel" />
            </Field>
            <Field label="Country and town" required>
              <input className={inp} value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Kenya, Nairobi" />
            </Field>
          </div>
        </Section>

        <Section id="s2" title="Services you're engaging us for" intro="Select every service that applies. The scope under each one becomes part of the agreement.">
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
          <Field label="Project overview" required>
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

        <Section id="s3" title="Fees and timeline" intro="Enter the amounts exactly as quoted in your proposal.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Client budget (KES)" required>
              <input inputMode="numeric" className={inp} value={f.budget} onChange={(e) => set("budget", e.target.value)} placeholder="150,000" />
            </Field>
            <Field label="Agreed project fee (KES)" required>
              <input inputMode="numeric" className={inp} value={f.fee} onChange={(e) => set("fee", e.target.value)} placeholder="120,000" />
            </Field>
            <Field label="Preferred payment method">
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
        </Section>

        <Section id="s4" title="Terms and conditions" intro="Please read in full. Scroll within the box.">
          <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border border-[#E8E2D6] bg-[#FBF9F5] p-4 text-sm leading-6 text-[#1A1A16]">
            {settings.terms.map((t, i) => (
              <p key={`${t.title}-${i}`}>
                <strong>
                  {i + 1}. {t.title}.{" "}
                </strong>
                {t.body}
              </p>
            ))}
          </div>
          {[
            "I have read and understood the terms above.",
            "I agree to the fees, payment schedule and ownership terms.",
            "I consent to signing electronically and agree this has the same effect as a handwritten signature.",
          ].map((t, i) => (
            <label key={t} className="flex cursor-pointer items-start gap-3 text-sm text-[#1A1A16]">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[#007979]"
                checked={agree[i]}
                onChange={(e) => setAgree((a) => a.map((v, j) => (j === i ? e.target.checked : v)))}
              />
              {t}
            </label>
          ))}
        </Section>

        <Section id="s5" title="Sign" intro="Draw, type or upload your signature.">
          <div className="inline-flex rounded-lg border border-[#E8E2D6] p-1">
            {([
              ["draw", "Draw", PenLine],
              ["type", "Type", Type],
              ["upload", "Upload", Upload],
            ] as const).map(([k, label, Icon]) => (
              <button
                type="button"
                key={k}
                onClick={() => setSigKind(k)}
                className={`inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium ${
                  sigKind === k ? "bg-[#007979] text-white" : "text-[#524646] hover:bg-[#007979]/10"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {sigKind === "draw" && <SignaturePad onChange={setDrawn} />}
          {sigKind === "type" && (
            <div>
              <Field label="Type your full name">
                <input className={inp} value={typedName} onChange={(e) => setTypedName(e.target.value)} />
              </Field>
              {typedPng && <img src={typedPng} alt="Typed signature preview" className="mt-3 h-24 rounded-lg border border-[#E8E2D6] bg-white object-contain" />}
            </div>
          )}
          {sigKind === "upload" && (
            <div>
              <Field label="Image of your signature (PNG or JPG)">
                <input type="file" accept="image/png,image/jpeg" onChange={(e) => onUpload(e.target.files?.[0])} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#007979] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white" />
              </Field>
              {uploaded ? (
                <img src={uploaded} alt="Uploaded signature preview" className="mt-3 h-24 rounded-lg border border-[#E8E2D6] bg-white object-contain" />
              ) : (
                <p className="mt-2 text-xs text-[#524646]/60">No image selected</p>
              )}
            </div>
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#EC5B38] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:brightness-95 disabled:opacity-60"
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : <FileSignature size={18} />}
            {busy ? "Signing…" : "Sign agreement"}
          </button>
          <p className="text-center text-xs text-[#524646]/60">
            Questions first? <Link to="/contact" className="underline">Contact {OWNER.rep.split(" ")[0]}</Link>
          </p>
        </Section>
      </div>
    </main>
  );
}