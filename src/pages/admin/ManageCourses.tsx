import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Plus, Search, AlertCircle, GripVertical,
  Eye, EyeOff, X, RefreshCw, Pencil, Trash2,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

const CATEGORY_OPTIONS = ["Graphic Design", "Video Editing", "Web Dev", "Marketing"];

const ICON_OPTIONS = [
  "Palette", "Brush", "Film", "Clapperboard", "Sparkles", "Target", "Camera",
  "Code2", "CreditCard", "Lightbulb", "Layout", "Zap", "TrendingUp", "Shield",
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "enrolling", label: "Enrolling" },
  { value: "waitlist", label: "Waitlist" },
  { value: "update", label: "Notify on Update" },
];

const emptyForm = {
  id: "",
  name: "",
  category: CATEGORY_OPTIONS[0],
  icon: "Zap",
  description: "",
  audience: "",
  duration: "",
  price: "",
  status: "enrolling",
  highlights: [""] as string[],
  tools: [""] as string[],
  certificate: true,
  live_support: false,
  project_count: "",
  bonuses: [""] as string[],
  published: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Generic helper for editing the three list fields (highlights, tools, bonuses)
function ListFieldEditor({
  label,
  hint,
  items,
  onChange,
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (next: string[]) => void;
}) {
  const update = (idx: number, value: string) => {
    const next = [...items];
    next[idx] = value;
    onChange(next);
  };
  const add = () => onChange([...items, ""]);
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
            <GripVertical size={14} className="text-slate-300 shrink-0 hidden sm:block" />
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
        onClick={add}
        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
      >
        <Plus size={13} /> Add {label.toLowerCase().replace(/s$/, "")}
      </button>
    </div>
  );
}

