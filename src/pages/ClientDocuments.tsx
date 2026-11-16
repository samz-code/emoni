import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { formatKes, getErrorMessage, type ClientProposal, type WebsiteReview } from "@/lib/clientWork";

const sectionClass = "rounded-xl border border-[#E8E2D6] bg-white p-4 sm:p-7";
const inputClass =
  "mt-1 w-full rounded-lg border border-[#E8E2D6] px-3 py-2.5 text-base focus:border-[#007979] focus:outline-none sm:text-sm";

function BrandHeader() {
  return (
    <header className="flex flex-col items-center gap-5 border-b border-[#E8E2D6] pb-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
      <img src="/darklogo.png" alt="Samuel Emoni" className="h-12 w-auto object-contain sm:h-14" />
      <div className="flex flex-col items-center gap-4 text-sm text-[#524646]/70 sm:items-end sm:text-right">
        <div className="space-y-0.5">
          <p className="font-semibold text-[#1A1A16]">Samuel A. Emoni</p>
          <a href="mailto:emonisamuel54@gmail.com" className="block break-all underline">
            emonisamuel54@gmail.com
          </a>
          <p>
            <span className="whitespace-nowrap">+254 727 492 545</span>
            <span className="hidden sm:inline"> · </span>
            <span className="block sm:inline">Nairobi, Kenya</span>
          </p>
        </div>
        <Link
          to="/"
          className="print:hidden hidden min-h-10 items-center justify-center rounded-lg border border-[#007979] px-4 font-semibold text-[#007979] transition-colors hover:bg-[#007979]/5 sm:inline-flex"
        >
          Return to the website
        </Link>
      </div>
    </header>
  );
}

function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FBF9F5] px-4 py-6 text-[#524646] sm:px-6 sm:py-12">
      <article className="mx-auto max-w-4xl space-y-5 sm:space-y-7">
        <BrandHeader />
        {children}
        <footer className="border-t border-[#E8E2D6] pt-5 text-center text-xs text-[#524646]/60">
          <Link
            to="/"
            className="print:hidden mb-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[#007979] px-4 text-sm font-semibold text-[#007979] transition-colors hover:bg-[#007979]/5 sm:hidden"
          >
            Return to the website
          </Link>
          <p>Prepared by Samuel A. Emoni · <a className="underline" href="https://www.emonisamuel.co.ke">emonisamuel.co.ke</a></p>
        </footer>
      </article>
    </main>
  );
}

function StatusMessage({ children, error = false }: { children: React.ReactNode; error?: boolean }) {
  return (
    <p
      role={error ? "alert" : "status"}
      className={`break-words rounded-lg border p-4 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-900" : "border-teal-200 bg-teal-50 text-teal-900"}`}
    >
      {children}
    </p>
  );
}

