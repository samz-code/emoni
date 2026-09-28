import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  Image as ImageIcon,
  Inbox,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  UserPlus,
  X,
} from "lucide-react";
import {
  APPLICATION_STATUSES,
  emptyPartner,
  emptyToNull,
  errMsg,
  hostname,
  linesToArray,
  nextOrder,
  normalizeUrl,
  type ApplicationStatus,
  type PartnerApplication,
  type PartnerProfile,
  type PartnerTerm,
} from "@/lib/partnersProgram";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS + HELPERS
═══════════════════════════════════════════════════════════ */
type Tab = "directory" | "applications" | "terms";
type Notify = (message: string, type?: "success" | "error") => void;
type ToastState = { id: number; message: string; type: "success" | "error" };

const BUCKET = "site-assets";
const MAX_UPLOAD_MB = 5;

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewing: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  declined: "bg-gray-200 text-gray-600",
};

function fileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName && fromName.length <= 5) return fromName;
  return file.type.split("/")[1]?.replace(/[^a-z0-9]/g, "") || "png";
}

async function uploadImage(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error(`"${file.name}" is not an image file`);
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`"${file.name}" is larger than ${MAX_UPLOAD_MB}MB`);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${fileExtension(file)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "31536000", contentType: file.type });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function removeUploadedImage(url?: string | null) {
  if (!url || !url.includes("/storage/v1/object/public/")) return;
  const marker = `/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return;
  const path = decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}

function useAdminList<T>(table: string, key: string, orderBy = "sort_order", ascending = true) {
  return useQuery({
    queryKey: [key],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order(orderBy, { ascending });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function ManagePartners() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("directory");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [reordering, setReordering] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");

  const [editingPartner, setEditingPartner] = useState<PartnerProfile | null>(null);
  const [editingTerm, setEditingTerm] = useState<PartnerTerm | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback<Notify>((message, type = "success") => setToast({ id: Date.now(), message, type }), []);
  const closeToast = useCallback(() => setToast(null), []);

  const partnersQ = useAdminList<PartnerProfile>("partner_profiles", "admin-partner-profiles");
  const termsQ = useAdminList<PartnerTerm>("partner_terms", "admin-partner-terms");
  const appsQ = useAdminList<PartnerApplication>("partner_applications", "admin-partner-applications", "created_at", false);

  const partners = partnersQ.data ?? [];
  const terms = termsQ.data ?? [];
  const apps = appsQ.data ?? [];
  const newCount = apps.filter((a) => a.status === "new").length;
  const shownApps = statusFilter === "all" ? apps : apps.filter((a) => a.status === statusFilter);

  const refreshPublic = () => {
    qc.invalidateQueries({ queryKey: ["partner-profiles-public"] });
    qc.invalidateQueries({ queryKey: ["partner-terms-public"] });
  };

  /* ── Partner save/delete ── */
  const savePartner = useMutation<void, unknown, PartnerProfile>({
    mutationFn: async (p) => {
      if (!p.name.trim()) throw new Error("Partner name is required");
      const payload = {
        name: p.name.trim(),
        logo_url: emptyToNull(p.logo_url),
        website_url: normalizeUrl(p.website_url),
        linkedin_url: normalizeUrl(p.linkedin_url),
        category: emptyToNull(p.category),
        tagline: emptyToNull(p.tagline),
        background: emptyToNull(p.background),
        offerings: p.offerings,
        contact_person: emptyToNull(p.contact_person),
        contact_email: emptyToNull(p.contact_email),
        contact_phone: emptyToNull(p.contact_phone),
        location: emptyToNull(p.location),
        partner_since: emptyToNull(p.partner_since),
        published: p.published,
        sort_order: p.sort_order,
      };
      const { error } = p.id
        ? await supabase.from("partner_profiles").update(payload).eq("id", p.id)
        : await supabase.from("partner_profiles").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-partner-profiles"] });
      refreshPublic();
      setEditingPartner(null);
      showToast("Partner saved");
    },
    onError: (e) => showToast(errMsg(e, "Failed to save partner"), "error"),
  });

  const deletePartner = useMutation<void, unknown, PartnerProfile>({
    mutationFn: async (p) => {
      if (!p.id) return;
      const { error } = await supabase.from("partner_profiles").delete().eq("id", p.id);
      if (error) throw error;
      try {
        await removeUploadedImage(p.logo_url);
      } catch {
        /* leftover file must not fail the delete */
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-partner-profiles"] });
      refreshPublic();
      showToast("Partner deleted");
    },
    onError: (e) => showToast(errMsg(e, "Failed to delete partner"), "error"),
  });

  /* ── Terms save/delete ── */
  const saveTerm = useMutation<void, unknown, PartnerTerm>({
    mutationFn: async (t) => {
      if (!t.title.trim() || !t.body.trim()) throw new Error("Title and text are required");
      const payload = { title: t.title.trim(), body: t.body.trim(), published: t.published, sort_order: t.sort_order };
      const { error } = t.id
        ? await supabase.from("partner_terms").update(payload).eq("id", t.id)
        : await supabase.from("partner_terms").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-partner-terms"] });
      refreshPublic();
      setEditingTerm(null);
      showToast("Term saved");
    },
    onError: (e) => showToast(errMsg(e, "Failed to save term"), "error"),
  });

  const deleteTerm = useMutation<void, unknown, PartnerTerm>({
    mutationFn: async (t) => {
      if (!t.id) return;
      const { error } = await supabase.from("partner_terms").delete().eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-partner-terms"] });
      refreshPublic();
      showToast("Term deleted");
    },
    onError: (e) => showToast(errMsg(e, "Failed to delete term"), "error"),
  });

  /* ── Applications ── */
  const updateApp = useMutation<void, unknown, { id: string; patch: Partial<PartnerApplication> }>({
    mutationFn: async ({ id, patch }) => {
      const { error } = await supabase.from("partner_applications").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-partner-applications"] }),
    onError: (e) => showToast(errMsg(e, "Failed to update application"), "error"),
  });

  const deleteApp = useMutation<void, unknown, PartnerApplication>({
    mutationFn: async (a) => {
      const { error } = await supabase.from("partner_applications").delete().eq("id", a.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-partner-applications"] });
      showToast("Application deleted");
    },
    onError: (e) => showToast(errMsg(e, "Failed to delete application"), "error"),
  });

  const convertToPartner = (a: PartnerApplication) => {
    setEditingPartner({
      ...emptyPartner(nextOrder(partners)),
      name: a.organization_name,
      website_url: a.website,
      category: a.field,
      background: a.offering,
      contact_person: a.contact_name,
      contact_email: a.email,
      contact_phone: a.phone,
      location: a.country,
    });
    setTab("directory");
    if (a.status !== "approved") updateApp.mutate({ id: a.id, patch: { status: "approved" } });
  };

  /* ── Reorder ── */
  const moveItem = async (
    table: string,
    listKey: string,
    items: { id?: string; sort_order: number }[],
    index: number,
    direction: "up" | "down"
  ) => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= items.length || reordering) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);

    setReordering(true);
    try {
      const changes = next.map((item, i) => ({ item, i })).filter(({ item, i }) => item.id && item.sort_order !== i);
      const results = await Promise.all(
        changes.map(({ item, i }) => supabase.from(table).update({ sort_order: i }).eq("id", item.id as string))
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    } catch (e) {
      showToast(errMsg(e, "Failed to reorder"), "error");
    } finally {
      setReordering(false);
      qc.invalidateQueries({ queryKey: [listKey] });
      refreshPublic();
    }
  };

  /* ── Logo upload ── */
  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const url = await uploadImage(file, "partner-logos");
      setEditingPartner((prev) => (prev ? { ...prev, logo_url: url } : prev));
      showToast("Logo uploaded. Click Save to publish it");
    } catch (e) {
      showToast(errMsg(e, "Failed to upload logo"), "error");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof Building2; badge?: number }[] = [
    { id: "directory", label: "Partner Directory", icon: Building2 },
    { id: "applications", label: "Applications", icon: Inbox, badge: newCount },
    { id: "terms", label: "Terms", icon: FileText },
  ];

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="min-h-screen bg-[#FBF9F5]">
      <div className="border-b border-[#E8E2D6] bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1 className="font-display text-2xl text-[#1A1A16] tracking-tight">Manage Partners</h1>
          <p className="font-body text-sm text-[#524646]/70 mt-0.5">
            The public Partners page: directory, incoming applications and terms. The homepage Trusted By strip is edited
            in Manage Content.
          </p>
          <div className="flex flex-wrap gap-1 mt-5 -mb-px">
            {tabs.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-body rounded-t-md transition-colors ${
                  tab === id
                    ? "bg-[#FBF9F5] text-[#007979] border border-[#E8E2D6] border-b-[#FBF9F5] font-medium"
                    : "text-[#524646]/70 hover:text-[#007979]"
                }`}
              >
                <Icon size={15} />
                {label}
                {badge ? (
                  <span className="text-[10px] font-bold bg-[#EC5B38] text-white rounded-full px-1.5 py-0.5">{badge}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* ══════ DIRECTORY ══════ */}
          {tab === "directory" && (
            <TabPane key="directory">
              <TabHeader
                description="Partners shown on the public Partners page, with logo, background, offerings and contact details."
                actionLabel="Add Partner"
                onAction={() => setEditingPartner(emptyPartner(nextOrder(partners)))}
              />
              <ListState
                loading={partnersQ.isPending}
                error={partnersQ.error}
                isEmpty={partners.length === 0}
                emptyTitle="No partners yet"
                emptyDescription="Add a partner, or convert an approved application."
                onAdd={() => setEditingPartner(emptyPartner(0))}
              >
                <div className="space-y-3">
                  {partners.map((p, idx) => (
                    <div key={p.id} className="group bg-white border border-[#E8E2D6] rounded-xl p-4 flex items-start gap-4">
                      <MoveButtons
                        index={idx}
                        total={partners.length}
                        busy={reordering}
                        onMove={(d) => moveItem("partner_profiles", "admin-partner-profiles", partners, idx, d)}
                      />
                      <div className="w-28 h-20 rounded-lg bg-[#FBF9F5] border border-[#E8E2D6] flex items-center justify-center overflow-hidden p-2 shrink-0">
                        {p.logo_url ? (
                          <img src={p.logo_url} alt={p.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <ImageIcon size={22} className="text-[#524646]/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display text-lg text-[#1A1A16]">{p.name}</h3>
                          {p.category && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#007979]/10 text-[#007979]">{p.category}</span>}
                          {!p.published && <DraftBadge />}
                        </div>
                        {p.tagline && <p className="font-body text-sm text-[#524646]/80">{p.tagline}</p>}
                        <p className="font-body text-[11px] text-[#9A9A9A] mt-1 truncate">
                          {p.website_url ? hostname(p.website_url) : "No website"}
                          {p.contact_email ? ` · ${p.contact_email}` : ""}
                          {p.offerings.length ? ` · ${p.offerings.length} offerings` : ""}
                        </p>
                      </div>
                      <RowActions
                        onEdit={() => setEditingPartner(p)}
                        onDelete={() => {
                          if (confirm(`Delete partner "${p.name}"?`)) deletePartner.mutate(p);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </ListState>
            </TabPane>
          )}

          {/* ══════ APPLICATIONS ══════ */}
          {tab === "applications" && (
            <TabPane key="applications" className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-body text-sm text-[#524646]/70">
                  Submitted from the Partners page. Approve an application to turn it into a directory entry.
                </p>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "all")}
                  className="px-3 py-2 border border-[#E8E2D6] rounded-lg font-body text-sm bg-white"
                  aria-label="Filter by status"
                >
                  <option value="all">All statuses ({apps.length})</option>
                  {APPLICATION_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label} ({apps.filter((a) => a.status === s.value).length})
                    </option>
                  ))}
                </select>
              </div>

              <ListState
                loading={appsQ.isPending}
                error={appsQ.error}
                isEmpty={shownApps.length === 0}
                emptyTitle={apps.length === 0 ? "No applications yet" : "No applications with this status"}
                emptyDescription="New applications from the Partners page appear here."
              >
                <div className="space-y-4">
                  {shownApps.map((a) => (
                    <ApplicationCard
                      key={a.id}
                      app={a}
                      onStatus={(status) => updateApp.mutate({ id: a.id, patch: { status } })}
                      onNotes={(admin_notes) => updateApp.mutate({ id: a.id, patch: { admin_notes } })}
                      onConvert={() => convertToPartner(a)}
                      onDelete={() => {
                        if (confirm(`Delete the application from "${a.organization_name}"?`)) deleteApp.mutate(a);
                      }}
                    />
                  ))}
                </div>
              </ListState>
            </TabPane>
          )}

          {/* ══════ TERMS ══════ */}
          {tab === "terms" && (
            <TabPane key="terms">
              <TabHeader
                description="How to partner with us. Shown as numbered terms on the Partners page, above the application form."
                actionLabel="Add Term"
                onAction={() => setEditingTerm({ title: "", body: "", published: true, sort_order: nextOrder(terms) })}
              />
              <ListState
                loading={termsQ.isPending}
                error={termsQ.error}
                isEmpty={terms.length === 0}
                emptyTitle="No terms yet"
                emptyDescription="Until you add some, the Partners page shows a default set."
                onAdd={() => setEditingTerm({ title: "", body: "", published: true, sort_order: 0 })}
              >
                <div className="space-y-3">
                  {terms.map((t, idx) => (
                    <div key={t.id} className="group bg-white border border-[#E8E2D6] rounded-xl p-5 flex items-start gap-4">
                      <MoveButtons
                        index={idx}
                        total={terms.length}
                        busy={reordering}
                        onMove={(d) => moveItem("partner_terms", "admin-partner-terms", terms, idx, d)}
                      />
                      <div className="w-8 h-8 rounded-full bg-[#007979] text-[#FFE2AF] font-display text-sm font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-lg text-[#1A1A16]">{t.title}</h3>
                          {!t.published && <DraftBadge />}
                        </div>
                        <p className="font-body text-sm text-[#524646]/80 mt-1 leading-relaxed">{t.body}</p>
                      </div>
                      <RowActions
                        onEdit={() => setEditingTerm(t)}
                        onDelete={() => {
                          if (confirm("Delete this term?")) deleteTerm.mutate(t);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </ListState>
            </TabPane>
          )}
        </AnimatePresence>
      </div>

      {/* ══════ MODALS ══════ */}
      <AnimatePresence>
        {editingPartner && (
          <Modal
            wide
            title={editingPartner.id ? "Edit Partner" : "New Partner"}
            onClose={() => setEditingPartner(null)}
          >
            <PartnerForm
              value={editingPartner}
              onChange={setEditingPartner}
              uploadingLogo={uploadingLogo}
              logoInputRef={logoInputRef}
              onLogoFile={handleLogoUpload}
            />
            <ModalActions
              onCancel={() => setEditingPartner(null)}
              onSave={() => savePartner.mutate(editingPartner)}
              saving={savePartner.isPending}
              disabled={!editingPartner.name.trim() || uploadingLogo}
            />
          </Modal>
        )}

        {editingTerm && (
          <Modal title={editingTerm.id ? "Edit Term" : "New Term"} onClose={() => setEditingTerm(null)}>
            <div className="space-y-4">
              <Field
                label="Title"
                value={editingTerm.title}
                onChange={(v) => setEditingTerm({ ...editingTerm, title: v })}
                placeholder="Clear roles"
              />
              <Field
                label="Text"
                value={editingTerm.body}
                onChange={(v) => setEditingTerm({ ...editingTerm, body: v })}
                multiline
                rows={5}
              />
              <Checkbox
                label="Published"
                checked={editingTerm.published}
                onChange={(c) => setEditingTerm({ ...editingTerm, published: c })}
              />
              <ModalActions
                onCancel={() => setEditingTerm(null)}
                onSave={() => saveTerm.mutate(editingTerm)}
                saving={saveTerm.isPending}
                disabled={!editingTerm.title.trim() || !editingTerm.body.trim()}
              />
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={closeToast} />}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PARTNER FORM
═══════════════════════════════════════════════════════════ */
function PartnerForm({
  value: p,
  onChange,
  uploadingLogo,
  logoInputRef,
  onLogoFile,
}: {
  value: PartnerProfile;
  onChange: (p: PartnerProfile) => void;
  uploadingLogo: boolean;
  logoInputRef: React.RefObject<HTMLInputElement>;
  onLogoFile: (f: File) => void;
}) {
  // offerings are edited as free text (one per line) and parsed on every change
  const [offeringsText, setOfferingsText] = useState(p.offerings.join("\n"));
  const set = (patch: Partial<PartnerProfile>) => onChange({ ...p, ...patch });

  return (
    <div className="space-y-6">
      <Section title="Identity">
        <Field label="Company / Partner Name *" value={p.name} onChange={(v) => set({ name: v })} placeholder="Acme Corporation" />
        <Field label="Tagline" value={p.tagline ?? ""} onChange={(v) => set({ tagline: v })} placeholder="One line on who they are" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Category" value={p.category ?? ""} onChange={(v) => set({ category: v })} placeholder="Technology, NGO, Finance…" />
          <Field label="Partner since" value={p.partner_since ?? ""} onChange={(v) => set({ partner_since: v })} placeholder="2024" />
        </div>
      </Section>

      <Section title="Logo (shown large on the Partners page)">
        <div className="flex items-center gap-4">
          <div className="relative w-40 h-24 rounded-lg bg-[#FBF9F5] border border-[#E8E2D6] flex items-center justify-center overflow-hidden p-2 shrink-0">
            {p.logo_url ? (
              <img src={p.logo_url} alt="Logo preview" className="max-h-full max-w-full object-contain" />
            ) : (
              <ImageIcon size={26} className="text-[#524646]/30" />
            )}
            {uploadingLogo && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={18} />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              ref={logoInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onLogoFile(file);
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#007979] text-[#FFE2AF] rounded-lg text-xs font-body font-medium hover:bg-[#24B1B1] disabled:opacity-60"
              >
                <UploadCloud size={14} /> Upload
              </button>
              {p.logo_url && (
                <button
                  type="button"
                  onClick={() => set({ logo_url: null })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-body font-medium hover:bg-red-100"
                >
                  <Trash2 size={13} /> Clear
                </button>
              )}
            </div>
            <p className="font-body text-[11px] text-[#524646]/60">
              Wide PNG/SVG with transparent background, at least 600px wide. Up to {MAX_UPLOAD_MB}MB.
            </p>
          </div>
        </div>
        <Field label="Or paste a logo URL" value={p.logo_url ?? ""} onChange={(v) => set({ logo_url: v })} placeholder="https://…/logo.png" />
      </Section>

      <Section title="About">
        <Field
          label="Background"
          value={p.background ?? ""}
          onChange={(v) => set({ background: v })}
          multiline
          rows={4}
          placeholder="Short history and what the organisation does"
        />
        <Field
          label="What they offer (one per line)"
          value={offeringsText}
          onChange={(v) => {
            setOfferingsText(v);
            set({ offerings: linesToArray(v) });
          }}
          multiline
          rows={4}
          placeholder={"Payment gateway integration\nCloud hosting\nStaff training"}
        />
      </Section>

      <Section title="Links (used to tag and link them)">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Website" value={p.website_url ?? ""} onChange={(v) => set({ website_url: v })} placeholder="acme.com" />
          <Field label="LinkedIn" value={p.linkedin_url ?? ""} onChange={(v) => set({ linkedin_url: v })} placeholder="linkedin.com/company/acme" />
        </div>
      </Section>

      <Section title="Contact details">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Contact person" value={p.contact_person ?? ""} onChange={(v) => set({ contact_person: v })} />
          <Field label="Email" value={p.contact_email ?? ""} onChange={(v) => set({ contact_email: v })} />
          <Field label="Phone" value={p.contact_phone ?? ""} onChange={(v) => set({ contact_phone: v })} placeholder="+254 …" />
          <Field label="Location" value={p.location ?? ""} onChange={(v) => set({ location: v })} placeholder="Nairobi, Kenya" />
        </div>
      </Section>

      <Checkbox label="Published on the Partners page" checked={p.published} onChange={(c) => set({ published: c })} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   APPLICATION CARD
═══════════════════════════════════════════════════════════ */
function ApplicationCard({
  app: a,
  onStatus,
  onNotes,
  onConvert,
  onDelete,
}: {
  app: PartnerApplication;
  onStatus: (s: ApplicationStatus) => void;
  onNotes: (notes: string) => void;
  onConvert: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(a.status === "new");

  return (
    <div className="bg-white border border-[#E8E2D6] rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button onClick={() => setOpen(!open)} className="text-left min-w-0" aria-expanded={open}>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-lg text-[#1A1A16]">{a.organization_name}</h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_STYLE[a.status]}`}>
              {APPLICATION_STATUSES.find((s) => s.value === a.status)?.label}
            </span>
          </div>
          <p className="font-body text-xs text-[#9A9A9A] mt-0.5">
            {a.field} · {a.partnership_type} · {new Date(a.created_at).toLocaleDateString()}
          </p>
        </button>

        <div className="flex items-center gap-2">
          <select
            value={a.status}
            onChange={(e) => onStatus(e.target.value as ApplicationStatus)}
            className="px-2.5 py-1.5 border border-[#E8E2D6] rounded-lg font-body text-xs bg-white"
            aria-label="Application status"
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={onConvert}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#007979] text-[#FFE2AF] rounded-lg text-xs font-medium hover:bg-[#24B1B1]"
          >
            <UserPlus size={13} /> Add to directory
          </button>
          <button onClick={onDelete} aria-label="Delete application" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-[#E8E2D6] grid gap-5 md:grid-cols-2 font-body text-sm text-[#524646]">
          <dl className="space-y-1.5">
            <Row label="Contact">{a.contact_name}{a.job_title ? `, ${a.job_title}` : ""}</Row>
            <Row label="Email">
              <a href={`mailto:${a.email}`} className="text-[#007979] hover:underline inline-flex items-center gap-1">
                <Mail size={12} /> {a.email}
              </a>
            </Row>
            {a.phone && (
              <Row label="Phone">
                <a href={`tel:${a.phone.replace(/\s+/g, "")}`} className="text-[#007979] hover:underline inline-flex items-center gap-1">
                  <Phone size={12} /> {a.phone}
                </a>
              </Row>
            )}
            {a.website && (
              <Row label="Website">
                <a href={a.website} target="_blank" rel="noopener noreferrer" className="text-[#007979] hover:underline">
                  {hostname(a.website)}
                </a>
              </Row>
            )}
            <Row label="Department">{a.department}</Row>
            <Row label="Field">{a.field}</Row>
            {a.country && <Row label="Country">{a.country}</Row>}
          </dl>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#524646]/60 mb-1">Can offer</p>
              <p className="whitespace-pre-line leading-relaxed">{a.offering}</p>
            </div>
            {a.message && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#524646]/60 mb-1">Message</p>
                <p className="whitespace-pre-line leading-relaxed">{a.message}</p>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest text-[#524646]/60 mb-1">Internal notes</label>
            <textarea
              defaultValue={a.admin_notes ?? ""}
              onBlur={(e) => {
                if ((a.admin_notes ?? "") !== e.target.value) onNotes(e.target.value);
              }}
              rows={2}
              placeholder="Only visible to you"
              className="w-full px-3 py-2 border border-[#E8E2D6] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#007979]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-[#524646]/60">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SMALL UI PRIMITIVES
═══════════════════════════════════════════════════════════ */
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, type === "error" ? 6000 : 3200);
    return () => clearTimeout(t);
  }, [onClose, type]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      role="status"
      className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-lg border max-w-sm ${
        type === "success" ? "bg-white border-emerald-200 text-emerald-800" : "bg-white border-red-200 text-red-800"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
      ) : (
        <AlertCircle size={18} className="text-red-500 shrink-0" />
      )}
      <span className="font-body text-sm font-medium">{message}</span>
      <button onClick={onClose} aria-label="Dismiss" className="ml-2 opacity-50 hover:opacity-100">
        <X size={14} />
      </button>
    </motion.div>
  );
}

function TabPane({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-[#007979]" size={28} />
    </div>
  );
}

function QueryError({ error }: { error: unknown }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5 max-w-2xl">
      <p className="font-display text-base text-red-800">Could not load this section</p>
      <p className="font-body text-sm text-red-700 mt-1">{errMsg(error, "Unknown error")}</p>
      <p className="font-body text-xs text-red-700/80 mt-2">
        If a table is missing, run <code>supabase/partners_program.sql</code> in the Supabase SQL editor and reload.
      </p>
    </div>
  );
}

function ListState({
  loading,
  error,
  isEmpty,
  emptyTitle,
  emptyDescription,
  onAdd,
  children,
}: {
  loading: boolean;
  error: unknown;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  if (loading) return <Spinner />;
  if (error) return <QueryError error={error} />;
  if (isEmpty) {
    return (
      <div className="bg-white border border-dashed border-[#E8E2D6] rounded-xl py-16 text-center px-4">
        <ClipboardList className="mx-auto text-[#524646]/30 mb-2" size={28} />
        <p className="font-display text-lg text-[#1A1A16]">{emptyTitle}</p>
        <p className="font-body text-sm text-[#524646]/70 mt-1">{emptyDescription}</p>
        {onAdd && (
          <button
            onClick={onAdd}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-medium hover:bg-[#24B1B1]"
          >
            <Plus size={16} /> Add first item
          </button>
        )}
      </div>
    );
  }
  return <>{children}</>;
}

function TabHeader({ description, actionLabel, onAction }: { description: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <p className="font-body text-sm text-[#524646]/70 max-w-2xl">{description}</p>
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-body font-medium hover:bg-[#24B1B1] transition-colors shrink-0"
      >
        <Plus size={16} /> {actionLabel}
      </button>
    </div>
  );
}

function DraftBadge() {
  return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Draft</span>;
}

function MoveButtons({
  index,
  total,
  busy,
  onMove,
}: {
  index: number;
  total: number;
  busy: boolean;
  onMove: (direction: "up" | "down") => void;
}) {
  return (
    <div className="flex flex-col gap-1 text-[#9A9A9A] pt-1">
      <button onClick={() => onMove("up")} disabled={index === 0 || busy} aria-label="Move up" className="hover:text-[#007979] disabled:opacity-30">
        <ArrowUp size={14} />
      </button>
      <button onClick={() => onMove("down")} disabled={index === total - 1 || busy} aria-label="Move down" className="hover:text-[#007979] disabled:opacity-30">
        <ArrowDown size={14} />
      </button>
    </div>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
      <button onClick={onEdit} aria-label="Edit" className="p-2 rounded-lg hover:bg-[#FBF9F5] text-[#524646]">
        <Pencil size={16} />
      </button>
      <button onClick={onDelete} aria-label="Delete" className="p-2 rounded-lg hover:bg-red-50 text-red-500">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-base text-[#1A1A16] border-b border-[#E8E2D6] pb-1.5">{title}</h3>
      {children}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 font-body text-sm text-[#524646] cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded border-[#E8E2D6]" />
      {label}
    </label>
  );
}

function ModalActions({
  onCancel,
  onSave,
  saving,
  disabled,
}: {
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <button onClick={onCancel} className="px-4 py-2 text-sm font-body text-[#524646] hover:bg-[#FBF9F5] rounded-lg">
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving || disabled}
        className="inline-flex items-center gap-2 px-5 py-2 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-medium hover:bg-[#24B1B1] disabled:opacity-50"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        Save
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const cls =
    "w-full px-4 py-2.5 border border-[#E8E2D6] rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#007979]/30 focus:border-[#007979] bg-white";
  return (
    <div>
      <label className="block font-body text-xs uppercase tracking-widest text-[#524646]/70 mb-2">{label}</label>
      {multiline ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={cls + " resize-y"}
        />
      ) : (
        <input type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-white rounded-2xl shadow-xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto p-6 border border-[#E8E2D6]`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-[#1A1A16]">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-[#FBF9F5] text-[#524646]">
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}