import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { PopupBannerView, PopupModalView } from "@/components/popups/PopupViews";
import {
  AUDIENCE_OPTIONS,
  FLYER_HEIGHT,
  FLYER_WIDTH,
  FREQUENCY_OPTIONS,
  MODE_OPTIONS,
  PLACEMENT_OPTIONS,
  VARIANT_STYLES,
  type Popup,
  type PopupDraft,
  type Variant,
} from "@/components/popups/popupTypes";

const EMPTY_DRAFT: PopupDraft = {
  name: "",
  activity_tag: null,
  placement: "banner",
  display_mode: "text",
  variant: "amber",
  title: null,
  body: null,
  image_url: null,
  cta_label: null,
  cta_href: null,
  secondary_label: null,
  secondary_href: null,
  audience: "guests",
  page_scope: "*",
  frequency: "session",
  priority: 0,
  is_active: true,
  starts_at: null,
  ends_at: null,
};

const inputClass =
  "block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900";

function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

function toLocalInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-sm font-medium text-slate-800">{label}</span>
      {children}
    </label>
  );
}

function stateLabel(popup: Popup): { text: string; color: string } {
  const now = Date.now();
  if (!popup.is_active) return { text: "Off", color: "bg-slate-200 text-slate-700" };
  if (popup.starts_at && new Date(popup.starts_at).getTime() > now) return { text: "Scheduled", color: "bg-sky-100 text-sky-800" };
  if (popup.ends_at && new Date(popup.ends_at).getTime() < now) return { text: "Expired", color: "bg-rose-100 text-rose-800" };
  return { text: "Live", color: "bg-emerald-100 text-emerald-800" };
}

