import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Plus, Search, AlertCircle, Eye, EyeOff, X, RefreshCw,
  Pencil, Trash2, ImagePlus,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

/* ------------------------------------------------------------------ */
/* Image upload helpers (Supabase Storage, bucket: "media")            */
/* ------------------------------------------------------------------ */
const BUCKET = "media";
const MAX_IMAGE_MB = 5;
const MAX_GALLERY = 8;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

async function uploadImage(file: File, folder: string): Promise<string> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("Use a JPG, PNG, WebP or AVIF image.");
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    throw new Error(`"${file.name}" is over ${MAX_IMAGE_MB}MB. Compress it and try again.`);
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function ImageUploadField({
  label, hint, value, folder, onChange, onBusyChange,
}: {
  label: string;
  hint?: string;
  value: string;
  folder: string;
  onChange: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    onBusyChange(true);
    try {
      onChange(await uploadImage(file, folder));
    } catch (err: any) {
      setError(err?.message || "Upload failed.");
    } finally {
      setUploading(false);
      onBusyChange(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block font-semibold text-slate-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-400 mb-2">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {value ? (
        <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
          <div className="relative aspect-[16/9] bg-slate-100">
            <img src={value} alt="" className="h-full w-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <RefreshCw size={20} className="animate-spin text-slate-600" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 p-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md py-2 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Replace image
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={uploading}
              className="flex-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-md py-2 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          disabled={uploading}
          className="w-full aspect-[16/9] sm:aspect-[21/9] flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-slate-400 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-60"
        >
          {uploading ? (
            <RefreshCw size={20} className="animate-spin" />
          ) : (
            <ImagePlus size={22} />
          )}
          <span className="text-sm font-medium">
            {uploading ? "Uploading..." : "Click or drop an image here"}
          </span>
          <span className="text-xs text-slate-400">JPG, PNG, WebP or AVIF · max {MAX_IMAGE_MB}MB</span>
        </button>
      )}

      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function GalleryUploadField({
  label, hint, urls, folder, onChange, onBusyChange,
}: {
  label: string;
  hint?: string;
  urls: string[];
  folder: string;
  onChange: (urls: string[]) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const slots = MAX_GALLERY - urls.length;
    if (slots <= 0) {
      setError(`You can add up to ${MAX_GALLERY} images.`);
      return;
    }
    const selected = Array.from(files).slice(0, slots);
    setError(null);
    setUploading(true);
    onBusyChange(true);

    const results = await Promise.allSettled(selected.map((f) => uploadImage(f, folder)));
    const uploaded = results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
      .map((r) => r.value);
    const failed = results.find((r): r is PromiseRejectedResult => r.status === "rejected");

    if (uploaded.length > 0) onChange([...urls, ...uploaded]);
    if (failed) setError(failed.reason?.message || "Some images failed to upload.");
    else if (files.length > slots) setError(`Only the first ${slots} image(s) were added (limit ${MAX_GALLERY}).`);

    setUploading(false);
    onBusyChange(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="block font-semibold text-slate-700 mb-1">
        {label} <span className="font-normal text-slate-400">({urls.length}/{MAX_GALLERY})</span>
      </label>
      {hint && <p className="text-xs text-slate-400 mb-2">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {urls.map((url, idx) => (
          <div key={url} className="relative aspect-[4/3] rounded-md overflow-hidden border border-slate-200 bg-slate-100">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(urls.filter((_, i) => i !== idx))}
              className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {urls.length < MAX_GALLERY && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-[4/3] flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-slate-400 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-60"
          >
            {uploading ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={18} />}
            <span className="text-xs font-medium">{uploading ? "Uploading..." : "Add images"}</span>
          </button>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small form helpers                                                  */
/* ------------------------------------------------------------------ */
function FormSection({
  title, description, children,
}: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 pt-5 first:pt-0 border-t first:border-t-0 border-slate-200">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h4>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function ListFieldEditor({
  label, hint, addLabel, items, onChange,
}: {
  label: string;
  hint?: string;
  addLabel: string;
  items: string[];
  onChange: (next: string[]) => void;
}) {
  const update = (idx: number, value: string) => {
    const next = [...items];
    next[idx] = value;
    onChange(next);
  };
  const remove = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    onChange(next.length > 0 ? next : [""]);
  };

  return (
    <div>
      <label className="block font-semibold text-slate-700 mb-1">{label}</label>
      <div className="space-y-2">
        {items.map((val, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={val}
              onChange={(e) => update(idx, e.target.value)}
              className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-md p-2"
              placeholder={hint || "Item"}
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer shrink-0"
              aria-label={`Remove ${label} item`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
      >
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}

type Pair = Record<string, string>;

function PairListEditor({
  label, addLabel, primaryKey, secondaryKey, primaryPlaceholder, secondaryPlaceholder, items, onChange,
}: {
  label: string;
  addLabel: string;
  primaryKey: string;
  secondaryKey: string;
  primaryPlaceholder: string;
  secondaryPlaceholder: string;
  items: Pair[];
  onChange: (next: Pair[]) => void;
}) {
  const update = (idx: number, key: string, value: string) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));

  return (
    <div>
      <label className="block font-semibold text-slate-700 mb-1">{label}</label>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={item[primaryKey] || ""}
                onChange={(e) => update(idx, primaryKey, e.target.value)}
                className="flex-1 min-w-0 bg-white border border-slate-200 rounded-md p-2"
                placeholder={primaryPlaceholder}
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer shrink-0"
                aria-label={`Remove ${label} entry`}
              >
                <X size={14} />
              </button>
            </div>
            <textarea
              rows={2}
              value={item[secondaryKey] || ""}
              onChange={(e) => update(idx, secondaryKey, e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-md p-2"
              placeholder={secondaryPlaceholder}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, { [primaryKey]: "", [secondaryKey]: "" }])}
        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
      >
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}

function Thumb({ url, name }: { url?: string | null; name: string }) {
  return url ? (
    <img src={url} alt="" loading="lazy" className="h-10 w-16 rounded object-cover border border-slate-200 shrink-0" />
  ) : (
    <div className="h-10 w-16 rounded bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-xs font-bold text-slate-400">
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form defaults                                                       */
/* ------------------------------------------------------------------ */
const emptyForm = {
  id: "",
  category: "strategy",
  name: "",
  short_description: "",
  problem: "",
  solution: "",
  long_description: "",
  outcome: "",
  deliverables: [""] as string[],
  tools: [""] as string[],
  timeline: "",
  starting_from: "",
  ideal_for: "",
  banner_url: "",
  gallery_urls: [] as string[],
  faqs: [] as Pair[],
  published: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const cleanList = (arr: string[]) => arr.map((v) => v.trim()).filter(Boolean);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function ManageServices() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [servicePendingDelete, setServicePendingDelete] = useState<any | null>(null);
  const [busyCount, setBusyCount] = useState(0);
  const uploading = busyCount > 0;
  const trackBusy = (busy: boolean) => setBusyCount((c) => Math.max(0, c + (busy ? 1 : -1)));

  const { data: services = [], isLoading, error: loadError } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        id: editingId || slugify(formData.name),
        category: formData.category,
        name: formData.name.trim(),
        short_description: formData.short_description.trim() || null,
        problem: formData.problem.trim(),
        solution: formData.solution.trim(),
        long_description: formData.long_description.trim() || null,
        outcome: formData.outcome.trim(),
        deliverables: cleanList(formData.deliverables),
        tools: cleanList(formData.tools),
        timeline: formData.timeline.trim() || null,
        starting_from: formData.starting_from.trim() || null,
        ideal_for: formData.ideal_for.trim(),
        banner_url: formData.banner_url || null,
        gallery_urls: formData.gallery_urls,
        faqs: formData.faqs
          .map((f) => ({ question: (f.question || "").trim(), answer: (f.answer || "").trim() }))
          .filter((f) => f.question && f.answer),
        published: formData.published,
        ...(editingId ? {} : { sort_order: services.length }),
      };

      const { error } = await supabase.from("services").upsert(payload);
      if (error) throw error;
    },
    onMutate: () => setMutationError(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      closeModal();
    },
    onError: (error: any) => {
      console.error("Service save failed:", error);
      const parts = [error?.message, error?.details, error?.hint].filter(Boolean);
      setMutationError(parts.length > 0 ? parts.join(" — ") : "Save failed. Check console.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      setServicePendingDelete(null);
    },
    onError: (error: any) => {
      alert(error?.message || "Delete failed.");
    },
  });

  const togglePublishedMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("services").update({ published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-services"] }),
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setMutationError(null);
    setBusyCount(0);
    setFormData(emptyForm);
  };

  const openCreateModal = () => {
    setFormData({ ...emptyForm, category: categories[0]?.id || "strategy" });
    setEditingId(null);
    setMutationError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service: any) => {
    setEditingId(service.id);
    setMutationError(null);
    setFormData({
      id: service.id,
      category: service.category || categories[0]?.id || "strategy",
      name: service.name || "",
      short_description: service.short_description || "",
      problem: service.problem || "",
      solution: service.solution || "",
      long_description: service.long_description || "",
      outcome: service.outcome || "",
      deliverables:
        Array.isArray(service.deliverables) && service.deliverables.length > 0
          ? service.deliverables
          : [""],
      tools: Array.isArray(service.tools) && service.tools.length > 0 ? service.tools : [""],
      timeline: service.timeline || "",
      starting_from: service.starting_from || "",
      ideal_for: service.ideal_for || "",
      banner_url: service.banner_url || "",
      gallery_urls: Array.isArray(service.gallery_urls) ? service.gallery_urls : [],
      faqs: Array.isArray(service.faqs) ? service.faqs : [],
      published: service.published ?? true,
    });
    setIsModalOpen(true);
  };

  const filteredServices = services.filter((s: any) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoryLabel = (value: string) =>
    categories.find((c: any) => c.id === value)?.label || value;

  const folder = "services";

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Services</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage the services shown on the public site. Changes here go live immediately.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer w-full sm:w-auto"
        >
          <Plus size={16} /> Add New Service
        </button>
      </div>

      {loadError && (
        <p className="mb-4 flex items-start gap-1.5 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>Failed to load services: {(loadError as any)?.message || "Unknown error"}</span>
        </p>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-md pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition-colors w-full sm:w-auto"
        >
          <option value="all">All categories</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Loading / empty states */}
      {isLoading ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-500 text-sm">
          Loading services...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-400 text-sm">
          No services found.
        </div>
      ) : (
        <>
          {/* Table — desktop / tablet */}
          <div className="hidden sm:block bg-white rounded-xl border overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-slate-700 text-sm">Service</th>
                  <th className="p-4 font-semibold text-slate-700 text-sm">Category</th>
                  <th className="p-4 font-semibold text-slate-700 text-sm">Outcome</th>
                  <th className="p-4 font-semibold text-slate-700 text-sm">Status</th>
                  <th className="p-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((s: any) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Thumb url={s.banner_url} name={s.name} />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{s.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">/{s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{categoryLabel(s.category)}</td>
                    <td className="p-4 text-sm text-slate-600 max-w-[220px] truncate">{s.outcome}</td>
                    <td className="p-4">
                      <button
                        onClick={() => togglePublishedMutation.mutate({ id: s.id, published: !s.published })}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                          s.published
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        {s.published ? <Eye size={12} /> : <EyeOff size={12} />}
                        {s.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(s)}
                          className="text-blue-600 hover:underline text-sm cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setServicePendingDelete(s)}
                          className="text-red-600 hover:underline text-sm cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards — mobile */}
          <div className="sm:hidden space-y-3">
            {filteredServices.map((s: any) => (
              <div key={s.id} className="bg-white rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Thumb url={s.banner_url} name={s.name} />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{s.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">/{s.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePublishedMutation.mutate({ id: s.id, published: !s.published })}
                    className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                      s.published
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    {s.published ? <Eye size={12} /> : <EyeOff size={12} />}
                    {s.published ? "Published" : "Draft"}
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span><span className="text-slate-400">Category:</span> {categoryLabel(s.category)}</span>
                </div>

                {s.outcome && (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{s.outcome}</p>
                )}

                <div className="mt-4 pt-3 border-t flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(s)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md py-2 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => setServicePendingDelete(s)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-md py-2 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b bg-slate-50 shrink-0">
              <h3 className="font-bold text-sm">
                {editingId ? "Edit Service" : "Add New Service"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 -m-1">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); upsertMutation.mutate(); }}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="p-4 sm:p-5 space-y-6 overflow-y-auto text-sm flex-1">
                {mutationError && (
                  <p className="flex items-start gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-2">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    <span>{mutationError}</span>
                  </p>
                )}

                {/* BASICS */}
                <FormSection title="Basics">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Service Name</label>
                    <input
                      type="text" required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                      placeholder="e.g. Web Development"
                    />
                    <p className="text-xs text-slate-400 mt-1 break-all">
                      URL id: <span className="font-mono">{editingId || slugify(formData.name) || "—"}</span>
                      {editingId && " (fixed once created)"}
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                    >
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Short Description</label>
                    <textarea
                      rows={2} maxLength={180}
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                      placeholder="One or two sentences shown on the service card. Falls back to 'How It's Solved' if empty."
                    />
                    <p className="text-xs text-slate-400 mt-1 text-right">{formData.short_description.length}/180</p>
                  </div>
                </FormSection>

                {/* MEDIA */}
                <FormSection
                  title="Images"
                  description="Real project visuals work best. Use landscape images, around 1600×900."
                >
                  <ImageUploadField
                    label="Banner Image"
                    hint="Shown on the service card and at the top of the details page."
                    value={formData.banner_url}
                    folder={folder}
                    onChange={(url) => setFormData((p) => ({ ...p, banner_url: url }))}
                    onBusyChange={trackBusy}
                  />
                  <GalleryUploadField
                    label="Gallery"
                    hint="Past work, screenshots or process shots for the details page."
                    urls={formData.gallery_urls}
                    folder={folder}
                    onChange={(urls) => setFormData((p) => ({ ...p, gallery_urls: urls }))}
                    onBusyChange={trackBusy}
                  />
                </FormSection>

                {/* DESCRIPTION */}
                <FormSection
                  title="Description"
                  description="The card uses the short version. The details page uses everything here."
                >
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">The Problem</label>
                    <textarea
                      rows={3} required
                      value={formData.problem}
                      onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                      placeholder="What pain point does this service address?"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">How It's Solved</label>
                    <textarea
                      rows={3} required
                      value={formData.solution}
                      onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                      placeholder="How do you solve it?"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Description</label>
                    <textarea
                      rows={10}
                      value={formData.long_description}
                      onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 leading-relaxed"
                      placeholder={"Explain the service in detail: what is involved, how you work, what the client should prepare, what happens after delivery.\n\nLeave a blank line between paragraphs."}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      {formData.long_description.trim().split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Outcome</label>
                    <input
                      type="text" required
                      value={formData.outcome}
                      onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                      placeholder="e.g. Online visibility & conversions"
                    />
                  </div>
                </FormSection>

                {/* DELIVERY */}
                <FormSection title="What the Client Gets">
                  <ListFieldEditor
                    label="Deliverables"
                    hint="Deliverable item"
                    addLabel="Add deliverable"
                    items={formData.deliverables}
                    onChange={(next) => setFormData({ ...formData, deliverables: next })}
                  />
                  <ListFieldEditor
                    label="Tools & Technologies"
                    hint="e.g. React, Figma, Supabase"
                    addLabel="Add tool"
                    items={formData.tools}
                    onChange={(next) => setFormData({ ...formData, tools: next })}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Typical Timeline</label>
                      <input
                        type="text"
                        value={formData.timeline}
                        onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                        placeholder="e.g. 2–4 weeks"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Starting From</label>
                      <input
                        type="text"
                        value={formData.starting_from}
                        onChange={(e) => setFormData({ ...formData, starting_from: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                        placeholder="e.g. KES 45,000 (optional)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ideal For</label>
                    <input
                      type="text" required
                      value={formData.ideal_for}
                      onChange={(e) => setFormData({ ...formData, ideal_for: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                      placeholder="e.g. Businesses, institutions, e-commerce, SaaS, portfolios"
                    />
                  </div>
                </FormSection>

                {/* FAQ */}
                <FormSection title="FAQs" description="Answer the questions clients ask before they book.">
                  <PairListEditor
                    label="Questions & Answers"
                    addLabel="Add question"
                    primaryKey="question"
                    secondaryKey="answer"
                    primaryPlaceholder="Question"
                    secondaryPlaceholder="Answer"
                    items={formData.faqs}
                    onChange={(next) => setFormData({ ...formData, faqs: next })}
                  />
                </FormSection>

                {/* PUBLISHING */}
                <FormSection title="Publishing">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="font-semibold text-slate-700">Published (visible on the public site)</span>
                  </label>
                </FormSection>
              </div>

              <div className="p-4 sm:px-5 border-t bg-white shrink-0 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3">
                {uploading && (
                  <span className="text-xs text-slate-500 sm:mr-auto flex items-center gap-1.5">
                    <RefreshCw size={12} className="animate-spin" /> Uploading images...
                  </span>
                )}
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 sm:py-2 bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={upsertMutation.isPending || uploading}
                  className="px-5 py-2.5 sm:py-2 bg-black text-white font-semibold rounded-md hover:bg-slate-800 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {upsertMutation.isPending && <RefreshCw size={14} className="animate-spin" />}
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={servicePendingDelete !== null}
        title="Delete service"
        message={
          servicePendingDelete
            ? `Delete "${servicePendingDelete.name}"? This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        isLoading={deleteMutation.isPending}
        onConfirm={() => servicePendingDelete && deleteMutation.mutate(servicePendingDelete.id)}
        onCancel={() => setServicePendingDelete(null)}
      />
    </div>
  );
}