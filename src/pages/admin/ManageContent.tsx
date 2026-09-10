import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layout,
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
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type HeroContent = {
  id?: string;
  badge: string;
  heading: string;
  subheading: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
};

type CarouselImage = {
  id?: string;
  url: string;
  alt_text?: string;
  sort_order: number;
};

type HeroPair = {
  id?: string;
  problem: string;
  solution: string;
  sort_order: number;
  published: boolean;
};

type ProcessStep = {
  id?: string;
  step_number: string;
  title: string;
  description: string;
  sort_order: number;
  published: boolean;
};

type Sector = {
  id?: string;
  icon: string;
  label: string;
  sort_order: number;
  published: boolean;
};

type Reason = {
  id?: string;
  t: string;
  d: string;
  sort_order: number;
  published: boolean;
};

type SiteSettings = {
  id?: string;
  banner_text: string;
  banner_cta_text: string;
  banner_cta_link: string;
  focus_areas: string[];
  availability_text: string;
  cta_heading: string;
  cta_subtext: string;
  profile_title: string;
  profile_subtitle: string;
  profile_footer_note: string;
  profile_image_url?: string;
  services_heading: string;
  services_subheading: string;
  process_heading: string;
  process_description1: string;
  process_description2: string;
  sectors_heading: string;
  sectors_subheading: string;
  reasons_heading: string;
  reasons_subheading: string;
  insights_heading: string;
  insights_subheading: string;
};

type Tab = "hero" | "carousel" | "pairs" | "process" | "sectors" | "reasons" | "settings";