export default function ManagePopups() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [draft, setDraft] = useState<PopupDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase.from("popups").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setPopups((data ?? []) as Popup[]);
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const setField = <K extends keyof PopupDraft>(key: K, value: PopupDraft[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
  };

  const openForm = (next: PopupDraft, id: string | null = null) => {
    setDraft(next);
    setEditingId(id);
    setFormOpen(true);
  };

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setNotice({ type: "error", text: "Choose a JPG, PNG, or WebP image." });
      event.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setNotice({ type: "error", text: "Images must be 10 MB or smaller." });
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `flyers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
      const { error } = await supabase.storage.from("popup-images").upload(path, file, {
        contentType: file.type,
        cacheControl: "31536000",
      });
      if (error) throw error;
      const { data } = supabase.storage.from("popup-images").getPublicUrl(path);
      setField("image_url", data.publicUrl);
      setNotice({ type: "success", text: "Flyer uploaded." });
    } catch (error) {
      setNotice({ type: "error", text: errorMessage(error) });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    const needsText = draft.display_mode !== "image";
    const needsImage = draft.display_mode !== "text";
    const primaryLabel = draft.cta_label?.trim() ?? "";
    const primaryHref = draft.cta_href?.trim() ?? "";
    const secondaryLabel = draft.secondary_label?.trim() ?? "";
    const secondaryHref = draft.secondary_href?.trim() ?? "";
    const validHref = (href: string) => /^(\/(?!\/)|https?:\/\/|mailto:|tel:)/i.test(href);

    let validationError: string | null = null;
    if (!draft.name.trim()) validationError = "Add an internal name for this popup.";
    else if (needsText && !draft.title?.trim() && !draft.body?.trim()) validationError = "Add a title or message.";
    else if (needsImage && !draft.image_url) validationError = "Upload an image or choose a text-only popup.";
    else if ((primaryLabel && !primaryHref) || (!primaryLabel && primaryHref && !needsText)) validationError = "The main button needs both a label and a link.";
    else if ((secondaryLabel && !secondaryHref) || (!secondaryLabel && secondaryHref)) validationError = "The second button needs both a label and a link.";
    else if ((primaryHref && !validHref(primaryHref)) || (secondaryHref && !validHref(secondaryHref))) validationError = "Links must start with /, https://, mailto: or tel:.";
    else if (draft.starts_at && draft.ends_at && new Date(draft.ends_at) <= new Date(draft.starts_at)) validationError = "The end date must be after the start date.";

    if (validationError) {
      setNotice({ type: "error", text: validationError });
      return;
    }

    setSaving(true);
    const payload = {
      ...draft,
      name: draft.name.trim(),
      activity_tag: draft.activity_tag?.trim() || null,
      title: draft.title?.trim() || null,
      body: draft.body?.trim() || null,
      image_url: needsImage ? draft.image_url : null,
      cta_label: primaryLabel || null,
      cta_href: primaryHref || null,
      secondary_label: secondaryLabel || null,
      secondary_href: secondaryHref || null,
      page_scope: draft.page_scope.trim() || "*",
      priority: Number.isFinite(draft.priority) ? Math.trunc(draft.priority) : 0,
      updated_at: new Date().toISOString(),
    };

    try {
      const result = editingId
        ? await supabase.from("popups").update(payload).eq("id", editingId)
        : await supabase.from("popups").insert(payload);
      if (result.error) throw result.error;
      setNotice({ type: "success", text: editingId ? "Popup updated." : "Popup created." });
      setFormOpen(false);
      setEditingId(null);
      await load();
    } catch (error) {
      setNotice({ type: "error", text: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (popup: Popup) => {
    try {
      const { error } = await supabase.from("popups").update({
        is_active: !popup.is_active,
        updated_at: new Date().toISOString(),
      }).eq("id", popup.id);
      if (error) throw error;
      setNotice({ type: "success", text: popup.is_active ? "Popup turned off." : "Popup turned on." });
      await load();
    } catch (error) {
      setNotice({ type: "error", text: errorMessage(error) });
    }
  };

  const remove = async (popup: Popup) => {
    if (!window.confirm(`Delete "${popup.name}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from("popups").delete().eq("id", popup.id);
      if (error) throw error;
      setPopups((previous) => previous.filter((item) => item.id !== popup.id));
      setNotice({ type: "success", text: "Popup deleted." });
    } catch (error) {
      setNotice({ type: "error", text: errorMessage(error) });
    }
  };

  const needsImage = draft.display_mode !== "text";
  const needsText = draft.display_mode !== "image";
  const previewPopup: Popup = { ...draft, id: "preview", created_at: "", updated_at: "" };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Popups and banners</h1>
          <p className="text-sm text-slate-600">Create visitor alerts and flyers targeted by page, audience, and dates.</p>
        </div>
        {!formOpen && (
          <button type="button" onClick={() => openForm({ ...EMPTY_DRAFT })} className="min-h-[44px] bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            New popup
          </button>
        )}
      </div>

      {notice && (
        <div role="status" className={`flex items-center justify-between gap-3 border p-3 text-sm ${notice.type === "error" ? "border-rose-300 bg-rose-50 text-rose-900" : "border-emerald-300 bg-emerald-50 text-emerald-900"}`}>
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification" className="font-semibold">×</button>
        </div>
      )}

      {formOpen && (
        <form onSubmit={handleSave} className="grid min-w-0 gap-6 border border-slate-300 bg-white p-4 sm:p-6 lg:grid-cols-2">
          <div className="min-w-0 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit popup" : "New popup"}</h2>
            <Field label="Internal name">
              <input required maxLength={120} className={inputClass} value={draft.name} onChange={(event) => setField("name", event.target.value)} />
            </Field>
            <Field label="Activity label (optional)">
              <input maxLength={40} className={inputClass} value={draft.activity_tag ?? ""} onChange={(event) => setField("activity_tag", event.target.value || null)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Placement">
                <select className={inputClass} value={draft.placement} onChange={(event) => setField("placement", event.target.value as PopupDraft["placement"])}>
                  {PLACEMENT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </Field>
              <Field label="Content type">
                <select className={inputClass} value={draft.display_mode} onChange={(event) => setField("display_mode", event.target.value as PopupDraft["display_mode"])}>
                  {MODE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </Field>
            </div>

            {needsImage && (
              <Field label="Flyer image">
                {draft.image_url && (
                  <div className="relative mb-2">
                    <img src={draft.image_url} alt="Popup flyer preview" width={FLYER_WIDTH} height={FLYER_HEIGHT} className="aspect-video w-full border object-cover" />
                    <button type="button" onClick={() => setField("image_url", null)} className="absolute right-2 top-2 bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">Remove</button>
                  </div>
                )}
                <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="block w-full text-sm text-slate-600 file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-2" />
                <span className="mt-1 block text-xs text-slate-500">{uploading ? "Uploading..." : `JPG, PNG or WebP, up to 10 MB. Recommended ${FLYER_WIDTH} x ${FLYER_HEIGHT} (16:9).`}</span>
              </Field>
            )}

            {needsText && (
              <>
                <Field label="Title">
                  <input maxLength={120} className={inputClass} value={draft.title ?? ""} onChange={(event) => setField("title", event.target.value || null)} />
                </Field>
                <Field label="Message">
                  <textarea rows={4} maxLength={500} className={inputClass} value={draft.body ?? ""} onChange={(event) => setField("body", event.target.value || null)} />
                </Field>
              </>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Main button label">
                <input maxLength={40} className={inputClass} value={draft.cta_label ?? ""} onChange={(event) => setField("cta_label", event.target.value || null)} />
              </Field>
              <Field label="Main button link">
                <input className={inputClass} placeholder="/contact or https://..." value={draft.cta_href ?? ""} onChange={(event) => setField("cta_href", event.target.value || null)} />
              </Field>
              {needsText && (
                <>
                  <Field label="Second button label">
                    <input maxLength={40} className={inputClass} value={draft.secondary_label ?? ""} onChange={(event) => setField("secondary_label", event.target.value || null)} />
                  </Field>
                  <Field label="Second button link">
                    <input className={inputClass} value={draft.secondary_href ?? ""} onChange={(event) => setField("secondary_href", event.target.value || null)} />
                  </Field>
                </>
              )}
            </div>

            <Field label="Color style">
              <div className="flex flex-wrap gap-2 pt-1">
                {(Object.keys(VARIANT_STYLES) as Variant[]).map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    aria-label={`${variant} color`}
                    aria-pressed={draft.variant === variant}
                    onClick={() => setField("variant", variant)}
                    className={`h-9 w-9 ${VARIANT_STYLES[variant].swatch} ${draft.variant === variant ? "ring-2 ring-slate-900 ring-offset-2" : ""}`}
                  />
                ))}
              </div>
            </Field>

            <h3 className="border-t border-slate-200 pt-4 text-sm font-semibold text-slate-900">Audience, timing, and display</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Audience">
                <select className={inputClass} value={draft.audience} onChange={(event) => setField("audience", event.target.value as PopupDraft["audience"])}>
                  {AUDIENCE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </Field>
              <Field label="How often">
                <select className={inputClass} value={draft.frequency} onChange={(event) => setField("frequency", event.target.value as PopupDraft["frequency"])}>
                  {FREQUENCY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </Field>
              <Field label="Pages (comma-separated paths, or *)">
                <input className={inputClass} value={draft.page_scope} onChange={(event) => setField("page_scope", event.target.value)} />
              </Field>
              <Field label="Priority (higher displays first)">
                <input type="number" className={inputClass} value={draft.priority} onChange={(event) => setField("priority", event.target.value === "" ? 0 : Number(event.target.value))} />
              </Field>
              <Field label="Starts (optional)">
                <input type="datetime-local" className={inputClass} value={toLocalInput(draft.starts_at)} onChange={(event) => setField("starts_at", fromLocalInput(event.target.value))} />
              </Field>
              <Field label="Ends (optional)">
                <input type="datetime-local" className={inputClass} value={toLocalInput(draft.ends_at)} onChange={(event) => setField("ends_at", fromLocalInput(event.target.value))} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-800">
              <input type="checkbox" checked={draft.is_active} onChange={(event) => setField("is_active", event.target.checked)} />
              Active
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="submit" disabled={saving || uploading} className="min-h-[44px] bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
                {saving ? "Saving..." : editingId ? "Save changes" : "Create popup"}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className="min-h-[44px] border border-slate-900 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                Cancel
              </button>
            </div>
          </div>

          <div className="min-w-0 lg:sticky lg:top-4 lg:self-start">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Live preview</h3>
            <div className="border border-dashed border-slate-300 bg-slate-100 p-3">
              {needsImage && !draft.image_url ? (
                <p className="p-6 text-center text-sm text-slate-500">Upload a flyer to see the preview.</p>
              ) : draft.placement === "banner" ? (
                <PopupBannerView popup={previewPopup} preview />
              ) : (
                <PopupModalView popup={previewPopup} preview />
              )}
            </div>
          </div>
        </form>
      )}

      {loading && <p className="text-sm text-slate-500">Loading popups...</p>}
      {loadError && (
        <div className="border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">
          Could not load popups: {loadError}{" "}
          <button type="button" onClick={() => void load()} className="font-semibold underline">Retry</button>
        </div>
      )}
      {!loading && !loadError && popups.length === 0 && <p className="text-sm text-slate-500">No popups yet. Create your first one above.</p>}

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {popups.map((popup) => {
          const state = stateLabel(popup);
          return (
            <li key={popup.id} className="flex min-w-0 flex-col border border-slate-300 bg-white">
              {popup.image_url ? (
                <img src={popup.image_url} alt="" width={FLYER_WIDTH} height={FLYER_HEIGHT} loading="lazy" className="aspect-video w-full object-cover" />
              ) : (
                <div className={`flex aspect-video items-center justify-center px-4 text-center text-sm font-semibold ${VARIANT_STYLES[popup.variant].alert}`}>
                  {popup.title || popup.name}
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-semibold ${state.color}`}>{state.text}</span>
                  <span className="bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{popup.placement === "banner" ? "Alert banner" : "Popup"}</span>
                  <span className="bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{AUDIENCE_OPTIONS.find((option) => option.value === popup.audience)?.label}</span>
                </div>
                <p className="break-words text-sm font-semibold text-slate-900">{popup.name}</p>
                <p className="break-words text-xs text-slate-500">Pages: {popup.page_scope}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <button type="button" onClick={() => {
                    const { id: _id, created_at: _created, updated_at: _updated, ...content } = popup;
                    void _id;
                    void _created;
                    void _updated;
                    openForm(content, popup.id);
                  }} className="min-h-[36px] border border-slate-900 px-3 text-xs font-semibold text-slate-900 hover:bg-slate-100">
                    Edit
                  </button>
                  <button type="button" onClick={() => {
                    const { id: _id, created_at: _created, updated_at: _updated, ...content } = popup;
                    void _id;
                    void _created;
                    void _updated;
                    openForm({ ...content, name: `${popup.name} (copy)`, is_active: false });
                  }} className="min-h-[36px] border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Duplicate
                  </button>
                  <button type="button" onClick={() => void toggleActive(popup)} className="min-h-[36px] border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    {popup.is_active ? "Turn off" : "Turn on"}
                  </button>
                  <button type="button" onClick={() => void remove(popup)} className="min-h-[36px] border border-rose-400 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                    Delete
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
