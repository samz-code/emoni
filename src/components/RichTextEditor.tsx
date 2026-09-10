import React, { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  Unlink,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  UploadCloud,
  Palette,
  Highlighter,
  Undo2,
  Redo2,
  Code2,
  Loader2,
  Quote,
  X,
  Table as TableIcon,
  Shapes,
  User,
  Plus,
  LayoutGrid,
  Frame,
  Columns,
  Sparkles,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  authorName?: string;
  onAuthorChange?: (author: string) => void;
  placeholder?: string;
}

const HEADING_OPTIONS = [
  { label: "Paragraph", value: "P" },
  { label: "Heading 1", value: "H1" },
  { label: "Heading 2", value: "H2" },
  { label: "Heading 3", value: "H3" },
];

const TEXT_COLORS = [
  "#1a1a1a", "#4b5563", "#b45309", "#b91c1c",
  "#166534", "#1d4ed8", "#7c3aed", "#ffffff",
  "#0284c7", "#d97706", "#059669", "#dc2626",
];

const HIGHLIGHT_COLORS = [
  "#fef08a", "#bbf7d0", "#bfdbfe", "#fbcfe8",
  "#fed7aa", "#e9d5ff", "#c7d2fe", "#fef3c7",
];

export interface MaskShapeConfig {
  id: string;
  label: string;
  clipPath: string;
  aspectRatio?: string;
}

const MASK_SHAPES: MaskShapeConfig[] = [
  { id: "circle", label: "Circle", clipPath: "circle(50% at 50% 50%)", aspectRatio: "1/1" },
  { id: "pill", label: "Pill / Oval", clipPath: "ellipse(50% 40% at 50% 50%)", aspectRatio: "16/9" },
  { id: "rounded", label: "Rounded Box", clipPath: "inset(0 round 1.25rem)", aspectRatio: "1/1" },
  { id: "hexagon", label: "Hexagon", clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)", aspectRatio: "1/1" },
  { id: "diamond", label: "Diamond", clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", aspectRatio: "1/1" },
  { id: "arch", label: "Arch Door", clipPath: "polygon(0% 100%, 0% 35%, 15% 10%, 50% 0%, 85% 10%, 100% 35%, 100% 100%)", aspectRatio: "3/4" },
  { id: "star", label: "5-Point Star", clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)", aspectRatio: "1/1" },
  { id: "shield", label: "Shield", clipPath: "polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%)", aspectRatio: "3/4" },
];

export interface ImageTemplateConfig {
  id: string;
  label: string;
  wrapperClass: string;
  imageClass: string;
}

const IMAGE_TEMPLATES: ImageTemplateConfig[] = [
  { id: "standard", label: "Standard", wrapperClass: "", imageClass: "max-w-full rounded" },
  { id: "polaroid", label: "Polaroid", wrapperClass: "p-3 bg-white shadow-md border rounded inline-block text-center font-mono text-xs", imageClass: "max-w-full h-auto mb-2" },
  { id: "bordered-frame", label: "Elegance Frame", wrapperClass: "p-2 border-2 border-amber-600 rounded-lg inline-block bg-neutral-50 shadow-sm", imageClass: "max-w-full rounded" },
  { id: "floating-shadow", label: "Floating Elevation", wrapperClass: "inline-block rounded-xl shadow-2xl border border-neutral-200 overflow-hidden", imageClass: "max-w-full" },
  { id: "glow-accent", label: "Soft Glow", wrapperClass: "inline-block rounded-xl shadow-[0_0_20px_rgba(180,83,9,0.35)] border border-amber-200 overflow-hidden", imageClass: "max-w-full" },
  { id: "badge-card", label: "Card Inset", wrapperClass: "p-4 bg-gray-50 border border-gray-200 rounded-2xl shadow-inner inline-block", imageClass: "max-w-full rounded-lg" },
];

export interface LayoutTemplateConfig {
  id: string;
  label: string;
  iconName: string;
  generateHtml: () => string;
}

const LAYOUT_TEMPLATES: LayoutTemplateConfig[] = [
  {
    id: "2-col-equal",
    label: "2 Equal Columns",
    iconName: "columns",
    generateHtml: () =>
      `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin: 1rem 0;"><div style="border: 1px dashed #d1d5db; padding: 1rem; rounded: 0.5rem;"><p>Left Column Content...</p></div><div style="border: 1px dashed #d1d5db; padding: 1rem; rounded: 0.5rem;"><p>Right Column Content...</p></div></div><p><br/></p>`,
  },
  {
    id: "3-col-equal",
    label: "3 Equal Columns",
    iconName: "grid",
    generateHtml: () =>
      `<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin: 1rem 0;"><div style="border: 1px dashed #d1d5db; padding: 0.75rem;"><p>Column 1...</p></div><div style="border: 1px dashed #d1d5db; padding: 0.75rem;"><p>Column 2...</p></div><div style="border: 1px dashed #d1d5db; padding: 0.75rem;"><p>Column 3...</p></div></div><p><br/></p>`,
  },
  {
    id: "sidebar-right",
    label: "Main Content + Sidebar",
    iconName: "layout",
    generateHtml: () =>
      `<div style="display: grid; grid-template-columns: 2.5fr 1fr; gap: 1.5rem; margin: 1rem 0;"><div style="border: 1px dashed #d1d5db; padding: 1rem;"><p>Main Narrative Body Text...</p></div><div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 1rem; border-radius: 0.375rem;"><p><strong>Sidebar Highlight</strong></p><p>Key takeaways or callouts go here.</p></div></div><p><br/></p>`,
  },
  {
    id: "callout-box",
    label: "Emphasis Callout Box",
    iconName: "sparkles",
    generateHtml: () =>
      `<div style="background-color: #fef3c7; border-left: 4px solid #b45309; border-radius: 0 0.5rem 0.5rem 0; padding: 1rem 1.25rem; margin: 1rem 0;"><p style="margin: 0; color: #92400e; font-weight: 500;"><strong>Important Note:</strong> Insert emphasized quote or crucial announcement details here.</p></div><p><br/></p>`,
  },
];

interface ToolbarButtonProps {
  onClick?: () => void;
  active?: boolean;
  title?: string;
  disabled?: boolean;
  children: React.ReactNode;
  as?: "button" | "span";
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, active, title, disabled, children, as = "button" }) => {
  const classes = `p-1.5 rounded transition-colors inline-flex items-center justify-center ${
    active ? "bg-ember text-cream" : "text-ink/70 hover:bg-paper hover:text-ink"
  } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`;

  if (as === "span") {
    return (
      <span className={classes} title={title}>
        {children}
      </span>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title} className={classes}>
      {children}
    </button>
  );
};

