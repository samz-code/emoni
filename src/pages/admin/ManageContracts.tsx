import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Copy, Download, FileSignature, Loader2, MessageCircle, Printer, Search, Trash2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { downloadContractDocx } from "@/lib/contractDocx";
import { OWNER, fmtDate, kes, waDigits, waLink, type ContractStatus, type ServiceContract } from "@/lib/contracts";
import ContractDocument from "@/components/ContractDocument/ContractDocument";

type Filter = "all" | "unread" | ContractStatus;

/** Lightweight row used by the list. Excludes the heavy signature_data and long text fields. */
const LIST_COLUMNS =
  "id, reference, status, is_read, client_name, company_name, client_email, project_name, fee_kes, signed_at, created_at";

type ContractListItem = Pick<
  ServiceContract,
  | "id"
  | "reference"
  | "status"
  | "is_read"
  | "client_name"
  | "company_name"
  | "client_email"
  | "project_name"
  | "fee_kes"
  | "signed_at"
  | "created_at"
>;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "signed", label: "Signed" },
  { key: "countersigned", label: "Countersigned" },
  { key: "cancelled", label: "Cancelled" },
];

const BADGE: Record<ContractStatus, string> = {
  signed: "bg-[#EC5B38]/10 text-[#EC5B38]",
  countersigned: "bg-[#007979]/10 text-[#007979]",
  cancelled: "bg-gray-200 text-gray-600",
};

const errMsg = (e: unknown) => (e as { message?: string })?.message || "Something went wrong. Try again.";

