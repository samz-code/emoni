import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function EditService() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", slug: "", short_description: "", full_description: "", deliverables: "", published: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      supabase.from("services").select("*").eq("id", id).single().then(({ data }) => {
        if (data) setForm({ ...data, deliverables: data.deliverables ? data.deliverables.join(", ") : "" });
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-"),
      short_description: form.short_description,
      full_description: form.full_description,
      deliverables: form.deliverables.split(",").map((s) => s.trim()).filter(Boolean),
      published: form.published,
    };

    const { error } = id ? await supabase.from("services").update(payload).eq("id", id) : await supabase.from("services").insert([payload]);
    setSaving(false);

    if (!error) {
      navigate("/admin/services");
    } else {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl border shadow-sm">
      <h2 className="text-2xl font-bold mb-6">{id ? "Edit Service" : "Add Service"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input type="text" required className="w-full border p-2 rounded-md" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input type="text" className="w-full border p-2 rounded-md" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Short Description</label>
          <textarea className="w-full border p-2 rounded-md h-20" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Deliverables (comma separated)</label>
          <input type="text" className="w-full border p-2 rounded-md" value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          <label htmlFor="published">Published</label>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate("/admin/services")} className="px-4 py-2 border rounded-md">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-black text-white rounded-md">{saving ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
