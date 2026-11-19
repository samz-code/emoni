import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { BadgeCheck, CalendarDays, Download, FileSignature, Loader2, Printer, Wallet } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { downloadContractDocx } from "@/lib/contractDocx";
import { OWNER, kes, ownerMessage, waLink, type ServiceContract } from "@/lib/contracts";
import ContractDocument from "@/components/ContractDocument/ContractDocument";

/**
 * Official WhatsApp logo as an image file (not a drawn icon).
 * Save the file from https://whatsapp.com/brand as public/whatsapp-logo.svg
 */
const WHATSAPP_LOGO = "/whatsapp-logo.svg";

const errMsg = (e: unknown) => (e as { message?: string })?.message || "Something went wrong. Try again.";
const day = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" }) : "Pending";

function Stat({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFE2AF]/20 text-[#FFE2AF]">
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#FFE2AF]/80">{label}</span>
        <span className="block truncate text-sm font-semibold text-white">{value}</span>
      </span>
    </div>
  );
}

export default function ContractView() {
  const { token = "" } = useParams();
  const [params] = useSearchParams();
  const [c, setC] = useState<ServiceContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: rpcError } = await supabase.rpc("get_service_contract", { p_token: token });
      if (!active) return;
      const row = (Array.isArray(data) ? data[0] : data) as ServiceContract | null | undefined;
      if (rpcError) setError(rpcError.message);
      else if (!row) setError("Agreement not found. Check the link you were sent.");
      else setC(row);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (c && params.get("print") === "1") {
      const t = window.setTimeout(() => window.print(), 600);
      return () => window.clearTimeout(t);
    }
  }, [c, params]);

  const countersigned = Boolean(c?.countersigned_at);
  const firstName = OWNER.rep.split(" ")[0];

  return (
    <main className="min-h-screen bg-[#F3EFE6] font-body text-[#524646] print:bg-white">
      <style>{`@media print { .no-print { display: none !important; } @page { margin: 14mm; } }`}</style>

      {/* Hero banner */}
      <header className="no-print relative overflow-hidden bg-gradient-to-br from-[#007979] via-[#007979] to-[#0A5C5C] px-4 pb-24 pt-8 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#24B1B1]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-[#EC5B38]/15 blur-3xl" />
        <div className="relative mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-4">
            <Link to="/">
              <img src="/whitelogo.png" alt={OWNER.company} className="h-11 w-auto object-contain" />
            </Link>
            {c && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold ${
                  countersigned ? "bg-[#FFE2AF] text-[#1A1A16]" : "bg-white/15 text-white"
                }`}
              >
                <BadgeCheck size={14} /> {countersigned ? "Fully executed" : "Signed by client"}
              </span>
            )}
          </div>

          <p className="mt-10 text-xs font-bold uppercase tracking-[0.25em] text-[#FFE2AF]">Client service agreement</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{c ? c.project_name : "Your agreement"}</h1>
          {c && (
            <p className="mt-2 text-sm text-[#FFE2AF]/90">
              {c.reference} · {c.client_name}
              {c.company_name ? ` · ${c.company_name}` : ""}
            </p>
          )}

          {c && (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Stat icon={Wallet} label="Project fee" value={kes(c.fee_kes)} />
              <Stat icon={CalendarDays} label="Start date" value={day(c.start_date)} />
              <Stat icon={FileSignature} label="Signed" value={day(c.signed_at)} />
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto -mt-16 max-w-4xl px-4 pb-16 print:mt-0 print:max-w-none print:p-0">
        {loading && (
          <p className="no-print flex items-center justify-center gap-2 rounded-2xl bg-white py-20 text-sm shadow-lg">
            <Loader2 className="animate-spin" size={18} /> Loading agreement…
          </p>
        )}
        {error && <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700 shadow-lg">{error}</p>}

        {c && (
          <>
            {/* Actions */}
            <div className="no-print mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[#E8E2D6] bg-white p-4 shadow-lg">
              <a
                href={waLink(OWNER.whatsapp, ownerMessage(c, window.location.origin))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
              >
                <img src={WHATSAPP_LOGO} alt="" aria-hidden="true" width={22} height={22} className="h-[22px] w-[22px] object-contain" />
                Send to {firstName} on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => downloadContractDocx(c).catch((e) => setError(errMsg(e)))}
                className="inline-flex items-center gap-2 rounded-lg bg-[#007979] px-5 py-3 text-sm font-bold text-[#FFE2AF] transition hover:bg-[#24B1B1]"
              >
                <Download size={16} /> Word copy
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg border border-[#007979] px-5 py-3 text-sm font-bold text-[#007979] transition hover:bg-[#007979]/5"
              >
                <Printer size={16} /> Save as PDF
              </button>
              <p className="w-full text-xs text-[#524646]/60 sm:ml-auto sm:w-auto">
                Keep this link private. Anyone with it can view the agreement.
              </p>
            </div>

            {/* Paper */}
            <div className="rounded-2xl border border-[#E8E2D6] bg-white p-5 shadow-xl sm:p-10 print:rounded-none print:border-0 print:p-0 print:shadow-none">
              <ContractDocument c={c} />
            </div>

            <p className="no-print mt-6 text-center text-xs text-[#524646]/60">
              Questions?{" "}
              <Link to="/contact" className="font-medium text-[#007979] underline">
                Contact {firstName}
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}