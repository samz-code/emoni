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
type PricingPackage = {
  name: string;
  description: string;
  price: string;
  price_label: string;
  featured: boolean;
  includes: string[];
  excludes: string[];
};
type PricingAddon = { name: string; description: string; price: string };
type MarketingSection = { eyebrow: string; title: string; description: string; items: string[] };
type PortfolioItem = { name: string; category: string; image_url: string; live_url: string };
type ServiceStep = { step_number: string; title: string; description: string };

const linesToList = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);

function PricingPackagesEditor({
  packages,
  onChange,
}: {
  packages: PricingPackage[];
  onChange: (next: PricingPackage[]) => void;
}) {
  const update = (index: number, patch: Partial<PricingPackage>) =>
    onChange(packages.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  return (
    <div className="space-y-3">
      {packages.map((item, index) => (
        <div key={index} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={item.name} onChange={(e) => update(index, { name: e.target.value })} className="rounded-md border p-2" placeholder="Package name" />
            <div className="flex gap-2">
              <input type="number" min="0" step="1" value={item.price} onChange={(e) => update(index, { price: e.target.value })} className="min-w-0 flex-1 rounded-md border p-2" placeholder="Price (KES; leave blank for quote)" />
              <button type="button" onClick={() => onChange(packages.filter((_, i) => i !== index))} className="rounded-md px-3 text-rose-600 hover:bg-rose-50" aria-label="Remove package"><X size={16} /></button>
            </div>
          </div>
          <input value={item.description} onChange={(e) => update(index, { description: e.target.value })} className="w-full rounded-md border p-2" placeholder="Who this package is for" />
          <input value={item.price_label} onChange={(e) => update(index, { price_label: e.target.value })} className="w-full rounded-md border p-2" placeholder="Price suffix, e.g. one-off or per month" />
          <div className="grid gap-3 sm:grid-cols-2">
            <textarea rows={3} value={item.includes.join("\n")} onChange={(e) => update(index, { includes: linesToList(e.target.value) })} className="rounded-md border p-2" placeholder={"Included (one per line)\nUp to 5 pages"} />
            <textarea rows={3} value={item.excludes.join("\n")} onChange={(e) => update(index, { excludes: linesToList(e.target.value) })} className="rounded-md border p-2" placeholder={"Not included (one per line)\nCopywriting"} />
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <input type="checkbox" checked={item.featured} onChange={(e) => update(index, { featured: e.target.checked })} />
            Mark as popular
          </label>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...packages, { name: "", description: "", price: "", price_label: "", featured: false, includes: [], excludes: [] }])} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
        <Plus size={13} /> Add pricing package
      </button>
    </div>
  );
}

function PricingAddonsEditor({
  addons,
  onChange,
}: {
  addons: PricingAddon[];
  onChange: (next: PricingAddon[]) => void;
}) {
  return (
    <div className="space-y-2">
      {addons.map((item, index) => (
        <div key={index} className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_130px_auto]">
          <input value={item.name} onChange={(e) => onChange(addons.map((a, i) => i === index ? { ...a, name: e.target.value } : a))} className="rounded-md border p-2" placeholder="Extra name" />
          <input value={item.description} onChange={(e) => onChange(addons.map((a, i) => i === index ? { ...a, description: e.target.value } : a))} className="rounded-md border p-2" placeholder="Description" />
          <input type="number" min="0" step="1" value={item.price} onChange={(e) => onChange(addons.map((a, i) => i === index ? { ...a, price: e.target.value } : a))} className="rounded-md border p-2" placeholder="Price (KES)" />
          <button type="button" onClick={() => onChange(addons.filter((_, i) => i !== index))} className="rounded-md px-2 text-rose-600 hover:bg-rose-50" aria-label="Remove extra"><X size={16} /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...addons, { name: "", description: "", price: "" }])} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
        <Plus size={13} /> Add optional extra
      </button>
    </div>
  );
}