export default function ManageContracts() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedForm, setCopiedForm] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  /* List: light columns only (no signature images) */
  const list = useQuery<ContractListItem[]>({
    queryKey: ["admin-contracts", "list"],
    queryFn: async () => {
      const { data, error: e } = await supabase
        .from("service_contracts")
        .select(LIST_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(200);
      if (e) throw e;
      return (data ?? []) as ContractListItem[];
    },
  });

  /* Detail: full row, fetched only for the opened agreement */
  const detail = useQuery<ServiceContract>({
    queryKey: ["admin-contracts", "detail", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error: e } = await supabase
        .from("service_contracts")
        .select("*")
        .eq("id", selectedId!)
        .single();
      if (e) throw e;
      return data as ServiceContract;
    },
  });

  const selected = detail.data ?? null;

  // Load saved notes once per opened agreement (not on every background refetch,
  // so text being typed is never overwritten).
  useEffect(() => {
    setNotes(detail.data?.admin_notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.data?.id]);

  // Live updates
  useEffect(() => {
    const channel = supabase
      .channel("admin-contracts-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "service_contracts" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-contracts"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  const items = list.data ?? [];

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      if (filter === "unread" && c.is_read) return false;
      if (filter !== "all" && filter !== "unread" && c.status !== filter) return false;
      if (!q) return true;
      return [c.reference, c.client_name, c.company_name, c.project_name, c.client_email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, filter, search]);

  const patch = async (id: string, values: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.from("service_contracts").update(values).eq("id", id);
    setBusy(false);
    if (e) {
      setError(e.message);
      return false;
    }
    await qc.invalidateQueries({ queryKey: ["admin-contracts"] });
    return true;
  };

  const open = async (c: ContractListItem) => {
    setSelectedId(c.id ?? null);
    setError(null);
    if (!c.is_read && c.id) await patch(c.id, { is_read: true });
  };

  const remove = async (c: Pick<ServiceContract, "id" | "reference">) => {
    if (!c.id || !window.confirm(`Delete agreement ${c.reference}? This cannot be undone.`)) return;
    setBusy(true);
    const { error: e } = await supabase.from("service_contracts").delete().eq("id", c.id);
    setBusy(false);
    if (e) return setError(e.message);
    setSelectedId(null);
    await qc.invalidateQueries({ queryKey: ["admin-contracts"] });
  };

  const clientLink = (c: ServiceContract) => `${window.location.origin}/contract/${c.access_token}`;

  const copyLink = async (c: ServiceContract) => {
    try {
      await navigator.clipboard.writeText(clientLink(c));
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 1800);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const copyFormLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/contract`);
      setCopiedForm(true);
      window.setTimeout(() => setCopiedForm(false), 1800);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const messageClient = (c: ServiceContract) => {
    const text =
      c.status === "countersigned"
        ? `Hello ${c.client_name}, your agreement ${c.reference} is countersigned. Your copy: ${clientLink(c)}`
        : `Hello ${c.client_name}, I received your signed agreement ${c.reference} for "${c.project_name}". Your copy: ${clientLink(c)}`;
    window.open(waLink(waDigits(c.client_phone), text), "_blank", "noopener");
  };

  const btn =
    "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors disabled:opacity-60";

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A1A16]">Contracts</h1>
          <p className="text-sm text-[#524646]/70">Agreements signed by clients at /contract.</p>
        </div>
        <button type="button" onClick={copyFormLink} className={`${btn} bg-[#007979] text-[#FFE2AF] hover:bg-[#24B1B1]`}>
          <Copy size={14} /> {copiedForm ? "Copied" : "Copy client form link"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* list */}
        <div className={selectedId ? "hidden lg:block" : "block"}>
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#524646]/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client, project, reference"
              className="w-full rounded-lg border border-[#E8E2D6] bg-white py-2.5 pl-9 pr-3 text-sm focus:border-[#007979] focus:outline-none focus:ring-2 focus:ring-[#007979]/30"
            />
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {FILTERS.map((x) => (
              <button
                key={x.key}
                type="button"
                onClick={() => setFilter(x.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  filter === x.key ? "bg-[#007979] text-white" : "bg-white text-[#524646] ring-1 ring-[#E8E2D6] hover:ring-[#007979]/50"
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>

          {list.isPending && (
            <p className="flex items-center gap-2 py-10 text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading…
            </p>
          )}
          {list.isError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errMsg(list.error)}</p>}
          {!list.isPending && !list.isError && visible.length === 0 && (
            <p className="rounded-xl border border-dashed border-[#E8E2D6] bg-white px-4 py-10 text-center text-sm text-[#524646]/70">
              No agreements yet. Share the client form link to get the first one.
            </p>
          )}

          <ul className="space-y-2">
            {visible.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => open(c)}
                  className={`w-full rounded-xl border bg-white p-3.5 text-left transition-colors ${
                    c.id === selectedId ? "border-[#007979]" : "border-[#E8E2D6] hover:border-[#007979]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      {!c.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#EC5B38]" aria-label="Unread" />}
                      <span className="truncate text-sm font-semibold text-[#1A1A16]">{c.client_name}</span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${BADGE[c.status]}`}>{c.status}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#524646]">{c.project_name}</p>
                  <p className="mt-1 text-[11px] text-[#524646]/60">
                    {c.reference} · {kes(c.fee_kes)} · {fmtDate(c.signed_at)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* detail */}
        <div className={selectedId ? "block" : "hidden lg:block"}>
          {!selectedId ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#E8E2D6] bg-white text-sm text-[#524646]/60">
              <FileSignature size={28} className="mb-2 text-[#524646]/30" />
              Select an agreement to review it.
            </div>
          ) : (
            <div className="space-y-4">
              <button type="button" onClick={() => setSelectedId(null)} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#007979] lg:hidden">
                <ArrowLeft size={15} /> Back to list
              </button>

              {detail.isPending && (
                <p className="flex items-center gap-2 py-10 text-sm">
                  <Loader2 size={16} className="animate-spin" /> Loading agreement…
                </p>
              )}
              {detail.isError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errMsg(detail.error)}</p>}

              {selected && (
                <>
                  <div className="flex flex-wrap gap-2 rounded-xl border border-[#E8E2D6] bg-white p-3">
                    {selected.status === "signed" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => patch(selected.id!, { status: "countersigned", countersigned_at: new Date().toISOString() })}
                        className={`${btn} bg-[#007979] text-white hover:bg-[#24B1B1]`}
                      >
                        <Check size={14} /> Countersign
                      </button>
                    )}
                    {selected.status === "countersigned" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => patch(selected.id!, { status: "signed", countersigned_at: null })}
                        className={`${btn} border border-[#E8E2D6] text-[#524646] hover:bg-[#FBF9F5]`}
                      >
                        Undo countersign
                      </button>
                    )}
                    {selected.status !== "cancelled" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => patch(selected.id!, { status: "cancelled" })}
                        className={`${btn} border border-red-200 text-red-600 hover:bg-red-50`}
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => patch(selected.id!, { status: selected.countersigned_at ? "countersigned" : "signed" })}
                        className={`${btn} border border-[#E8E2D6] text-[#524646] hover:bg-[#FBF9F5]`}
                      >
                        Reinstate
                      </button>
                    )}
                    <button type="button" onClick={() => messageClient(selected)} className={`${btn} bg-[#25D366] text-white hover:brightness-95`}>
                      <MessageCircle size={14} /> WhatsApp client
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadContractDocx(selected).catch((e) => setError(errMsg(e)))}
                      className={`${btn} border border-[#007979] text-[#007979] hover:bg-[#007979]/5`}
                    >
                      <Download size={14} /> Word
                    </button>
                    <a
                      href={`/contract/${selected.access_token}?print=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${btn} border border-[#007979] text-[#007979] hover:bg-[#007979]/5`}
                    >
                      <Printer size={14} /> PDF
                    </a>
                    <button type="button" onClick={() => copyLink(selected)} className={`${btn} border border-[#E8E2D6] text-[#524646] hover:bg-[#FBF9F5]`}>
                      <Copy size={14} /> {copiedLink ? "Copied" : "Copy client link"}
                    </button>
                    <button type="button" disabled={busy} onClick={() => remove(selected)} className={`${btn} ml-auto text-red-600 hover:bg-red-50`}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>

                  {error && (
                    <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </p>
                  )}

                  <div className="rounded-xl border border-[#E8E2D6] bg-white p-4">
                    <label className="mb-1.5 block text-sm font-medium text-[#1A1A16]" htmlFor="contract-notes">
                      Private notes
                    </label>
                    <textarea
                      id="contract-notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-lg border border-[#E8E2D6] px-3.5 py-2.5 text-sm focus:border-[#007979] focus:outline-none focus:ring-2 focus:ring-[#007979]/30"
                      placeholder={`Only visible to ${OWNER.rep}`}
                    />
                    <button
                      type="button"
                      disabled={busy || notes === (selected.admin_notes ?? "")}
                      onClick={() => patch(selected.id!, { admin_notes: notes.trim() || null })}
                      className={`${btn} mt-2 bg-[#007979] text-white hover:bg-[#24B1B1]`}
                    >
                      {busy ? <Loader2 size={14} className="animate-spin" /> : null} Save notes
                    </button>
                  </div>

                  <ContractDocument c={selected} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}