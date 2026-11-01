import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ImagePlus, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isOfferActive, type Offer, type OfferTarget } from "@/lib/servicePricing";

type SelectableItem = { id: string; name: string };
type OfferForm = {
  target_type: OfferTarget;
  target_id: string;
  enabled: boolean;
  title: string;
  description: string;
  currency: "KES" | "USD";
  discount_type: "percentage" | "fixed";
  discount_value: string;
  starts_at: string;
  ends_at: string;
  show_on_home: boolean;
  banner_image_url: string;
  banner_format: "banner" | "flyer";
  banner_alt: string;
  cta_text: string;
  cta_link: string;
  sort_order: number;
};

const emptyForm: OfferForm = {
  target_type: "all",
  target_id: "",
  enabled: false,
  title: "",
  description: "",
  currency: "KES",
  discount_type: "percentage",
  discount_value: "",
  starts_at: "",
  ends_at: "",
  show_on_home: false,
  banner_image_url: "",
  banner_format: "banner",
  banner_alt: "",
  cta_text: "View offer",
  cta_link: "",
  sort_order: 0,
};

const toDateTimeInput = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

const readError = (error: unknown) =>
  error instanceof Error ? error.message : "The request could not be completed.";

async function uploadBanner(file: File): Promise<string> {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowedTypes.includes(file.type)) throw new Error("Use a JPG, PNG, WebP or AVIF image.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Banner image must be 5 MB or smaller.");

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `offers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

async function validateArtwork(file: File, format: "banner" | "flyer") {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  try {
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error("This image could not be opened. Try another file."));
      image.src = objectUrl;
    });
    const ratio = dimensions.width / dimensions.height;
    const isBanner = format === "banner";
    const minWidth = isBanner ? 1280 : 800;
    const minHeight = isBanner ? 400 : 1000;
    const targetRatio = isBanner ? 3.2 : 0.8;
    if (dimensions.width < minWidth || dimensions.height < minHeight || Math.abs(ratio - targetRatio) > 0.15) {
      throw new Error(
        isBanner
          ? "Use a landscape banner around 1920 × 600 px (minimum 1280 × 400 px)."
          : "Use a portrait flyer around 1080 × 1350 px (minimum 800 × 1000 px).",
      );
    }
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function ManageOffers() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const offersQuery = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async (): Promise<Offer[]> => {
      const { data, error } = await supabase.from("offers").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Offer[];
    },
  });
  const servicesQuery = useQuery({
    queryKey: ["offer-service-options"],
    queryFn: async (): Promise<SelectableItem[]> => {
      const { data, error } = await supabase.from("services").select("id,name").order("name");
      if (error) throw error;
      return (data ?? []) as SelectableItem[];
    },
  });
  const coursesQuery = useQuery({
    queryKey: ["offer-course-options"],
    queryFn: async (): Promise<SelectableItem[]> => {
      const { data, error } = await supabase.from("courses").select("id,name").order("name");
      if (error) throw error;
      return (data ?? []) as SelectableItem[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const discountValue = Number(form.discount_value);
      if (!Number.isFinite(discountValue) || discountValue <= 0) {
        throw new Error("Enter a discount greater than zero.");
      }
      if (form.discount_type === "percentage" && discountValue > 100) {
        throw new Error("A percentage discount cannot exceed 100%.");
      }
      if (!form.title.trim()) throw new Error("Enter an offer title.");
      if ((form.target_type === "service" || form.target_type === "course") && !form.target_id) {
        throw new Error("Choose the specific service or course for this offer.");
      }
      if (form.show_on_home && !form.banner_image_url) {
        throw new Error("Upload a banner image before showing this offer on the homepage.");
      }
      if (form.starts_at && form.ends_at && new Date(form.ends_at) <= new Date(form.starts_at)) {
        throw new Error("The end date must be after the start date.");
      }
      const { error } = await supabase.from("offers").upsert({
        ...(editingId ? { id: editingId } : {}),
        target_type: form.target_type,
        target_id: form.target_type === "service" || form.target_type === "course" ? form.target_id : null,
        enabled: form.enabled,
        title: form.title.trim(),
        description: form.description.trim(),
        currency: form.currency,
        discount_type: form.discount_type,
        discount_value: discountValue,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        show_on_home: form.show_on_home,
        banner_image_url: form.banner_image_url || null,
        banner_format: form.banner_format,
        banner_alt: form.banner_alt.trim(),
        cta_text: form.cta_text.trim() || "View offer",
        cta_link: form.cta_link.trim(),
        sort_order: Math.max(0, Math.floor(form.sort_order)),
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onMutate: () => setErrorMessage(null),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-offers"] }),
        queryClient.invalidateQueries({ queryKey: ["offers"] }),
      ]);
      closeForm();
    },
    onError: (error: Error) => setErrorMessage(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-offers"] }),
        queryClient.invalidateQueries({ queryKey: ["offers"] }),
      ]);
    },
    onError: (error: Error) => setErrorMessage(error.message),
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setErrorMessage(null);
    setForm(emptyForm);
  };

  const beginEdit = (offer: Offer) => {
    setEditingId(offer.id);
    setErrorMessage(null);
    setForm({
      target_type: offer.target_type,
      target_id: offer.target_id || "",
      enabled: offer.enabled,
      title: offer.title,
      description: offer.description,
      currency: offer.currency,
      discount_type: offer.discount_type,
      discount_value: String(offer.discount_value),
      starts_at: toDateTimeInput(offer.starts_at),
      ends_at: toDateTimeInput(offer.ends_at),
      show_on_home: offer.show_on_home,
      banner_image_url: offer.banner_image_url || "",
      banner_format: offer.banner_format || "banner",
      banner_alt: offer.banner_alt,
      cta_text: offer.cta_text,
      cta_link: offer.cta_link,
      sort_order: offer.sort_order,
    });
    setFormOpen(true);
  };

  const selectableItems = form.target_type === "service"
    ? servicesQuery.data ?? []
    : coursesQuery.data ?? [];
  const targetLabel: Record<OfferTarget, string> = {
    all: "All services and courses",
    services: "All services",
    courses: "All courses",
    service: "One service",
    course: "One course",
  };

  const setField = <K extends keyof OfferForm>(key: K, value: OfferForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setErrorMessage(null);
    setUploading(true);
    try {
      await validateArtwork(file, form.banner_format);
      setField("banner_image_url", await uploadBanner(file));
    } catch (error) {
      setErrorMessage(readError(error));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Marketing</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Offers &amp; homepage banners</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Create multiple scheduled discounts for all services, all courses, or a specific item.
            Course prices are in USD and service prices are in KES; fixed discounts apply only to their selected currency.
            Add an uploaded banner to feature any active offer in the homepage carousel.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setForm({ ...emptyForm, sort_order: offersQuery.data?.length ?? 0 }); setEditingId(null); setErrorMessage(null); setFormOpen(true); }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 font-semibold text-white hover:bg-teal-900"
        >
          <Plus size={16} /> Create offer
        </button>
      </header>

      {offersQuery.error && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Could not load offers: {readError(offersQuery.error)}
        </p>
      )}
      {(servicesQuery.error || coursesQuery.error) && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Could not load the service/course options: {readError(servicesQuery.error || coursesQuery.error)}
        </p>
      )}
      {errorMessage && !formOpen && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />{errorMessage}
        </p>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {offersQuery.isPending ? (
          <p className="text-sm text-slate-500">Loading offers…</p>
        ) : offersQuery.data?.length ? offersQuery.data.map((offer) => (
          <article key={offer.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {offer.banner_image_url && (
              <img src={offer.banner_image_url} alt={offer.banner_alt} className="aspect-[16/7] w-full object-cover" />
            )}
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-slate-900">{offer.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {offer.discount_type === "percentage" ? `${offer.discount_value}% off` : `${offer.currency} ${offer.discount_value} off`}
                    {" · "}{targetLabel[offer.target_type]}
                    {(offer.target_type === "service" || offer.target_type === "course") && ` · ${[...(servicesQuery.data ?? []), ...(coursesQuery.data ?? [])].find((item) => item.id === offer.target_id)?.name ?? offer.target_id}`}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${isOfferActive(offer) ? "bg-emerald-100 text-emerald-800" : offer.enabled ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                  {isOfferActive(offer) ? "Active" : offer.enabled ? "Scheduled / expired" : "Disabled"}
                </span>
              </div>
              {offer.description && <p className="text-sm text-slate-600">{offer.description}</p>}
              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                {offer.show_on_home && <span className="rounded bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">Homepage carousel</span>}
                {offer.ends_at && <span className="text-xs text-slate-500">Ends {new Date(offer.ends_at).toLocaleString()}</span>}
                <span className="ml-auto flex gap-2">
                  <button type="button" onClick={() => beginEdit(offer)} className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                    <Pencil size={13} /> Edit
                  </button>
                  <button type="button" disabled={deleteMutation.isPending} onClick={() => {
                    if (window.confirm(`Delete "${offer.title}"?`)) deleteMutation.mutate(offer.id);
                  }} className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">
                    <Trash2 size={13} /> Delete
                  </button>
                </span>
              </div>
            </div>
          </article>
        )) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 md:col-span-2">
            No offers yet. Create one to set a discount or add a homepage banner.
          </p>
        )}
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <form
            onSubmit={(event) => { event.preventDefault(); saveMutation.mutate(); }}
            className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b bg-slate-50 p-4">
              <h2 className="font-bold text-slate-900">{editingId ? "Edit offer" : "Create offer"}</h2>
              <button type="button" onClick={closeForm} aria-label="Close form" className="rounded p-1 text-slate-500 hover:bg-slate-200"><X size={18} /></button>
            </div>
            <div className="space-y-5 overflow-y-auto p-4 sm:p-6">
              {errorMessage && (
                <p role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />{errorMessage}
                </p>
              )}
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={form.enabled} onChange={(event) => setField("enabled", event.target.checked)} />
                Offer is enabled
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  Offer title
                  <input required value={form.title} onChange={(event) => setField("title", event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-200 p-2.5 font-normal" placeholder="e.g. November launch offer" />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Applies to
                  <select value={form.target_type} onChange={(event) => setForm((current) => {
                    const targetType = event.target.value as OfferTarget;
                    return {
                      ...current,
                      target_type: targetType,
                      target_id: "",
                      currency: targetType === "course" || targetType === "courses"
                        ? "USD"
                        : targetType === "service" || targetType === "services"
                          ? "KES"
                          : current.currency,
                    };
                  })} className="mt-1.5 w-full rounded-md border border-slate-200 bg-white p-2.5 font-normal">
                    {(Object.keys(targetLabel) as OfferTarget[]).map((target) => <option key={target} value={target}>{targetLabel[target]}</option>)}
                  </select>
                </label>
                {(form.target_type === "service" || form.target_type === "course") && (
                  <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                    Choose {form.target_type}
                    <select required value={form.target_id} onChange={(event) => setField("target_id", event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-200 bg-white p-2.5 font-normal">
                      <option value="">Select {form.target_type}</option>
                      {selectableItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </label>
                )}
                <label className="text-sm font-semibold text-slate-700">
                  Discount type
                  <select value={form.discount_type} onChange={(event) => setField("discount_type", event.target.value as OfferForm["discount_type"])} className="mt-1.5 w-full rounded-md border border-slate-200 bg-white p-2.5 font-normal">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </label>
                {form.discount_type === "fixed" && (
                  <label className="text-sm font-semibold text-slate-700">
                    Discount currency
                    <select value={form.currency} onChange={(event) => setField("currency", event.target.value as OfferForm["currency"])} className="mt-1.5 w-full rounded-md border border-slate-200 bg-white p-2.5 font-normal">
                      <option value="KES">KES (services)</option>
                      <option value="USD">USD (courses)</option>
                    </select>
                  </label>
                )}
                <label className="text-sm font-semibold text-slate-700">
                  {form.discount_type === "percentage" ? "Discount percentage" : `Discount amount (${form.currency})`}
                  <input required type="number" min="0.01" max={form.discount_type === "percentage" ? "100" : undefined} step="0.01" value={form.discount_value} onChange={(event) => setField("discount_value", event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-200 p-2.5 font-normal" />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Starts at
                  <input type="datetime-local" value={form.starts_at} onChange={(event) => setField("starts_at", event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-200 p-2.5 text-sm font-normal" />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Ends at
                  <input type="datetime-local" value={form.ends_at} onChange={(event) => setField("ends_at", event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-200 p-2.5 text-sm font-normal" />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Display order
                  <input type="number" min="0" step="1" value={form.sort_order} onChange={(event) => setField("sort_order", Number(event.target.value) || 0)} className="mt-1.5 w-full rounded-md border border-slate-200 p-2.5 font-normal" />
                </label>
              </div>

              <label className="block text-sm font-semibold text-slate-700">
                Offer message
                <textarea rows={2} value={form.description} onChange={(event) => setField("description", event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-200 p-2.5 font-normal" />
              </label>

              <section className="space-y-4 rounded-lg border border-slate-200 p-4">
                <label className="flex items-start gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.show_on_home} onChange={(event) => setField("show_on_home", event.target.checked)} className="mt-0.5" />
                  <span>Show this offer in the homepage banner carousel</span>
                </label>
                {form.show_on_home && (
                  <>
                    <label className="block text-sm font-semibold text-slate-700">
                      Artwork format
                      <select
                        value={form.banner_format}
                        onChange={(event) => setForm((current) => ({
                          ...current,
                          banner_format: event.target.value as OfferForm["banner_format"],
                          banner_image_url: "",
                        }))}
                        className="mt-1.5 w-full rounded-md border border-slate-200 bg-white p-2.5 font-normal"
                      >
                        <option value="banner">Wide banner — 1920 × 600 px</option>
                        <option value="flyer">Portrait flyer — 1080 × 1350 px</option>
                      </select>
                      <span className="mt-1 block text-xs font-normal text-slate-500">
                        We check the artwork proportions and minimum resolution. The recommended dimensions are shown above.
                      </span>
                    </label>
                    <div
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        void handleUpload(event.dataTransfer.files[0]);
                      }}
                      className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center"
                    >
                      <ImagePlus size={22} className="mx-auto text-slate-500" aria-hidden="true" />
                      <p className="mt-2 text-sm font-semibold text-slate-700">Drop a banner or flyer here</p>
                      <p className="mt-1 text-xs text-slate-500">JPG, PNG, WebP or AVIF · maximum 5 MB</p>
                      <label className="mt-3 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100">
                        {uploading ? <RefreshCw size={15} className="animate-spin" /> : null}
                        {uploading ? "Uploading…" : form.banner_image_url ? "Choose another file" : "Choose file"}
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={uploading} onChange={(event) => void handleUpload(event.target.files?.[0])} />
                      </label>
                    </div>
                    {form.banner_image_url && (
                      <div className={`relative mx-auto overflow-hidden rounded-lg border bg-slate-100 ${form.banner_format === "flyer" ? "max-w-sm" : "w-full"}`}>
                        <img
                          src={form.banner_image_url}
                          alt={form.banner_alt}
                          className={`w-full ${form.banner_format === "flyer" ? "aspect-[4/5] object-contain" : "aspect-[16/5] object-cover"}`}
                        />
                        <button type="button" onClick={() => setField("banner_image_url", "")} aria-label="Remove banner image" className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white"><X size={14} /></button>
                      </div>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Image alt text
                        <input value={form.banner_alt} onChange={(event) => setField("banner_alt", event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-200 p-2.5 font-normal" />
                      </label>
                      <label className="text-sm font-semibold text-slate-700">
                        Button label
                        <input value={form.cta_text} onChange={(event) => setField("cta_text", event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-200 p-2.5 font-normal" />
                      </label>
                      <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                        Button destination
                        <input value={form.cta_link} onChange={(event) => setField("cta_link", event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-200 p-2.5 font-normal" placeholder={form.target_type === "service" ? `/what-i-do/${form.target_id}` : form.target_type === "course" ? `/courses/${form.target_id}` : "/what-i-do"} />
                        <span className="mt-1 block text-xs font-normal text-slate-500">Use an internal path or a full https:// URL.</span>
                      </label>
                    </div>
                  </>
                )}
              </section>
            </div>
            <footer className="flex flex-col-reverse gap-3 border-t bg-white p-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeForm} className="min-h-10 rounded-md bg-slate-100 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-200">Cancel</button>
              <button type="submit" disabled={saveMutation.isPending || uploading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-teal-800 px-5 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-50">
                {saveMutation.isPending && <RefreshCw size={14} className="animate-spin" />}Save offer
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}