export default function ManageCourses() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [coursePendingDelete, setCoursePendingDelete] = useState<any | null>(null);

  const { data: courses = [], isLoading, error: loadError } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async () => {
      const cleanList = (arr: string[]) => arr.map((v) => v.trim()).filter(Boolean);

      const payload = {
        id: editingId || slugify(formData.name),
        name: formData.name,
        category: formData.category,
        icon: formData.icon,
        description: formData.description,
        audience: formData.audience,
        duration: formData.duration,
        price: Number(formData.price) || 0,
        status: formData.status,
        highlights: cleanList(formData.highlights),
        tools: cleanList(formData.tools),
        certificate: formData.certificate,
        live_support: formData.live_support,
        project_count: Number(formData.project_count) || 0,
        bonuses: cleanList(formData.bonuses),
        published: formData.published,
        ...(editingId ? {} : { sort_order: courses.length }),
      };

      const { error } = await supabase.from("courses").upsert(payload);
      if (error) throw error;
    },
    onMutate: () => setMutationError(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      closeModal();
    },
    onError: (error: any) => {
      console.error("Course save failed:", error);
      const parts = [error?.message, error?.details, error?.hint].filter(Boolean);
      setMutationError(parts.length > 0 ? parts.join(" — ") : "Save failed. Check console.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setCoursePendingDelete(null);
    },
    onError: (error: any) => {
      alert(error?.message || "Delete failed.");
    },
  });

  const togglePublishedMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("courses").update({ published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-courses"] }),
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setMutationError(null);
    setFormData(emptyForm);
  };

  const openCreateModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setMutationError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (course: any) => {
    setEditingId(course.id);
    setMutationError(null);
    setFormData({
      id: course.id,
      name: course.name || "",
      category: course.category || CATEGORY_OPTIONS[0],
      icon: course.icon || "Zap",
      description: course.description || "",
      audience: course.audience || "",
      duration: course.duration || "",
      price: String(course.price ?? ""),
      status: course.status || "enrolling",
      highlights: Array.isArray(course.highlights) && course.highlights.length > 0 ? course.highlights : [""],
      tools: Array.isArray(course.tools) && course.tools.length > 0 ? course.tools : [""],
      certificate: course.certificate ?? true,
      live_support: course.live_support ?? false,
      project_count: String(course.project_count ?? ""),
      bonuses: Array.isArray(course.bonuses) && course.bonuses.length > 0 ? course.bonuses : [""],
      published: course.published ?? true,
    });
    setIsModalOpen(true);
  };

  const filteredCourses = courses.filter((c: any) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Courses</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage every course shown on the public Courses page. Changes here go live immediately.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer w-full sm:w-auto"
        >
          <Plus size={16} /> Add New Course
        </button>
      </div>

      {loadError && (
        <p className="mb-4 flex items-start gap-1.5 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>Failed to load courses: {(loadError as any)?.message || "Unknown error"}</span>
        </p>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
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
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Loading / empty states */}
      {isLoading ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-500 text-sm">
          Loading courses...
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-400 text-sm">
          No courses found.
        </div>
      ) : (
        <>
          {/* Table — desktop / tablet */}
          <div className="hidden sm:block bg-white rounded-xl border overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-slate-700 text-sm">Course</th>
                  <th className="p-4 font-semibold text-slate-700 text-sm">Category</th>
                  <th className="p-4 font-semibold text-slate-700 text-sm">Price</th>
                  <th className="p-4 font-semibold text-slate-700 text-sm">Status</th>
                  <th className="p-4 font-semibold text-slate-700 text-sm">Visibility</th>
                  <th className="p-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c: any) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">/{c.id}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{c.category}</td>
                    <td className="p-4 text-sm text-slate-600">${c.price}</td>
                    <td className="p-4 text-sm text-slate-600 capitalize">{c.status}</td>
                    <td className="p-4">
                      <button
                        onClick={() => togglePublishedMutation.mutate({ id: c.id, published: !c.published })}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                          c.published
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        {c.published ? <Eye size={12} /> : <EyeOff size={12} />}
                        {c.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(c)}
                          className="text-blue-600 hover:underline text-sm cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setCoursePendingDelete(c)}
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
            {filteredCourses.map((c: any) => (
              <div key={c.id} className="bg-white rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{c.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">/{c.id}</p>
                  </div>
                  <button
                    onClick={() => togglePublishedMutation.mutate({ id: c.id, published: !c.published })}
                    className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                      c.published
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    {c.published ? <Eye size={12} /> : <EyeOff size={12} />}
                    {c.published ? "Published" : "Draft"}
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span><span className="text-slate-400">Category:</span> {c.category}</span>
                  <span><span className="text-slate-400">Price:</span> ${c.price}</span>
                  <span className="capitalize"><span className="text-slate-400">Status:</span> {c.status}</span>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(c)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md py-2 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => setCoursePendingDelete(c)}
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
                {editingId ? "Edit Course" : "Add New Course"}
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
                <label className="block font-semibold text-slate-700 mb-1">Course Name</label>
                <input
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                  placeholder="e.g. Adobe Photoshop Mastery"
                />
                <p className="text-xs text-slate-400 mt-1 break-all">
                  URL id: <span className="font-mono">{editingId || slugify(formData.name) || "—"}</span>
                  {editingId && " (fixed once created)"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
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
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3} required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                  placeholder="What will students learn or achieve?"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Audience</label>
                  <input
                    type="text" required
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                    placeholder="e.g. Beginner to Advanced"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text" required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                    placeholder="e.g. 8 Weeks · Self-paced"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (USD)</label>
                  <input
                    type="number" required min="0" step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                    placeholder="249"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project Count</label>
                  <input
                    type="number" min="0" step="1"
                    value={formData.project_count}
                    onChange={(e) => setFormData({ ...formData, project_count: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                    placeholder="6"
                  />
                </div>
              </div>

              <ListFieldEditor
                label="Highlights"
                hint="What You Get bullet point"
                items={formData.highlights}
                onChange={(next) => setFormData({ ...formData, highlights: next })}
              />

              <ListFieldEditor
                label="Tools"
                hint="Software or platform used"
                items={formData.tools}
                onChange={(next) => setFormData({ ...formData, tools: next })}
              />

              <ListFieldEditor
                label="Bonuses"
                hint="Bonus material or perk (optional)"
                items={formData.bonuses}
                onChange={(next) => setFormData({ ...formData, bonuses: next })}
              />

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.certificate}
                    onChange={(e) => setFormData({ ...formData, certificate: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-slate-700">Certificate on completion</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.live_support}
                    onChange={(e) => setFormData({ ...formData, live_support: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-slate-700">Live support / cohort sessions</span>
                </label>
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
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={coursePendingDelete !== null}
        title="Delete course"
        message={
          coursePendingDelete
            ? `Delete "${coursePendingDelete.name}"? This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        isLoading={deleteMutation.isPending}
        onConfirm={() => coursePendingDelete && deleteMutation.mutate(coursePendingDelete.id)}
        onCancel={() => setCoursePendingDelete(null)}
      />
    </div>
  );
}