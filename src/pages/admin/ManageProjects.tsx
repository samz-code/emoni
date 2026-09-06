import React, { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Search, Trash2, Edit3, X, ExternalLink, RefreshCw, 
  Code, UploadCloud, Image as ImageIcon, Package, LayoutGrid, AlertCircle
} from "lucide-react";

type ActiveTab = "projects" | "products" | "designs";

const DEFAULT_DESIGN_CATEGORIES = [
  "Logos & Brand Identity",
  "Packaging & Labels",
  "Print & Marketing Flyers",
  "Social Media Campaigns",
  "Stationery & Corporate",
  "3D Architectural & Interior Renders",
];

export default function ManageProjects() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>("projects");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // NEW: surfaces the actual Postgres/PostgREST error instead of only logging it
  const [mutationError, setMutationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Form State with Multi-Image Array Support
  const [projectData, setProjectData] = useState({ 
    name: "", 
    sector: "Web Development", 
    description: "", 
    live_url: "", 
    image: "", 
    images: [] as string[] 
  });
  const [productData, setProductData] = useState({ 
    name: "", 
    category: "Design Templates", 
    description: "", 
    format: "Illustrator", 
    status: "available", 
    icon: "Palette", 
    price: 0 
  });
  const [designData, setDesignData] = useState({ 
    id: "", 
    title: "", 
    category: "Logos & Brand Identity", 
    image: "", 
    images: [] as string[] 
  });

  // Database Queries
  const { data: projects = [], isLoading: loadingProjects, error: projectsQueryError } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: designs = [], isLoading: loadingDesigns } = useQuery({
    queryKey: ["admin-designs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("graphic_designs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Upsert Mutation (Create + Update)
  const upsertMutation = useMutation({
    mutationFn: async () => {
      if (activeTab === "projects") {
        const payload = editingId ? { ...projectData, id: editingId } : projectData;
        const { error } = await supabase.from("projects").upsert(payload);
        if (error) throw error;
      } else if (activeTab === "products") {
        const payload = editingId ? { ...productData, id: editingId } : productData;
        const { error } = await supabase.from("products").upsert(payload);
        if (error) throw error;
      } else {
        const payload = editingId ? { ...designData, id: editingId } : { ...designData, id: `des-${Date.now()}` };
        const { error } = await supabase.from("graphic_designs").upsert(payload);
        if (error) throw error;
      }
    },
    onMutate: () => {
      // Clear any previous error as soon as a new save attempt starts
      setMutationError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-designs"] });
      closeModal();
    },
    onError: (error: any) => {
      // Supabase/PostgREST errors carry message, details, hint, and code.
      // Log the full object for devtools inspection, and surface a readable
      // string in the UI so the real cause (missing column, NOT NULL
      // violation, RLS denial, etc.) doesn't get lost in the console.
      console.error("Upsert failed:", error);
      const parts = [error?.message, error?.details, error?.hint].filter(Boolean);
      setMutationError(parts.length > 0 ? parts.join(" — ") : "Save failed. Check the browser console for details.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ table, id }: { table: string; id: string }) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-designs"] });
    },
    onError: (error: any) => {
      console.error("Delete failed:", error);
      const parts = [error?.message, error?.details, error?.hint].filter(Boolean);
      setMutationError(parts.length > 0 ? parts.join(" — ") : "Delete failed. Check the browser console for details.");
    },
  });

  // Multi-file upload handling
  const handleMultipleFilesUpload = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
    
    if (validFiles.length === 0) {
      setUploadError("Please upload valid image files (JPG, PNG, WEBP).");
      return;
    }

    setUploadError(null);
    setUploading(true);

    const uploadedUrls: string[] = [];

    for (const file of validFiles) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: storageError } = await supabase.storage
          .from("agency-assets")
          .upload(filePath, file);

        if (storageError) {
          console.error("Storage upload error, falling back to base64:", storageError);
          // Base64 fallback if bucket or network fails
          const reader = new FileReader();
          reader.readAsDataURL(file);
          await new Promise<void>((resolve) => {
            reader.onloadend = () => {
              if (reader.result) uploadedUrls.push(reader.result as string);
              resolve();
            };
          });
        } else {
          const { data } = supabase.storage.from("agency-assets").getPublicUrl(filePath);
          if (data?.publicUrl) uploadedUrls.push(data.publicUrl);
        }
      } catch (err: any) {
        console.error("Single file upload error:", err);
      }
    }

    if (uploadedUrls.length > 0) {
      appendImageUrls(uploadedUrls);
    }
    setUploading(false);
  };

  const appendImageUrls = (urls: string[]) => {
    if (activeTab === "projects") {
      setProjectData(prev => {
        const updated = [...prev.images, ...urls];
        return { ...prev, images: updated, image: updated[0] || prev.image };
      });
    } else if (activeTab === "designs") {
      setDesignData(prev => {
        const updated = [...prev.images, ...urls];
        return { ...prev, images: updated, image: updated[0] || prev.image };
      });
    }
  };

  const removeSingleImage = (indexToRemove: number) => {
    if (activeTab === "projects") {
      setProjectData(prev => {
        const updated = prev.images.filter((_, idx) => idx !== indexToRemove);
        return { ...prev, images: updated, image: updated[0] || "" };
      });
    } else if (activeTab === "designs") {
      setDesignData(prev => {
        const updated = prev.images.filter((_, idx) => idx !== indexToRemove);
        return { ...prev, images: updated, image: updated[0] || "" };
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setUploadError(null);
    setMutationError(null);
    setDragActive(false);
    dragCounter.current = 0;
    setProjectData({ name: "", sector: "Web Development", description: "", live_url: "", image: "", images: [] });
    setProductData({ name: "", category: "Design Templates", description: "", format: "Illustrator", status: "available", icon: "Palette", price: 0 });
    setDesignData({ id: "", title: "", category: "Logos & Brand Identity", image: "", images: [] });
  };

  const openEditModal = (item: any) => {
    setUploadError(null);
    setMutationError(null);
    setEditingId(item.id);
    if (activeTab === "projects") {
      const itemImages = Array.isArray(item.images) && item.images.length > 0 ? item.images : (item.image ? [item.image] : []);
      setProjectData({ 
        name: item.name || "", 
        sector: item.sector || "", 
        description: item.description || "", 
        live_url: item.live_url || "", 
        image: item.image || itemImages[0] || "",
        images: itemImages 
      });
    } else if (activeTab === "products") {
      setProductData({ 
        name: item.name || "", 
        category: item.category || "", 
        description: item.description || "", 
        format: item.format || "", 
        status: item.status || "available", 
        icon: item.icon || "Palette", 
        price: item.price || 0 
      });
    } else {
      const itemImages = Array.isArray(item.images) && item.images.length > 0 ? item.images : (item.image ? [item.image] : []);
      setDesignData({ 
        id: item.id, 
        title: item.title || "", 
        category: item.category || "", 
        image: item.image || itemImages[0] || "",
        images: itemImages 
      });
    }
    setIsModalOpen(true);
  };

  const getCurrentImageList = () => {
    if (activeTab === "projects") return projectData.images;
    if (activeTab === "designs") return designData.images;
    return [];
  };

  const filteredProjects = projects.filter((p: any) => p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sector?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredProducts = products.filter((p: any) => p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.category?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredDesigns = designs.filter((d: any) => d.title?.toLowerCase().includes(searchTerm.toLowerCase()) || d.category?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="w-full min-h-screen bg-[#FBF9F5] text-[#524646] font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        
        {/* Header Controls */}
        <div className="flex flex-col gap-4 pb-6 border-b border-[#524646]/10">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-[#007979] uppercase font-display">
              Catalog & Inventory Manager
            </h1>
            <p className="text-xs sm:text-sm text-[#524646]/70 mt-1">
              Directly manage web projects, retail products, and graphic assets in Supabase.
            </p>
          </div>

          {/* NEW: surfaces query-level errors (e.g. profiles RLS blocking the initial fetch) */}
          {projectsQueryError && (
            <p className="flex items-start gap-1.5 text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span>Failed to load projects: {(projectsQueryError as any)?.message || "Unknown error"}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => { closeModal(); setIsModalOpen(true); }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#EC5B38] hover:bg-[#d94a27] rounded-lg transition-all shadow-xs cursor-pointer"
            >
              <Plus size={16} /> CREATE RECORD
            </button>
          </div>
        </div>

        {/* View Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex p-1.5 bg-[#007979]/10 rounded-xl border border-[#007979]/15 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => { setActiveTab("projects"); setSearchTerm(""); }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "projects" ? "bg-[#007979] text-[#FFE2AF] shadow-xs" : "text-[#007979] hover:bg-[#007979]/10"
              }`}
            >
              <LayoutGrid size={14} /> PROJECTS ({projects.length})
            </button>
            <button
              onClick={() => { setActiveTab("products"); setSearchTerm(""); }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "products" ? "bg-[#007979] text-[#FFE2AF] shadow-xs" : "text-[#007979] hover:bg-[#007979]/10"
              }`}
            >
              <Package size={14} /> PRODUCTS ({products.length})
            </button>
            <button
              onClick={() => { setActiveTab("designs"); setSearchTerm(""); }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "designs" ? "bg-[#007979] text-[#FFE2AF] shadow-xs" : "text-[#007979] hover:bg-[#007979]/10"
              }`}
            >
              <ImageIcon size={14} /> DESIGNS ({designs.length})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#524646]/40" />
            <input
              type="text"
              placeholder={`Filter ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#524646]/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#524646] focus:outline-none focus:border-[#007979] transition-all"
            />
          </div>
        </div>

        {/* Display Table / Grid Area */}
        <div className="bg-white border border-[#524646]/10 rounded-2xl shadow-xs overflow-hidden">
          {activeTab === "projects" && (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#007979]/5 text-[#007979] font-display uppercase tracking-wider border-b border-[#524646]/10">
                    <tr>
                      <th className="py-4 px-6 w-1/4">Project Title</th>
                      <th className="py-4 px-6 w-1/6">Sector</th>
                      <th className="py-4 px-6 w-1/3">Description</th>
                      <th className="py-4 px-6">URL</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#524646]/10">
                    {loadingProjects ? (
                      <tr><td colSpan={5} className="py-12 text-center text-[#007979] font-bold uppercase tracking-wider">Fetching projects...</td></tr>
                    ) : filteredProjects.length === 0 ? (
                      <tr><td colSpan={5} className="py-12 text-center text-[#524646]/40">No projects found.</td></tr>
                    ) : (
                      filteredProjects.map((p: any) => (
                        <tr key={p.id} className="hover:bg-[#FBF9F5]/80 transition-colors">
                          <td className="py-4 px-6 font-bold text-[#524646]">
                            <div className="flex items-center gap-3">
                              {p.image || (p.images && p.images[0]) ? (
                                <img src={p.image || p.images[0]} alt={p.name} className="w-9 h-9 object-cover rounded-md border border-[#524646]/10 shrink-0" />
                              ) : (
                                <div className="w-9 h-9 bg-[#007979]/10 rounded-md flex items-center justify-center shrink-0">
                                  <Code size={15} className="text-[#007979]" />
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-stone-900 block">{p.name}</span>
                                {p.images && p.images.length > 1 && (
                                  <span className="text-[10px] text-[#007979] font-normal">{p.images.length} images</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="bg-[#007979]/10 text-[#007979] px-2.5 py-1 rounded-md text-[10px] font-bold">{p.sector}</span>
                          </td>
                          <td className="py-4 px-6 max-w-xs truncate text-[#524646]/80">{p.description}</td>
                          <td className="py-4 px-6">
                            {p.live_url ? (
                              <a href={p.live_url} target="_blank" rel="noreferrer" className="text-[#007979] hover:underline inline-flex items-center gap-1 font-semibold">Live <ExternalLink size={12} /></a>
                            ) : <span className="text-[#524646]/30">—</span>}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button onClick={() => openEditModal(p)} className="p-2 text-[#007979] hover:bg-[#007979]/10 rounded-md transition-colors cursor-pointer"><Edit3 size={15} /></button>
                              <button onClick={() => deleteMutation.mutate({ table: "projects", id: p.id })} className="p-2 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"><Trash2 size={15} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="sm:hidden divide-y divide-[#524646]/10">
                {loadingProjects ? (
                  <div className="py-12 text-center text-[#007979] font-bold uppercase tracking-wider text-xs">Fetching projects...</div>
                ) : filteredProjects.length === 0 ? (
                  <div className="py-12 text-center text-[#524646]/40 text-xs">No projects found.</div>
                ) : (
                  filteredProjects.map((p: any) => (
                    <div key={p.id} className="p-4 flex gap-3">
                      {p.image || (p.images && p.images[0]) ? (
                        <img src={p.image || p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-md border border-[#524646]/10 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-[#007979]/10 rounded-md flex items-center justify-center shrink-0">
                          <Code size={18} className="text-[#007979]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-stone-900 text-sm truncate">{p.name}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => openEditModal(p)} className="p-1.5 text-[#007979] hover:bg-[#007979]/10 rounded-md transition-colors cursor-pointer"><Edit3 size={14} /></button>
                            <button onClick={() => deleteMutation.mutate({ table: "projects", id: p.id })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"><Trash2 size={14} /></button>
                          </div>
                        </div>
                        <span className="inline-block mt-1 bg-[#007979]/10 text-[#007979] px-2 py-0.5 rounded-md text-[10px] font-bold">{p.sector}</span>
                        <p className="text-xs text-[#524646]/80 mt-1.5 line-clamp-2">{p.description}</p>
                        {p.live_url && (
                          <a href={p.live_url} target="_blank" rel="noreferrer" className="text-xs text-[#007979] hover:underline inline-flex items-center gap-1 font-semibold mt-1.5">Live <ExternalLink size={11} /></a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === "products" && (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#007979]/5 text-[#007979] font-display uppercase tracking-wider border-b border-[#524646]/10">
                    <tr>
                      <th className="py-4 px-6 w-1/4">Product Name</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Format</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#524646]/10">
                    {loadingProducts ? (
                      <tr><td colSpan={6} className="py-12 text-center text-[#007979] font-bold uppercase tracking-wider">Fetching products...</td></tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr><td colSpan={6} className="py-12 text-center text-[#524646]/40">No products found.</td></tr>
                    ) : (
                      filteredProducts.map((p: any) => (
                        <tr key={p.id} className="hover:bg-[#FBF9F5]/80 transition-colors">
                          <td className="py-4 px-6 font-semibold text-stone-900">{p.name}</td>
                          <td className="py-4 px-6 text-[#524646]/80">{p.category}</td>
                          <td className="py-4 px-6 font-bold text-[#007979]">${p.price}</td>
                          <td className="py-4 px-6 text-[#524646]/70 font-mono text-[11px]">{p.format}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${p.status === "available" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button onClick={() => openEditModal(p)} className="p-2 text-[#007979] hover:bg-[#007979]/10 rounded-md transition-colors cursor-pointer"><Edit3 size={15} /></button>
                              <button onClick={() => deleteMutation.mutate({ table: "products", id: p.id })} className="p-2 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"><Trash2 size={15} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="sm:hidden divide-y divide-[#524646]/10">
                {loadingProducts ? (
                  <div className="py-12 text-center text-[#007979] font-bold uppercase tracking-wider text-xs">Fetching products...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-12 text-center text-[#524646]/40 text-xs">No products found.</div>
                ) : (
                  filteredProducts.map((p: any) => (
                    <div key={p.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-stone-900 text-sm truncate">{p.name}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => openEditModal(p)} className="p-1.5 text-[#007979] hover:bg-[#007979]/10 rounded-md transition-colors cursor-pointer"><Edit3 size={14} /></button>
                          <button onClick={() => deleteMutation.mutate({ table: "products", id: p.id })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-[#524646]/80">{p.category}</span>
                        <span className="text-xs font-bold text-[#007979]">${p.price}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${p.status === "available" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#524646]/70 font-mono mt-1">{p.format}</p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === "designs" && (
            <div className="p-3 sm:p-6">
              {loadingDesigns ? (
                <div className="py-12 text-center text-[#007979] font-bold uppercase tracking-wider text-xs">Fetching graphic assets...</div>
              ) : filteredDesigns.length === 0 ? (
                <div className="py-12 text-center text-[#524646]/40 text-xs">No design assets found.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
                  {filteredDesigns.map((d: any) => (
                    <div key={d.id} className="bg-white border border-[#524646]/10 rounded-xl overflow-hidden group flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
                      <div className="h-24 sm:h-32 bg-[#524646]/5 relative overflow-hidden">
                        <img src={d.image || (d.images && d.images[0])} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-[#007979]/75 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(d)} className="p-2 bg-white text-[#007979] rounded-full hover:bg-[#FFE2AF] transition-colors cursor-pointer"><Edit3 size={14} /></button>
                          <button onClick={() => deleteMutation.mutate({ table: "graphic_designs", id: d.id })} className="p-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors cursor-pointer"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div className="p-2.5 sm:p-3">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#EC5B38]">{d.category}</span>
                        <h4 className="text-xs font-bold text-[#524646] truncate mt-0.5">{d.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#524646]/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border border-[#524646]/10 rounded-t-2xl sm:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[92vh] sm:max-h-none flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#524646]/10 bg-[#007979] text-[#FFE2AF] shrink-0">
              <h3 className="font-display font-bold text-xs sm:text-sm uppercase tracking-wider">
                {editingId ? "Update Item Record" : "Insert New Entry"} ({activeTab})
              </h3>
              <button onClick={closeModal} className="text-[#FFE2AF]/70 hover:text-[#FFE2AF] transition-colors cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); upsertMutation.mutate(); }} className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs">
              {/* NEW: shows the real Supabase/PostgREST error (missing column, NOT NULL violation, RLS denial, etc.) */}
              {mutationError && (
                <p className="flex items-start gap-1.5 text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-2">
                  <AlertCircle size={13} className="shrink-0 mt-0.5" />
                  <span>{mutationError}</span>
                </p>
              )}

              {(activeTab === "projects" || activeTab === "designs") && (
                <div>
                  <label className="block font-bold text-[#524646] mb-1">Asset Images (Multiple Supported)</label>
                  
                  {/* Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dragCounter.current += 1;
                      setDragActive(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dragCounter.current -= 1;
                      if (dragCounter.current <= 0) {
                        dragCounter.current = 0;
                        setDragActive(false);
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dragCounter.current = 0;
                      setDragActive(false);
                      if (e.dataTransfer.files) handleMultipleFilesUpload(e.dataTransfer.files);
                    }}
                    className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${dragActive ? "border-[#EC5B38] bg-[#EC5B38]/5" : "border-[#524646]/20 bg-[#FBF9F5]"}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) handleMultipleFilesUpload(e.target.files);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />

                    <div className="py-2 flex flex-col items-center justify-center gap-1.5 text-[#524646]/60 pointer-events-none">
                      <UploadCloud size={24} className={`text-[#007979] ${uploading ? "animate-pulse" : ""}`} />
                      <p className="font-medium text-xs">{uploading ? "Uploading images..." : "Drag images here or click to select multiple"}</p>
                    </div>
                  </div>

                  {/* Thumbnail Gallery Preview */}
                  {getCurrentImageList().length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {getCurrentImageList().map((imgUrl, idx) => (
                        <div key={idx} className="relative group h-16 rounded-lg overflow-hidden border border-[#524646]/20 bg-stone-100">
                          <img src={imgUrl} alt={`Uploaded thumbnail ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSingleImage(idx);
                            }}
                            className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadError && (
                    <p className="mt-2 flex items-start gap-1.5 text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-2">
                      <AlertCircle size={13} className="shrink-0 mt-0.5" />
                      <span>{uploadError}</span>
                    </p>
                  )}
                </div>
              )}

              {activeTab === "projects" && (
                <>
                  <div>
                    <label className="block font-bold text-[#524646] mb-1">Project Name</label>
                    <input type="text" required value={projectData.name} onChange={e => setProjectData({ ...projectData, name: e.target.value })} className="w-full bg-[#FBF9F5] border border-[#524646]/20 rounded-lg p-2.5 text-[#524646]" />
                  </div>
                  <div>
                    <label className="block font-bold text-[#524646] mb-1">Sector</label>
                    <input type="text" required value={projectData.sector} onChange={e => setProjectData({ ...projectData, sector: e.target.value })} className="w-full bg-[#FBF9F5] border border-[#524646]/20 rounded-lg p-2.5 text-[#524646]" />
                  </div>
                  <div>
                    <label className="block font-bold text-[#524646] mb-1">Description</label>
                    <textarea rows={3} required value={projectData.description} onChange={e => setProjectData({ ...projectData, description: e.target.value })} className="w-full bg-[#FBF9F5] border border-[#524646]/20 rounded-lg p-2.5 text-[#524646]" />
                  </div>
                  <div>
                    <label className="block font-bold text-[#524646] mb-1">Live URL</label>
                    <input type="url" value={projectData.live_url} onChange={e => setProjectData({ ...projectData, live_url: e.target.value })} className="w-full bg-[#FBF9F5] border border-[#524646]/20 rounded-lg p-2.5 text-[#524646]" placeholder="https://..." />
                  </div>
                </>
              )}

              {activeTab === "products" && (
                <>
                  <div>
                    <label className="block font-bold text-[#524646] mb-1">Product Title</label>
                    <input type="text" required value={productData.name} onChange={e => setProductData({ ...productData, name: e.target.value })} className="w-full bg-[#FBF9F5] border border-[#524646]/20 rounded-lg p-2.5 text-[#524646]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#524646] mb-1">Category</label>
                      <input type="text" required value={productData.category} onChange={e => setProductData({ ...productData, category: e.target.value })} className="w-full bg-[#FBF9F5] border border-[#524646]/20 rounded-lg p-2.5 text-[#524646]" />
                    </div>
                    <div>
                      <label className="block font-bold text-[#524646] mb-1">Price ($ USD)</label>
                      <input type="number" required min={0} value={productData.price} onChange={e => setProductData({ ...productData, price: Number(e.target.value) })} className="w-full bg-[#FBF9F5] border border-[#524646]/20 rounded-lg p-2.5 text-[#524646]" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-[#524646] mb-1">Description</label>
                    <textarea rows={3} required value={productData.description} onChange={e => setProductData({ ...productData, description: e.target.value })} className="w-full bg-[#FBF9F5] border border-[#524646]/20 rounded-lg p-2.5 text-[#524646]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#524646] mb-1">Format</label>
                      <input type="text" required value={productData.format} onChange={e => setProductData({ ...productData, format: e.target.value })} className="w-full bg-[#FBF9F5] border border-[#524646]/20 rounded-lg p-2.5 text-[#524646]" />
                    </div>
                    <div>
                      <label className="block font-bold text-[#524646] mb-1">Status</label>
                      <select value={productData.status} onChange={e => setProductData({ ...productData, status: e.target.value as any })} className="w-full bg-[#FBF9F5] border border-[#524646]/20 rounded-lg p-2.5 text-[#524646]">
                        <option value="available">available</option>
                        <option value="update">update</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "designs" && (
                <>
                  <div>
                    <label className="block font-bold text-[#524646] mb-1">Design Title</label>
                    <input type="text" required value={designData.title} onChange={e => setDesignData({ ...designData, title: e.target.value })} className="w-full bg-[#FBF9F5] border border-[#524646]/20 rounded-lg p-2.5 text-[#524646]" />
                  </div>
                  <div>
                    <label className="block font-bold text-[#524646] mb-1">Category</label>
                    <select value={designData.category} onChange={e => setDesignData({ ...designData, category: e.target.value })} className="w-full bg-[#FBF9F5] border border-[#524646]/20 rounded-lg p-2.5 text-[#524646]">
                      {DEFAULT_DESIGN_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-[#524646]/10 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2.5 sm:py-2 bg-stone-100 text-[#524646] font-bold rounded-lg hover:bg-stone-200 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={upsertMutation.isPending || uploading} className="px-5 py-2.5 sm:py-2 bg-[#007979] text-[#FFE2AF] font-display font-bold rounded-lg hover:bg-[#24B1B1] flex items-center justify-center gap-2 disabled:opacity-50 transition-colors cursor-pointer">
                  {upsertMutation.isPending && <RefreshCw size={14} className="animate-spin" />} Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}