interface RoutineJournalEditorProps {
  value: string;
  maxLength: number;
  isSaving: boolean;
  errorMessage?: string;
  onChange: (nextValue: string) => void;
  onBlur: () => void;
}

export function RoutineJournalEditor({
  value,
  maxLength,
  isSaving,
  errorMessage,
  onChange,
  onBlur,
}: RoutineJournalEditorProps) {
  const remaining = maxLength - value.length;

  return (
    <section className="space-y-3 rounded-3xl bg-white/80 p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink/90">Journal</h2>
        <p className="text-xs text-ink/55" aria-live="polite">
          {value.length}/{maxLength}
        </p>
      </div>
      <textarea
        aria-label="Daily journal entry"
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value.slice(0, maxLength))}
        onBlur={onBlur}
        rows={6}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink/90 outline-none"
        placeholder="Write an optional note for this day..."
      />
      <div className="flex items-center justify-between gap-3 text-xs">
        <p className="text-ink/55" aria-live="polite">
          {isSaving ? 'Saving...' : 'Saved locally to this device'}
        </p>
        <p className={remaining === 0 ? 'text-red-600' : 'text-ink/55'}>{remaining} remaining</p>
      </div>
      {errorMessage ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
