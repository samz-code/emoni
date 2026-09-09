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
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const HEADING_OPTIONS: { label: string; value: string }[] = [
  { label: "Paragraph", value: "P" },
  { label: "Heading 1", value: "H1" },
  { label: "Heading 2", value: "H2" },
  { label: "Heading 3", value: "H3" },
];

const TEXT_COLORS = ["#1a1a1a", "#4b5563", "#b45309", "#b91c1c", "#166534", "#1d4ed8", "#7c3aed", "#ffffff"];
const HIGHLIGHT_COLORS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#fed7aa"];

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

// Strip scripts, styles, and inline event handlers from pasted HTML before it's inserted.
// This is a paste-time safety net, not a substitute for sanitizing on the server/render side.
const sanitizeHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, iframe, object, embed").forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (attr.name.startsWith("on") || attr.name === "style") {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showHtmlView, setShowHtmlView] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState(value || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});

  // Sync incoming value (e.g. switching between edit/create) into the editable div
  useEffect(() => {
    if (!showHtmlView && editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
    setHtmlDraft(value || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

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
      // execCommand/queryCommandState unsupported in this browser — toolbar still works, just no active highlighting
    }
  }, []);

  const focusEditor = () => editorRef.current?.focus();

  // Positions the text cursor at the exact point a file was dropped, so the
  // image lands where the user dropped it instead of wherever focus last was.
  const placeCaretAtPoint = (x: number, y: number) => {
    const anyDoc = document as any;
    let range: Range | null = null;
    if (typeof anyDoc.caretRangeFromPoint === "function") {
      range = anyDoc.caretRangeFromPoint(x, y);
    } else if (typeof anyDoc.caretPositionFromPoint === "function") {
      const pos = anyDoc.caretPositionFromPoint(x, y);
      if (pos) {
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse(true);
      }
    }
    if (range) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const exec = (command: string, arg?: string) => {
    focusEditor();
    document.execCommand(command, false, arg);
    handleInput();
    updateActiveStates();
  };

  // Word/Google Docs paste drags in messy inline styles -> strip to plain text.
  // But if the clipboard's plain text is itself HTML markup (e.g. someone pasting
  // <p>...</p> source straight from a doc or from Claude), render it as real HTML
  // instead of dumping the tags as literal text.
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const looksLikeHtml = /^\s*<([a-z][a-z0-9]*)\b[^>]*>[\s\S]*<\/\1>/i.test(text.trim());

    if (looksLikeHtml) {
      document.execCommand("insertHTML", false, sanitizeHtml(text));
    } else {
      document.execCommand("insertText", false, text);
    }
    handleInput();
  };

  const handleHeading = (tag: string) => exec("formatBlock", tag);

  const handleLink = () => {
    const url = window.prompt("Link URL (https://...)");
    if (!url) return;
    exec("createLink", url);
  };

  const handleUnlink = () => exec("unlink");

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file (PNG, JPG, WEBP).");
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
      exec("insertImage", data.publicUrl);
    } catch (err: any) {
      setUploadError(err.message || "Image upload to Supabase storage failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInsertImageUrl = () => {
    const url = window.prompt("Image URL");
    if (!url) return;
    exec("insertImage", url);
  };

  const handleEditorDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (showHtmlView) return;
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      setIsDraggingImage(true);
    }
  };

  const handleEditorDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingImage(false);
  };

  const handleEditorDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (showHtmlView) return;
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    focusEditor();
    placeCaretAtPoint(e.clientX, e.clientY);
    await handleImageFile(file);
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
    <div className="border border-border rounded bg-paper overflow-visible">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-snow">
        <select
          onChange={(e) => handleHeading(e.target.value)}
          defaultValue="P"
          disabled={showHtmlView}
          className="text-xs font-body border border-border rounded px-1.5 py-1.5 bg-paper text-ink mr-1 disabled:opacity-50"
          title="Block style"
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
        <ToolbarButton active={activeStates.strikeThrough} onClick={() => exec("strikeThrough")} title="Strikethrough" disabled={showHtmlView}>
          <Strikethrough size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <div className="relative">
          <ToolbarButton
            onClick={() => {
              setShowTextColor((p) => !p);
              setShowHighlight(false);
            }}
            title="Text color"
            disabled={showHtmlView}
          >
            <Palette size={15} />
          </ToolbarButton>
          {showTextColor && (
            <div className="absolute z-20 top-9 left-0 bg-snow border border-border rounded shadow-lg p-2 flex gap-1.5 flex-wrap w-[168px]">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    exec("foreColor", color);
                    setShowTextColor(false);
                  }}
                  className="w-6 h-6 rounded border border-border"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <label className="w-6 h-6 rounded border border-border flex items-center justify-center cursor-pointer text-[10px] text-ink/60" title="Custom color">
                +
                <input
                  type="color"
                  className="hidden"
                  onChange={(e) => {
                    exec("foreColor", e.target.value);
                    setShowTextColor(false);
                  }}
                />
              </label>
            </div>
          )}
        </div>

        <div className="relative">
          <ToolbarButton
            onClick={() => {
              setShowHighlight((p) => !p);
              setShowTextColor(false);
            }}
            title="Highlight"
            disabled={showHtmlView}
          >
            <Highlighter size={15} />
          </ToolbarButton>
          {showHighlight && (
            <div className="absolute z-20 top-9 left-0 bg-snow border border-border rounded shadow-lg p-2 flex gap-1.5 flex-wrap w-[168px]">
              <button
                type="button"
                onClick={() => {
                  exec("hiliteColor", "transparent");
                  setShowHighlight(false);
                }}
                className="w-6 h-6 rounded border border-border bg-white flex items-center justify-center"
                title="Remove highlight"
              >
                <X size={12} className="text-ink/40" />
              </button>
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    exec("hiliteColor", color);
                    setShowHighlight(false);
                  }}
                  className="w-6 h-6 rounded border border-border"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        <ToolbarDivider />

        <ToolbarButton onClick={handleLink} title="Insert link" disabled={showHtmlView}>
          <Link2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={handleUnlink} title="Remove link" disabled={showHtmlView}>
          <Unlink size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton active={activeStates.insertUnorderedList} onClick={() => exec("insertUnorderedList")} title="Bullet list" disabled={showHtmlView}>
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton active={activeStates.insertOrderedList} onClick={() => exec("insertOrderedList")} title="Numbered list" disabled={showHtmlView}>
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("formatBlock", "BLOCKQUOTE")} title="Quote" disabled={showHtmlView}>
          <Quote size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton active={activeStates.justifyLeft} onClick={() => exec("justifyLeft")} title="Align left" disabled={showHtmlView}>
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton active={activeStates.justifyCenter} onClick={() => exec("justifyCenter")} title="Align center" disabled={showHtmlView}>
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton active={activeStates.justifyRight} onClick={() => exec("justifyRight")} title="Align right" disabled={showHtmlView}>
          <AlignRight size={15} />
        </ToolbarButton>
        <ToolbarButton active={activeStates.justifyFull} onClick={() => exec("justifyFull")} title="Justify" disabled={showHtmlView}>
          <AlignJustify size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={handleInsertImageUrl} title="Insert image from URL" disabled={showHtmlView}>
          <ImageIcon size={15} />
        </ToolbarButton>
        <label className="relative">
          <ToolbarButton as="span" title="Upload image to Supabase" disabled={uploadingImage || showHtmlView}>
            {uploadingImage ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
          </ToolbarButton>
          <input
            type="file"
            accept="image/*"
            disabled={showHtmlView}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImageFile(e.target.files[0]);
                e.target.value = "";
              }
            }}
          />
        </label>

        <ToolbarDivider />

        <ToolbarButton onClick={() => exec("undo")} title="Undo" disabled={showHtmlView}>
          <Undo2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("redo")} title="Redo" disabled={showHtmlView}>
          <Redo2 size={15} />
        </ToolbarButton>

        <div className="flex-1" />

        <ToolbarButton active={showHtmlView} onClick={toggleHtmlView} title="View/edit raw HTML">
          <Code2 size={15} />
        </ToolbarButton>
      </div>

      {uploadError && (
        <div className="px-3 py-2 text-xs font-body text-red-600 bg-red-50 border-b border-border">{uploadError}</div>
      )}

      {showHtmlView ? (
        <textarea
          value={htmlDraft}
          onChange={(e) => setHtmlDraft(e.target.value)}
          rows={12}
          className="w-full p-3 font-mono text-xs text-ink bg-paper focus:outline-none resize-y"
          placeholder="<p>HTML source...</p>"
        />
      ) : (
        <div
          className="relative"
          onDragOver={handleEditorDragOver}
          onDragLeave={handleEditorDragLeave}
          onDrop={handleEditorDrop}
        >
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onPaste={handlePaste}
            onKeyUp={updateActiveStates}
            onMouseUp={updateActiveStates}
            onFocus={updateActiveStates}
            data-placeholder={placeholder}
            className="rte-content min-h-[240px] max-h-[480px] overflow-y-auto p-3 text-sm text-ink focus:outline-none"
          />

          {(isDraggingImage || uploadingImage) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-paper/95 border-2 border-dashed border-ember rounded pointer-events-none">
              {uploadingImage ? (
                <>
                  <Loader2 size={22} className="animate-spin text-ember" />
                  <span className="text-xs font-body text-ink/70">Uploading to Supabase storage...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={22} className="text-ember" />
                  <span className="text-xs font-body text-ink/70">Drop image to insert here</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        .rte-content:empty:before {
          content: attr(data-placeholder);
          color: rgba(0,0,0,0.35);
          pointer-events: none;
        }
        .rte-content h1 { font-size: 1.5rem; font-weight: 700; margin: 0.75rem 0 0.5rem; line-height: 1.25; }
        .rte-content h2 { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.5rem; line-height: 1.3; }
        .rte-content h3 { font-size: 1.05rem; font-weight: 600; margin: 0.6rem 0 0.4rem; }
        .rte-content p { margin: 0 0 0.6rem; }
        .rte-content ul { list-style: disc; padding-left: 1.4rem; margin: 0 0 0.6rem; }
        .rte-content ol { list-style: decimal; padding-left: 1.4rem; margin: 0 0 0.6rem; }
        .rte-content li { margin: 0.15rem 0; }
        .rte-content a { color: #b45309; text-decoration: underline; }
        .rte-content blockquote {
          border-left: 3px solid #b45309;
          padding: 0.25rem 0 0.25rem 0.9rem;
          margin: 0.6rem 0;
          color: rgba(0,0,0,0.65);
          font-style: italic;
        }
        .rte-content img { max-width: 100%; border-radius: 0.375rem; margin: 0.6rem 0; display: block; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;