export function ClientProposalPage() {
  const { token = "" } = useParams();
  const [proposal, setProposal] = useState<ClientProposal | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // supabase.rpc() returns a PromiseLike (no .catch), so use async/await with try/catch instead.
    const loadProposal = async () => {
      try {
        const { data, error: rpcError } = await supabase.rpc("get_client_proposal", { p_token: token });
        if (!active) return;
        if (rpcError) {
          setError(rpcError.message);
          return;
        }
        const value = (Array.isArray(data) ? data[0] : data) as ClientProposal | null | undefined;
        if (!value) {
          setError("This proposal link is invalid or is no longer available.");
          return;
        }
        setProposal(value);
        setMessage(value.client_message ?? "");
      } catch (reason: unknown) {
        if (active) setError(getErrorMessage(reason));
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProposal();
    return () => { active = false; };
  }, [token]);

  const respond = async (response: "accepted" | "declined" | "changes_requested") => {
    setSaving(true);
    setNotice(null);
    try {
      const { data, error: rpcError } = await supabase.rpc("respond_to_client_proposal", {
        p_token: token,
        p_response: response,
        p_message: message,
      });
      if (rpcError) throw rpcError;
      if (!data) throw new Error("This proposal is no longer accepting responses.");
      setProposal((current) => current ? {
        ...current,
        status: response,
        client_message: message.trim() || null,
        accepted_at: response === "accepted" ? new Date().toISOString() : null,
      } : current);
      setNotice(response === "accepted" ? "Thank you. Your acceptance has been recorded." : response === "declined" ? "Your response has been recorded." : "Your change request has been sent.");
    } catch (reason) {
      setNotice(getErrorMessage(reason));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageFrame><p className="text-center">Loading your proposal...</p></PageFrame>;
  if (error || !proposal) return <PageFrame><StatusMessage error>{error ?? "Proposal not found."}</StatusMessage><Link to="/" className="block text-center text-teal-800 underline">Return to the website</Link></PageFrame>;

  const expires = new Date(new Date(proposal.created_at).getTime() + proposal.validity_days * 86_400_000);
  const canRespond = proposal.status === "sent" && Date.now() <= expires.getTime();

  return (
    <PageFrame>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#007979]">Proposal & quote</p>
          <h1 className="mt-2 break-words text-2xl font-bold text-[#1A1A16] sm:text-3xl">{proposal.title}</h1>
          <p className="mt-2 text-sm text-[#524646]/70">Prepared for {proposal.client_name}{proposal.company_name ? ` · ${proposal.company_name}` : ""}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-11 w-full shrink-0 rounded-lg border border-[#007979] px-4 py-2 text-sm font-semibold text-[#007979] hover:bg-[#007979]/5 print:hidden sm:min-h-0 sm:w-auto"
        >
          Print / Save as PDF
        </button>
      </div>

      {notice && <StatusMessage>{notice}</StatusMessage>}
      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-[#1A1A16]">Project summary</h2>
        <p className="mt-2 whitespace-pre-line break-words leading-relaxed">{proposal.summary || "Please review the proposed scope and quote below."}</p>
        <p className="mt-4 text-xs text-[#524646]/60">Quote valid until {expires.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}.</p>
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-[#1A1A16]">Scope & deliverables</h2>
        <p className="mt-3 whitespace-pre-line break-words leading-relaxed">{proposal.scope}</p>
      </section>

      <section className={`${sectionClass} !p-0`}>
        <div className="p-4 sm:p-7">
          <h2 className="text-lg font-semibold text-[#1A1A16]">Investment · KES</h2>
          <ul className="mt-4 divide-y divide-[#E8E2D6]">
            {(proposal.line_items ?? []).map((item, index) => (
              <li key={`${item.description}-${index}`} className="flex items-start justify-between gap-4 py-3 text-sm">
                <span className="min-w-0 break-words">{item.description}</span>
                <span className="shrink-0 whitespace-nowrap font-medium">{formatKes(item.amount_kes)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-start justify-between gap-4 border-t border-[#524646]/20 pt-4 text-base font-bold text-[#007979] sm:text-lg">
            <span>Total (tax inclusive)</span>
            <span className="shrink-0 whitespace-nowrap">{formatKes(proposal.total_kes)}</span>
          </div>
          {proposal.payment_terms && <p className="mt-4 whitespace-pre-line break-words text-sm leading-relaxed text-[#524646]/80">{proposal.payment_terms}</p>}
        </div>
      </section>

      {proposal.client_message && !canRespond && <section className={sectionClass}><h2 className="font-semibold">Your message</h2><p className="mt-2 whitespace-pre-line break-words">{proposal.client_message}</p></section>}
      {proposal.status === "sent" && !canRespond && <StatusMessage>This quote has expired. Contact Samuel if you would like an updated proposal.</StatusMessage>}
      {!canRespond && <StatusMessage>Your response: <strong className="capitalize">{proposal.status.replace("_", " ")}</strong>{proposal.accepted_at ? ` on ${new Date(proposal.accepted_at).toLocaleDateString()}` : ""}.</StatusMessage>}

      {canRespond && (
        <section className={`${sectionClass} print:hidden`}>
          <h2 className="text-lg font-semibold text-[#1A1A16]">Your response</h2>
          <label className="mt-3 block text-sm font-medium" htmlFor="client-message">Message or requested changes (optional)</label>
          <textarea id="client-message" rows={4} maxLength={3000} className={inputClass} value={message} onChange={(event) => setMessage(event.target.value)} />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button type="button" disabled={saving} onClick={() => void respond("accepted")} className="min-h-12 w-full rounded-lg bg-[#007979] px-5 text-sm font-semibold text-white disabled:opacity-60 sm:min-h-11 sm:w-auto">{saving ? "Sending..." : "Accept proposal"}</button>
            <button type="button" disabled={saving} onClick={() => void respond("changes_requested")} className="min-h-12 w-full rounded-lg border border-[#007979] px-5 text-sm font-semibold text-[#007979] disabled:opacity-60 sm:min-h-11 sm:w-auto">Request changes</button>
            <button type="button" disabled={saving} onClick={() => void respond("declined")} className="min-h-12 w-full rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-700 disabled:opacity-60 sm:min-h-11 sm:w-auto">Decline</button>
          </div>
        </section>
      )}
    </PageFrame>
  );
}

interface ReviewPortalData {
  client_name: string;
  website_url: string;
  goals: string;
  status: WebsiteReview["status"];
  fee_kes: number;
  payment_instructions: string;
  payment_reference: string | null;
  summary: string;
  working_well: string[];
  needs_improvement: string[];
  created_at: string;
}

export function WebsiteReviewClientPage() {
  const { token = "" } = useParams();
  const [review, setReview] = useState<ReviewPortalData | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc("get_website_review", { p_token: token });
      if (rpcError) throw rpcError;
      const result = (Array.isArray(data) ? data[0] : data) as ReviewPortalData | null;
      if (!result) throw new Error("This review link is invalid or no longer available.");
      setReview(result);
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const sendPaymentReference = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setNotice(null);
    try {
      const { data, error: rpcError } = await supabase.rpc("submit_review_payment_reference", {
        p_token: token,
        p_reference: paymentReference,
      });
      if (rpcError) throw rpcError;
      if (!data) throw new Error("Payment reference could not be saved. Check the status or refresh.");
      setNotice("Payment reference submitted. It will be verified before your report is unlocked.");
      await load();
    } catch (reason) {
      setNotice(getErrorMessage(reason));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <PageFrame><p className="text-center">Loading your website review...</p></PageFrame>;
  if (error || !review) return <PageFrame><StatusMessage error>{error ?? "Review not found."}</StatusMessage><Link to="/website-review" className="block text-center text-teal-800 underline">Request a website review</Link></PageFrame>;

  const reportReady = review.status === "complete";
  return (
    <PageFrame>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#007979]">Website review</p>
        <h1 className="mt-2 break-words text-2xl font-bold text-[#1A1A16] sm:text-3xl">Review for {review.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</h1>
        <p className="mt-2 text-sm text-[#524646]/70">Prepared for {review.client_name} · Request status: <span className="font-semibold capitalize">{review.status.replace("_", " ")}</span></p>
      </div>

      {notice && <StatusMessage>{notice}</StatusMessage>}
      {review.status === "requested" || review.status === "reviewing" ? (
        <section className={sectionClass}>
          <h2 className="text-lg font-semibold text-[#1A1A16]">Your request is being reviewed</h2>
          <p className="mt-2 leading-relaxed">I’m reviewing your website and will update this page with the review fee and payment instructions. Your report will be available here after payment is confirmed and the review is complete.</p>
          {review.goals && <p className="mt-4 break-words rounded-lg bg-[#FBF9F5] p-3 text-sm"><strong>Your goals:</strong> {review.goals}</p>}
          <button type="button" onClick={() => void load()} className="mt-4 min-h-11 text-sm font-semibold text-[#007979] underline sm:min-h-0">Refresh status</button>
        </section>
      ) : null}

      {review.status === "awaiting_payment" && (
        <section className={sectionClass}>
          <h2 className="text-lg font-semibold text-[#1A1A16]">Payment required to unlock the report</h2>
          <p className="mt-2 text-2xl font-bold text-[#007979]">{formatKes(review.fee_kes)} <span className="text-sm font-normal text-[#524646]/60">tax inclusive</span></p>
          <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed">{review.payment_instructions || "Please contact Samuel using the details above to receive payment instructions."}</p>
          {review.payment_reference ? (
            <div className="mt-4"><StatusMessage>Your payment reference has been received and is awaiting verification.</StatusMessage></div>
          ) : (
            <form onSubmit={(event) => void sendPaymentReference(event)} className="mt-5 space-y-3">
              <label htmlFor="payment-reference" className="block text-sm font-medium">Payment reference / transaction code</label>
              <input id="payment-reference" required minLength={3} maxLength={100} value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} className={inputClass} />
              <button type="submit" disabled={sending} className="min-h-12 w-full rounded-lg bg-[#007979] px-5 text-sm font-semibold text-white disabled:opacity-60 sm:min-h-11 sm:w-auto">{sending ? "Submitting..." : "Submit payment reference"}</button>
            </form>
          )}
        </section>
      )}

      {review.status === "paid" && <StatusMessage>Payment is confirmed. Your review report is being prepared. Refresh this page shortly for the final report.</StatusMessage>}

      {reportReady && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 sm:flex-1"><StatusMessage>Your payment is confirmed and your report is ready.</StatusMessage></div>
            <button type="button" onClick={() => window.print()} className="min-h-11 w-full shrink-0 rounded-lg border border-[#007979] px-4 py-2 text-sm font-semibold text-[#007979] hover:bg-[#007979]/5 print:hidden sm:min-h-0 sm:w-auto">Download / Save report as PDF</button>
          </div>
          <section className={sectionClass}><h2 className="text-lg font-semibold text-[#1A1A16]">Executive summary</h2><p className="mt-2 whitespace-pre-line break-words leading-relaxed">{review.summary}</p></section>
          <div className="grid gap-5 md:grid-cols-2">
            <section className={sectionClass}><h2 className="text-lg font-semibold text-emerald-800">What is working well</h2><ul className="mt-3 list-disc space-y-2 pl-5">{review.working_well.map((item, index) => <li key={index} className="break-words leading-relaxed">{item}</li>)}</ul></section>
            <section className={sectionClass}><h2 className="text-lg font-semibold text-amber-800">What needs improvement</h2><ul className="mt-3 list-disc space-y-2 pl-5">{review.needs_improvement.map((item, index) => <li key={index} className="break-words leading-relaxed">{item}</li>)}</ul></section>
          </div>
        </>
      )}
    </PageFrame>
  );
}

export function WebsiteReviewRequestPage() {
  const [form, setForm] = useState({ client_name: "", client_email: "", website_url: "", goals: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc("create_website_review_request", {
        p_client_name: form.client_name,
        p_client_email: form.client_email,
        p_website_url: form.website_url,
        p_goals: form.goals,
      });
      if (rpcError) throw rpcError;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.access_token) throw new Error("The review request was not created. Please try again.");
      window.location.assign(`/website-review/${row.access_token}`);
    } catch (reason) {
      setError(getErrorMessage(reason));
      setSending(false);
    }
  };

  return (
    <PageFrame>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#007979]">Website review</p>
        <h1 className="mt-2 text-2xl font-bold text-[#1A1A16] sm:text-3xl">Get a practical review of your website</h1>
        <p className="mt-3 max-w-2xl leading-relaxed">Share your website and goals. I’ll review what is working, identify what could improve, and prepare a clear report. You can track your request, submit your payment reference, and download the completed report from a private link.</p>
      </div>
      <form onSubmit={(event) => void submit(event)} className={`${sectionClass} space-y-4`}>
        {error && <StatusMessage error>{error}</StatusMessage>}
        <label className="block text-sm font-medium">Your name<input required maxLength={120} value={form.client_name} onChange={(event) => setForm({ ...form, client_name: event.target.value })} className={inputClass} /></label>
        <label className="block text-sm font-medium">Email address<input required type="email" maxLength={254} value={form.client_email} onChange={(event) => setForm({ ...form, client_email: event.target.value })} className={inputClass} /></label>
        <label className="block text-sm font-medium">Website URL<input required type="url" maxLength={2048} placeholder="https://example.com" value={form.website_url} onChange={(event) => setForm({ ...form, website_url: event.target.value })} className={inputClass} /></label>
        <label className="block text-sm font-medium">What would you like the review to focus on?<span className="font-normal text-slate-500"> (optional)</span><textarea rows={4} maxLength={2000} value={form.goals} onChange={(event) => setForm({ ...form, goals: event.target.value })} className={inputClass} /></label>
        <button type="submit" disabled={sending} className="min-h-12 w-full rounded-lg bg-[#007979] px-5 text-sm font-semibold text-white disabled:opacity-60 sm:min-h-11 sm:w-auto">{sending ? "Submitting..." : "Request website review"}</button>
      </form>
      <p className="text-xs leading-relaxed text-[#524646]/60">Submitting this form creates a private review link. No automated security testing is performed; reviews are prepared manually based on your site and stated goals.</p>
    </PageFrame>
  );
}