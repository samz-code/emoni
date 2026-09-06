import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Plus, Search, AlertCircle, GripVertical,
  Eye, EyeOff, X, RefreshCw, Pencil, Trash2,
} from "lucide-react";

const ICON_OPTIONS = [
  "Zap", "Layers", "Monitor", "Palette", "CreditCard", "Workflow", "Link",
  "Wrench", "TrendingUp", "Target", "Compass", "Radio", "BarChart2",
  "Layout", "Search", "Share2", "Edit3",
];

const emptyForm = {
  id: "",
  category: "strategy",
  icon: "Zap",
  name: "",
  problem: "",
  solution: "",
  outcome: "",
  deliverables: [""] as string[],
  ideal_for: "",
  published: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function ManageServices() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Fetch Services from Supabase
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

  // Fetch Categories dynamically from Database
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
      const cleanDeliverables = formData.deliverables.map((d) => d.trim()).filter(Boolean);

      const payload = {
        id: editingId || slugify(formData.name),
        category: formData.category,
        icon: formData.icon,
        name: formData.name,
        problem: formData.problem,
        solution: formData.solution,
        outcome: formData.outcome,
        deliverables: cleanDeliverables,
        ideal_for: formData.ideal_for,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-services"] }),
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
    setFormData(emptyForm);
  };

  const openCreateModal = () => {
    setFormData({
      ...emptyForm,
      category: categories[0]?.id || "strategy",
    });
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
      icon: service.icon || "Zap",
      name: service.name || "",
      problem: service.problem || "",
      solution: service.solution || "",
      outcome: service.outcome || "",
      deliverables: Array.isArray(service.deliverables) && service.deliverables.length > 0
        ? service.deliverables
        : [""],
      ideal_for: service.ideal_for || "",
      published: service.published ?? true,
    });
    setIsModalOpen(true);
  };

  const updateDeliverable = (index: number, value: string) => {
    setFormData((prev) => {
      const next = [...prev.deliverables];
      next[index] = value;
      return { ...prev, deliverables: next };
    });
  };

  const addDeliverable = () => {
    setFormData((prev) => ({ ...prev, deliverables: [...prev.deliverables, ""] }));
  };

  const removeDeliverable = (index: number) => {
    setFormData((prev) => {
      const next = prev.deliverables.filter((_, i) => i !== index);
      return { ...prev, deliverables: next.length > 0 ? next : [""] };
    });
  };

  const handleDelete = (service: any) => {
    if (confirm(`Delete "${service.name}"? This can't be undone.`)) {
      deleteMutation.mutate(service.id);
    }
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

      {/* Loading / empty states (shared) */}
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
                      <p className="font-medium text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">/{s.id}</p>
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
                          onClick={() => handleDelete(s)}
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
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">/{s.id}</p>
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
                    onClick={() => handleDelete(s)}
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
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col">
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
              className="p-4 sm:p-5 space-y-4 overflow-y-auto text-sm"
            >
              {mutationError && (
                <p className="flex items-start gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-2">
                  <AlertCircle size={13} className="shrink-0 mt-0.5" />
                  <span>{mutationError}</span>
                </p>
              )}

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

              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
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
                  <label className="block font-semibold text-slate-700 mb-1">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>

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
                <label className="block font-semibold text-slate-700 mb-1">Outcome</label>
                <input
                  type="text" required
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                  placeholder="e.g. ↑ Online visibility & conversions"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">What You Get</label>
                <div className="space-y-2">
                  {formData.deliverables.map((d, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <GripVertical size={14} className="text-slate-300 shrink-0 hidden sm:block" />
                      <input
                        type="text"
                        value={d}
                        onChange={(e) => updateDeliverable(idx, e.target.value)}
                        className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-md p-2"
                        placeholder="Deliverable item"
                      />
                      <button
                        type="button"
                        onClick={() => removeDeliverable(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer shrink-0"
                        aria-label="Remove deliverable"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addDeliverable}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  <Plus size={13} /> Add deliverable
                </button>
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

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="font-semibold text-slate-700">Published (visible on the public site)</span>
              </label>

              <div className="pt-4 border-t flex flex-col-reverse sm:flex-row justify-end gap-3 pb-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 sm:py-2 bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={upsertMutation.isPending}
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
    </div>
  );
}