/* ═══════════════════════════════════════════════════════════
   ICON OPTIONS
═══════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════
   HELPERS
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
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-lg border ${
        type === "success"
          ? "bg-white border-emerald-200 text-emerald-800"
          : "bg-white border-red-200 text-red-800"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
      ) : (
        <AlertCircle size={18} className="text-red-500 shrink-0" />
      )}
      <span className="font-body text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100">
        <X size={14} />
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ManageContent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") =>
    setToast({ message, type });

  /* ── Queries ────────────────────────────────────────────── */
  const { data: heroData, isLoading: heroLoading } = useQuery({
    queryKey: ["admin-hero"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_content")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as HeroContent) ?? null;
    },
  });

  const { data: carouselImages = [], isLoading: carouselLoading } = useQuery({
    queryKey: ["admin-carousel-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carousel_images")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CarouselImage[];
    },
  });

  const { data: pairs = [], isLoading: pairsLoading } = useQuery({
    queryKey: ["admin-hero-pairs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_pairs")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as HeroPair[];
    },
  });

  const { data: processSteps = [], isLoading: processLoading } = useQuery({
    queryKey: ["admin-process-steps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("process_steps")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ProcessStep[];
    },
  });

  const { data: sectors = [], isLoading: sectorsLoading } = useQuery({
    queryKey: ["admin-sectors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sectors")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Sector[];
    },
  });

  const { data: reasons = [], isLoading: reasonsLoading } = useQuery({
    queryKey: ["admin-reasons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reasons")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Reason[];
    },
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as SiteSettings) ?? null;
    },
  });

  /* ── Local edit state ───────────────────────────────────── */
  const [heroForm, setHeroForm] = useState<HeroContent | null>(null);
  const [editingPair, setEditingPair] = useState<HeroPair | null>(null);
  const [editingProcess, setEditingProcess] = useState<ProcessStep | null>(null);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [editingReason, setEditingReason] = useState<Reason | null>(null);
  const [settingsForm, setSettingsForm] = useState<SiteSettings | null>(null);

  useEffect(() => {
    if (heroData) {
      setHeroForm(heroData);
    } else if (!heroLoading) {
      setHeroForm({
        badge: "Consulting · Public & Private Sector",
        heading: "Engineering reliable solutions for digital platforms",
        subheading: "I solve business problems through smart design, technology, and creative thinking. Software engineer and creative designer building reliable digital systems for businesses, NGOs, and government institutions across East Africa.",
        primary_cta_text: "Explore My Services",
        primary_cta_link: "/what-i-do",
        secondary_cta_text: "View My Work →",
        secondary_cta_link: "/projects",
      });
    }
  }, [heroData, heroLoading]);

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        ...settings,
        profile_image_url: settings.profile_image_url || "",
        banner_cta_text: settings.banner_cta_text || "Talk through a problem",
        banner_cta_link: settings.banner_cta_link || "/contact",
        profile_footer_note: settings.profile_footer_note || "Documentation-first · No lock-in · East Africa",
        services_heading: settings.services_heading || "Core Disciplines",
        services_subheading: settings.services_subheading || "From digital strategy to deployment, every engagement is structured around a clear problem and a measurable outcome.",
        process_heading: settings.process_heading || "Diagnose first. Build second.",
        process_description1: settings.process_description1 || "The biggest reason digital projects fail is that they start with a solution instead of a problem. Every engagement begins with a structured diagnosis — your systems, your constraints, your real goals.",
        process_description2: settings.process_description2 || "Only then do we design. You see the full plan, signed off, before a single line of code is written.",
        sectors_heading: settings.sectors_heading || "Where I do my best work",
        sectors_subheading: settings.sectors_subheading || "Six years of work across public and private institutions in East Africa.",
        reasons_heading: settings.reasons_heading || "One person, full service.",
        reasons_subheading: settings.reasons_subheading || "I understand both business needs and technical solutions. After 6 years, I can build systems that actually solve your real problems.",
        insights_heading: settings.insights_heading || "Field notes from the work",
        insights_subheading: settings.insights_subheading || "Practical perspectives on building digital systems in Africa — written for the people who actually have to ship them.",
        focus_areas: Array.isArray(settings.focus_areas)
          ? settings.focus_areas
          : typeof settings.focus_areas === "string"
          ? JSON.parse(settings.focus_areas || "[]")
          : ["GovTech", "Systems", "Automation", "Design", "Integrations"],
      });
    } else if (!settingsLoading) {
      setSettingsForm({
        profile_image_url: "",
        banner_text: "Built for institutions that cannot afford systems that fail quietly.",
        banner_cta_text: "Talk through a problem",
        banner_cta_link: "/contact",
        focus_areas: ["GovTech", "Systems", "Automation", "Design", "Integrations"],
        availability_text: "Available for projects",
        cta_heading: "Have a system to build, fix, or rescue?",
        cta_subtext:
          "Tell me about the problem. I will tell you honestly whether I am the right person to solve it — and what it will take.",
        profile_title: "Samuel A. Emoni",
        profile_subtitle: "Solutions Architect · Digital Systems",
        profile_footer_note: "Documentation-first · No lock-in · East Africa",
        services_heading: "Core Disciplines",
        services_subheading: "From digital strategy to deployment, every engagement is structured around a clear problem and a measurable outcome.",
        process_heading: "Diagnose first. Build second.",
        process_description1: "The biggest reason digital projects fail is that they start with a solution instead of a problem. Every engagement begins with a structured diagnosis — your systems, your constraints, your real goals.",
        process_description2: "Only then do we design. You see the full plan, signed off, before a single line of code is written.",
        sectors_heading: "Where I do my best work",
        sectors_subheading: "Six years of work across public and private institutions in East Africa.",
        reasons_heading: "One person, full service.",
        reasons_subheading: "I understand both business needs and technical solutions. After 6 years, I can build systems that actually solve your real problems.",
        insights_heading: "Field notes from the work",
        insights_subheading: "Practical perspectives on building digital systems in Africa — written for the people who actually have to ship them.",
      });
    }
  }, [settings, settingsLoading]);

  /* ── Profile Image Upload logic ─────────────────────────── */
  const handleProfileImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file", "error");
      return;
    }

    setUploadingProfilePic(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `profile-${Date.now()}.${fileExt}`;
      const filePath = `profile/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      setSettingsForm((prev) =>
        prev ? { ...prev, profile_image_url: publicUrlData.publicUrl } : null
      );

      showToast("Profile image uploaded successfully");
    } catch (error: any) {
      showToast(error.message || "Failed to upload profile image", "error");
    } finally {
      setUploadingProfilePic(false);
    }
  };

  /* ── Upload & Carousel logic ────────────────────────────── */
  const handleUploadFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length === 0) {
      showToast("Please select valid image files", "error");
      return;
    }

    setUploading(true);
    try {
      let currentOrder = carouselImages.length;

      for (const file of validFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `carousel/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("site-assets")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("site-assets")
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase.from("carousel_images").insert({
          url: publicUrlData.publicUrl,
          alt_text: file.name.split(".")[0],
          sort_order: currentOrder++,
        });

        if (dbError) throw dbError;
      }

      queryClient.invalidateQueries({ queryKey: ["admin-carousel-images"] });
      queryClient.invalidateQueries({ queryKey: ["carousel-images"] });
      showToast(`${validFiles.length} image(s) uploaded successfully`);
    } catch (error: any) {
      showToast(error.message || "Failed to upload image(s)", "error");
    } finally {
      setUploading(false);
    }
  };

  const deleteCarouselImage = useMutation({
    mutationFn: async (img: CarouselImage) => {
      const { error } = await supabase
        .from("carousel_images")
        .delete()
        .eq("id", img.id);
      if (error) throw error;

      if (img.url.includes("/storage/v1/object/public/site-assets/")) {
        const path = img.url.split("/site-assets/")[1];
        if (path) {
          await supabase.storage.from("site-assets").remove([path]);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-carousel-images"] });
      queryClient.invalidateQueries({ queryKey: ["carousel-images"] });
      showToast("Image removed");
    },
    onError: (e: any) => showToast(e.message || "Failed to delete image", "error"),
  });

  const updateAltText = async (id: string, alt_text: string) => {
    await supabase.from("carousel_images").update({ alt_text }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-carousel-images"] });
  };

  /* ── Mutations – Hero Content ───────────────────────────── */
  const saveHero = useMutation({
    mutationFn: async (form: HeroContent) => {
      const payload = {
        badge: form.badge,
        heading: form.heading,
        subheading: form.subheading,
        primary_cta_text: form.primary_cta_text,
        primary_cta_link: form.primary_cta_link,
        secondary_cta_text: form.secondary_cta_text,
        secondary_cta_link: form.secondary_cta_link,
      };

      if (form.id) {
        const { error } = await supabase
          .from("hero_content")
          .update(payload)
          .eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hero_content").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      showToast("Hero section updated");
    },
    onError: (e: any) => showToast(e.message || "Failed to save Hero section", "error"),
  });

  /* ── Mutations – Hero Pairs ─────────────────────────────── */
  const savePair = useMutation({
    mutationFn: async (pair: HeroPair) => {
      if (pair.id) {
        const { error } = await supabase
          .from("hero_pairs")
          .update({
            problem: pair.problem,
            solution: pair.solution,
            sort_order: pair.sort_order,
            published: pair.published,
          })
          .eq("id", pair.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hero_pairs").insert({
          problem: pair.problem,
          solution: pair.solution,
          sort_order: pair.sort_order ?? pairs.length,
          published: pair.published ?? true,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-pairs"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      setEditingPair(null);
      showToast("Hero pair saved");
    },
    onError: (e: any) => showToast(e.message || "Failed to save", "error"),
  });

  const deletePair = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_pairs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-pairs"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      showToast("Pair deleted");
    },
    onError: (e: any) => showToast(e.message || "Failed to delete", "error"),
  });

  /* ── Mutations – Process Steps ──────────────────────────── */
  const saveProcess = useMutation({
    mutationFn: async (step: ProcessStep) => {
      if (step.id) {
        const { error } = await supabase
          .from("process_steps")
          .update({
            step_number: step.step_number,
            title: step.title,
            description: step.description,
            sort_order: step.sort_order,
            published: step.published,
          })
          .eq("id", step.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("process_steps").insert({
          step_number: step.step_number || `0${processSteps.length + 1}`,
          title: step.title,
          description: step.description,
          sort_order: step.sort_order ?? processSteps.length,
          published: step.published ?? true,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-process-steps"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      setEditingProcess(null);
      showToast("Process step saved");
    },
    onError: (e: any) => showToast(e.message || "Failed to save process step", "error"),
  });

  const deleteProcess = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("process_steps").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-process-steps"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      showToast("Process step deleted");
    },
    onError: (e: any) => showToast(e.message || "Failed to delete", "error"),
  });

  /* ── Mutations – Sectors ────────────────────────────────── */
  const saveSector = useMutation({
    mutationFn: async (sector: Sector) => {
      if (sector.id) {
        const { error } = await supabase
          .from("sectors")
          .update({
            icon: sector.icon,
            label: sector.label,
            sort_order: sector.sort_order,
            published: sector.published,
          })
          .eq("id", sector.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sectors").insert({
          icon: sector.icon,
          label: sector.label,
          sort_order: sector.sort_order ?? sectors.length,
          published: sector.published ?? true,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sectors"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      setEditingSector(null);
      showToast("Sector saved");
    },
    onError: (e: any) => showToast(e.message || "Failed to save", "error"),
  });

  const deleteSector = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sectors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sectors"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      showToast("Sector deleted");
    },
    onError: (e: any) => showToast(e.message || "Failed to delete", "error"),
  });

  /* ── Mutations – Reasons ────────────────────────────────── */
  const saveReason = useMutation({
    mutationFn: async (reason: Reason) => {
      if (reason.id) {
        const { error } = await supabase
          .from("reasons")
          .update({
            t: reason.t,
            d: reason.d,
            sort_order: reason.sort_order,
            published: reason.published,
          })
          .eq("id", reason.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reasons").insert({
          t: reason.t,
          d: reason.d,
          sort_order: reason.sort_order ?? reasons.length,
          published: reason.published ?? true,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reasons"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      setEditingReason(null);
      showToast("Reason saved");
    },
    onError: (e: any) => showToast(e.message || "Failed to save", "error"),
  });

  const deleteReason = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reasons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reasons"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      showToast("Reason deleted");
    },
    onError: (e: any) => showToast(e.message || "Failed to delete", "error"),
  });

  /* ── Mutations – Settings ───────────────────────────────── */
  const saveSettings = useMutation({
    mutationFn: async (form: SiteSettings) => {
      const payload = {
        banner_text: form.banner_text,
        banner_cta_text: form.banner_cta_text,
        banner_cta_link: form.banner_cta_link,
        focus_areas: form.focus_areas,
        availability_text: form.availability_text,
        cta_heading: form.cta_heading,
        cta_subtext: form.cta_subtext,
        profile_title: form.profile_title,
        profile_subtitle: form.profile_subtitle,
        profile_footer_note: form.profile_footer_note,
        profile_image_url: form.profile_image_url,
        services_heading: form.services_heading,
        services_subheading: form.services_subheading,
        process_heading: form.process_heading,
        process_description1: form.process_description1,
        process_description2: form.process_description2,
        sectors_heading: form.sectors_heading,
        sectors_subheading: form.sectors_subheading,
        reasons_heading: form.reasons_heading,
        reasons_subheading: form.reasons_subheading,
        insights_heading: form.insights_heading,
        insights_subheading: form.insights_subheading,
      };

      if (form.id) {
        const { error } = await supabase
          .from("site_settings")
          .update(payload)
          .eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_settings").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
      showToast("Site settings saved");
    },
    onError: (e: any) => showToast(e.message || "Failed to save settings", "error"),
  });

  /* ── Reorder helpers ────────────────────────────────────── */
  const moveItem = async (
    table: "hero_pairs" | "sectors" | "reasons" | "carousel_images" | "process_steps",
    items: any[],
    index: number,
    direction: "up" | "down"
  ) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const a = items[index];
    const b = items[newIndex];

    await supabase.from(table).update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from(table).update({ sort_order: a.sort_order }).eq("id", b.id);

    const keyMap: Record<string, string> = {
      hero_pairs: "admin-hero-pairs",
      sectors: "admin-sectors",
      reasons: "admin-reasons",
      carousel_images: "admin-carousel-images",
      process_steps: "admin-process-steps",
    };

    queryClient.invalidateQueries({ queryKey: [keyMap[table]] });
    queryClient.invalidateQueries({ queryKey: ["home-page-data"] });
  };

  /* ── Tabs config ────────────────────────────────────────── */
  const tabs: { id: Tab; label: string; icon: typeof Layout }[] = [
    { id: "hero", label: "Hero", icon: Sparkles },
    { id: "carousel", label: "Carousel Images", icon: ImageIcon },
    { id: "pairs", label: "Hero Pairs", icon: MessageSquare },
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl text-[#1A1A16] tracking-tight">
                Manage Content
              </h1>
              <p className="font-body text-sm text-[#524646]/70 mt-0.5">
                Hero section, carousel, homepage copy, process steps, sectors, reasons & site-wide settings
              </p>
            </div>
          </div>

          {/* Tabs */}
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
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {heroLoading || !heroForm ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-[#007979]" size={28} />
                </div>
              ) : (
                <div className="bg-white border border-[#E8E2D6] rounded-xl p-6 space-y-6 max-w-2xl">
                  <Field
                    label="Badge / Eyebrow"
                    value={heroForm.badge}
                    onChange={(v) => setHeroForm({ ...heroForm, badge: v })}
                    placeholder="Consulting · Public & Private Sector"
                  />
                  <Field
                    label="Main Heading (Fallback)"
                    value={heroForm.heading}
                    onChange={(v) => setHeroForm({ ...heroForm, heading: v })}
                    multiline
                    placeholder="Engineering reliable solutions for digital platforms"
                  />
                  <Field
                    label="Subheading / Description"
                    value={heroForm.subheading}
                    onChange={(v) => setHeroForm({ ...heroForm, subheading: v })}
                    multiline
                    placeholder="I solve business problems through smart design, technology..."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Primary CTA Text"
                      value={heroForm.primary_cta_text}
                      onChange={(v) => setHeroForm({ ...heroForm, primary_cta_text: v })}
                      placeholder="Explore My Services"
                    />
                    <Field
                      label="Primary CTA Link"
                      value={heroForm.primary_cta_link}
                      onChange={(v) => setHeroForm({ ...heroForm, primary_cta_link: v })}
                      placeholder="/what-i-do"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Secondary CTA Text"
                      value={heroForm.secondary_cta_text}
                      onChange={(v) => setHeroForm({ ...heroForm, secondary_cta_text: v })}
                      placeholder="View My Work →"
                    />
                    <Field
                      label="Secondary CTA Link"
                      value={heroForm.secondary_cta_link}
                      onChange={(v) => setHeroForm({ ...heroForm, secondary_cta_link: v })}
                      placeholder="/projects"
                    />
                  </div>

                  <button
                    onClick={() => saveHero.mutate(heroForm)}
                    disabled={saveHero.isPending}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-body font-medium hover:bg-[#24B1B1] transition-colors disabled:opacity-60"
                  >
                    {saveHero.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Save Hero Content
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════ CAROUSEL IMAGES ════════════ */}
          {activeTab === "carousel" && (
            <motion.div
              key="carousel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.length) {
                    handleUploadFiles(e.dataTransfer.files);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
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
                  <p className="font-body text-xs text-[#524646]/70">
                    or click to browse multiple files from your device
                  </p>
                </div>
              </div>

              {carouselLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-[#007979]" size={28} />
                </div>
              ) : carouselImages.length === 0 ? (
                <EmptyState
                  title="No carousel images uploaded"
                  description="Upload images above to build your homepage carousel."
                  onAction={() => fileInputRef.current?.click()}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {carouselImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className="bg-white border border-[#E8E2D6] rounded-xl p-3 flex flex-col gap-3 group relative"
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-[#FBF9F5] border border-[#E8E2D6]">
                        <img
                          src={img.url}
                          alt={img.alt_text || "Carousel item"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <button
                            onClick={() => moveItem("carousel_images", carouselImages, idx, "up")}
                            disabled={idx === 0}
                            className="p-1 rounded bg-black/60 text-white hover:bg-black disabled:opacity-30"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={() => moveItem("carousel_images", carouselImages, idx, "down")}
                            disabled={idx === carouselImages.length - 1}
                            className="p-1 rounded bg-black/60 text-white hover:bg-black disabled:opacity-30"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm("Remove this image from carousel?"))
                              deleteCarouselImage.mutate(img);
                          }}
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
                          onBlur={(e) => updateAltText(img.id!, e.target.value)}
                          placeholder="Image description"
                          className="w-full px-3 py-1.5 border border-[#E8E2D6] rounded font-body text-xs focus:outline-none focus:ring-1 focus:ring-[#007979]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════ HERO PAIRS ════════════ */}
          {activeTab === "pairs" && (
            <motion.div
              key="pairs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <p className="font-body text-sm text-[#524646]/70">
                  These rotate on the homepage hero (Problem → Solution).
                </p>
                <button
                  onClick={() =>
                    setEditingPair({
                      problem: "",
                      solution: "",
                      sort_order: pairs.length,
                      published: true,
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-body font-medium hover:bg-[#24B1B1] transition-colors"
                >
                  <Plus size={16} /> Add Pair
                </button>
              </div>

              {pairsLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-[#007979]" size={28} />
                </div>
              ) : pairs.length === 0 ? (
                <EmptyState
                  title="No hero pairs yet"
                  description="Add your first problem → solution pair."
                  onAction={() =>
                    setEditingPair({
                      problem: "",
                      solution: "",
                      sort_order: 0,
                      published: true,
                    })
                  }
                />
              ) : (
                <div className="space-y-3">
                  {pairs.map((pair, idx) => (
                    <div
                      key={pair.id}
                      className="bg-white border border-[#E8E2D6] rounded-xl p-5 flex items-start gap-4 group"
                    >
                      <div className="flex flex-col gap-1 pt-1 text-[#9A9A9A]">
                        <button
                          onClick={() => moveItem("hero_pairs", pairs, idx, "up")}
                          disabled={idx === 0}
                          className="hover:text-[#007979] disabled:opacity-30"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => moveItem("hero_pairs", pairs, idx, "down")}
                          disabled={idx === pairs.length - 1}
                          className="hover:text-[#007979] disabled:opacity-30"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase tracking-widest text-[#EC5B38] font-body">
                            Problem
                          </span>
                          {!pair.published && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                              Draft
                            </span>
                          )}
                        </div>
                        <p className="font-display text-lg text-[#1A1A16]">{pair.problem}</p>
                        <div className="mt-3">
                          <span className="text-[10px] uppercase tracking-widest text-[#007979] font-body">
                            Solution
                          </span>
                          <p className="font-display text-lg text-[#007979] mt-0.5">
                            {pair.solution}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingPair(pair)}
                          className="p-2 rounded-lg hover:bg-[#FBF9F5] text-[#524646]"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this pair?")) deletePair.mutate(pair.id!);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════ PROCESS STEPS ════════════ */}
          {activeTab === "process" && (
            <motion.div
              key="process"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <p className="font-body text-sm text-[#524646]/70">
                  Approach and process steps displayed on homepage.
                </p>
                <button
                  onClick={() =>
                    setEditingProcess({
                      step_number: `0${processSteps.length + 1}`,
                      title: "",
                      description: "",
                      sort_order: processSteps.length,
                      published: true,
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-body font-medium hover:bg-[#24B1B1] transition-colors"
                >
                  <Plus size={16} /> Add Step
                </button>
              </div>

              {processLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-[#007979]" size={28} />
                </div>
              ) : processSteps.length === 0 ? (
                <EmptyState
                  title="No process steps found"
                  description="Add steps for your work approach."
                  onAction={() =>
                    setEditingProcess({
                      step_number: "01",
                      title: "",
                      description: "",
                      sort_order: 0,
                      published: true,
                    })
                  }
                />
              ) : (
                <div className="space-y-3">
                  {processSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="bg-white border border-[#E8E2D6] rounded-xl p-5 flex items-start gap-4 group"
                    >
                      <div className="flex flex-col gap-1 pt-1 text-[#9A9A9A]">
                        <button
                          onClick={() => moveItem("process_steps", processSteps, idx, "up")}
                          disabled={idx === 0}
                          className="hover:text-[#007979] disabled:opacity-30"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => moveItem("process_steps", processSteps, idx, "down")}
                          disabled={idx === processSteps.length - 1}
                          className="hover:text-[#007979] disabled:opacity-30"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      <div className="w-12 h-12 rounded-lg bg-[#FBF9F5] border border-[#E8E2D6] flex items-center justify-center font-display text-lg font-bold text-[#007979]">
                        {step.step_number || `0${idx + 1}`}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg text-[#1A1A16]">{step.title}</h3>
                        <p className="font-body text-sm text-[#524646]/80 mt-1 leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingProcess(step)}
                          className="p-2 rounded-lg hover:bg-[#FBF9F5]"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this process step?"))
                              deleteProcess.mutate(step.id!);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════ SECTORS ════════════ */}
          {activeTab === "sectors" && (
            <motion.div
              key="sectors"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <p className="font-body text-sm text-[#524646]/70">
                  Sectors shown on the homepage grid.
                </p>
                <button
                  onClick={() =>
                    setEditingSector({
                      icon: "Landmark",
                      label: "",
                      sort_order: sectors.length,
                      published: true,
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-body font-medium hover:bg-[#24B1B1] transition-colors"
                >
                  <Plus size={16} /> Add Sector
                </button>
              </div>

              {sectorsLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-[#007979]" size={28} />
                </div>
              ) : sectors.length === 0 ? (
                <EmptyState
                  title="No sectors yet"
                  description="Add the industries you work with."
                  onAction={() =>
                    setEditingSector({
                      icon: "Landmark",
                      label: "",
                      sort_order: 0,
                      published: true,
                    })
                  }
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sectors.map((sector, idx) => (
                    <div
                      key={sector.id}
                      className="bg-white border border-[#E8E2D6] rounded-xl p-4 flex items-center gap-3 group"
                    >
                      <div className="flex flex-col gap-0.5 text-[#9A9A9A]">
                        <button
                          onClick={() => moveItem("sectors", sectors, idx, "up")}
                          disabled={idx === 0}
                          className="hover:text-[#007979] disabled:opacity-30"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => moveItem("sectors", sectors, idx, "down")}
                          disabled={idx === sectors.length - 1}
                          className="hover:text-[#007979] disabled:opacity-30"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-[#FBF9F5] flex items-center justify-center text-[#007979] font-body text-xs font-bold">
                        {sector.icon.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-[15px] text-[#1A1A16] truncate">
                          {sector.label}
                        </p>
                        <p className="font-body text-[11px] text-[#9A9A9A]">{sector.icon}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingSector(sector)}
                          className="p-1.5 rounded-md hover:bg-[#FBF9F5]"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this sector?"))
                              deleteSector.mutate(sector.id!);
                          }}
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════ REASONS ════════════ */}
          {activeTab === "reasons" && (
            <motion.div
              key="reasons"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <p className="font-body text-sm text-[#524646]/70">
                  “Why work with me” cards on the homepage.
                </p>
                <button
                  onClick={() =>
                    setEditingReason({
                      t: "",
                      d: "",
                      sort_order: reasons.length,
                      published: true,
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-body font-medium hover:bg-[#24B1B1] transition-colors"
                >
                  <Plus size={16} /> Add Reason
                </button>
              </div>

              {reasonsLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-[#007979]" size={28} />
                </div>
              ) : reasons.length === 0 ? (
                <EmptyState
                  title="No reasons yet"
                  description="Add the key reasons clients should work with you."
                  onAction={() =>
                    setEditingReason({
                      t: "",
                      d: "",
                      sort_order: 0,
                      published: true,
                    })
                  }
                />
              ) : (
                <div className="space-y-3">
                  {reasons.map((reason, idx) => (
                    <div
                      key={reason.id}
                      className="bg-white border border-[#E8E2D6] rounded-xl p-5 flex items-start gap-4 group"
                    >
                      <div className="flex flex-col gap-1 pt-1 text-[#9A9A9A]">
                        <button
                          onClick={() => moveItem("reasons", reasons, idx, "up")}
                          disabled={idx === 0}
                          className="hover:text-[#007979] disabled:opacity-30"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => moveItem("reasons", reasons, idx, "down")}
                          disabled={idx === reasons.length - 1}
                          className="hover:text-[#007979] disabled:opacity-30"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg text-[#1A1A16]">{reason.t}</h3>
                        <p className="font-body text-sm text-[#524646]/80 mt-1 leading-relaxed">
                          {reason.d}
                        </p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingReason(reason)}
                          className="p-2 rounded-lg hover:bg-[#FBF9F5]"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this reason?"))
                              deleteReason.mutate(reason.id!);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════ SETTINGS ════════════ */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {settingsLoading || !settingsForm ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-[#007979]" size={28} />
                </div>
              ) : (
                <div className="bg-white border border-[#E8E2D6] rounded-xl p-6 space-y-6 max-w-3xl">
                  <h2 className="font-display text-lg text-[#1A1A16] border-b border-[#E8E2D6] pb-2">
                    Profile & Banner
                  </h2>

                  {/* Profile Image Field */}
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
                            if (e.target.files?.[0]) {
                              handleProfileImageUpload(e.target.files[0]);
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => profileImageInputRef.current?.click()}
                            disabled={uploadingProfilePic}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#007979] text-[#FFE2AF] rounded-lg text-xs font-body font-medium hover:bg-[#24B1B1] transition-colors"
                          >
                            <UploadCloud size={14} /> Upload Image
                          </button>

                          {settingsForm.profile_image_url && (
                            <button
                              type="button"
                              onClick={() =>
                                setSettingsForm({ ...settingsForm, profile_image_url: "" })
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-body font-medium hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          )}
                        </div>
                        <p className="font-body text-[11px] text-[#524646]/60">
                          JPG, PNG or WEBP format. Square aspect ratio works best.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Profile Title"
                      value={settingsForm.profile_title}
                      onChange={(v) => setSettingsForm({ ...settingsForm, profile_title: v })}
                    />
                    <Field
                      label="Profile Subtitle"
                      value={settingsForm.profile_subtitle}
                      onChange={(v) => setSettingsForm({ ...settingsForm, profile_subtitle: v })}
                    />
                  </div>
                  <Field
                    label="Profile Footer Note"
                    value={settingsForm.profile_footer_note}
                    onChange={(v) => setSettingsForm({ ...settingsForm, profile_footer_note: v })}
                  />
                  <Field
                    label="Banner Text"
                    value={settingsForm.banner_text}
                    onChange={(v) => setSettingsForm({ ...settingsForm, banner_text: v })}
                    multiline
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Banner CTA Button Text"
                      value={settingsForm.banner_cta_text}
                      onChange={(v) => setSettingsForm({ ...settingsForm, banner_cta_text: v })}
                    />
                    <Field
                      label="Banner CTA Link"
                      value={settingsForm.banner_cta_link}
                      onChange={(v) => setSettingsForm({ ...settingsForm, banner_cta_link: v })}
                    />
                  </div>

                  <div>
                    <label className="block font-body text-xs uppercase tracking-widest text-[#524646]/70 mb-2">
                      Focus Areas (comma separated)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.focus_areas.join(", ")}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          focus_areas: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full px-4 py-2.5 border border-[#E8E2D6] rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#007979]/30 focus:border-[#007979]"
                    />
                  </div>

                  <h2 className="font-display text-lg text-[#1A1A16] border-b border-[#E8E2D6] pb-2 pt-4">
                    Section Headings & Descriptions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Services Section Heading"
                      value={settingsForm.services_heading}
                      onChange={(v) => setSettingsForm({ ...settingsForm, services_heading: v })}
                    />
                    <Field
                      label="Services Subheading"
                      value={settingsForm.services_subheading}
                      onChange={(v) => setSettingsForm({ ...settingsForm, services_subheading: v })}
                      multiline
                    />
                  </div>

                  <Field
                    label="Process Section Heading"
                    value={settingsForm.process_heading}
                    onChange={(v) => setSettingsForm({ ...settingsForm, process_heading: v })}
                  />
                  <Field
                    label="Process Paragraph 1"
                    value={settingsForm.process_description1}
                    onChange={(v) => setSettingsForm({ ...settingsForm, process_description1: v })}
                    multiline
                  />
                  <Field
                    label="Process Paragraph 2"
                    value={settingsForm.process_description2}
                    onChange={(v) => setSettingsForm({ ...settingsForm, process_description2: v })}
                    multiline
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Sectors Section Heading"
                      value={settingsForm.sectors_heading}
                      onChange={(v) => setSettingsForm({ ...settingsForm, sectors_heading: v })}
                    />
                    <Field
                      label="Sectors Subheading"
                      value={settingsForm.sectors_subheading}
                      onChange={(v) => setSettingsForm({ ...settingsForm, sectors_subheading: v })}
                      multiline
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Reasons Section Heading"
                      value={settingsForm.reasons_heading}
                      onChange={(v) => setSettingsForm({ ...settingsForm, reasons_heading: v })}
                    />
                    <Field
                      label="Reasons Subheading"
                      value={settingsForm.reasons_subheading}
                      onChange={(v) => setSettingsForm({ ...settingsForm, reasons_subheading: v })}
                      multiline
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Insights Section Heading"
                      value={settingsForm.insights_heading}
                      onChange={(v) => setSettingsForm({ ...settingsForm, insights_heading: v })}
                    />
                    <Field
                      label="Insights Subheading"
                      value={settingsForm.insights_subheading}
                      onChange={(v) => setSettingsForm({ ...settingsForm, insights_subheading: v })}
                      multiline
                    />
                  </div>

                  <h2 className="font-display text-lg text-[#1A1A16] border-b border-[#E8E2D6] pb-2 pt-4">
                    Bottom CTA Banner
                  </h2>
                  <Field
                    label="CTA Heading"
                    value={settingsForm.cta_heading}
                    onChange={(v) => setSettingsForm({ ...settingsForm, cta_heading: v })}
                  />
                  <Field
                    label="CTA Subtext"
                    value={settingsForm.cta_subtext}
                    onChange={(v) => setSettingsForm({ ...settingsForm, cta_subtext: v })}
                    multiline
                  />

                  <button
                    onClick={() => saveSettings.mutate(settingsForm)}
                    disabled={saveSettings.isPending}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-body font-medium hover:bg-[#24B1B1] transition-colors disabled:opacity-60 mt-4"
                  >
                    {saveSettings.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Save All Settings
                  </button>
                </div>
              )}
            </motion.div>
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
              <label className="flex items-center gap-2 font-body text-sm text-[#524646]">
                <input
                  type="checkbox"
                  checked={editingPair.published}
                  onChange={(e) =>
                    setEditingPair({ ...editingPair, published: e.target.checked })
                  }
                  className="rounded border-[#E8E2D6]"
                />
                Published
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditingPair(null)}
                  className="px-4 py-2 text-sm font-body text-[#524646] hover:bg-[#FBF9F5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => savePair.mutate(editingPair)}
                  disabled={savePair.isPending || !editingPair.problem || !editingPair.solution}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-medium hover:bg-[#24B1B1] disabled:opacity-50"
                >
                  {savePair.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Save
                </button>
              </div>
            </div>
          </Modal>
        )}

        {editingProcess && (
          <Modal title={editingProcess.id ? "Edit Process Step" : "New Process Step"} onClose={() => setEditingProcess(null)}>
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
              <label className="flex items-center gap-2 font-body text-sm text-[#524646]">
                <input
                  type="checkbox"
                  checked={editingProcess.published}
                  onChange={(e) =>
                    setEditingProcess({ ...editingProcess, published: e.target.checked })
                  }
                  className="rounded border-[#E8E2D6]"
                />
                Published
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditingProcess(null)}
                  className="px-4 py-2 text-sm font-body text-[#524646] hover:bg-[#FBF9F5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveProcess.mutate(editingProcess)}
                  disabled={saveProcess.isPending || !editingProcess.title}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-medium hover:bg-[#24B1B1] disabled:opacity-50"
                >
                  {saveProcess.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Save Step
                </button>
              </div>
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
                <label className="block font-body text-xs uppercase tracking-widest text-[#524646]/70 mb-2">
                  Icon
                </label>
                <select
                  value={editingSector.icon}
                  onChange={(e) =>
                    setEditingSector({ ...editingSector, icon: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-[#E8E2D6] rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#007979]/30"
                >
                  {SECTOR_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 font-body text-sm text-[#524646]">
                <input
                  type="checkbox"
                  checked={editingSector.published}
                  onChange={(e) =>
                    setEditingSector({ ...editingSector, published: e.target.checked })
                  }
                  className="rounded border-[#E8E2D6]"
                />
                Published
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditingSector(null)}
                  className="px-4 py-2 text-sm font-body text-[#524646] hover:bg-[#FBF9F5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveSector.mutate(editingSector)}
                  disabled={saveSector.isPending || !editingSector.label}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-medium hover:bg-[#24B1B1] disabled:opacity-50"
                >
                  {saveSector.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Save
                </button>
              </div>
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
              <label className="flex items-center gap-2 font-body text-sm text-[#524646]">
                <input
                  type="checkbox"
                  checked={editingReason.published}
                  onChange={(e) =>
                    setEditingReason({ ...editingReason, published: e.target.checked })
                  }
                  className="rounded border-[#E8E2D6]"
                />
                Published
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditingReason(null)}
                  className="px-4 py-2 text-sm font-body text-[#524646] hover:bg-[#FBF9F5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveReason.mutate(editingReason)}
                  disabled={saveReason.isPending || !editingReason.t || !editingReason.d}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-medium hover:bg-[#24B1B1] disabled:opacity-50"
                >
                  {saveReason.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Save
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SMALL UI PRIMITIVES
═══════════════════════════════════════════════════════════ */
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
      <label className="block font-body text-xs uppercase tracking-widest text-[#524646]/70 mb-2">
        {label}
      </label>
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-[#E8E2D6]"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-[#1A1A16]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#FBF9F5] text-[#524646]"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function EmptyState({
  title,
  description,
  onAction,
}: {
  title: string;
  description: string;
  onAction: () => void;
}) {
  return (
    <div className="bg-white border border-dashed border-[#E8E2D6] rounded-xl py-16 text-center">
      <p className="font-display text-lg text-[#1A1A16]">{title}</p>
      <p className="font-body text-sm text-[#524646]/70 mt-1">{description}</p>
      <button
        onClick={onAction}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[#007979] text-[#FFE2AF] rounded-lg text-sm font-medium hover:bg-[#24B1B1]"
      >
        <Plus size={16} /> Add first item
      </button>
    </div>
  );
}