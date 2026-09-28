import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  MessageSquare,
  Settings2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  UploadCloud,
  Image as ImageIcon,
  ListOrdered,
  User,
  Building2,
} from "lucide-react";
import {
  DEFAULT_HERO,
  DEFAULT_SETTINGS,
  SETTINGS_TEXT_FIELDS,
  invalidateHomeContent,
  mergeDefaults,
  toStringArray,
  type CarouselImage,
  type HeroContent,
  type HeroPair,
  type Partner,
  type ProcessStep,
  type Reason,
  type Sector,
  type SettingsTextKey,
  type SiteSettings,
} from "@/lib/homeContent";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
type Tab = "hero" | "carousel" | "pairs" | "process" | "sectors" | "partners" | "reasons" | "settings";

const BUCKET = "site-assets";
const MAX_UPLOAD_MB = 5;

const SECTOR_ICONS = [
  "Landmark",
  "Building2",
  "ShoppingBag",
  "Plane",
  "GraduationCap",
  "Stethoscope",
  "Banknote",
  "Signal",
  "Cog",
  "Heart",
  "Store",
  "Sprout",
];

type SettingsField = { key: SettingsTextKey; label: string; multiline?: boolean; full?: boolean };
type SettingsGroup = { title: string; fields: SettingsField[]; hasProfileMedia?: boolean };

const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    title: "Hero Profile Card",
    hasProfileMedia: true,
    fields: [
      { key: "availability_text", label: "Availability Badge (top right of hero)", full: true },
      { key: "profile_title", label: "Profile Name" },
      { key: "profile_subtitle", label: "Profile Subtitle" },
      { key: "profile_footer_note", label: "Note Under Card", full: true },
      { key: "profile_cta_text", label: "Card Button Text" },
      { key: "profile_cta_link", label: "Card Button Link" },
    ],
  },
  {
    title: "Banner",
    fields: [
      { key: "banner_text", label: "Banner Text", multiline: true, full: true },
      { key: "banner_cta_text", label: "Banner Button Text" },
      { key: "banner_cta_link", label: "Banner Button Link" },
    ],
  },
  {
    title: "Trusted By Strip",
    fields: [
      { key: "trusted_eyebrow", label: "Eyebrow Label" },
      { key: "trusted_heading", label: "Heading Above Logos", full: true },
    ],
  },
  {
    title: "Services Section",
    fields: [
      { key: "services_eyebrow", label: "Eyebrow Label" },
      { key: "services_heading", label: "Heading" },
      { key: "services_subheading", label: "Subheading", multiline: true, full: true },
    ],
  },
  {
    title: "Process Section",
    fields: [
      { key: "process_eyebrow", label: "Eyebrow Label" },
      { key: "process_heading", label: "Heading" },
      { key: "process_description1", label: "Paragraph 1", multiline: true, full: true },
      { key: "process_description2", label: "Paragraph 2", multiline: true, full: true },
      { key: "process_cta_text", label: "Button Text (links to /what-i-do)", full: true },
    ],
  },
  {
    title: "Sectors Section",
    fields: [
      { key: "sectors_eyebrow", label: "Eyebrow Label" },
      { key: "sectors_heading", label: "Heading" },
      { key: "sectors_subheading", label: "Subheading", multiline: true, full: true },
    ],
  },
  {
    title: "Why Work With Me Section",
    fields: [
      { key: "reasons_eyebrow", label: "Eyebrow Label" },
      { key: "reasons_heading", label: "Heading" },
      { key: "reasons_subheading", label: "Subheading", multiline: true, full: true },
    ],
  },
  {
    title: "Insights Section",
    fields: [
      { key: "insights_eyebrow", label: "Eyebrow Label" },
      { key: "insights_heading", label: "Heading" },
      { key: "insights_subheading", label: "Subheading", multiline: true, full: true },
    ],
  },
  {
    title: "Bottom CTA Banner",
    fields: [
      { key: "cta_heading", label: "Heading", full: true },
      { key: "cta_subtext", label: "Subtext", multiline: true, full: true },
      { key: "cta_button_text", label: "Button Text" },
      { key: "cta_button_link", label: "Button Link" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
type Notify = (message: string, type?: "success" | "error") => void;
type ToastState = { id: number; message: string; type: "success" | "error" };

const errMsg = (e: unknown, fallback: string) => {
  if (e && typeof e === "object" && "message" in e && typeof (e as any).message === "string") {
    return (e as any).message as string;
  }
  return fallback;
};

const nextOrder = (rows: { sort_order: number }[]) =>
  rows.length ? Math.max(...rows.map((r) => Number(r.sort_order) || 0)) + 1 : 0;

const emptyToNull = (value: string | null | undefined) => {
  const v = (value ?? "").trim();
  return v ? v : null;
};

function normalizeWebsite(value: string | null | undefined): string | null {
  const v = (value ?? "").trim();
  if (!v) return null;
  const withProtocol = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    new URL(withProtocol);
  } catch {
    throw new Error("Enter a valid website address (e.g. https://example.com)");
  }
  return withProtocol;
}

function fileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName && fromName.length <= 5) return fromName;
  return file.type.split("/")[1]?.replace(/[^a-z0-9]/g, "") || "png";
}

async function uploadImage(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error(`"${file.name}" is not an image file`);
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new Error(`"${file.name}" is larger than ${MAX_UPLOAD_MB}MB`);
  }
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

