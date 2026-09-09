import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Insight } from "@/types/insight";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Loader2,
  GripVertical,
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  Search,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Palette,
} from "lucide-react";

// TipTap Editor Imports
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

// --- RICH TEXT TOOLBAR BAR COMPONENT ---
interface EditorToolbarProps {
  editor: ReturnType<typeof useEditor>;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-snow border-b border-border rounded-t font-body">
      {/* Bold, Italic, Underline, Strike */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-paper ${
          editor.isActive("bold") ? "bg-border text-ember" : "text-ink/70"
        }`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-paper ${
          editor.isActive("italic") ? "bg-border text-ember" : "text-ink/70"
        }`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded hover:bg-paper ${
          editor.isActive("underline") ? "bg-border text-ember" : "text-ink/70"
        }`}
        title="Underline"
      >
        <UnderlineIcon size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded hover:bg-paper ${
          editor.isActive("strike") ? "bg-border text-ember" : "text-ink/70"
        }`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>

      <span className="w-px h-5 bg-border mx-1" />

      {/* Font Color Picker */}
      <div className="flex items-center gap-1 px-1">
        <Palette size={16} className="text-ink/70" />
        <input
          type="color"
          onInput={(e) =>
            editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()
          }
          value={editor.getAttributes("textStyle").color || "#000000"}
          className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
          title="Text Color"
        />
      </div>

      <span className="w-px h-5 bg-border mx-1" />

      {/* Alignment */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`p-1.5 rounded hover:bg-paper ${
          editor.isActive({ textAlign: "left" }) ? "bg-border text-ember" : "text-ink/70"
        }`}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`p-1.5 rounded hover:bg-paper ${
          editor.isActive({ textAlign: "center" }) ? "bg-border text-ember" : "text-ink/70"
        }`}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`p-1.5 rounded hover:bg-paper ${
          editor.isActive({ textAlign: "right" }) ? "bg-border text-ember" : "text-ink/70"
        }`}
        title="Align Right"
      >
        <AlignRight size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        className={`p-1.5 rounded hover:bg-paper ${
          editor.isActive({ textAlign: "justify" }) ? "bg-border text-ember" : "text-ink/70"
        }`}
        title="Justify"
      >
        <AlignJustify size={16} />
      </button>

      <span className="w-px h-5 bg-border mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-paper ${
          editor.isActive("bulletList") ? "bg-border text-ember" : "text-ink/70"
        }`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-paper ${
          editor.isActive("orderedList") ? "bg-border text-ember" : "text-ink/70"
        }`}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>

      <span className="w-px h-5 bg-border mx-1" />

      {/* Links & Images */}
      <button
        type="button"
        onClick={setLink}
        className={`p-1.5 rounded hover:bg-paper ${
          editor.isActive("link") ? "bg-border text-ember" : "text-ink/70"
        }`}
        title="Insert Link"
      >
        <LinkIcon size={16} />
      </button>
      {editor.isActive("link") && (
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className="p-1.5 rounded hover:bg-paper text-ink/70"
          title="Remove Link"
        >
          <Unlink size={16} />
        </button>
      )}
      <button
        type="button"
        onClick={addImage}
        className="p-1.5 rounded hover:bg-paper text-ink/70"
        title="Insert Image"
      >
        <ImageIcon size={16} />
      </button>
    </div>
  );
};

