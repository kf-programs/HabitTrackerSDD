import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { CategoryAccordion } from './CategoryAccordion';
import { ParallelTimelines } from './ParallelTimelines';
import { HabitRow } from './HabitRow';
import { getRoutineById, updateRoutine, deleteRoutine } from '../repositories/routinesRepository';
import { listCategoriesForRoutine, updateCategory } from '../repositories/categoriesRepository';
import { listHabitsForRoutine, createHabit, updateHabit } from '../repositories/habitsRepository';
import { db } from '../db/client';
import { getPeriodKeyForHabit } from '../services/timelineService';
import { upsertEntry } from '../repositories/entriesRepository';
import type { HabitRecord, HabitTimeframe, HabitTrackingType } from '../db/schema';

export function RoutineWorkspace() {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const routine = useLiveQuery(async () => {
    if (!routineId) return undefined;
    return getRoutineById(routineId);
  }, [routineId]);

  const categories = useLiveQuery(async () => {
    if (!routineId) return [];
    return listCategoriesForRoutine(routineId);
  }, [routineId], []);

  const habits = useLiveQuery(async () => {
    if (!routineId) return [];
    return listHabitsForRoutine(routineId);
  }, [routineId], []);

  const entries = useLiveQuery(async () => db.entries.toArray(), [], []);

  const habitsByCategory = useMemo(() => {
    return habits.reduce<Record<string, HabitRecord[]>>((acc, habit) => {
      const list = acc[habit.categoryId] ?? [];
      list.push(habit);
      acc[habit.categoryId] = list;
      return acc;
    }, {});
  }, [habits]);

  const entryMap = useMemo(() => {
    const map = new Map<string, typeof entries[number]>();
    entries.forEach((entry) => {
      map.set(`${entry.habitId}:${entry.periodKey}`, entry);
    });
    return map;
  }, [entries]);

  async function handleSaveHabitValue(habit: HabitRecord, value: boolean | number | string) {
    const periodKey = getPeriodKeyForHabit(habit, new Date());
    await upsertEntry({
      habitId: habit.id,
      timeframe: habit.timeframe,
      periodKey,
      valueType: typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'integer' : 'string',
      boolValue: typeof value === 'boolean' ? value : undefined,
      intValue: typeof value === 'number' ? value : undefined,
      textValue: typeof value === 'string' ? value : undefined,
      source: 'user',
    });
  }

  async function handleRenameCategory(categoryId: string, name: string) {
    await updateCategory(categoryId, { name });
  }

  async function handleCreateHabit(categoryId: string, input: { title: string; timeframe: HabitTimeframe; trackingType: HabitTrackingType }) {
    if (!routineId) return;

    await createHabit({
      routineId,
      categoryId,
      title: input.title,
      timeframe: input.timeframe,
      trackingType: input.trackingType,
      measurementUnit: input.trackingType === 'measurement' ? 'value' : undefined,
    });
  }

  async function handleRenameHabit(habitId: string, title: string) {
    await updateHabit(habitId, { title });
  }

  if (!routineId || !routine) {
    return (
      <section className="space-y-4 rounded-3xl bg-white/80 p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">Routine not found</h1>
        <p className="text-sm text-ink/70">This routine may have been removed.</p>
      </section>
    );
  }

  const activeRoutineId = routineId;

  async function saveTitle() {
    const nextTitle = titleDraft.trim();
    if (!nextTitle) return;
    await updateRoutine(activeRoutineId, { title: nextTitle });
    setIsEditingTitle(false);
  }

  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-white/80 p-6 shadow-soft">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-ink/50">Routine Workspace</p>
        {isEditingTitle ? (
          <div className="mt-3 flex items-center gap-2">
            <input
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              className="w-full rounded-full border border-black/10 bg-white px-4 py-2 text-lg font-semibold outline-none"
              aria-label="Routine title"
            />
            <button type="button" onClick={saveTitle} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper">
              Save
            </button>
          </div>
        ) : (
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{routine.title}</h1>
        )}
        <p className="mt-3 text-sm text-ink/70">Tap to expand or collapse details, then record today&apos;s practice.</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setTitleDraft(routine.title);
              setIsEditingTitle(true);
            }}
            className="rounded-full bg-black/5 px-4 py-2 text-sm font-medium"
          >
            Edit title
          </button>
          <button
            type="button"
            onClick={async () => {
              await deleteRoutine(activeRoutineId);
              navigate('/routines');
            }}
            className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700"
          >
            Delete
          </button>
        </div>
      </header>

      <ParallelTimelines />
      {categories.map((category, index) => (
        <CategoryAccordion
          key={category.id}
          categoryId={category.id}
          title={category.name}
          defaultOpen={index === 0}
          onRenameCategory={handleRenameCategory}
          onCreateHabit={handleCreateHabit}
        >
          {(habitsByCategory[category.id] ?? []).map((habit) => {
            const periodKey = getPeriodKeyForHabit(habit, new Date());
            const entry = entryMap.get(`${habit.id}:${periodKey}`);

            return (
              <HabitRow
                key={habit.id}
                habitId={habit.id}
                title={habit.title}
                trackingType={habit.trackingType}
                timeframe={habit.timeframe}
                initialBoolean={entry?.boolValue}
                initialInteger={entry?.intValue}
                initialText={entry?.textValue}
                onSave={(_, value) => handleSaveHabitValue(habit, value)}
                onRenameHabit={handleRenameHabit}
              />
            );
          })}
        </CategoryAccordion>
      ))}
    </section>
  );
}
