import { type ReactNode, useState } from 'react';
import type { HabitTimeframe, HabitTrackingType } from '../db/schema';

interface NewHabitInput {
  title: string;
  timeframe: HabitTimeframe;
  trackingType: HabitTrackingType;
}

interface CategoryAccordionProps {
  categoryId: string;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  onRenameCategory?: (categoryId: string, input: { name: string; description?: string }) => Promise<void>;
  onCreateHabit?: (categoryId: string, input: NewHabitInput) => Promise<void>;
}

export function CategoryAccordion({
  categoryId,
  title,
  description,
  defaultOpen = false,
  children,
  onRenameCategory,
  onCreateHabit,
}: CategoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [nextTitle, setNextTitle] = useState(title);
  const [nextDescription, setNextDescription] = useState(description ?? '');
  const [isCreatingHabit, setIsCreatingHabit] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitTimeframe, setNewHabitTimeframe] = useState<HabitTimeframe>('daily');
  const [newHabitTrackingType, setNewHabitTrackingType] = useState<HabitTrackingType>('yesno');

  async function saveCategoryTitle() {
    const trimmed = nextTitle.trim();
    if (!trimmed || !onRenameCategory) {
      setIsEditingTitle(false);
      return;
    }

    await onRenameCategory(categoryId, {
      name: trimmed,
      description: nextDescription.trim() || undefined,
    });
    setIsEditingTitle(false);
  }

  async function createNewHabit() {
    const trimmed = newHabitTitle.trim();
    if (!trimmed || !onCreateHabit) return;

    await onCreateHabit(categoryId, {
      title: trimmed,
      timeframe: newHabitTimeframe,
      trackingType: newHabitTrackingType,
    });

    setNewHabitTitle('');
    setNewHabitTimeframe('daily');
    setNewHabitTrackingType('yesno');
    setIsCreatingHabit(false);
  }

  return (
    <article className="overflow-hidden rounded-3xl bg-white/80 shadow-soft">
      <div className="flex w-full items-center justify-between px-5 py-4 text-left">
        {isEditingTitle ? (
          <div className="w-full space-y-2">
            <input
              aria-label="Category title"
              value={nextTitle}
              onChange={(event) => setNextTitle(event.target.value)}
              className="w-full rounded-full border border-black/10 bg-white px-3 py-2 text-sm outline-none"
            />
            <textarea
              aria-label="Category description"
              value={nextDescription}
              onChange={(event) => setNextDescription(event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none"
              rows={2}
              placeholder="Add a short category description"
            />
            <div className="flex items-center gap-2">
              <button type="button" onClick={saveCategoryTitle} className="rounded-full bg-ink px-3 py-2 text-xs font-medium text-paper">
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setNextTitle(title);
                  setNextDescription(description ?? '');
                  setIsEditingTitle(false);
                }}
                className="rounded-full bg-black/5 px-3 py-2 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <button type="button" className="flex flex-1 items-center justify-between" onClick={() => setIsOpen((value) => !value)}>
              <span>
                <span className="block text-base font-semibold">{title}</span>
                {description ? <span className="mt-1 block text-xs text-ink/60">{description}</span> : null}
              </span>
              <span className="text-lg text-ink/45">{isOpen ? '−' : '+'}</span>
            </button>
            {onRenameCategory ? (
              <button
                type="button"
                onClick={() => {
                  setNextTitle(title);
                  setNextDescription(description ?? '');
                  setIsEditingTitle(true);
                }}
                className="ml-3 rounded-full bg-black/5 px-3 py-1 text-xs font-medium"
              >
                Edit
              </button>
            ) : null}
          </>
        )}
      </div>
      {isOpen ? (
        <div className="space-y-3 px-5 pb-5">
          {children}
          {isCreatingHabit ? (
            <div className="space-y-2 rounded-2xl border border-black/10 bg-white p-3">
              <input
                aria-label="Habit title"
                value={newHabitTitle}
                onChange={(event) => setNewHabitTitle(event.target.value)}
                className="w-full rounded-full border border-black/10 px-3 py-2 text-sm outline-none"
                placeholder="New habit title"
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <select
                  aria-label="Habit timeframe"
                  value={newHabitTimeframe}
                  onChange={(event) => setNewHabitTimeframe(event.target.value as HabitTimeframe)}
                  className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <select
                  aria-label="Habit tracking type"
                  value={newHabitTrackingType}
                  onChange={(event) => setNewHabitTrackingType(event.target.value as HabitTrackingType)}
                  className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm"
                >
                  <option value="yesno">Yes / No</option>
                  <option value="counter">Counter</option>
                  <option value="measurement">Measurement</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={createNewHabit} className="rounded-full bg-ink px-3 py-2 text-xs font-medium text-paper">
                  Add habit
                </button>
                <button type="button" onClick={() => setIsCreatingHabit(false)} className="rounded-full bg-black/5 px-3 py-2 text-xs font-medium">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setIsCreatingHabit(true)} className="rounded-full bg-black/5 px-3 py-2 text-xs font-medium">
              Add habit
            </button>
          )}
        </div>
      ) : null}
    </article>
  );
}