// --- MAIN CMS COMPONENT ---
const ManageInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Insight | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    read_time: "5 min read",
    excerpt: "",
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    image: "",
    tags: "",
    featured: false,
    published: true,
  });

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none p-3 min-h-[220px] focus:outline-none bg-paper rounded-b text-ink",
      },
    },
  });

  useEffect(() => {
    fetchInsights();
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInsights((data as Insight[]) || []);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load database insights");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: Insight) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        slug: item.slug,
        category: item.category,
        read_time: item.read_time || "5 min read",
        excerpt: item.excerpt,
        date: item.date,
        image: item.image || "",
        tags: item.tags ? item.tags.join(", ") : "",
        featured: !!item.featured,
        published: item.published ?? true,
      });
      editor?.commands.setContent(item.body ? item.body.join("\n") : "");
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        slug: "",
        category: "",
        read_time: "5 min read",
        excerpt: "",
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        image: "",
        tags: "",
        featured: false,
        published: true,
      });
      editor?.commands.setContent("");
    }
    setIsModalOpen(true);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("error", "Please upload an image file (PNG, JPG, WEBP).");
      return;
    }

    try {
      setUploadingImage(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("insights-images")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("insights-images").getPublicUrl(filePath);
      setFormData((prev) => ({ ...prev, image: data.publicUrl }));
      showToast("success", "Cover image uploaded directly to Supabase!");
    } catch (error: any) {
      showToast("error", error.message || "Error uploading image file");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const computedSlug = formData.slug.trim() || generateSlug(formData.title);
      const htmlContent = editor?.getHTML() || "";
      const bodyArray = [htmlContent]; // Saved as HTML output

      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        title: formData.title,
        slug: computedSlug,
        category: formData.category,
        read_time: formData.read_time,
        excerpt: formData.excerpt,
        date: formData.date,
        image: formData.image,
        tags: tagsArray,
        body: bodyArray,
        featured: formData.featured,
        published: formData.published,
        updated_at: new Date().toISOString(),
      };

      if (editingItem?.id) {
        const { error } = await supabase.from("insights").update(payload).eq("id", editingItem.id);
        if (error) throw error;
        showToast("success", "Article updated in database");
      } else {
        const nextOrder = insights.length > 0 ? Math.max(...insights.map((i) => i.sort_order || 0)) + 1 : 0;
        const { error } = await supabase.from("insights").insert([{ ...payload, sort_order: nextOrder }]);
        if (error) throw error;
        showToast("success", "Article created in database");
      }

      setIsModalOpen(false);
      fetchInsights();
    } catch (err: any) {
      showToast("error", err.message || "Failed to persist article");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this article from Supabase?")) return;
    try {
      const { error } = await supabase.from("insights").delete().eq("id", id);
      if (error) throw error;
      showToast("success", "Article deleted from database");
      fetchInsights();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete article");
    }
  };

  const togglePublished = async (item: Insight) => {
    try {
      const { error } = await supabase
        .from("insights")
        .update({ published: !item.published })
        .eq("id", item.id);
      if (error) throw error;
      setInsights((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, published: !i.published } : i))
      );
    } catch (err: any) {
      showToast("error", "Failed to update publish state");
    }
  };

  const toggleFeatured = async (item: Insight) => {
    try {
      const { error } = await supabase
        .from("insights")
        .update({ featured: !item.featured })
        .eq("id", item.id);
      if (error) throw error;
      setInsights((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, featured: !i.featured } : i))
      );
    } catch (err: any) {
      showToast("error", "Failed to update featured state");
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const updated = [...insights];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, movedItem);

    setInsights(updated);
    setDraggedIndex(null);

    try {
      const updates = updated.map((item, idx) =>
        supabase.from("insights").update({ sort_order: idx }).eq("id", item.id)
      );
      await Promise.all(updates);
      showToast("success", "Display order saved");
    } catch (err: any) {
      showToast("error", "Failed to save reordered positions");
      fetchInsights();
    }
  };

  const filteredInsights = insights.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto bg-paper min-h-screen">
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white font-body text-sm ${
            notification.type === "success" ? "bg-forest" : "bg-red-600"
          }`}
        >
          {notification.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-border">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink">Insight CMS Management</h1>
          <p className="font-body text-xs sm:text-sm text-ink/60 mt-1">
            Connected to live Supabase backend database.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-ember text-cream px-4 py-2.5 rounded font-body text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus size={18} /> Add Article
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-snow border border-border rounded text-sm font-body text-ink focus:outline-none focus:border-ember"
          />
        </div>
        <div className="text-xs font-body text-ink/60 self-end sm:self-auto">
          Total: <strong className="text-ink">{insights.length}</strong> | Published:{" "}
          <strong className="text-forest">{insights.filter((i) => i.published).length}</strong>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-ink/60">
          <Loader2 className="animate-spin mr-2 text-ember" size={24} />
          <span className="font-body text-sm">Querying database...</span>
        </div>
      ) : filteredInsights.length === 0 ? (
        <div className="text-center py-16 bg-snow border border-border rounded-lg p-6">
          <p className="font-body text-ink/60 text-sm">No articles in database matching search query.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-snow border border-border rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-forest/5 border-b border-border font-body text-xs text-ink/70 uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">Order</th>
                  <th className="p-4">Title & Slug</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Reads</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-body text-sm">
                {filteredInsights.map((item, index) => (
                  <tr
                    key={item.id || item.slug}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    className={`hover:bg-paper/70 transition-colors ${
                      draggedIndex === index ? "opacity-40 bg-ember/10" : ""
                    }`}
                  >
                    <td className="p-4 text-center cursor-grab active:cursor-grabbing text-ink/40 hover:text-ink">
                      <GripVertical size={18} className="mx-auto" />
                    </td>
                    <td className="p-4 max-w-md">
                      <div className="font-medium text-ink line-clamp-1">{item.title}</div>
                      <div className="text-xs text-ink/50 font-mono truncate">{item.slug}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-paper border border-border px-2.5 py-1 rounded text-xs font-medium text-ink/80">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-ink/70 text-xs whitespace-nowrap">{item.date}</td>
                    <td className="p-4 text-ink/70 text-xs font-mono">{(item.readers || 0).toLocaleString()}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePublished(item)}
                          className={`p-1.5 rounded transition-colors ${
                            item.published ? "text-forest bg-forest/10" : "text-ink/40 bg-border/40"
                          }`}
                        >
                          {item.published ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => toggleFeatured(item)}
                          className={`p-1.5 rounded transition-colors ${
                            item.featured ? "text-ember bg-ember/10" : "text-ink/30 hover:text-ink/60"
                          }`}
                        >
                          <Star size={16} fill={item.featured ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-1.5 hover:bg-paper border border-transparent hover:border-border rounded text-ink/70 hover:text-ink"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id!)}
                          className="p-1.5 hover:bg-paper border border-transparent hover:border-border rounded text-ember hover:opacity-80"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="block md:hidden space-y-4">
            {filteredInsights.map((item) => (
              <div key={item.id || item.slug} className="bg-snow border border-border rounded-lg p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="bg-paper border border-border px-2 py-0.5 rounded text-xs font-medium text-ink/80">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePublished(item)}
                      className={`p-1 rounded ${item.published ? "text-forest" : "text-ink/40"}`}
                    >
                      {item.published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => toggleFeatured(item)}
                      className={`p-1 rounded ${item.featured ? "text-ember" : "text-ink/30"}`}
                    >
                      <Star size={16} fill={item.featured ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-base text-ink">{item.title}</h3>
                  <p className="font-mono text-xs text-ink/40 mt-0.5 truncate">{item.slug}</p>
                </div>

                <div className="flex justify-between items-center text-xs text-ink/60 border-t border-border/50 pt-2 font-body">
                  <span>{item.date}</span>
                  <span>{item.readers || 0} reads</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="flex items-center gap-1 text-xs font-body text-ink/70 hover:text-ink px-2 py-1 border border-border rounded"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id!)}
                    className="flex items-center gap-1 text-xs font-body text-ember hover:opacity-80 px-2 py-1 border border-border rounded"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-snow border border-border rounded-lg max-w-3xl w-full my-8 p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
              <h2 className="font-display text-xl sm:text-2xl text-ink">
                {editingItem ? "Edit Article" : "Create Article"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink/40 hover:text-ink transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 font-body text-sm">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      title,
                      slug: editingItem ? prev.slug : generateSlug(title),
                    }));
                  }}
                  className="w-full border border-border rounded p-2.5 bg-paper text-ink focus:outline-none focus:border-ember"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full border border-border rounded p-2.5 bg-paper text-ink font-mono text-xs focus:outline-none focus:border-ember"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-border rounded p-2.5 bg-paper text-ink focus:outline-none focus:border-ember"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Date</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-border rounded p-2.5 bg-paper text-ink focus:outline-none focus:border-ember"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Read Time</label>
                  <input
                    type="text"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                    className="w-full border border-border rounded p-2.5 bg-paper text-ink focus:outline-none focus:border-ember"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full border border-border rounded p-2.5 bg-paper text-ink focus:outline-none focus:border-ember"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">Cover Image</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors ${
                    isDraggingFile
                      ? "border-ember bg-ember/10"
                      : "border-border bg-paper hover:border-ink/40"
                  }`}
                >
                  {uploadingImage ? (
                    <div className="flex flex-col items-center justify-center py-2 text-ink/60">
                      <Loader2 size={24} className="animate-spin text-ember mb-2" />
                      <span className="text-xs">Uploading to storage...</span>
                    </div>
                  ) : formData.image ? (
                    <div className="relative group max-w-xs mx-auto">
                      <img src={formData.image} alt="Preview" className="h-32 w-full object-cover rounded border border-border" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center cursor-pointer">
                      <UploadCloud size={28} className="text-ink/40 mb-2" />
                      <p className="text-xs text-ink/70">
                        Drag & drop image here or{" "}
                        <label className="text-ember font-medium cursor-pointer hover:underline">
                          browse files
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">Excerpt *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full border border-border rounded p-2.5 bg-paper text-ink focus:outline-none focus:border-ember"
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Article Content *</label>
                <div className="border border-border rounded shadow-sm overflow-hidden focus-within:border-ember">
                  <EditorToolbar editor={editor} />
                  <EditorContent editor={editor} />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded border-border text-ember focus:ring-ember"
                  />
                  <span className="text-xs font-medium text-ink">Publish Article</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-border text-ember focus:ring-ember"
                  />
                  <span className="text-xs font-medium text-ink">Mark as Featured</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded text-ink/70 hover:bg-paper font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-5 py-2 bg-ember text-cream rounded font-medium text-xs hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editingItem ? "Update Article" : "Save Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInsights;