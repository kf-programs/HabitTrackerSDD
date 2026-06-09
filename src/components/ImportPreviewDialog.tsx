interface ImportPreviewDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  categoryCount: number;
  habitCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  errorMessage?: string;
}

export function ImportPreviewDialog({
  isOpen,
  title,
  description,
  categoryCount,
  habitCount,
  onConfirm,
  onCancel,
  errorMessage,
}: ImportPreviewDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-ink/50">Import preview</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-2 text-sm text-ink/70">{description}</p> : null}

        <div className="mt-4 rounded-2xl bg-paper p-4 text-sm text-ink/80">
          <p>Categories: {categoryCount}</p>
          <p>Habits: {habitCount}</p>
        </div>

        {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full bg-black/5 px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper"
          >
            Import routine
          </button>
        </div>
      </div>
    </div>
  );
}
