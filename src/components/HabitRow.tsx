import { useState } from 'react';
import type { HabitTimeframe, HabitTrackingType } from '../db/schema';

interface HabitRowProps {
  habitId: string;
  title: string;
  trackingType: HabitTrackingType;
  timeframe: HabitTimeframe;
  initialBoolean?: boolean;
  initialInteger?: number;
  initialText?: string;
  onSave: (habitId: string, value: boolean | number | string) => Promise<void>;
  onRenameHabit?: (habitId: string, title: string) => Promise<void>;
}

export function HabitRow({
  habitId,
  title,
  trackingType,
  timeframe,
  initialBoolean,
  initialInteger,
  initialText,
  onSave,
  onRenameHabit,
}: HabitRowProps) {
  const [habitTitle, setHabitTitle] = useState(title);
  const [titleDraft, setTitleDraft] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [count, setCount] = useState(initialInteger ?? 0);
  const [value, setValue] = useState(initialText ?? '');
  const [completed, setCompleted] = useState(initialBoolean ?? false);
  const [isEditing, setIsEditing] = useState(true);
  const [error, setError] = useState('');

  async function saveTitle() {
    const nextTitle = titleDraft.trim();
    if (!nextTitle) {
      setIsEditingTitle(false);
      setTitleDraft(habitTitle);
      return;
    }

    try {
      setError('');
      if (onRenameHabit) {
        await onRenameHabit(habitId, nextTitle);
      }
      setHabitTitle(nextTitle);
      setIsEditingTitle(false);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Unable to save right now. Please retry.';
      setError(message);
    }
  }

  async function saveValue(nextValue: boolean | number | string) {
    try {
      setError('');
      await onSave(habitId, nextValue);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Unable to save right now. Please retry.';
      setError(message);
    }
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-paper px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                aria-label="Edit habit title"
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm outline-none"
              />
              <button type="button" onClick={saveTitle} className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper">
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitleDraft(habitTitle);
                  setIsEditingTitle(false);
                }}
                className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className={`font-medium ${completed ? 'line-through opacity-70' : ''}`}>{habitTitle}</p>
              {onRenameHabit ? (
                <button type="button" onClick={() => setIsEditingTitle(true)} className="rounded-full bg-black/5 px-2 py-1 text-xs font-medium">
                  Edit
                </button>
              ) : null}
            </div>
          )}
          <p className="text-xs uppercase tracking-[0.25em] text-ink/40">
            {timeframe} • {trackingType}
          </p>
        </div>

        {trackingType === 'yesno' ? (
          <button
            type="button"
            onClick={async () => {
              if (timeframe === 'weekly' && completed) {
                return;
              }

              const next = !completed;
              setCompleted(next);
              await saveValue(next);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium ${completed ? 'bg-sage' : 'bg-white'}`}
          >
            {completed ? (timeframe === 'weekly' ? 'Done this week' : 'Done') : 'Mark complete'}
          </button>
        ) : null}

        {trackingType === 'counter' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                const next = Math.max(0, count - 1);
                setCount(next);
                await saveValue(next);
              }}
              className="rounded-full bg-white px-3 py-2 text-sm"
            >
              −
            </button>
            <span className="min-w-8 text-center font-semibold">{count}</span>
            <button
              type="button"
              onClick={async () => {
                const next = count + 1;
                setCount(next);
                await saveValue(next);
              }}
              className="rounded-full bg-white px-3 py-2 text-sm"
            >
              +
            </button>
          </div>
        ) : null}

        {trackingType === 'measurement' ? (
          isEditing ? (
            <input
              aria-label={title}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onBlur={async () => {
                setIsEditing(false);
                await saveValue(value);
              }}
              className="w-full rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none sm:max-w-xs"
              placeholder="Add a note or value"
            />
          ) : (
            <button type="button" onClick={() => setIsEditing(true)} className="text-sm font-medium underline-offset-4 hover:underline">
              {value || 'Add value'} ✎
            </button>
          )
        ) : null}
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