function MarketingSectionsEditor({
  sections,
  onChange,
}: {
  sections: MarketingSection[];
  onChange: (next: MarketingSection[]) => void;
}) {
  const update = (index: number, patch: Partial<MarketingSection>) =>
    onChange(sections.map((section, i) => i === index ? { ...section, ...patch } : section));

  return (
    <div className="space-y-3">
      {sections.map((section, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input value={section.eyebrow} onChange={(e) => update(index, { eyebrow: e.target.value })} className="rounded-md border p-2" placeholder="Small label (optional)" />
            <input value={section.title} onChange={(e) => update(index, { title: e.target.value })} className="rounded-md border p-2" placeholder="Section title" />
            <button type="button" onClick={() => onChange(sections.filter((_, i) => i !== index))} className="rounded-md px-3 text-rose-600 hover:bg-rose-50" aria-label="Remove section"><X size={16} /></button>
          </div>
          <textarea rows={2} value={section.description} onChange={(e) => update(index, { description: e.target.value })} className="w-full rounded-md border p-2" placeholder="Section introduction" />
          <textarea rows={3} value={section.items.join("\n")} onChange={(e) => update(index, { items: linesToList(e.target.value) })} className="w-full rounded-md border p-2" placeholder={"Items (one per line)\nBusiness website design"} />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...sections, { eyebrow: "", title: "", description: "", items: [] }])} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
        <Plus size={13} /> Add content section
      </button>
    </div>
  );
}

function PortfolioEditor({
  items,
  onChange,
  onBusyChange,
}: {
  items: PortfolioItem[];
  onChange: (next: PortfolioItem[]) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const update = (index: number, patch: Partial<PortfolioItem>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-2">
          <div className="space-y-2">
            <input value={item.name} onChange={(e) => update(index, { name: e.target.value })} className="w-full rounded-md border p-2" placeholder="Client or project name" />
            <input value={item.category} onChange={(e) => update(index, { category: e.target.value })} className="w-full rounded-md border p-2" placeholder="Industry" />
            <input type="url" value={item.live_url} onChange={(e) => update(index, { live_url: e.target.value })} className="w-full rounded-md border p-2" placeholder="Live website URL (optional)" />
          </div>
          <div>
            <ImageUploadField
              label={`Project image ${index + 1}`}
              hint="Screenshot or project thumbnail."
              value={item.image_url}
              folder="service-portfolio"
              onChange={(url) => update(index, { image_url: url })}
              onBusyChange={onBusyChange}
            />
          </div>
          <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))} className="justify-self-start rounded-md px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 md:col-span-2">
            Remove portfolio item
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { name: "", category: "", image_url: "", live_url: "" }])} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
        <Plus size={13} /> Add portfolio item
      </button>
    </div>
  );
}

function ServiceProcessEditor({
  steps,
  onChange,
}: {
  steps: ServiceStep[];
  onChange: (next: ServiceStep[]) => void;
}) {
  const update = (index: number, patch: Partial<ServiceStep>) =>
    onChange(steps.map((step, i) => (i === index ? { ...step, ...patch } : step)));

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="grid gap-2 sm:grid-cols-[100px_1fr_auto]">
            <input value={step.step_number} onChange={(e) => update(index, { step_number: e.target.value })} className="rounded-md border p-2" placeholder="01" />
            <input value={step.title} onChange={(e) => update(index, { title: e.target.value })} className="rounded-md border p-2" placeholder="Step title" />
            <button type="button" onClick={() => onChange(steps.filter((_, i) => i !== index))} className="rounded-md px-3 text-rose-600 hover:bg-rose-50" aria-label="Remove process step"><X size={16} /></button>
          </div>
          <textarea rows={2} value={step.description} onChange={(e) => update(index, { description: e.target.value })} className="w-full rounded-md border p-2" placeholder="Describe this step" />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...steps, { step_number: String(steps.length + 1).padStart(2, "0"), title: "", description: "" }])} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
        <Plus size={13} /> Add process step
      </button>
    </div>
  );
}

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
  starting_price: "",
  price_unit: "",
  hero_headline: "",
  hero_primary_label: "",
  hero_primary_link: "",
  hero_secondary_label: "",
  hero_secondary_link: "",
  ideal_for: "",
  banner_url: "",
  gallery_urls: [] as string[],
  faqs: [] as Pair[],
  trust_metrics: [] as Pair[],
  testimonials: [] as Pair[],
  review_rating: "",
  review_count: "",
  google_review_url: "",
  portfolio_heading: "",
  portfolio_intro: "",
  process_heading: "",
  pricing_packages: [] as PricingPackage[],
  pricing_addons: [] as PricingAddon[],
  page_sections: [] as MarketingSection[],
  portfolio_items: [] as PortfolioItem[],
  service_process_steps: [] as ServiceStep[],
  published: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const cleanList = (arr: string[]) => arr.map((v) => v.trim()).filter(Boolean);
