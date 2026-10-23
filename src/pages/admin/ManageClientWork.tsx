import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Copy, ExternalLink, Plus, RefreshCw, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  formatKes,
  fromLines,
  getErrorMessage,
  toLines,
  type ClientProposal,
  type ProposalLineItem,
  type WebsiteReview,
} from "@/lib/clientWork";

type Section = "proposals" | "reviews";

const newProposal = () => ({
  client_name: "",
  client_email: "",
  company_name: "",
  title: "",
  summary: "",
  scope: "",
  line_items: [{ description: "", amount_kes: 0 }] as ProposalLineItem[],
  payment_terms: "Prices are inclusive of applicable taxes. A 50% deposit is required to begin work, with the balance due on completion.",
  validity_days: 30,
});

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700";

function LabelField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block min-w-0"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</span>{children}</label>;
}

export default function ManageClientWork() {
  const [section, setSection] = useState<Section>("proposals");
  const [proposals, setProposals] = useState<ClientProposal[]>([]);
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [proposalForm, setProposalForm] = useState<ReturnType<typeof newProposal> | null>(null);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<WebsiteReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [proposalResult, reviewResult] = await Promise.all([
        supabase.from("client_proposals").select("*").order("created_at", { ascending: false }),
        supabase.from("website_review_requests").select("*").order("created_at", { ascending: false }),
      ]);
      if (proposalResult.error) throw proposalResult.error;
      if (reviewResult.error) throw reviewResult.error;
      setProposals((proposalResult.data ?? []) as ClientProposal[]);
      setReviews((reviewResult.data ?? []) as WebsiteReview[]);
    } catch (error) {
      setNotice(`Could not load client work: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const startEditProposal = (proposal?: ClientProposal) => {
    if (!proposal) {
      setEditingProposalId(null);
      setProposalForm(newProposal());
      return;
    }
    setEditingProposalId(proposal.id);
    setProposalForm({
      client_name: proposal.client_name,
      client_email: proposal.client_email,
      company_name: proposal.company_name ?? "",
      title: proposal.title,
      summary: proposal.summary,
      scope: proposal.scope,
      line_items: proposal.line_items?.length ? proposal.line_items : [{ description: "", amount_kes: 0 }],
      payment_terms: proposal.payment_terms,
      validity_days: proposal.validity_days,
    });
  };

  const saveProposal = async (send: boolean) => {
    if (!proposalForm) return;
    const items = proposalForm.line_items.map((item) => ({
      description: item.description.trim(),
      amount_kes: Math.max(0, Math.round(Number(item.amount_kes) || 0)),
    })).filter((item) => item.description);
    if (!items.length) {
      setNotice("Add at least one described quote line item.");
      return;
    }
    if (!proposalForm.client_name.trim() || !proposalForm.client_email.trim() || !proposalForm.title.trim()) {
      setNotice("Enter the client name, email address, and proposal title.");
      return;
    }
    setSaving(true);
    const payload = {
      ...proposalForm,
      client_name: proposalForm.client_name.trim(),
      client_email: proposalForm.client_email.trim().toLowerCase(),
      company_name: proposalForm.company_name.trim() || null,
      total_kes: items.reduce((sum, item) => sum + item.amount_kes, 0),
      line_items: items,
      status: send ? "sent" : "draft",
      updated_at: new Date().toISOString(),
    };
    try {
      const result = editingProposalId
        ? await supabase.from("client_proposals").update(payload).eq("id", editingProposalId)
        : await supabase.from("client_proposals").insert(payload);
      if (result.error) throw result.error;
      setProposalForm(null);
      setEditingProposalId(null);
      setNotice(send ? "Proposal sent. Copy the private link below to share it with the client." : "Proposal draft saved.");
      await load();
    } catch (error) {
      setNotice(`Could not save proposal: ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const updateReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingReview) return;
    if (editingReview.status === "awaiting_payment" && editingReview.fee_kes <= 0) {
      setNotice("Set a review fee greater than zero before requesting payment.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("website_review_requests").update({
        status: editingReview.status,
        fee_kes: Math.max(0, Math.round(Number(editingReview.fee_kes) || 0)),
        payment_instructions: editingReview.payment_instructions,
        summary: editingReview.summary,
        working_well: editingReview.working_well,
        needs_improvement: editingReview.needs_improvement,
        admin_notes: editingReview.admin_notes,
        updated_at: new Date().toISOString(),
      }).eq("id", editingReview.id);
      if (error) throw error;
      setEditingReview(null);
      setNotice("Website review saved.");
      await load();
    } catch (error) {
      setNotice(`Could not save review: ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async (path: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setNotice("Private client link copied.");
    } catch (error) {
      setNotice(`Could not copy link: ${getErrorMessage(error)}`);
    }
  };

  const updateLineItem = (index: number, key: keyof ProposalLineItem, value: string | number) => {
    setProposalForm((current) => current ? {
      ...current,
      line_items: current.line_items.map((item, i) => i === index ? { ...item, [key]: value } : item),
    } : current);
  };

  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client proposals & website reviews</h1>
          <p className="mt-1 text-sm text-slate-600">Create branded KES quotes, share proposals privately, and prepare paid manual website reviews.</p>
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium hover:bg-white">
          <RefreshCw size={15} /> Refresh
        </button>
      </header>

      {notice && <div role="status" className="flex items-start justify-between gap-3 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900"><p>{notice}</p><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">×</button></div>}

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        <button type="button" onClick={() => setSection("proposals")} className={`px-4 py-2 text-sm font-semibold ${section === "proposals" ? "border-b-2 border-teal-700 text-teal-800" : "text-slate-500"}`}>Proposals & quotes ({proposals.length})</button>
        <button type="button" onClick={() => setSection("reviews")} className={`px-4 py-2 text-sm font-semibold ${section === "reviews" ? "border-b-2 border-teal-700 text-teal-800" : "text-slate-500"}`}>Website reviews ({reviews.length})</button>
      </div>

      {section === "proposals" && (
        <section className="space-y-4">
          {!proposalForm && <button type="button" onClick={() => startEditProposal()} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"><Plus size={16} /> New proposal / quote</button>}
          {proposalForm && (
            <form className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-6" onSubmit={(event) => { event.preventDefault(); void saveProposal(true); }}>
              <h2 className="text-lg font-semibold text-slate-900">{editingProposalId ? "Edit proposal" : "New branded proposal"}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <LabelField label="Client name"><input required className={inputClass} value={proposalForm.client_name} onChange={(e) => setProposalForm({ ...proposalForm, client_name: e.target.value })} /></LabelField>
                <LabelField label="Client email"><input required type="email" className={inputClass} value={proposalForm.client_email} onChange={(e) => setProposalForm({ ...proposalForm, client_email: e.target.value })} /></LabelField>
                <LabelField label="Company / organization"><input className={inputClass} value={proposalForm.company_name} onChange={(e) => setProposalForm({ ...proposalForm, company_name: e.target.value })} /></LabelField>
                <LabelField label="Proposal title"><input required className={inputClass} value={proposalForm.title} onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })} /></LabelField>
              </div>
              <LabelField label="Summary"><textarea rows={3} className={inputClass} value={proposalForm.summary} onChange={(e) => setProposalForm({ ...proposalForm, summary: e.target.value })} /></LabelField>
              <LabelField label="Scope and deliverables"><textarea rows={5} className={inputClass} value={proposalForm.scope} onChange={(e) => setProposalForm({ ...proposalForm, scope: e.target.value })} /></LabelField>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-800">Quote line items · KES, tax inclusive</h3><button type="button" onClick={() => setProposalForm({ ...proposalForm, line_items: [...proposalForm.line_items, { description: "", amount_kes: 0 }] })} className="text-sm font-semibold text-teal-800">+ Add item</button></div>
                {proposalForm.line_items.map((item, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[1fr_180px_auto]">
                    <input aria-label="Description" className={inputClass} placeholder="Description" value={item.description} onChange={(e) => updateLineItem(index, "description", e.target.value)} />
                    <input aria-label="Amount in KES" type="number" min="0" className={inputClass} placeholder="KES amount" value={item.amount_kes || ""} onChange={(e) => updateLineItem(index, "amount_kes", Number(e.target.value))} />
                    <button type="button" disabled={proposalForm.line_items.length === 1} onClick={() => setProposalForm({ ...proposalForm, line_items: proposalForm.line_items.filter((_, i) => i !== index) })} className="min-h-10 rounded border border-rose-200 px-3 text-sm text-rose-700 disabled:opacity-40">Remove</button>
                  </div>
                ))}
                <p className="text-right text-lg font-bold text-slate-900">Total: {formatKes(proposalForm.line_items.reduce((sum, item) => sum + (Number(item.amount_kes) || 0), 0))}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <LabelField label="Payment terms"><textarea rows={3} className={inputClass} value={proposalForm.payment_terms} onChange={(e) => setProposalForm({ ...proposalForm, payment_terms: e.target.value })} /></LabelField>
                <LabelField label="Quote valid for (days)"><input type="number" min="1" className={inputClass} value={proposalForm.validity_days} onChange={(e) => setProposalForm({ ...proposalForm, validity_days: Number(e.target.value) })} /></LabelField>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" disabled={saving} onClick={() => void saveProposal(false)} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">Save draft</button>
                <button type="submit" disabled={saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 text-sm font-semibold text-white disabled:opacity-60"><ExternalLink size={15} /> {saving ? "Saving..." : "Save & create client link"}</button>
                <button type="button" onClick={() => { setProposalForm(null); setEditingProposalId(null); }} className="min-h-11 px-4 text-sm text-slate-600">Cancel</button>
              </div>
            </form>
          )}
          {loading ? <p className="text-sm text-slate-500">Loading proposals...</p> : proposals.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">No proposals yet. Create a branded quote to get started.</p> : (
            <ul className="grid gap-3 xl:grid-cols-2">
              {proposals.map((proposal) => (
                <li key={proposal.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0"><p className="font-semibold text-slate-900">{proposal.title}</p><p className="text-sm text-slate-600">{proposal.client_name} · {proposal.client_email}</p><p className="mt-1 text-sm font-bold text-teal-800">{formatKes(proposal.total_kes)} <span className="font-normal text-slate-500">(tax inclusive)</span></p></div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-700">{proposal.status.replace("_", " ")}</span>
                  </div>
                  {proposal.client_message && <p className="mt-3 rounded bg-amber-50 p-2 text-sm text-amber-900">Client: {proposal.client_message}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {proposal.status !== "draft" && <button type="button" onClick={() => void copyLink(`/proposal/${proposal.public_token}`)} className="inline-flex min-h-9 items-center gap-1.5 rounded border border-slate-300 px-3 text-xs font-semibold"><Copy size={13} /> Copy client link</button>}
                    <a className="inline-flex min-h-9 items-center gap-1.5 rounded border border-slate-300 px-3 text-xs font-semibold" href={`mailto:${encodeURIComponent(proposal.client_email)}?subject=${encodeURIComponent(proposal.title)}&body=${encodeURIComponent(`Hello ${proposal.client_name},\n\nPlease review your proposal here:\n${window.location.origin}/proposal/${proposal.public_token}`)}`}><ExternalLink size={13} /> Email link</a>
                    <button type="button" onClick={() => startEditProposal(proposal)} className="min-h-9 rounded border border-slate-300 px-3 text-xs font-semibold">Edit</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {section === "reviews" && (
        <section className="space-y-4">
          {editingReview && (
            <form onSubmit={(event) => void updateReview(event)} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">Website review for {editingReview.client_name}</h2><a href={editingReview.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-teal-800 underline"><ExternalLink size={14} /> Open website</a></div>
              <p className="break-all text-sm text-slate-600">{editingReview.website_url} · {editingReview.client_email}</p>
              {editingReview.goals && <p className="rounded bg-slate-50 p-3 text-sm"><strong>Client goals:</strong> {editingReview.goals}</p>}
              <div className="grid gap-4 sm:grid-cols-2">
                <LabelField label="Workflow status"><select className={inputClass} value={editingReview.status} onChange={(e) => setEditingReview({ ...editingReview, status: e.target.value as WebsiteReview["status"] })}><option value="requested">Requested</option><option value="reviewing">Reviewing</option><option value="awaiting_payment">Awaiting payment</option><option value="paid">Paid — report can be prepared</option><option value="complete">Complete — unlock report</option></select></LabelField>
                <LabelField label="Review fee (KES, inclusive)"><input type="number" min="0" className={inputClass} value={editingReview.fee_kes} onChange={(e) => setEditingReview({ ...editingReview, fee_kes: Number(e.target.value) })} /></LabelField>
              </div>
              <LabelField label="Payment instructions"><textarea rows={2} className={inputClass} placeholder="Add your M-Pesa or bank payment instructions" value={editingReview.payment_instructions} onChange={(e) => setEditingReview({ ...editingReview, payment_instructions: e.target.value })} /></LabelField>
              <LabelField label="Review summary"><textarea rows={3} className={inputClass} value={editingReview.summary} onChange={(e) => setEditingReview({ ...editingReview, summary: e.target.value })} /></LabelField>
              <div className="grid gap-4 sm:grid-cols-2">
                <LabelField label="What is working well (one item per line)"><textarea rows={6} className={inputClass} value={toLines(editingReview.working_well ?? [])} onChange={(e) => setEditingReview({ ...editingReview, working_well: fromLines(e.target.value) })} /></LabelField>
                <LabelField label="What needs improvement (one item per line)"><textarea rows={6} className={inputClass} value={toLines(editingReview.needs_improvement ?? [])} onChange={(e) => setEditingReview({ ...editingReview, needs_improvement: fromLines(e.target.value) })} /></LabelField>
              </div>
              <LabelField label="Private admin notes"><textarea rows={2} className={inputClass} value={editingReview.admin_notes} onChange={(e) => setEditingReview({ ...editingReview, admin_notes: e.target.value })} /></LabelField>
              {editingReview.payment_reference && <p className="rounded bg-amber-50 p-3 text-sm text-amber-900">Client payment reference: <strong>{editingReview.payment_reference}</strong></p>}
              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={saving} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-teal-800 px-4 text-sm font-semibold text-white disabled:opacity-60"><Save size={15} /> Save review</button>
                <button type="button" onClick={() => void copyLink(`/website-review/${editingReview.public_token}`)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold"><Copy size={14} /> Copy client link</button>
                <button type="button" onClick={() => setEditingReview(null)} className="min-h-10 px-3 text-sm text-slate-600">Close</button>
              </div>
            </form>
          )}
          {loading ? <p className="text-sm text-slate-500">Loading review requests...</p> : reviews.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">No review requests received yet.</p> : (
            <ul className="space-y-3">
              {reviews.map((review) => (
                <li key={review.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0"><p className="font-semibold text-slate-900">{review.client_name} <span className="font-normal text-slate-500">· {review.status.replace("_", " ")}</span></p><a href={review.website_url} target="_blank" rel="noreferrer" className="break-all text-sm text-teal-800 underline">{review.website_url}</a><p className="text-xs text-slate-500">{review.client_email} · Fee {formatKes(review.fee_kes)}{review.payment_reference ? ` · Ref ${review.payment_reference}` : ""}</p></div>
                  <button type="button" onClick={() => setEditingReview({ ...review })} className="min-h-10 shrink-0 rounded-lg border border-slate-300 px-4 text-sm font-semibold">Review & update</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
