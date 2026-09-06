import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                danger ? "bg-rose-50" : "bg-slate-100"
              }`}
            >
              <AlertTriangle
                size={18}
                className={danger ? "text-rose-600" : "text-slate-600"}
              />
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 -m-1"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <h3 className="font-bold text-slate-900 text-base mt-4">{title}</h3>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center gap-3 px-5 sm:px-6 pb-5 sm:pb-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold text-sm rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 font-semibold text-sm rounded-md transition-colors cursor-pointer disabled:opacity-50 ${
              danger
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-black text-white hover:bg-slate-800"
            }`}
          >
            {isLoading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}