const objectRows = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && !Array.isArray(item))
    : [];
const textField = (value: unknown) => (typeof value === "string" ? value : "");

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
      const readPrice = (value: string, label: string) => {
        if (!value.trim()) return null;
        const price = Number(value);
        if (!Number.isFinite(price) || price < 0) {
          throw new Error(`${label} must be a non-negative number.`);
        }
        return price;
      };
      const reviewRating = readPrice(formData.review_rating, "Review rating");
      if (reviewRating !== null && reviewRating > 5) {
        throw new Error("Review rating cannot be greater than 5.");
      }
      const reviewCount = readPrice(formData.review_count, "Review count");
      if (reviewCount !== null && !Number.isInteger(reviewCount)) {
        throw new Error("Review count must be a whole number.");
      }

      const payload = {
        id: editingId || slugify(formData.name),
        category: formData.category,
        name: formData.name.trim(),
        hero_headline: formData.hero_headline.trim(),
        hero_primary_label: formData.hero_primary_label.trim(),
        hero_primary_link: formData.hero_primary_link.trim(),
        hero_secondary_label: formData.hero_secondary_label.trim(),
        hero_secondary_link: formData.hero_secondary_link.trim(),
        short_description: formData.short_description.trim() || null,
        problem: formData.problem.trim(),
        solution: formData.solution.trim(),
        long_description: formData.long_description.trim() || null,
        outcome: formData.outcome.trim(),
        deliverables: cleanList(formData.deliverables),
        tools: cleanList(formData.tools),
        timeline: formData.timeline.trim() || null,
        starting_from: formData.starting_from.trim() || null,
        starting_price: readPrice(formData.starting_price, "Starting price"),
        price_unit: formData.price_unit.trim(),
        ideal_for: formData.ideal_for.trim(),
        banner_url: formData.banner_url || null,
        gallery_urls: formData.gallery_urls,
        faqs: formData.faqs
          .map((f) => ({ question: (f.question || "").trim(), answer: (f.answer || "").trim() }))
          .filter((f) => f.question && f.answer),
        trust_metrics: formData.trust_metrics
          .map((metric) => ({ value: (metric.value || "").trim(), label: (metric.label || "").trim() }))
          .filter((metric) => metric.value && metric.label),
        testimonials: formData.testimonials
          .map((item) => ({ quote: (item.quote || "").trim(), author: (item.author || "").trim() }))
          .filter((item) => item.quote && item.author),
        review_rating: reviewRating,
        review_count: reviewCount ?? 0,
        google_review_url: formData.google_review_url.trim(),
        portfolio_heading: formData.portfolio_heading.trim(),
        portfolio_intro: formData.portfolio_intro.trim(),
        process_heading: formData.process_heading.trim(),
        portfolio_items: formData.portfolio_items
          .map((item) => ({
            name: item.name.trim(),
            category: item.category.trim(),
            image_url: item.image_url.trim(),
            live_url: item.live_url.trim(),
          }))
          .filter((item) => item.name),
        service_process_steps: formData.service_process_steps
          .map((step) => ({
            step_number: step.step_number.trim(),
            title: step.title.trim(),
            description: step.description.trim(),
          }))
          .filter((step) => step.title),
        pricing_packages: formData.pricing_packages
          .map((item) => ({
            name: item.name.trim(),
            description: item.description.trim(),
            price: readPrice(item.price, `${item.name || "Package"} price`),
            price_label: item.price_label.trim(),
            featured: item.featured,
            includes: cleanList(item.includes),
            excludes: cleanList(item.excludes),
          }))
          .filter((item) => item.name),
        pricing_addons: formData.pricing_addons
          .map((item) => ({
            name: item.name.trim(),
            description: item.description.trim(),
            price: readPrice(item.price, `${item.name || "Extra"} price`),
          }))
          .filter((item) => item.name && item.price !== null),
        page_sections: formData.page_sections
          .map((section) => ({
            eyebrow: section.eyebrow.trim(),
            title: section.title.trim(),
            description: section.description.trim(),
            items: cleanList(section.items),
          }))
          .filter((section) => section.title),
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
      hero_headline: service.hero_headline || "",
      hero_primary_label: service.hero_primary_label || "",
      hero_primary_link: service.hero_primary_link || "",
      hero_secondary_label: service.hero_secondary_label || "",
      hero_secondary_link: service.hero_secondary_link || "",
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
      starting_price: service.starting_price === null || service.starting_price === undefined ? "" : String(service.starting_price),
      price_unit: service.price_unit || "",
      ideal_for: service.ideal_for || "",
      banner_url: service.banner_url || "",
      gallery_urls: Array.isArray(service.gallery_urls) ? service.gallery_urls : [],
      faqs: Array.isArray(service.faqs) ? service.faqs : [],
      trust_metrics: Array.isArray(service.trust_metrics) ? service.trust_metrics : [],
      testimonials: Array.isArray(service.testimonials) ? service.testimonials : [],
      review_rating: service.review_rating === null || service.review_rating === undefined ? "" : String(service.review_rating),
      review_count: String(service.review_count ?? ""),
      google_review_url: service.google_review_url || "",
      portfolio_heading: service.portfolio_heading || "",
      portfolio_intro: service.portfolio_intro || "",
      process_heading: service.process_heading || "",
      portfolio_items: objectRows(service.portfolio_items).map((item) => ({
        name: textField(item.name),
        category: textField(item.category),
        image_url: textField(item.image_url),
        live_url: textField(item.live_url),
      })),
      service_process_steps: objectRows(service.service_process_steps).map((step) => ({
        step_number: textField(step.step_number),
        title: textField(step.title),
        description: textField(step.description),
      })),
      pricing_packages: objectRows(service.pricing_packages)
        .map((item) => ({
            name: textField(item.name),
            description: textField(item.description),
            price: item?.price === null || item?.price === undefined ? "" : String(item.price),
            price_label: textField(item.price_label),
            featured: item.featured === true,
            includes: Array.isArray(item.includes) ? item.includes.filter((value): value is string => typeof value === "string") : [],
            excludes: Array.isArray(item.excludes) ? item.excludes.filter((value): value is string => typeof value === "string") : [],
          })),
      pricing_addons: objectRows(service.pricing_addons)
        .map((item) => ({
            name: textField(item.name),
            description: textField(item.description),
            price: item?.price === null || item?.price === undefined ? "" : String(item.price),
          })),
      page_sections: objectRows(service.page_sections)
        .map((section) => ({
            eyebrow: textField(section.eyebrow),
            title: textField(section.title),
            description: textField(section.description),
            items: Array.isArray(section.items) ? section.items.filter((value): value is string => typeof value === "string") : [],
          })),
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
                    <label className="block font-semibold text-slate-700 mb-1">Hero headline</label>
                    <input
                      type="text"
                      value={formData.hero_headline}
                      onChange={(e) => setFormData({ ...formData, hero_headline: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                      placeholder="e.g. Website Design That Wins You Customers"
                    />
                    <p className="mt-1 text-xs text-slate-400">Optional promotional headline shown as the main page heading.</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block font-semibold text-slate-700">
                      Primary button label
                      <input value={formData.hero_primary_label} onChange={(e) => setFormData({ ...formData, hero_primary_label: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 p-2.5 font-normal" placeholder="Start this project" />
                    </label>
                    <label className="block font-semibold text-slate-700">
                      Primary button link
                      <input value={formData.hero_primary_link} onChange={(e) => setFormData({ ...formData, hero_primary_link: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 p-2.5 font-normal" placeholder="Defaults to the service contact form" />
                    </label>
                    <label className="block font-semibold text-slate-700">
                      Secondary button label
                      <input value={formData.hero_secondary_label} onChange={(e) => setFormData({ ...formData, hero_secondary_label: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 p-2.5 font-normal" placeholder="See my work" />
                    </label>
                    <label className="block font-semibold text-slate-700">
                      Secondary button link
                      <input value={formData.hero_secondary_link} onChange={(e) => setFormData({ ...formData, hero_secondary_link: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 p-2.5 font-normal" placeholder="/projects or https://wa.me/..." />
                    </label>
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
                      <label className="block font-semibold text-slate-700 mb-1">Starting price (KES)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.starting_price}
                        onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                        placeholder="e.g. 26000"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Price unit</label>
                      <input
                        type="text"
                        value={formData.price_unit}
                        onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                        placeholder="e.g. per month"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Text-only starting price</label>
                    <input
                      type="text"
                      value={formData.starting_from}
                      onChange={(e) => setFormData({ ...formData, starting_from: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                      placeholder="e.g. Custom quote (use only when there is no numeric price)"
                    />
                    <p className="mt-1 text-xs text-slate-400">Numeric prices take precedence and receive any active offer that matches this service.</p>
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

                <FormSection
                  title="Packages and optional extras"
                  description="Numeric prices participate in the active offer that matches this service. Leave package prices empty for quote-based pricing."
                >
                  <PricingPackagesEditor
                    packages={formData.pricing_packages}
                    onChange={(next) => setFormData({ ...formData, pricing_packages: next })}
                  />
                  <div className="border-t border-slate-100 pt-4">
                    <label className="mb-2 block font-semibold text-slate-700">Optional extras</label>
                    <PricingAddonsEditor
                      addons={formData.pricing_addons}
                      onChange={(next) => setFormData({ ...formData, pricing_addons: next })}
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

                <FormSection
                  title="Extra page sections"
                  description="Add sections such as service options, why choose us, or what is included. Each item appears as a separate bullet."
                >
                  <MarketingSectionsEditor
                    sections={formData.page_sections}
                    onChange={(next) => setFormData({ ...formData, page_sections: next })}
                  />
                </FormSection>

                <FormSection
                  title="Portfolio"
                  description="Add client work, industries, optional live links and uploaded screenshots."
                >
                  <label className="block font-semibold text-slate-700">
                    Portfolio heading
                    <input value={formData.portfolio_heading} onChange={(e) => setFormData({ ...formData, portfolio_heading: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 p-2.5 font-normal" placeholder="Selected work" />
                  </label>
                  <label className="block font-semibold text-slate-700">
                    Portfolio introduction
                    <textarea rows={2} value={formData.portfolio_intro} onChange={(e) => setFormData({ ...formData, portfolio_intro: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 p-2.5 font-normal" />
                  </label>
                  <PortfolioEditor
                    items={formData.portfolio_items}
                    onChange={(next) => setFormData({ ...formData, portfolio_items: next })}
                    onBusyChange={trackBusy}
                  />
                </FormSection>

                <FormSection
                  title="Service-specific process"
                  description="When provided, these steps replace the sitewide process on this service page."
                >
                  <label className="block font-semibold text-slate-700">
                    Section heading
                    <input value={formData.process_heading} onChange={(e) => setFormData({ ...formData, process_heading: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 p-2.5 font-normal" placeholder="How we will work together" />
                  </label>
                  <ServiceProcessEditor
                    steps={formData.service_process_steps}
                    onChange={(next) => setFormData({ ...formData, service_process_steps: next })}
                  />
                </FormSection>

                <FormSection title="Trust indicators and testimonials">
                  <PairListEditor
                    label="Trust indicators (value and label)"
                    addLabel="Add indicator"
                    primaryKey="value"
                    secondaryKey="label"
                    primaryPlaceholder="e.g. 15+"
                    secondaryPlaceholder="e.g. websites built for Kenyan clients"
                    items={formData.trust_metrics}
                    onChange={(next) => setFormData({ ...formData, trust_metrics: next })}
                  />
                  <PairListEditor
                    label="Client quotes (quote and name)"
                    addLabel="Add testimonial"
                    primaryKey="quote"
                    secondaryKey="author"
                    primaryPlaceholder="Client review quote"
                    secondaryPlaceholder="Client name or attribution"
                    items={formData.testimonials}
                    onChange={(next) => setFormData({ ...formData, testimonials: next })}
                  />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="block font-semibold text-slate-700">
                      Review rating (out of 5)
                      <input type="number" min="0" max="5" step="0.1" value={formData.review_rating} onChange={(e) => setFormData({ ...formData, review_rating: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 p-2.5 font-normal" placeholder="5.0" />
                    </label>
                    <label className="block font-semibold text-slate-700">
                      Number of reviews
                      <input type="number" min="0" step="1" value={formData.review_count} onChange={(e) => setFormData({ ...formData, review_count: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 p-2.5 font-normal" placeholder="3" />
                    </label>
                    <label className="block font-semibold text-slate-700">
                      Google review link
                      <input type="url" value={formData.google_review_url} onChange={(e) => setFormData({ ...formData, google_review_url: e.target.value })} className="mt-1 w-full rounded-md border border-slate-200 p-2.5 font-normal" placeholder="https://g.page/..." />
                    </label>
                  </div>
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