/* ═══════════════════════════════════════════════════════════
   DATA HOOKS
═══════════════════════════════════════════════════════════ */
function useAdminList<T>(table: string, key: string) {
  return useQuery({
    queryKey: [key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

function useTableCrud<T extends { id?: string }>(cfg: {
  table: string;
  listKey: string;
  label: string;
  notify: Notify;
  toPayload: (row: T) => Record<string, unknown>;
  onSaved?: () => void;
  afterDelete?: (row: T) => Promise<void>;
}) {
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [cfg.listKey] });
    invalidateHomeContent(queryClient);
  };

  const save = useMutation<void, unknown, T>({
    mutationFn: async (row) => {
      const payload = cfg.toPayload(row);
      const { error } = row.id
        ? await supabase.from(cfg.table).update(payload).eq("id", row.id)
        : await supabase.from(cfg.table).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      refresh();
      cfg.onSaved?.();
      cfg.notify(`${cfg.label} saved`);
    },
    onError: (e) => cfg.notify(errMsg(e, `Failed to save ${cfg.label.toLowerCase()}`), "error"),
  });

  const remove = useMutation<void, unknown, T>({
    mutationFn: async (row) => {
      if (!row.id) return;
      const { error } = await supabase.from(cfg.table).delete().eq("id", row.id);
      if (error) throw error;
      try {
        await cfg.afterDelete?.(row);
      } catch {
        /* a leftover storage file must not fail the delete */
      }
    },
    onSuccess: () => {
      refresh();
      cfg.notify(`${cfg.label} deleted`);
    },
    onError: (e) => cfg.notify(errMsg(e, `Failed to delete ${cfg.label.toLowerCase()}`), "error"),
  });

  return { save, remove };
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ManageContent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [reordering, setReordering] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback<Notify>(
    (message, type = "success") => setToast({ id: Date.now(), message, type }),
    []
  );
  const closeToast = useCallback(() => setToast(null), []);

  /* ── Queries ────────────────────────────────────────────── */
  const heroQ = useQuery({
    queryKey: ["admin-hero"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase.from("hero_content").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return (data as Record<string, any> | null) ?? null;
    },
  });

  const settingsQ = useQuery({
    queryKey: ["admin-site-settings"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return (data as Record<string, any> | null) ?? null;
    },
  });

  const carouselQ = useAdminList<CarouselImage>("carousel_images", "admin-carousel-images");
  const pairsQ = useAdminList<HeroPair>("hero_pairs", "admin-hero-pairs");
  const processQ = useAdminList<ProcessStep>("process_steps", "admin-process-steps");
  const sectorsQ = useAdminList<Sector>("sectors", "admin-sectors");
  const partnersQ = useAdminList<Partner>("partners", "admin-partners");
  const reasonsQ = useAdminList<Reason>("reasons", "admin-reasons");

  const carouselImages = carouselQ.data ?? [];
  const pairs = pairsQ.data ?? [];
  const processSteps = processQ.data ?? [];
  const sectors = sectorsQ.data ?? [];
  const partners = partnersQ.data ?? [];
  const reasons = reasonsQ.data ?? [];

  /* ── Local edit state ───────────────────────────────────── */
  const [heroForm, setHeroForm] = useState<HeroContent | null>(null);
  const [settingsForm, setSettingsForm] = useState<SiteSettings | null>(null);
  const [focusText, setFocusText] = useState("");
  const [editingPair, setEditingPair] = useState<HeroPair | null>(null);
  const [editingProcess, setEditingProcess] = useState<ProcessStep | null>(null);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [editingReason, setEditingReason] = useState<Reason | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  useEffect(() => {
    if (!heroQ.isSuccess) return;
    setHeroForm(mergeDefaults(DEFAULT_HERO, heroQ.data));
  }, [heroQ.isSuccess, heroQ.data]);

  useEffect(() => {
    if (!settingsQ.isSuccess) return;
    const row = settingsQ.data;
    const focus =
      row && row.focus_areas !== null && row.focus_areas !== undefined
        ? toStringArray(row.focus_areas)
        : DEFAULT_SETTINGS.focus_areas;
    setSettingsForm({ ...mergeDefaults(DEFAULT_SETTINGS, row), focus_areas: focus });
    setFocusText(focus.join(", "));
  }, [settingsQ.isSuccess, settingsQ.data]);

  /* ── CRUD hooks ─────────────────────────────────────────── */
  const pairCrud = useTableCrud<HeroPair>({
    table: "hero_pairs",
    listKey: "admin-hero-pairs",
    label: "Hero pair",
    notify: showToast,
    onSaved: () => setEditingPair(null),
    toPayload: (p) => ({
      problem: p.problem.trim(),
      solution: p.solution.trim(),
      sort_order: p.sort_order,
      published: p.published,
    }),
  });

  const processCrud = useTableCrud<ProcessStep>({
    table: "process_steps",
    listKey: "admin-process-steps",
    label: "Process step",
    notify: showToast,
    onSaved: () => setEditingProcess(null),
    toPayload: (s) => ({
      step_number: s.step_number.trim() || "01",
      title: s.title.trim(),
      description: s.description.trim(),
      sort_order: s.sort_order,
      published: s.published,
    }),
  });

  const sectorCrud = useTableCrud<Sector>({
    table: "sectors",
    listKey: "admin-sectors",
    label: "Sector",
    notify: showToast,
    onSaved: () => setEditingSector(null),
    toPayload: (s) => ({
      icon: s.icon,
      label: s.label.trim(),
      sort_order: s.sort_order,
      published: s.published,
    }),
  });

  const reasonCrud = useTableCrud<Reason>({
    table: "reasons",
    listKey: "admin-reasons",
    label: "Reason",
    notify: showToast,
    onSaved: () => setEditingReason(null),
    toPayload: (r) => ({
      t: r.t.trim(),
      d: r.d.trim(),
      sort_order: r.sort_order,
      published: r.published,
    }),
  });

  const partnerCrud = useTableCrud<Partner>({
    table: "partners",
    listKey: "admin-partners",
    label: "Partner",
    notify: showToast,
    onSaved: () => setEditingPartner(null),
    afterDelete: (p) => removeUploadedImage(p.logo_url),
    toPayload: (p) => {
      if (!p.name.trim()) throw new Error("Partner name is required");
      return {
        name: p.name.trim(),
        logo_url: emptyToNull(p.logo_url),
        website_url: normalizeWebsite(p.website_url),
        description: emptyToNull(p.description),
        category: emptyToNull(p.category),
        show_on_home: p.show_on_home,
        published: p.published,
        sort_order: p.sort_order,
      };
    },
  });

  const carouselCrud = useTableCrud<CarouselImage>({
    table: "carousel_images",
    listKey: "admin-carousel-images",
    label: "Image",
    notify: showToast,
    afterDelete: (img) => removeUploadedImage(img.url),
    toPayload: (img) => ({ url: img.url, alt_text: img.alt_text ?? null, sort_order: img.sort_order }),
  });

  /* ── Hero + Settings mutations ──────────────────────────── */
  const saveHero = useMutation<void, unknown, HeroContent>({
    mutationFn: async (form) => {
      if (!form.heading.trim()) throw new Error("Main heading is required");
      const payload = {
        badge: form.badge.trim(),
        heading: form.heading.trim(),
        subheading: form.subheading.trim(),
        primary_cta_text: form.primary_cta_text.trim(),
        primary_cta_link: form.primary_cta_link.trim(),
        secondary_cta_text: form.secondary_cta_text.trim(),
        secondary_cta_link: form.secondary_cta_link.trim(),
      };
      const { error } = form.id
        ? await supabase.from("hero_content").update(payload).eq("id", form.id)
        : await supabase.from("hero_content").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero"] });
      invalidateHomeContent(queryClient);
      showToast("Hero section updated");
    },
    onError: (e) => showToast(errMsg(e, "Failed to save Hero section"), "error"),
  });

  const saveSettings = useMutation<void, unknown, { form: SiteSettings; focus: string }>({
    mutationFn: async ({ form, focus }) => {
      const payload: Record<string, unknown> = { focus_areas: toStringArray(focus) };
      for (const key of SETTINGS_TEXT_FIELDS) payload[key] = (form[key] ?? "").trim();
      const { error } = form.id
        ? await supabase.from("site_settings").update(payload).eq("id", form.id)
        : await supabase.from("site_settings").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
      invalidateHomeContent(queryClient);
      showToast("Site settings saved");
    },
    onError: (e) => showToast(errMsg(e, "Failed to save settings"), "error"),
  });

  /* ── Uploads ────────────────────────────────────────────── */
  const handleProfileImageUpload = async (file: File) => {
    setUploadingProfilePic(true);
    try {
      const url = await uploadImage(file, "profile");
      setSettingsForm((prev) => (prev ? { ...prev, profile_image_url: url } : prev));
      showToast("Profile image uploaded — click Save All Settings to publish it");
    } catch (e) {
      showToast(errMsg(e, "Failed to upload profile image"), "error");
    } finally {
      setUploadingProfilePic(false);
      if (profileImageInputRef.current) profileImageInputRef.current.value = "";
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const url = await uploadImage(file, "partners");
      setEditingPartner((prev) => (prev ? { ...prev, logo_url: url } : prev));
      showToast("Logo uploaded — click Save to publish it");
    } catch (e) {
      showToast(errMsg(e, "Failed to upload logo"), "error");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleUploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      showToast("Please select valid image files", "error");
      return;
    }

    setUploading(true);
    let order = nextOrder(carouselImages);
    let done = 0;
    try {
      for (const file of list) {
        const url = await uploadImage(file, "carousel");
        const { error } = await supabase.from("carousel_images").insert({
          url,
          alt_text: file.name.replace(/\.[^.]+$/, ""),
          sort_order: order++,
        });
        if (error) {
          await removeUploadedImage(url);
          throw error;
        }
        done++;
      }
      showToast(`${done} image(s) uploaded`);
    } catch (e) {
      showToast(
        done > 0 ? `${done} uploaded, then: ${errMsg(e, "upload failed")}` : errMsg(e, "Failed to upload image(s)"),
        "error"
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["admin-carousel-images"] });
      invalidateHomeContent(queryClient);
    }
  };

  const updateAltText = async (img: CarouselImage, alt_text: string) => {
    if (!img.id || (img.alt_text ?? "") === alt_text) return;
    const { error } = await supabase.from("carousel_images").update({ alt_text }).eq("id", img.id);
    if (error) {
      showToast(errMsg(error, "Failed to update caption"), "error");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["admin-carousel-images"] });
    invalidateHomeContent(queryClient);
  };

  /* ── Reorder (re-numbers the whole list, so duplicates can't break it) ── */
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
      const changes = next
        .map((item, i) => ({ item, i }))
        .filter(({ item, i }) => item.id && item.sort_order !== i);
      const results = await Promise.all(
        changes.map(({ item, i }) => supabase.from(table).update({ sort_order: i }).eq("id", item.id as string))
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    } catch (e) {
      showToast(errMsg(e, "Failed to reorder"), "error");
    } finally {
      setReordering(false);
      queryClient.invalidateQueries({ queryKey: [listKey] });
      invalidateHomeContent(queryClient);
    }
  };

  /* ── Tabs config ────────────────────────────────────────── */
  const tabs: { id: Tab; label: string; icon: typeof Layers }[] = [
    { id: "hero", label: "Hero", icon: Sparkles },
    { id: "carousel", label: "Carousel Images", icon: ImageIcon },
    { id: "pairs", label: "Hero Pairs", icon: MessageSquare },
    { id: "partners", label: "Partners", icon: Building2 },
    { id: "process", label: "Process Steps", icon: ListOrdered },
    { id: "sectors", label: "Sectors", icon: Layers },
    { id: "reasons", label: "Why Work With Me", icon: CheckCircle2 },
    { id: "settings", label: "Homepage Copy & Settings", icon: Settings2 },
  ];

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#FBF9F5]">
      {/* Header */}
      <div className="border-b border-[#E8E2D6] bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1 className="font-display text-2xl text-[#1A1A16] tracking-tight">Manage Content</h1>
          <p className="font-body text-sm text-[#524646]/70 mt-0.5">
            Everything on the homepage is edited here — hero, partners, sections, copy and settings.
          </p>

          <div className="flex flex-wrap gap-1 mt-5 -mb-px">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-body rounded-t-md transition-colors ${
                  activeTab === id
                    ? "bg-[#FBF9F5] text-[#007979] border border-[#E8E2D6] border-b-[#FBF9F5] font-medium"
                    : "text-[#524646]/70 hover:text-[#007979]"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* ════════════ HERO ════════════ */}
          {activeTab === "hero" && (
            <TabPane key="hero">
              {heroQ.isError ? (
                <QueryError error={heroQ.error} />
              ) : heroQ.isPending || !heroForm ? (
                <Spinner />
              ) : (
                <div className="bg-white border border-[#E8E2D6] rounded-xl p-6 space-y-6 max-w-2xl">
                  <Field
                    label="Badge / Eyebrow"
                    value={heroForm.badge}
                    onChange={(v) => setHeroForm({ ...heroForm, badge: v })}
                    placeholder="Consulting · Public & Private Sector"
                  />
                  <Field
                    label="Main Heading (shown when there are no Hero Pairs)"
                    value={heroForm.heading}
                    onChange={(v) => setHeroForm({ ...heroForm, heading: v })}
                    multiline
                  />
                  <Field
                    label="Subheading / Description"
                    value={heroForm.subheading}
                    onChange={(v) => setHeroForm({ ...heroForm, subheading: v })}
                    multiline
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Primary CTA Text"
                      value={heroForm.primary_cta_text}
                      onChange={(v) => setHeroForm({ ...heroForm, primary_cta_text: v })}
                    />
                    <Field
                      label="Primary CTA Link"
                      value={heroForm.primary_cta_link}
                      onChange={(v) => setHeroForm({ ...heroForm, primary_cta_link: v })}
                      placeholder="/what-i-do"
                    />
                    <Field
                      label="Secondary CTA Text"
                      value={heroForm.secondary_cta_text}
                      onChange={(v) => setHeroForm({ ...heroForm, secondary_cta_text: v })}
                    />
                    <Field
                      label="Secondary CTA Link"
                      value={heroForm.secondary_cta_link}
                      onChange={(v) => setHeroForm({ ...heroForm, secondary_cta_link: v })}
                      placeholder="/projects"
                    />
                  </div>
                  <SaveButton loading={saveHero.isPending} onClick={() => saveHero.mutate(heroForm)}>
                    Save Hero Content
                  </SaveButton>
                </div>
              )}
            </TabPane>
          )}

          {/* ════════════ CAROUSEL ════════════ */}
          {activeTab === "carousel" && (
            <TabPane key="carousel" className="space-y-6">
              <p className="font-body text-sm text-[#524646]/70">
                These images rotate in the homepage hero card, after the profile image. Max {MAX_UPLOAD_MB}MB each.
              </p>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.length) handleUploadFiles(e.dataTransfer.files);
                }}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-[#007979] bg-[#007979]/5"
                    : "border-[#E8E2D6] bg-white hover:border-[#007979]/50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  {uploading ? (
                    <Loader2 className="animate-spin text-[#007979]" size={32} />
                  ) : (
                    <UploadCloud size={32} className="text-[#007979]" />
                  )}
                  <p className="font-display text-lg text-[#1A1A16]">
                    {uploading ? "Uploading images..." : "Drag and drop carousel images here"}
                  </p>
                  <p className="font-body text-xs text-[#524646]/70">or click to browse files from your device</p>
                </div>
              </div>

              <ListState
                loading={carouselQ.isPending}
                error={carouselQ.error}
                isEmpty={carouselImages.length === 0}
                emptyTitle="No carousel images uploaded"
                emptyDescription="Upload images above to build your homepage carousel."
                onAdd={() => fileInputRef.current?.click()}
                addLabel="Upload images"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {carouselImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className="bg-white border border-[#E8E2D6] rounded-xl p-3 flex flex-col gap-3"
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-[#FBF9F5] border border-[#E8E2D6]">
                        <img src={img.url} alt={img.alt_text || "Carousel item"} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <button
                            onClick={() => moveItem("carousel_images", "admin-carousel-images", carouselImages, idx, "up")}
                            disabled={idx === 0 || reordering}
                            aria-label="Move earlier"
                            className="p-1 rounded bg-black/60 text-white hover:bg-black disabled:opacity-30"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={() => moveItem("carousel_images", "admin-carousel-images", carouselImages, idx, "down")}
                            disabled={idx === carouselImages.length - 1 || reordering}
                            aria-label="Move later"
                            className="p-1 rounded bg-black/60 text-white hover:bg-black disabled:opacity-30"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm("Remove this image from the carousel?")) carouselCrud.remove.mutate(img);
                          }}
                          aria-label="Delete image"
                          className="absolute top-2 right-2 p-1.5 rounded bg-red-600/80 text-white hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-body text-[10px] uppercase tracking-widest text-[#524646]/70">
                          Alt / Caption
                        </label>
                        <input
                          type="text"
                          defaultValue={img.alt_text || ""}
                          onBlur={(e) => updateAltText(img, e.target.value)}
                          placeholder="Image description"
                          className="w-full px-3 py-1.5 border border-[#E8E2D6] rounded font-body text-xs focus:outline-none focus:ring-1 focus:ring-[#007979]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ListState>
            </TabPane>
          )}

          {/* ════════════ HERO PAIRS ════════════ */}
          {activeTab === "pairs" && (
            <TabPane key="pairs">
              <TabHeader
                description="These rotate on the homepage hero (Problem → Solution)."
                actionLabel="Add Pair"
                onAction={() =>
                  setEditingPair({ problem: "", solution: "", sort_order: nextOrder(pairs), published: true })
                }
              />
              <ListState
                loading={pairsQ.isPending}
                error={pairsQ.error}
                isEmpty={pairs.length === 0}
                emptyTitle="No hero pairs yet"
                emptyDescription="Add your first problem → solution pair. Until then the hero shows the Main Heading."
                onAdd={() => setEditingPair({ problem: "", solution: "", sort_order: 0, published: true })}
              >
                <div className="space-y-3">
                  {pairs.map((pair, idx) => (
                    <RowShell
                      key={pair.id}
                      index={idx}
                      total={pairs.length}
                      busy={reordering}
                      onMove={(d) => moveItem("hero_pairs", "admin-hero-pairs", pairs, idx, d)}
                      onEdit={() => setEditingPair(pair)}
                      onDelete={() => {
                        if (confirm("Delete this pair?")) pairCrud.remove.mutate(pair);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-widest text-[#EC5B38] font-body">Problem</span>
                        {!pair.published && <DraftBadge />}
                      </div>
                      <p className="font-display text-lg text-[#1A1A16]">{pair.problem}</p>
                      <div className="mt-3">
                        <span className="text-[10px] uppercase tracking-widest text-[#007979] font-body">Solution</span>
                        <p className="font-display text-lg text-[#007979] mt-0.5">{pair.solution}</p>
                      </div>
                    </RowShell>
                  ))}
                </div>
              </ListState>
            </TabPane>
          )}

          {/* ════════════ PARTNERS ════════════ */}
          {activeTab === "partners" && (
            <TabPane key="partners">
              <TabHeader
                description="Trusted-by companies. “Show on homepage” partners appear in the logo strip; every published partner is ready for the upcoming Partners page."
                actionLabel="Add Partner"
                onAction={() =>
                  setEditingPartner({
                    name: "",
                    logo_url: null,
                    website_url: null,
                    description: null,
                    category: null,
                    show_on_home: true,
                    published: true,
                    sort_order: nextOrder(partners),
                  })
                }
              />
              <ListState
                loading={partnersQ.isPending}
                error={partnersQ.error}
                isEmpty={partners.length === 0}
                emptyTitle="No partners yet"
                emptyDescription="Add the companies and institutions you have worked with."
                onAdd={() =>
                  setEditingPartner({
                    name: "",
                    logo_url: null,
                    website_url: null,
                    description: null,
                    category: null,
                    show_on_home: true,
                    published: true,
                    sort_order: 0,
                  })
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {partners.map((p, idx) => (
                    <div key={p.id} className="group bg-white border border-[#E8E2D6] rounded-xl p-4 flex flex-col gap-3">
                      <div className="h-20 rounded-lg bg-[#FBF9F5] border border-[#E8E2D6] flex items-center justify-center overflow-hidden p-3">
                        {p.logo_url ? (
                          <img src={p.logo_url} alt={p.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="font-display text-base text-[#524646]/60 text-center">{p.name}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-[15px] text-[#1A1A16] truncate">{p.name}</p>
                        <p className="font-body text-[11px] text-[#9A9A9A] truncate">
                          {p.website_url || "No website"}
                          {p.category ? ` · ${p.category}` : ""}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.show_on_home ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#007979]/10 text-[#007979]">On homepage</span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">Partners page only</span>
                          )}
                          {!p.published && <DraftBadge />}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <MoveButtons
                          horizontal
                          index={idx}
                          total={partners.length}
                          busy={reordering}
                          onMove={(d) => moveItem("partners", "admin-partners", partners, idx, d)}
                        />
                        <RowActions
                          onEdit={() => setEditingPartner(p)}
                          onDelete={() => {
                            if (confirm(`Delete partner "${p.name}"?`)) partnerCrud.remove.mutate(p);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ListState>
            </TabPane>
          )}

          {/* ════════════ PROCESS STEPS ════════════ */}
          {activeTab === "process" && (
            <TabPane key="process">
              <TabHeader
                description="Approach and process steps displayed on the homepage."
                actionLabel="Add Step"
                onAction={() =>
                  setEditingProcess({
                    step_number: String(processSteps.length + 1).padStart(2, "0"),
                    title: "",
                    description: "",
                    sort_order: nextOrder(processSteps),
                    published: true,
                  })
                }
              />
              <ListState
                loading={processQ.isPending}
                error={processQ.error}
                isEmpty={processSteps.length === 0}
                emptyTitle="No process steps found"
                emptyDescription="Add steps for your work approach."
                onAdd={() =>
                  setEditingProcess({ step_number: "01", title: "", description: "", sort_order: 0, published: true })
                }
              >
                <div className="space-y-3">
                  {processSteps.map((step, idx) => (
                    <RowShell
                      key={step.id}
                      index={idx}
                      total={processSteps.length}
                      busy={reordering}
                      lead={
                        <div className="w-12 h-12 rounded-lg bg-[#FBF9F5] border border-[#E8E2D6] flex items-center justify-center font-display text-lg font-bold text-[#007979] shrink-0">
                          {step.step_number || String(idx + 1).padStart(2, "0")}
                        </div>
                      }
                      onMove={(d) => moveItem("process_steps", "admin-process-steps", processSteps, idx, d)}
                      onEdit={() => setEditingProcess(step)}
                      onDelete={() => {
                        if (confirm("Delete this process step?")) processCrud.remove.mutate(step);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg text-[#1A1A16]">{step.title}</h3>
                        {!step.published && <DraftBadge />}
                      </div>
                      <p className="font-body text-sm text-[#524646]/80 mt-1 leading-relaxed">{step.description}</p>
                    </RowShell>
                  ))}
                </div>
              </ListState>
            </TabPane>
          )}

          {/* ════════════ SECTORS ════════════ */}
          {activeTab === "sectors" && (
            <TabPane key="sectors">
              <TabHeader
                description="Sectors shown on the homepage grid."
                actionLabel="Add Sector"
                onAction={() =>
                  setEditingSector({ icon: "Landmark", label: "", sort_order: nextOrder(sectors), published: true })
                }
              />
              <ListState
                loading={sectorsQ.isPending}
                error={sectorsQ.error}
                isEmpty={sectors.length === 0}
                emptyTitle="No sectors yet"
                emptyDescription="Add the industries you work with."
                onAdd={() => setEditingSector({ icon: "Landmark", label: "", sort_order: 0, published: true })}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sectors.map((sector, idx) => (
                    <div
                      key={sector.id}
                      className="group bg-white border border-[#E8E2D6] rounded-xl p-4 flex items-center gap-3"
                    >
                      <MoveButtons
                        index={idx}
                        total={sectors.length}
                        busy={reordering}
                        small
                        onMove={(d) => moveItem("sectors", "admin-sectors", sectors, idx, d)}
                      />
                      <div className="w-10 h-10 rounded-lg bg-[#FBF9F5] flex items-center justify-center text-[#007979] font-body text-xs font-bold shrink-0">
                        {sector.icon.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-[15px] text-[#1A1A16] truncate">{sector.label}</p>
                        <p className="font-body text-[11px] text-[#9A9A9A]">
                          {sector.icon}
                          {!sector.published ? " · Draft" : ""}
                        </p>
                      </div>
                      <RowActions
                        small
                        onEdit={() => setEditingSector(sector)}
                        onDelete={() => {
                          if (confirm("Delete this sector?")) sectorCrud.remove.mutate(sector);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </ListState>
            </TabPane>
          )}

          {/* ════════════ REASONS ════════════ */}
          {activeTab === "reasons" && (
            <TabPane key="reasons">
              <TabHeader
                description="“Why work with me” cards on the homepage."
                actionLabel="Add Reason"
                onAction={() => setEditingReason({ t: "", d: "", sort_order: nextOrder(reasons), published: true })}
              />
              <ListState
                loading={reasonsQ.isPending}
                error={reasonsQ.error}
                isEmpty={reasons.length === 0}
                emptyTitle="No reasons yet"
                emptyDescription="Add the key reasons clients should work with you."
                onAdd={() => setEditingReason({ t: "", d: "", sort_order: 0, published: true })}
              >
                <div className="space-y-3">
                  {reasons.map((reason, idx) => (
                    <RowShell
                      key={reason.id}
                      index={idx}
                      total={reasons.length}
                      busy={reordering}
                      onMove={(d) => moveItem("reasons", "admin-reasons", reasons, idx, d)}
                      onEdit={() => setEditingReason(reason)}
                      onDelete={() => {
                        if (confirm("Delete this reason?")) reasonCrud.remove.mutate(reason);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg text-[#1A1A16]">{reason.t}</h3>
                        {!reason.published && <DraftBadge />}
                      </div>
                      <p className="font-body text-sm text-[#524646]/80 mt-1 leading-relaxed">{reason.d}</p>
                    </RowShell>
                  ))}
                </div>
              </ListState>
            </TabPane>
          )}

          {/* ════════════ SETTINGS ════════════ */}
          {activeTab === "settings" && (
            <TabPane key="settings">
              {settingsQ.isError ? (
                <QueryError error={settingsQ.error} />
              ) : settingsQ.isPending || !settingsForm ? (
                <Spinner />
              ) : (
                <div className="bg-white border border-[#E8E2D6] rounded-xl p-6 space-y-8 max-w-3xl">
                  {SETTINGS_GROUPS.map((group) => (
                    <div key={group.title} className="space-y-4">
                      <h2 className="font-display text-lg text-[#1A1A16] border-b border-[#E8E2D6] pb-2">
                        {group.title}
                      </h2>

                      {group.hasProfileMedia && (
                        <>
                          <div>
                            <label className="block font-body text-xs uppercase tracking-widest text-[#524646]/70 mb-2">
                              Profile Image
                            </label>
                            <div className="flex items-center gap-4">
                              <div className="relative w-20 h-20 rounded-full bg-[#FBF9F5] border border-[#E8E2D6] overflow-hidden flex items-center justify-center shrink-0">
                                {settingsForm.profile_image_url ? (
                                  <img
                                    src={settingsForm.profile_image_url}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User size={32} className="text-[#524646]/40" />
                                )}
                                {uploadingProfilePic && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-white" size={18} />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                <input
                                  type="file"
                                  ref={profileImageInputRef}
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleProfileImageUpload(file);
                                  }}
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => profileImageInputRef.current?.click()}
                                    disabled={uploadingProfilePic}
                                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#007979] text-[#FFE2AF] rounded-lg text-xs font-body font-medium hover:bg-[#24B1B1] transition-colors disabled:opacity-60"
                                  >
                                    <UploadCloud size={14} /> Upload Image
                                  </button>
                                  {settingsForm.profile_image_url && (
                                    <button
                                      type="button"
                                      onClick={() => setSettingsForm({ ...settingsForm, profile_image_url: "" })}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-body font-medium hover:bg-red-100 transition-colors"
                                    >
                                      <Trash2 size={13} /> Remove
                                    </button>
                                  )}
                                </div>
                                <p className="font-body text-[11px] text-[#524646]/60">
                                  JPG, PNG or WEBP, up to {MAX_UPLOAD_MB}MB. Square or portrait works best.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block font-body text-xs uppercase tracking-widest text-[#524646]/70 mb-2">
                              Focus Areas (comma separated)
                            </label>
                            <input
                              type="text"
                              value={focusText}
                              onChange={(e) => setFocusText(e.target.value)}
                              placeholder="GovTech, Systems, Automation"
                              className="w-full px-4 py-2.5 border border-[#E8E2D6] rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#007979]/30 focus:border-[#007979]"
                            />
                          </div>
                        </>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {group.fields.map((f) => (
                          <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
                            <Field
                              label={f.label}
                              multiline={f.multiline}
                              value={settingsForm[f.key] ?? ""}
                              onChange={(v) => setSettingsForm({ ...settingsForm, [f.key]: v })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <SaveButton
                    loading={saveSettings.isPending}
                    onClick={() => saveSettings.mutate({ form: settingsForm, focus: focusText })}
                  >
                    Save All Settings
                  </SaveButton>
                </div>
              )}
            </TabPane>
          )}
        </AnimatePresence>
      </div>

      {/* ════════════ MODALS ════════════ */}
      <AnimatePresence>
        {editingPair && (
          <Modal title={editingPair.id ? "Edit Hero Pair" : "New Hero Pair"} onClose={() => setEditingPair(null)}>
            <div className="space-y-4">
              <Field
                label="Problem"
                value={editingPair.problem}
                onChange={(v) => setEditingPair({ ...editingPair, problem: v })}
                placeholder="Slow manual work."
              />
              <Field
                label="Solution"
                value={editingPair.solution}
                onChange={(v) => setEditingPair({ ...editingPair, solution: v })}
                placeholder="We automate systems."
              />
              <Checkbox
                label="Published"
                checked={editingPair.published}
                onChange={(c) => setEditingPair({ ...editingPair, published: c })}
              />
              <ModalActions
                onCancel={() => setEditingPair(null)}
                onSave={() => pairCrud.save.mutate(editingPair)}
                saving={pairCrud.save.isPending}
                disabled={!editingPair.problem.trim() || !editingPair.solution.trim()}
              />
            </div>
          </Modal>
        )}

        {editingProcess && (
          <Modal
            title={editingProcess.id ? "Edit Process Step" : "New Process Step"}
            onClose={() => setEditingProcess(null)}
          >
            <div className="space-y-4">
              <Field
                label="Step Number"
                value={editingProcess.step_number}
                onChange={(v) => setEditingProcess({ ...editingProcess, step_number: v })}
                placeholder="01"
              />
              <Field
                label="Title"
                value={editingProcess.title}
                onChange={(v) => setEditingProcess({ ...editingProcess, title: v })}
                placeholder="Discovery & Audit"
              />
              <Field
                label="Description"
                value={editingProcess.description}
                onChange={(v) => setEditingProcess({ ...editingProcess, description: v })}
                multiline
                placeholder="We audit existing workflows..."
              />
              <Checkbox
                label="Published"
                checked={editingProcess.published}
                onChange={(c) => setEditingProcess({ ...editingProcess, published: c })}
              />
              <ModalActions
                onCancel={() => setEditingProcess(null)}
                onSave={() => processCrud.save.mutate(editingProcess)}
                saving={processCrud.save.isPending}
                disabled={!editingProcess.title.trim()}
              />
            </div>
          </Modal>
        )}

        {editingSector && (
          <Modal title={editingSector.id ? "Edit Sector" : "New Sector"} onClose={() => setEditingSector(null)}>
            <div className="space-y-4">
              <Field
                label="Label"
                value={editingSector.label}
                onChange={(v) => setEditingSector({ ...editingSector, label: v })}
                placeholder="Government"
              />
              <div>
                <label className="block font-body text-xs uppercase tracking-widest text-[#524646]/70 mb-2">Icon</label>
                <select
                  value={editingSector.icon}
                  onChange={(e) => setEditingSector({ ...editingSector, icon: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#E8E2D6] rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#007979]/30"
                >
                  {SECTOR_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
              <Checkbox
                label="Published"
                checked={editingSector.published}
                onChange={(c) => setEditingSector({ ...editingSector, published: c })}
              />
              <ModalActions
                onCancel={() => setEditingSector(null)}
                onSave={() => sectorCrud.save.mutate(editingSector)}
                saving={sectorCrud.save.isPending}
                disabled={!editingSector.label.trim()}
              />
            </div>
          </Modal>
        )}

        {editingReason && (
          <Modal title={editingReason.id ? "Edit Reason" : "New Reason"} onClose={() => setEditingReason(null)}>
            <div className="space-y-4">
              <Field
                label="Title"
                value={editingReason.t}
                onChange={(v) => setEditingReason({ ...editingReason, t: v })}
                placeholder="Fair pricing based on results"
              />
              <Field
                label="Description"
                value={editingReason.d}
                onChange={(v) => setEditingReason({ ...editingReason, d: v })}
                multiline
                placeholder="We agree on the final result and price first..."
              />
              <Checkbox
                label="Published"
                checked={editingReason.published}
                onChange={(c) => setEditingReason({ ...editingReason, published: c })}
              />
              <ModalActions
                onCancel={() => setEditingReason(null)}
                onSave={() => reasonCrud.save.mutate(editingReason)}
                saving={reasonCrud.save.isPending}
                disabled={!editingReason.t.trim() || !editingReason.d.trim()}
              />
            </div>
          </Modal>
        )}

        {editingPartner && (
          <Modal title={editingPartner.id ? "Edit Partner" : "New Partner"} onClose={() => setEditingPartner(null)}>
            <div className="space-y-4">
              <Field
                label="Company / Partner Name"
                value={editingPartner.name}
                onChange={(v) => setEditingPartner({ ...editingPartner, name: v })}
                placeholder="Acme Corporation"
              />

              <div>
                <label className="block font-body text-xs uppercase tracking-widest text-[#524646]/70 mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-28 h-16 rounded-lg bg-[#FBF9F5] border border-[#E8E2D6] flex items-center justify-center overflow-hidden p-2 shrink-0">
                    {editingPartner.logo_url ? (
                      <img
                        src={editingPartner.logo_url}
                        alt="Logo preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <ImageIcon size={22} className="text-[#524646]/30" />
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
                        if (file) handleLogoUpload(file);
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#007979] text-[#FFE2AF] rounded-lg text-xs font-body font-medium hover:bg-[#24B1B1] transition-colors disabled:opacity-60"
                      >
                        <UploadCloud size={14} /> Upload
                      </button>
                      {editingPartner.logo_url && (
                        <button
                          type="button"
                          onClick={() => setEditingPartner({ ...editingPartner, logo_url: null })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-body font-medium hover:bg-red-100"
                        >
                          <Trash2 size={13} /> Clear
                        </button>
                      )}
                    </div>
                    <p className="font-body text-[11px] text-[#524646]/60">
                      PNG/SVG with transparent background works best. Without a logo the name is shown.
                    </p>
                  </div>
                </div>
              </div>

              <Field
                label="Or paste a logo URL"
                value={editingPartner.logo_url ?? ""}
                onChange={(v) => setEditingPartner({ ...editingPartner, logo_url: v })}
                placeholder="https://…/logo.png"
              />
              <Field
                label="Website"
                value={editingPartner.website_url ?? ""}
                onChange={(v) => setEditingPartner({ ...editingPartner, website_url: v })}
                placeholder="acme.com"
              />
              <Field
                label="Category (for the Partners page)"
                value={editingPartner.category ?? ""}
                onChange={(v) => setEditingPartner({ ...editingPartner, category: v })}
                placeholder="Government, NGO, Private…"
              />
              <Field
                label="Short Description (for the Partners page)"
                value={editingPartner.description ?? ""}
                onChange={(v) => setEditingPartner({ ...editingPartner, description: v })}
                multiline
              />
              <Checkbox
                label="Show on homepage Trusted-By strip"
                checked={editingPartner.show_on_home}
                onChange={(c) => setEditingPartner({ ...editingPartner, show_on_home: c })}
              />
              <Checkbox
                label="Published"
                checked={editingPartner.published}
                onChange={(c) => setEditingPartner({ ...editingPartner, published: c })}
              />
              <ModalActions
                onCancel={() => setEditingPartner(null)}
                onSave={() => partnerCrud.save.mutate(editingPartner)}
                saving={partnerCrud.save.isPending}
                disabled={!editingPartner.name.trim() || uploadingLogo}
              />
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={closeToast} />}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SMALL UI PRIMITIVES
═══════════════════════════════════════════════════════════ */
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
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
        If this is a new table or column, run <code>supabase/homepage_cms.sql</code> in the Supabase SQL editor and
        reload.
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
  addLabel = "Add first item",
  children,
}: {
  loading: boolean;
  error: unknown;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  onAdd: () => void;
  addLabel?: string;
  children: React.ReactNode;
}) {
  if (loading) return <Spinner />;
  if (error) return <QueryError error={error} />;
  if (isEmpty) {
    return (
      <div className="bg-white border border-dashed border-[#E8E2D6] rounded-xl py-16 text-center px-4">
        <p className="font-display text-lg text-[#1A1A16]">{emptyTitle}</p>
        <p className="font-body text-sm text-[#524646]/70 mt-1">{emptyDescription}</p>
        <button
          onClick={onAdd}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-medium hover:bg-[#24B1B1]"
        >
          <Plus size={16} /> {addLabel}
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

function TabHeader({
  description,
  actionLabel,
  onAction,
}: {
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
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
  horizontal = false,
  small = false,
}: {
  index: number;
  total: number;
  busy: boolean;
  onMove: (direction: "up" | "down") => void;
  horizontal?: boolean;
  small?: boolean;
}) {
  const size = small ? 12 : 14;
  return (
    <div className={`flex ${horizontal ? "flex-row gap-2" : "flex-col gap-1"} text-[#9A9A9A]`}>
      <button
        onClick={() => onMove("up")}
        disabled={index === 0 || busy}
        aria-label="Move up"
        className="hover:text-[#007979] disabled:opacity-30"
      >
        <ArrowUp size={size} />
      </button>
      <button
        onClick={() => onMove("down")}
        disabled={index === total - 1 || busy}
        aria-label="Move down"
        className="hover:text-[#007979] disabled:opacity-30"
      >
        <ArrowDown size={size} />
      </button>
    </div>
  );
}

function RowActions({
  onEdit,
  onDelete,
  small = false,
}: {
  onEdit: () => void;
  onDelete: () => void;
  small?: boolean;
}) {
  const size = small ? 14 : 16;
  const pad = small ? "p-1.5" : "p-2";
  return (
    <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
      <button onClick={onEdit} aria-label="Edit" className={`${pad} rounded-lg hover:bg-[#FBF9F5] text-[#524646]`}>
        <Pencil size={size} />
      </button>
      <button onClick={onDelete} aria-label="Delete" className={`${pad} rounded-lg hover:bg-red-50 text-red-500`}>
        <Trash2 size={size} />
      </button>
    </div>
  );
}

function RowShell({
  index,
  total,
  busy,
  onMove,
  onEdit,
  onDelete,
  lead,
  children,
}: {
  index: number;
  total: number;
  busy: boolean;
  onMove: (direction: "up" | "down") => void;
  onEdit: () => void;
  onDelete: () => void;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="group bg-white border border-[#E8E2D6] rounded-xl p-5 flex items-start gap-4">
      <div className="pt-1">
        <MoveButtons index={index} total={total} busy={busy} onMove={onMove} />
      </div>
      {lead}
      <div className="flex-1 min-w-0">{children}</div>
      <RowActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

function SaveButton({
  loading,
  onClick,
  children,
}: {
  loading: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-body font-medium hover:bg-[#24B1B1] transition-colors disabled:opacity-60"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      {children}
    </button>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 font-body text-sm text-[#524646] cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-[#E8E2D6]"
      />
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
    <div className="flex justify-end gap-3 pt-2">
      <button
        onClick={onCancel}
        className="px-4 py-2 text-sm font-body text-[#524646] hover:bg-[#FBF9F5] rounded-lg"
      >
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
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
          rows={3}
          className={cls + " resize-y"}
        />
      ) : (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 border border-[#E8E2D6]"
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