import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Plus, Search, AlertCircle, X, RefreshCw, Pencil, Trash2, ArrowUp, ArrowDown,
} from "lucide-react";

const emptyForm = {
  step_number: "",
  title: "",
  description: "",
};

export default function ManageProcessSteps() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Fetch process steps from Supabase
  const { data: steps = [], isLoading, error: loadError } = useQuery({
    queryKey: ["admin-process-steps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("process_steps")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        step_number: formData.step_number,
        title: formData.title,
        description: formData.description,
        ...(editingId ? {} : { sort_order: steps.length }),
      };

      const { error } = await supabase.from("process_steps").upsert(payload);
      if (error) throw error;
    },
    onMutate: () => setMutationError(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-process-steps"] });
      closeModal();
    },
    onError: (error: any) => {
      console.error("Process step save failed:", error);
      const parts = [error?.message, error?.details, error?.hint].filter(Boolean);
      setMutationError(parts.length > 0 ? parts.join(" — ") : "Save failed. Check console.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await supabase.from("process_steps").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-process-steps"] }),
    onError: (error: any) => {
      alert(error?.message || "Delete failed.");
    },
  });

  // Swap sort_order with the neighbouring step to move up/down
  const reorderMutation = useMutation({
    mutationFn: async ({ current, neighbour }: { current: any; neighbour: any }) => {
      const { error: err1 } = await supabase
        .from("process_steps")
        .update({ sort_order: neighbour.sort_order })
        .eq("id", current.id);
      if (err1) throw err1;

      const { error: err2 } = await supabase
        .from("process_steps")
        .update({ sort_order: current.sort_order })
        .eq("id", neighbour.id);
      if (err2) throw err2;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-process-steps"] }),
    onError: (error: any) => {
      alert(error?.message || "Reorder failed.");
    },
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
      step_number: String(steps.length + 1).padStart(2, "0"),
    });
    setEditingId(null);
    setMutationError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (step: any) => {
    setEditingId(step.id);
    setMutationError(null);
    setFormData({
      step_number: step.step_number || "",
      title: step.title || "",
      description: step.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (step: any) => {
    if (confirm(`Delete step "${step.title}"? This can't be undone.`)) {
      deleteMutation.mutate(step.id);
    }
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredSteps.length) return;
    reorderMutation.mutate({ current: filteredSteps[index], neighbour: filteredSteps[targetIndex] });
  };

  const filteredSteps = steps.filter((s: any) =>
    s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">How I Work — Process Steps</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage the steps shown in the "How I Work" section. Changes here go live immediately.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer w-full sm:w-auto"
        >
          <Plus size={16} /> Add New Step
        </button>
      </div>

      {loadError && (
        <p className="mb-4 flex items-start gap-1.5 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>Failed to load process steps: {(loadError as any)?.message || "Unknown error"}</span>
        </p>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search steps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-md pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Loading / empty states */}
      {isLoading ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-500 text-sm">
          Loading process steps...
        </div>
      ) : filteredSteps.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-400 text-sm">
          No process steps found.
        </div>
      ) : (
        <>
          {/* Table — desktop / tablet */}
          <div className="hidden sm:block bg-white rounded-xl border overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-slate-700 text-sm w-20">#</th>
                  <th className="p-4 font-semibold text-slate-700 text-sm">Title</th>
                  <th className="p-4 font-semibold text-slate-700 text-sm">Description</th>
                  <th className="p-4 font-semibold text-slate-700 text-sm w-28">Order</th>
                  <th className="p-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSteps.map((s: any, index: number) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm text-slate-500 font-mono">{s.step_number}</td>
                    <td className="p-4">
                      <p className="font-medium text-slate-900">{s.title}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600 max-w-[320px] truncate">{s.description}</td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => moveStep(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          aria-label="Move up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => moveStep(index, "down")}
                          disabled={index === filteredSteps.length - 1}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          aria-label="Move down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
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
            {filteredSteps.map((s: any, index: number) => (
              <div key={s.id} className="bg-white rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-mono">{s.step_number}</p>
                    <p className="font-medium text-slate-900 mt-0.5">{s.title}</p>
                  </div>
                  <div className="shrink-0 inline-flex items-center gap-1">
                    <button
                      onClick={() => moveStep(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 text-slate-500 bg-slate-50 border border-slate-200 rounded-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveStep(index, "down")}
                      disabled={index === filteredSteps.length - 1}
                      className="p-1.5 text-slate-500 bg-slate-50 border border-slate-200 rounded-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>

                {s.description && (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{s.description}</p>
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
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b bg-slate-50 shrink-0">
              <h3 className="font-bold text-sm">
                {editingId ? "Edit Step" : "Add New Step"}
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
                <label className="block font-semibold text-slate-700 mb-1">Step Number</label>
                <input
                  type="text" required
                  value={formData.step_number}
                  onChange={(e) => setFormData({ ...formData, step_number: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                  placeholder="e.g. 01"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Displayed as the large background number on the site.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text" required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                  placeholder="e.g. Discovery & Problem Mapping"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={4} required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                  placeholder="What happens during this step?"
                />
              </div>

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
                  Save Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}