const ToolbarDivider = () => <div className="w-px h-5 bg-border mx-1 self-center" />;

const sanitizeHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, iframe, object, embed").forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.name.startsWith("on")) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  authorName = "",
  onAuthorChange,
  placeholder = "Start writing content here...",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const shapeFileInputRef = useRef<HTMLInputElement>(null);
  const frameFileInputRef = useRef<HTMLInputElement>(null);
  const standardFileInputRef = useRef<HTMLInputElement>(null);

  const [showHtmlView, setShowHtmlView] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState(value || "");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showFrameMenu, setShowFrameMenu] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  const [selectedShape, setSelectedShape] = useState<MaskShapeConfig>(MASK_SHAPES[0]);
  const [selectedFrame, setSelectedFrame] = useState<ImageTemplateConfig>(IMAGE_TEMPLATES[1]);
  const [frameCaption, setFrameCaption] = useState("Photo Caption");
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHasHeader, setTableHasHeader] = useState(true);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!showHtmlView && editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
    setHtmlDraft(value || "");
  }, [value, showHtmlView]);

  const updateActiveStates = useCallback(() => {
    try {
      setActiveStates({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        justifyFull: document.queryCommandState("justifyFull"),
      });
    } catch {
      // Fallback ignore state updates
    }
  }, []);

  const focusEditor = () => editorRef.current?.focus();

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command: string, arg?: string) => {
    focusEditor();
    document.execCommand(command, false, arg);
    handleInput();
    updateActiveStates();
  };

  const insertHtmlAtCaret = (html: string) => {
    focusEditor();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const el = document.createElement("div");
      el.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node;
      let lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      document.execCommand("insertHTML", false, html);
    }
    handleInput();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const looksLikeHtml = /^\s*<([a-z][a-z0-9]*)\b[^>]*>[\s\S]*<\/\1>/i.test(text.trim());

    if (looksLikeHtml) {
      insertHtmlAtCaret(sanitizeHtml(text));
    } else {
      exec("insertText", text);
    }
  };

  const handleImageUpload = async (
    file: File,
    options?: { shapeMask?: MaskShapeConfig; frameTemplate?: ImageTemplateConfig; caption?: string }
  ) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose a valid image file (PNG, JPG, WEBP).");
      return;
    }
    try {
      setUploadingImage(true);
      setUploadError(null);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `body/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from("insights-images")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage.from("insights-images").getPublicUrl(filePath);

      if (options?.shapeMask) {
        const shape = options.shapeMask;
        const maskedHtml = `<div class="shape-mask-wrapper" style="display: inline-block; margin: 0.75rem 0;"><img src="${data.publicUrl}" alt="Masked Image" style="clip-path: ${shape.clipPath}; -webkit-clip-path: ${shape.clipPath}; width: 260px; height: 260px; object-fit: cover; aspect-ratio: ${shape.aspectRatio || "1/1"}; display: block;" /></div>&nbsp;`;
        insertHtmlAtCaret(maskedHtml);
      } else if (options?.frameTemplate) {
        const frame = options.frameTemplate;
        const isPolaroid = frame.id === "polaroid";
        const captionText = options.caption || "";
        const framedHtml = `<div class="${frame.wrapperClass}" style="margin: 0.75rem 0;"><img src="${data.publicUrl}" alt="Framed Image" class="${frame.imageClass}" style="max-width: 320px;" />${
          isPolaroid ? `<span class="block text-center text-xs text-gray-600 mt-1">${captionText}</span>` : ""
        }</div>&nbsp;`;
        insertHtmlAtCaret(framedHtml);
      } else {
        exec("insertImage", data.publicUrl);
      }
    } catch (err: any) {
      setUploadError(err.message || "Image upload failed. Please check network/Supabase config.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInsertTable = () => {
    let tableHtml = `<table class="rte-custom-table" style="width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem;"><tbody>`;
    for (let r = 0; r < tableRows; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < tableCols; c++) {
        const isHeader = r === 0 && tableHasHeader;
        const Tag = isHeader ? "th" : "td";
        const headerStyles = "background-color: #f3f4f6; font-weight: 600; text-align: left;";
        const baseStyles = "border: 1px solid #d1d5db; padding: 10px 12px; min-width: 60px;";
        tableHtml += `<${Tag} style="${baseStyles} ${isHeader ? headerStyles : ""}">${
          isHeader ? `Header ${c + 1}` : `Data ${r},${c + 1}`
        }</${Tag}>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br/></p>`;
    insertHtmlAtCaret(tableHtml);
    setShowTableMenu(false);
  };

  const handleInsertLayout = (template: LayoutTemplateConfig) => {
    insertHtmlAtCaret(template.generateHtml());
    setShowLayoutMenu(false);
  };

  const closeAllMenus = () => {
    setShowTextColor(false);
    setShowHighlight(false);
    setShowShapeMenu(false);
    setShowTableMenu(false);
    setShowFrameMenu(false);
    setShowLayoutMenu(false);
  };

  const toggleHtmlView = () => {
    if (!showHtmlView) {
      setHtmlDraft(editorRef.current?.innerHTML || value || "");
      setShowHtmlView(true);
    } else {
      onChange(htmlDraft);
      setShowHtmlView(false);
    }
  };

  return (
    <div className="border border-border rounded bg-paper overflow-visible flex flex-col">
      {/* Author Input Section */}
      {onAuthorChange !== undefined && (
        <div className="flex items-center gap-2 px-3 py-2 bg-snow border-b border-border text-xs">
          <User size={14} className="text-ink/60" />
          <span className="font-medium text-ink/70">Author Name:</span>
          <input
            type="text"
            value={authorName}
            onChange={(e) => onAuthorChange(e.target.value)}
            placeholder="Type author attribution name..."
            className="flex-1 bg-paper border border-border rounded px-2.5 py-1 text-ink focus:outline-none focus:border-ember transition-colors"
          />
        </div>
      )}

      {/* Editor Main Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-snow select-none">
        <select
          onChange={(e) => exec("formatBlock", e.target.value)}
          defaultValue="P"
          disabled={showHtmlView}
          className="text-xs font-body border border-border rounded px-2 py-1.5 bg-paper text-ink mr-1 disabled:opacity-50 focus:outline-none"
        >
          {HEADING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <ToolbarDivider />

        <ToolbarButton active={activeStates.bold} onClick={() => exec("bold")} title="Bold" disabled={showHtmlView}>
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton active={activeStates.italic} onClick={() => exec("italic")} title="Italic" disabled={showHtmlView}>
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton active={activeStates.underline} onClick={() => exec("underline")} title="Underline" disabled={showHtmlView}>
          <Underline size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text Color Picker */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              const next = !showTextColor;
              closeAllMenus();
              setShowTextColor(next);
            }}
            title="Text Color"
            disabled={showHtmlView}
          >
            <Palette size={15} />
          </ToolbarButton>
          {showTextColor && (
            <div className="absolute z-30 top-9 left-0 bg-snow border border-border rounded shadow-xl p-2.5 flex gap-1.5 flex-wrap w-[180px]">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    exec("foreColor", color);
                    setShowTextColor(false);
                  }}
                  className="w-6 h-6 rounded border border-border hover:scale-105 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Highlight Color Picker */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              const next = !showHighlight;
              closeAllMenus();
              setShowHighlight(next);
            }}
            title="Highlight Color"
            disabled={showHtmlView}
          >
            <Highlighter size={15} />
          </ToolbarButton>
          {showHighlight && (
            <div className="absolute z-30 top-9 left-0 bg-snow border border-border rounded shadow-xl p-2.5 flex gap-1.5 flex-wrap w-[180px]">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    exec("hiliteColor", color);
                    setShowHighlight(false);
                  }}
                  className="w-6 h-6 rounded border border-border hover:scale-105 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        <ToolbarDivider />

        {/* Layout Templates Submenu */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              const next = !showLayoutMenu;
              closeAllMenus();
              setShowLayoutMenu(next);
            }}
            title="Layout & Grid Templates"
            disabled={showHtmlView}
          >
            <Columns size={15} />
          </ToolbarButton>
          {showLayoutMenu && (
            <div className="absolute z-30 top-9 left-0 bg-snow border border-border rounded shadow-xl p-3 flex flex-col gap-2.5 w-64 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-1.5 font-medium text-ink">
                <span className="flex items-center gap-1.5"><Columns size={14} /> Layout Grid Templates</span>
                <X size={14} className="cursor-pointer text-ink/50 hover:text-ink" onClick={() => setShowLayoutMenu(false)} />
              </div>
              <div className="flex flex-col gap-1.5">
                {LAYOUT_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleInsertLayout(tpl)}
                    className="flex items-center gap-2 p-2 rounded hover:bg-paper border border-transparent hover:border-border text-left transition-colors"
                  >
                    <Sparkles size={14} className="text-ember shrink-0" />
                    <span>{tpl.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table Builder Menu */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              const next = !showTableMenu;
              closeAllMenus();
              setShowTableMenu(next);
            }}
            title="Insert Custom Table"
            disabled={showHtmlView}
          >
            <TableIcon size={15} />
          </ToolbarButton>
          {showTableMenu && (
            <div className="absolute z-30 top-9 left-0 bg-snow border border-border rounded shadow-xl p-3 flex flex-col gap-3 w-56 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-1.5 font-medium text-ink">
                <span className="flex items-center gap-1.5"><LayoutGrid size={14} /> Table Builder</span>
                <X size={14} className="cursor-pointer text-ink/50 hover:text-ink" onClick={() => setShowTableMenu(false)} />
              </div>
              <div className="flex justify-between items-center">
                <span>Rows:</span>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={tableRows}
                  onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 border border-border rounded p-1 text-center bg-paper"
                />
              </div>
              <div className="flex justify-between items-center">
                <span>Columns:</span>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={tableCols}
                  onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 border border-border rounded p-1 text-center bg-paper"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={tableHasHeader}
                  onChange={(e) => setTableHasHeader(e.target.checked)}
                  className="rounded border-border text-ember"
                />
                <span>Include Header Row</span>
              </label>
              <button
                type="button"
                onClick={handleInsertTable}
                className="w-full bg-ember text-cream py-1.5 rounded font-medium hover:opacity-90 flex items-center justify-center gap-1"
              >
                <Plus size={14} /> Insert Table
              </button>
            </div>
          )}
        </div>

        {/* Image Frame Styling Menu */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              const next = !showFrameMenu;
              closeAllMenus();
              setShowFrameMenu(next);
            }}
            title="Image Framing Templates"
            disabled={showHtmlView}
          >
            <Frame size={15} />
          </ToolbarButton>
          {showFrameMenu && (
            <div className="absolute z-30 top-9 left-0 bg-snow border border-border rounded shadow-xl p-3 flex flex-col gap-3 w-64 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-1.5 font-medium text-ink">
                <span className="flex items-center gap-1.5"><Frame size={14} /> Framing Styles</span>
                <X size={14} className="cursor-pointer text-ink/50 hover:text-ink" onClick={() => setShowFrameMenu(false)} />
              </div>
              <select
                value={selectedFrame.id}
                onChange={(e) => {
                  const found = IMAGE_TEMPLATES.find((t) => t.id === e.target.value);
                  if (found) setSelectedFrame(found);
                }}
                className="border border-border bg-paper rounded p-1.5 text-xs text-ink"
              >
                {IMAGE_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.label}
                  </option>
                ))}
              </select>

              {selectedFrame.id === "polaroid" && (
                <input
                  type="text"
                  value={frameCaption}
                  onChange={(e) => setFrameCaption(e.target.value)}
                  placeholder="Polaroid Caption..."
                  className="border border-border bg-paper rounded px-2 py-1 text-xs"
                />
              )}

              <button
                type="button"
                onClick={() => frameFileInputRef.current?.click()}
                className="w-full bg-ember text-cream py-1.5 rounded font-medium hover:opacity-90 flex items-center justify-center gap-1.5"
              >
                <UploadCloud size={14} /> Upload Framed Image
              </button>
              <input
                ref={frameFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUpload(e.target.files[0], {
                      frameTemplate: selectedFrame,
                      caption: frameCaption,
                    });
                    setShowFrameMenu(false);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Image Shape Masking Menu */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              const next = !showShapeMenu;
              closeAllMenus();
              setShowShapeMenu(next);
            }}
            title="Upload Image to Shape Mask"
            disabled={showHtmlView}
          >
            <Shapes size={15} />
          </ToolbarButton>
          {showShapeMenu && (
            <div className="absolute z-30 top-9 left-0 bg-snow border border-border rounded shadow-xl p-3 flex flex-col gap-3 w-60 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-1.5 font-medium text-ink">
                <span className="flex items-center gap-1.5"><Shapes size={14} /> Shape Mask</span>
                <X size={14} className="cursor-pointer text-ink/50 hover:text-ink" onClick={() => setShowShapeMenu(false)} />
              </div>
              <select
                value={selectedShape.id}
                onChange={(e) => {
                  const found = MASK_SHAPES.find((s) => s.id === e.target.value);
                  if (found) setSelectedShape(found);
                }}
                className="border border-border bg-paper rounded p-1.5 text-xs text-ink focus:outline-none"
              >
                {MASK_SHAPES.map((shape) => (
                  <option key={shape.id} value={shape.id}>
                    {shape.label}
                  </option>
                ))}
              </select>

              <div className="flex flex-col items-center justify-center p-3 bg-paper border border-dashed border-border rounded">
                <div
                  className="w-16 h-16 bg-ember/80 flex items-center justify-center text-[10px] text-cream font-medium"
                  style={{
                    clipPath: selectedShape.clipPath,
                    WebkitClipPath: selectedShape.clipPath,
                  }}
                >
                  Preview
                </div>
              </div>

              <button
                type="button"
                onClick={() => shapeFileInputRef.current?.click()}
                className="w-full bg-ember text-cream py-1.5 rounded font-medium hover:opacity-90 flex items-center justify-center gap-1.5"
              >
                <UploadCloud size={14} /> Choose Image...
              </button>
              <input
                ref={shapeFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUpload(e.target.files[0], { shapeMask: selectedShape });
                    setShowShapeMenu(false);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          )}
        </div>

        <ToolbarDivider />

        <ToolbarButton onClick={() => exec("insertUnorderedList")} title="Bullet List" disabled={showHtmlView}>
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertOrderedList")} title="Numbered List" disabled={showHtmlView}>
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("formatBlock", "BLOCKQUOTE")} title="Quote Block" disabled={showHtmlView}>
          <Quote size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => exec("justifyLeft")} title="Align Left" disabled={showHtmlView}>
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("justifyCenter")} title="Align Center" disabled={showHtmlView}>
          <AlignCenter size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <label className="relative">
          <ToolbarButton as="span" title="Upload Standard Image" disabled={uploadingImage || showHtmlView}>
            {uploadingImage ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
          </ToolbarButton>
          <input
            ref={standardFileInputRef}
            type="file"
            accept="image/*"
            disabled={showHtmlView}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImageUpload(e.target.files[0]);
                e.target.value = "";
              }
            }}
          />
        </label>

        <ToolbarButton onClick={() => exec("undo")} title="Undo" disabled={showHtmlView}>
          <Undo2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("redo")} title="Redo" disabled={showHtmlView}>
          <Redo2 size={15} />
        </ToolbarButton>

        <div className="flex-1" />

        <ToolbarButton active={showHtmlView} onClick={toggleHtmlView} title="Toggle HTML Raw View">
          <Code2 size={15} />
        </ToolbarButton>
      </div>

      {uploadError && (
        <div className="px-3 py-2 text-xs text-red-600 bg-red-50 border-b border-border flex items-center justify-between">
          <span>{uploadError}</span>
          <X size={12} className="cursor-pointer" onClick={() => setUploadError(null)} />
        </div>
      )}

      {/* Editor Body Surface */}
      {showHtmlView ? (
        <textarea
          value={htmlDraft}
          onChange={(e) => {
            setHtmlDraft(e.target.value);
            onChange(e.target.value);
          }}
          rows={14}
          className="w-full p-3 font-mono text-xs text-ink bg-paper focus:outline-none resize-y min-h-[260px]"
          placeholder="<p>Write raw HTML here...</p>"
        />
      ) : (
        <div className="relative flex-1">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onPaste={handlePaste}
            onKeyUp={updateActiveStates}
            onMouseUp={updateActiveStates}
            data-placeholder={placeholder}
            className="rte-content min-h-[280px] max-h-[560px] overflow-y-auto p-4 text-sm text-ink focus:outline-none"
          />
        </div>
      )}

      {/* CSS Styles for Editor Content Elements */}
      <style>{`
        .rte-content:empty:before { content: attr(data-placeholder); color: rgba(0,0,0,0.35); pointer-events: none; }
        .rte-content h1 { font-size: 1.5rem; font-weight: 700; margin: 0.85rem 0 0.5rem; }
        .rte-content h2 { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.5rem; }
        .rte-content p { margin: 0 0 0.65rem; line-height: 1.5; }
        .rte-content blockquote { border-left: 3px solid #b45309; padding-left: 0.9rem; margin: 0.75rem 0; font-style: italic; }
        .rte-content img { max-width: 100%; display: inline-block; }
        .rte-content table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .rte-content th, .rte-content td { border: 1px solid #d1d5db; padding: 8px 12px; }
        .rte-content th { background-color: #f3f4f6; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;