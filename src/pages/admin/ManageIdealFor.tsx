import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Plus, Search, AlertCircle, X, RefreshCw, Pencil, Trash2, ArrowUp, ArrowDown,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function ManageIdealFor() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [label, setLabel] = useState("");
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<any | null>(null);

  // Fetch ideal-for items from Supabase
  const { data: items = [], isLoading, error: loadError } = useQuery({
    queryKey: ["admin-ideal-for"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ideal_for_items")
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
        label: label.trim(),
        ...(editingId ? {} : { sort_order: items.length }),
      };

      const { error } = await supabase.from("ideal_for_items").upsert(payload);
      if (error) throw error;
    },
    onMutate: () => setMutationError(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ideal-for"] });
      closeModal();
    },
    onError: (error: any) => {
      console.error("Ideal-for item save failed:", error);
      const parts = [error?.message, error?.details, error?.hint].filter(Boolean);
      setMutationError(parts.length > 0 ? parts.join(" — ") : "Save failed. Check console.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await supabase.from("ideal_for_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ideal-for"] });
      setItemPendingDelete(null);
    },
    onError: (error: any) => {
      alert(error?.message || "Delete failed.");
    },
  });

  // Swap sort_order with the neighbouring item to move up/down
  const reorderMutation = useMutation({
    mutationFn: async ({ current, neighbour }: { current: any; neighbour: any }) => {
      const { error: err1 } = await supabase
        .from("ideal_for_items")
        .update({ sort_order: neighbour.sort_order })
        .eq("id", current.id);
      if (err1) throw err1;

      const { error: err2 } = await supabase
        .from("ideal_for_items")
        .update({ sort_order: current.sort_order })
        .eq("id", neighbour.id);
      if (err2) throw err2;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-ideal-for"] }),
    onError: (error: any) => {
      alert(error?.message || "Reorder failed.");
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setMutationError(null);
    setLabel("");
  };

  const openCreateModal = () => {
    setLabel("");
    setEditingId(null);
    setMutationError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setLabel(item.label || "");
    setMutationError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (item: any) => {
    setItemPendingDelete(item);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredItems.length) return;
    reorderMutation.mutate({ current: filteredItems[index], neighbour: filteredItems[targetIndex] });
  };

  const filteredItems = items.filter((i: any) =>
    i.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Ideal For — Who I Work With Best</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage the tags shown in the "Ideal For" section. Changes here go live immediately.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer w-full sm:w-auto"
        >
          <Plus size={16} /> Add New Tag
        </button>
      </div>

      {loadError && (
        <p className="mb-4 flex items-start gap-1.5 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>Failed to load ideal-for items: {(loadError as any)?.message || "Unknown error"}</span>
        </p>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-md pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Loading / empty states */}
      {isLoading ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-500 text-sm">
          Loading tags...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-slate-400 text-sm">
          No ideal-for tags found.
        </div>
      ) : (
        <>
          {/* Table — desktop / tablet */}
          <div className="hidden sm:block bg-white rounded-xl border overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-slate-700 text-sm">Tag Label</th>
                  <th className="p-4 font-semibold text-slate-700 text-sm w-28">Order</th>
                  <th className="p-4 font-semibold text-slate-700 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item: any, index: number) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-slate-900">{item.label}</p>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => moveItem(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          aria-label="Move up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => moveItem(index, "down")}
                          disabled={index === filteredItems.length - 1}
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
                          onClick={() => openEditModal(item)}
                          className="text-blue-600 hover:underline text-sm cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
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
            {filteredItems.map((item: any, index: number) => (
              <div key={item.id} className="bg-white rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-slate-900 min-w-0">{item.label}</p>
                  <div className="shrink-0 inline-flex items-center gap-1">
                    <button
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 text-slate-500 bg-slate-50 border border-slate-200 rounded-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveItem(index, "down")}
                      disabled={index === filteredItems.length - 1}
                      className="p-1.5 text-slate-500 bg-slate-50 border border-slate-200 rounded-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md py-2 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
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
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b bg-slate-50 shrink-0">
              <h3 className="font-bold text-sm">
                {editingId ? "Edit Tag" : "Add New Tag"}
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
                <label className="block font-semibold text-slate-700 mb-1">Tag Label</label>
                <input
                  type="text" required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5"
                  placeholder="e.g. Startups moving from MVP to production"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Shown as a bordered tag box on the public site.
                </p>
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
                  Save Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={itemPendingDelete !== null}
        title="Delete tag"
        message={
          itemPendingDelete
            ? `Delete "${itemPendingDelete.label}"? This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        isLoading={deleteMutation.isPending}
        onConfirm={() => itemPendingDelete && deleteMutation.mutate(itemPendingDelete.id)}
        onCancel={() => setItemPendingDelete(null)}
      />
    </div>
  );
}