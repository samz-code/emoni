import { OWNER, contractRows, fmtDate, type Row, type ServiceContract } from "@/lib/contracts";

function KV({ rows }: { rows: Row[] }) {
  return (
    <dl className="divide-y divide-[#E8E2D6] border-y border-[#E8E2D6]">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[200px_1fr] sm:gap-4">
          <dt className="text-sm text-[#524646]/70">{k}</dt>
          <dd className="whitespace-pre-line text-sm text-[#1A1A16]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-8 font-display text-lg font-bold text-[#007979]">{children}</h2>;
}

export default function ContractDocument({ c }: { c: ServiceContract }) {
  const { parties, project, fees } = contractRows(c);
  const countersigned = c.status === "countersigned" && !!c.countersigned_at;

  return (
    <article className="rounded-2xl border border-[#E8E2D6] bg-white p-6 shadow-sm sm:p-10 print:border-0 print:p-0 print:shadow-none">
      {c.status === "cancelled" && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          This agreement has been cancelled.
        </p>
      )}

      <h1 className="font-display text-3xl font-bold text-[#1A1A16]">Client Service Agreement</h1>
      <p className="mt-2 text-xs text-[#524646]/70">
        {OWNER.company} · {OWNER.site} | Agreement no. {c.reference} | {fmtDate(c.signed_at)}
      </p>

      <Heading>1. Parties</Heading>
      <KV rows={parties} />

      <Heading>2. Project and scope</Heading>
      <KV rows={project} />

      <Heading>3. Fees, payment and timeline</Heading>
      <KV rows={fees} />

      <Heading>4. Terms and conditions</Heading>
      <div className="space-y-2.5 text-sm leading-6 text-[#1A1A16]">
        {c.terms_snapshot.map((t, i) => (
          <p key={t.title}>
            <strong>
              4.{i + 1} {t.title}.{" "}
            </strong>
            {t.body}
          </p>
        ))}
      </div>

      <Heading>5. Signatures</Heading>
      <p className="mb-4 text-sm text-[#524646]">By signing below, the parties agree to be bound by this agreement.</p>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E8E2D6] p-4">
          <div className="flex h-20 items-center">
            {countersigned ? (
              <span className="text-4xl text-[#1B2F4A]" style={{ fontFamily: "'Segoe Script','Brush Script MT',cursive" }}>
                {OWNER.rep}
              </span>
            ) : (
              <span className="text-sm text-[#524646]/70">Awaiting countersignature</span>
            )}
          </div>
          <p className="mt-2 text-sm font-semibold text-[#1A1A16]">{OWNER.rep}</p>
          <p className="text-sm text-[#524646]">For {OWNER.company}</p>
          {countersigned && <p className="text-xs text-[#524646]/70">{fmtDate(c.countersigned_at as string)}</p>}
        </div>
        <div className="rounded-xl border border-[#E8E2D6] p-4">
          <div className="flex h-20 items-center">
            <img src={c.signature_data} alt="Client signature" className="max-h-20 max-w-full object-contain" />
          </div>
          <p className="mt-2 text-sm font-semibold text-[#1A1A16]">{c.signed_name}</p>
          <p className="text-sm text-[#524646]">{c.company_name || "Client"}</p>
          <p className="text-xs text-[#524646]/70">{fmtDate(c.signed_at)}</p>
        </div>
      </div>

      <p className="mt-6 text-xs text-[#524646]/70">
        Electronically signed on {new Date(c.signed_at).toLocaleString("en-GB")}. Agreement no. {c.reference}. Signed
        electronically under the laws of Kenya.
      </p>
    </article>
  );
}
