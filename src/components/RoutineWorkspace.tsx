import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Pencil, Trash2 } from 'lucide-react';
import { CategoryAccordion } from './CategoryAccordion';
import { ParallelTimelines } from './ParallelTimelines';
import { HabitRow } from './HabitRow';
import { RoutineJournalEditor } from './RoutineJournalEditor';
import ConfirmationDialog from './modals/ConfirmationDialog';
import { createRoutine, getRoutineById, updateRoutine, deleteRoutine } from '../repositories/routinesRepository';
import {
  listCategoriesForRoutine,
  updateCategory,
  createCategory,
} from '../repositories/categoriesRepository';
import { listHabitsForRoutineOnDate, createHabit, updateHabit } from '../repositories/habitsRepository';
import { db } from '../db/client';
import { buildSelectedDateChecklistItems, getPeriodKeyForHabit } from '../services/timelineService';
import { deleteEntryForHabitPeriod, upsertEntry } from '../repositories/entriesRepository';
import { getRoutineJournalEntry, upsertRoutineJournalEntry } from '../repositories/routineJournalRepository';
import { exportRoutineStructure } from '../services/sharingService';
import type { HabitRecord, HabitTimeframe, HabitTrackingType } from '../db/schema';
import { getDayKey } from '../utils/dateBoundaries';

const JOURNAL_MAX_LENGTH = 2000;
export const JOURNAL_AUTOSAVE_DEBOUNCE_MS = 600;

export function RoutineWorkspace() {
  const { routineId, selectedDayKey: selectedDayKeyParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isCreatingNew = routineId === 'new';
  const [isEditingRoutineMeta, setIsEditingRoutineMeta] = useState(isCreatingNew);
  const [titleDraft, setTitleDraft] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState(selectedDayKeyParam ?? getDayKey());
  const [journalDraft, setJournalDraft] = useState('');
  const [persistedJournalText, setPersistedJournalText] = useState('');
  const [isJournalSaving, setIsJournalSaving] = useState(false);
  const [journalError, setJournalError] = useState('');
  const skipBlockRef = useRef(false);

  useEffect(() => {
    if (isCreatingNew) {
      setIsEditingRoutineMeta(true);
    }
  }, [isCreatingNew]);

  useEffect(() => {
    skipBlockRef.current = false;
  }, [location.pathname]);

  useEffect(() => {
    if (!selectedDayKeyParam) {
      return;
    }

    setSelectedDayKey(selectedDayKeyParam);
  }, [selectedDayKeyParam]);

  const routine = useLiveQuery(async () => {
    if (!routineId || isCreatingNew) return undefined;
    return getRoutineById(routineId);
  }, [routineId, isCreatingNew]);

  const categories = useLiveQuery(async () => {
    if (!routineId || isCreatingNew) return [];
    return listCategoriesForRoutine(routineId);
  }, [routineId, isCreatingNew], []);

  const habits = useLiveQuery(async () => {
    if (!routineId || isCreatingNew) return [];
    return listHabitsForRoutineOnDate(routineId, selectedDayKey);
  }, [routineId, isCreatingNew, selectedDayKey], []);

  const entries = useLiveQuery(async () => {
    if (habits.length === 0) {
      return [];
    }

    const habitIds = habits.map((habit) => habit.id);
    const possiblePeriodKeys = new Set<string>();

    habits.forEach((habit) => {
      possiblePeriodKeys.add(getPeriodKeyForHabit(habit, new Date(`${selectedDayKey}T12:00:00`)));
    });

    const records = await db.entries.where('habitId').anyOf(habitIds).toArray();
    return records.filter((entry) => possiblePeriodKeys.has(entry.periodKey));
  }, [habits, selectedDayKey], []);

  const journalEntry = useLiveQuery(async () => {
    if (!routineId || isCreatingNew) {
      return undefined;
    }

    return getRoutineJournalEntry(routineId, selectedDayKey);
  }, [routineId, isCreatingNew, selectedDayKey]);

  const habitsByCategory = useMemo(() => {
    const grouped = habits.reduce<Record<string, HabitRecord[]>>((acc, habit) => {
      const list = acc[habit.categoryId] ?? [];
      list.push(habit);
      acc[habit.categoryId] = list;
      return acc;
    }, {});

    Object.keys(grouped).forEach((categoryId) => {
      grouped[categoryId] = grouped[categoryId].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    });

    return grouped;
  }, [habits]);

  const isRoutineMetaDirty = useMemo(() => {
    if (isCreatingNew) {
      return Boolean(titleDraft.trim() || descriptionDraft.trim());
    }

    if (!routine || !isEditingRoutineMeta) {
      return false;
    }

    const nextTitle = titleDraft.trim();
    const nextDescription = descriptionDraft.trim();
    return nextTitle !== routine.title || nextDescription !== (routine.description ?? '');
  }, [descriptionDraft, isCreatingNew, isEditingRoutineMeta, routine, titleDraft]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isRoutineMetaDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRoutineMetaDirty]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!isRoutineMetaDirty || skipBlockRef.current) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest('a');
      if (!link) {
        return;
      }

      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) {
        return;
      }

      if (href === location.pathname) {
        return;
      }

      event.preventDefault();
      setPendingPath(href);
      setIsLeaveDialogOpen(true);
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, [isRoutineMetaDirty, location.pathname]);

  const checklistItems = useMemo(
    () => buildSelectedDateChecklistItems(habits, entries, new Date(`${selectedDayKey}T12:00:00`)),
    [habits, entries, selectedDayKey],
  );

  const checklistByHabitId = useMemo(() => {
    return new Map(checklistItems.map((item) => [item.habit.id, item]));
  }, [checklistItems]);

  useEffect(() => {
    if (isCreatingNew || !routineId) {
      setJournalDraft('');
      setPersistedJournalText('');
      setJournalError('');
      return;
    }

    const nextText = journalEntry?.text ?? '';
    setJournalDraft(nextText);
    setPersistedJournalText(nextText);
    setJournalError('');
  }, [isCreatingNew, journalEntry?.text, routineId, selectedDayKey]);

  const saveJournalDraft = useCallback(
    async (override?: { routineId?: string; dayKey?: string; text?: string }) => {
      const resolvedRoutineId = override?.routineId ?? (isCreatingNew ? undefined : routineId);
      const resolvedDayKey = override?.dayKey ?? selectedDayKey;
      const resolvedText = (override?.text ?? journalDraft).slice(0, JOURNAL_MAX_LENGTH);

      if (!resolvedRoutineId) {
        return true;
      }

      if (resolvedText === persistedJournalText && !override) {
        return true;
      }

      setIsJournalSaving(true);

      try {
        const saved = await upsertRoutineJournalEntry({
          routineId: resolvedRoutineId,
          dayKey: resolvedDayKey,
          text: resolvedText,
        });

        if (resolvedRoutineId === routineId && resolvedDayKey === selectedDayKey) {
          setPersistedJournalText(saved.text);
          setJournalDraft(saved.text);
        }

        setJournalError('');
        return true;
      } catch (error) {
        setJournalError(error instanceof Error ? error.message : 'Unable to save journal right now.');
        return false;
      } finally {
        setIsJournalSaving(false);
      }
    },
    [isCreatingNew, journalDraft, persistedJournalText, routineId, selectedDayKey],
  );

  useEffect(() => {
    if (isCreatingNew || !routineId) {
      return;
    }

    if (journalDraft === persistedJournalText) {
      return;
    }

    const timer = window.setTimeout(() => {
      void saveJournalDraft();
    }, JOURNAL_AUTOSAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [isCreatingNew, journalDraft, persistedJournalText, routineId, saveJournalDraft]);

  async function handleSelectedDayKeyChange(nextDayKey: string) {
    if (nextDayKey === selectedDayKey) {
      return;
    }

    // Flush current-day draft before switching contexts to keep writes date-scoped.
    const didSave = await saveJournalDraft({
      routineId: isCreatingNew ? undefined : routineId,
      dayKey: selectedDayKey,
      text: journalDraft,
    });

    if (!didSave) {
      return;
    }

    setSelectedDayKey(nextDayKey);
  }

  async function handleSaveHabitValue(habit: HabitRecord, value: boolean | number | string) {
    const periodKey = getPeriodKeyForHabit(habit, new Date(`${selectedDayKey}T12:00:00`));
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

  async function handleClearHabitEntry(habit: HabitRecord) {
    const periodKey = getPeriodKeyForHabit(habit, new Date(`${selectedDayKey}T12:00:00`));
    await deleteEntryForHabitPeriod(habit.id, periodKey);
  }

  async function handleRenameCategory(categoryId: string, input: { name: string; description?: string }) {
    await updateCategory(categoryId, {
      name: input.name,
      description: input.description,
    });
  }

  async function handleCreateCategory() {
    if (!routineId) return;
    const newCategoryName = `Category ${categories.length + 1}`;
    await createCategory(routineId, newCategoryName, categories.length);
  }

  async function handleCreateHabit(
    categoryId: string,
    input: { title: string; timeframe: HabitTimeframe; trackingType: HabitTrackingType; counterGoalOperator?: HabitRecord['counterGoalOperator']; counterGoalValue?: number },
  ) {
    if (!routineId) return;

    await createHabit({
      routineId,
      categoryId,
      title: input.title,
      timeframe: input.timeframe,
      trackingType: input.trackingType,
      measurementUnit: input.trackingType === 'measurement' ? 'value' : undefined,
      counterGoalOperator: input.counterGoalOperator,
      counterGoalValue: input.counterGoalValue,
    });
  }

  async function handleRenameHabit(habitId: string, title: string) {
    await updateHabit(habitId, { title });
  }

  async function handleUpdateCounterGoal(habitId: string, counterGoalOperator: HabitRecord['counterGoalOperator'], counterGoalValue: number) {
    await updateHabit(habitId, { counterGoalOperator, counterGoalValue });
  }

  async function handleShareRoutine() {
    if (!routineId || isCreatingNew) {
      return;
    }

    const encodedPayload = await exportRoutineStructure(routineId);
    const shareUrl = `${window.location.origin}/import?d=${encodedPayload}`;

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      setShareFeedback('Share link copied to clipboard.');
      return;
    }

    setShareFeedback(shareUrl);
  }

  async function handleDeleteRoutine() {
    setIsConfirmDeleteDialogOpen(true);
  }

  async function confirmDeleteRoutine() {
    if (!routineId || isCreatingNew) return;
    await deleteRoutine(routineId);
    setIsConfirmDeleteDialogOpen(false);
    skipBlockRef.current = true;
    navigate('/routines');
  }

  async function saveRoutineMeta() {
    if (!routineId || !routine || isCreatingNew) {
      return;
    }

    const nextTitle = titleDraft.trim();
    if (!nextTitle) {
      return;
    }

    await updateRoutine(routineId, {
      title: nextTitle,
      description: descriptionDraft.trim() || undefined,
    });
    setIsEditingRoutineMeta(false);
  }

  async function createDraftRoutineAndContinue() {
    const nextTitle = titleDraft.trim() || 'New Routine';
    const nextDescription = descriptionDraft.trim() || undefined;
    const createdRoutine = await createRoutine(nextTitle, nextDescription);
    await createCategory(createdRoutine.id, 'First Category', 0);
    return createdRoutine.id;
  }

  async function handleCreateFromDraft() {
    if (!isCreatingNew) {
      return;
    }

    const createdRoutineId = await createDraftRoutineAndContinue();
    skipBlockRef.current = true;
    navigate(`/routines/${createdRoutineId}`);
  }

  function handleCancelDraft() {
    if (isRoutineMetaDirty) {
      setPendingPath('/routines');
      setIsLeaveDialogOpen(true);
      return;
    }

    skipBlockRef.current = true;
    navigate('/routines');
  }

  async function handleSaveBeforeLeaving() {
    const destination = pendingPath ?? '/routines';

    if (isCreatingNew) {
      const createdRoutineId = await createDraftRoutineAndContinue();
      skipBlockRef.current = true;
      if (destination === '/routines') {
        navigate(`/routines/${createdRoutineId}`);
      } else {
        navigate(destination);
      }
      setIsLeaveDialogOpen(false);
      setPendingPath(null);
      return;
    }

    await saveRoutineMeta();
    skipBlockRef.current = true;
    navigate(destination);
    setIsLeaveDialogOpen(false);
    setPendingPath(null);
  }

  function handleLeaveWithoutSaving() {
    skipBlockRef.current = true;
    navigate(pendingPath ?? '/routines');
    setIsLeaveDialogOpen(false);
    setPendingPath(null);
  }

  if (!routineId) {
    return (
      <section className="space-y-4 rounded-3xl bg-white/80 p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">Routine not found</h1>
        <p className="text-sm text-ink/70">This routine may have been removed.</p>
      </section>
    );
  }

  if (!isCreatingNew && !routine) {
    return (
      <section className="space-y-4 rounded-3xl bg-white/80 p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">Routine not found</h1>
        <p className="text-sm text-ink/70">This routine may have been removed.</p>
      </section>
    );
  }

  const activeRoutineId = isCreatingNew ? undefined : routineId;
  const effectiveTitle = isCreatingNew ? titleDraft || 'New Routine' : routine?.title ?? '';
  const effectiveDescription = isCreatingNew ? descriptionDraft : routine?.description;

  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-white/80 p-6 shadow-soft">
  {isEditingRoutineMeta ? (
    <div className="space-y-3">
      <input
        value={titleDraft}
        onChange={(event) => setTitleDraft(event.target.value)}
        className="w-full rounded-full border border-black/10 bg-white px-4 py-2 text-lg font-semibold outline-none"
        aria-label="Routine title"
        placeholder="Routine title"
      />
      <textarea
        value={descriptionDraft}
        onChange={(event) => setDescriptionDraft(event.target.value)}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
        aria-label="Routine description"
        rows={3}
        placeholder="Add a routine description"
      />
      {!isCreatingNew ? (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void saveRoutineMeta()} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper">
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setTitleDraft(routine?.title ?? '');
              setDescriptionDraft(routine?.description ?? '');
              setIsEditingRoutineMeta(false);
            }}
            className="rounded-full bg-black/5 px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  ) : (
    <>
      {/* 1. Wrapped the title and buttons in a row flex container */}
      <div className="flex items-center justify-between gap-4">
        {/* Removed mt-3 from h1 to prevent layout shifting */}
        <h1 className="text-3xl font-semibold tracking-tight">{effectiveTitle}</h1>
        {!isCreatingNew ? (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setTitleDraft(routine?.title ?? '');
                setDescriptionDraft(routine?.description ?? '');
                setIsEditingRoutineMeta(true);
              }}
              className="flex items-center justify-center rounded-full bg-black/5 px-3 py-2 text-sm font-medium"
              aria-label="Edit routine details"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => void handleDeleteRoutine()}
              className="flex items-center justify-center rounded-full bg-red-100 px-3 py-2 text-sm font-medium text-red-700"
              aria-label="Delete routine"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
      
      {effectiveDescription ? <p className="mt-2 text-sm text-ink/70">{effectiveDescription}</p> : null}
    </>
  )}
</header>

      {!isCreatingNew && activeRoutineId ? (
        <section className="text-center rounded-3xl bg-white/80 p-5 shadow-soft">
          <p className="text-sm text-ink/75">
            Want to share this routine with others? 
          </p>
          <p className="text-sm text-ink/75">
            Hit the button below to copy a share link to your clipboard. When someone clicks the share link,
            they can import your routine into their habit tracker!
          </p>
          <p className="mt-2 text-xs text-ink/55">
            Note: if you make any changes to the routine, you&apos;ll need to click the button to generate a new link with the latest changes.
          </p>
          {/* Added justify-center to keep the button and feedback centered */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => void handleShareRoutine()}
              className="rounded-full bg-sage px-4 py-2 text-sm font-medium text-ink"
            >
              Share routine
            </button>
            {shareFeedback ? <p className="text-sm text-ink/65">{shareFeedback}</p> : null}
          </div>
        </section>
      ) : null}

      {!isCreatingNew && activeRoutineId ? (
        <ParallelTimelines
          routineId={activeRoutineId}
          selectedDayKey={selectedDayKey}
          onSelectedDayKeyChange={handleSelectedDayKeyChange}
        />
      ) : null}
      {!isCreatingNew && activeRoutineId ? (
        <RoutineJournalEditor
          value={journalDraft}
          maxLength={JOURNAL_MAX_LENGTH}
          isSaving={isJournalSaving}
          errorMessage={journalError}
          onChange={setJournalDraft}
          onBlur={() => {
            void saveJournalDraft();
          }}
        />
      ) : null}
      {categories.map((category, index) => (
        <CategoryAccordion
          key={category.id}
          categoryId={category.id}
          title={category.name}
          description={category.description}
          defaultOpen={index === 0}
          onRenameCategory={handleRenameCategory}
          onCreateHabit={handleCreateHabit}
        >
          {(habitsByCategory[category.id] ?? []).map((habit) => {
            const item = checklistByHabitId.get(habit.id);
            const entry = item?.entry;

            return (
              <HabitRow
                key={habit.id}
                habitId={habit.id}
                title={habit.title}
                trackingType={habit.trackingType}
                timeframe={habit.timeframe}
                initialBoolean={item?.completed ?? entry?.boolValue}
                initialInteger={item?.numericValue ?? entry?.intValue}
                initialText={item?.textValue ?? entry?.textValue}
                counterGoalOperator={habit.counterGoalOperator}
                counterGoalValue={habit.counterGoalValue}
                hasEntry={Boolean(entry)}
                fallbackApplied={item?.fallbackApplied}
                onSave={(_, value) => handleSaveHabitValue(habit, value)}
                onRenameHabit={handleRenameHabit}
                onUpdateCounterGoal={handleUpdateCounterGoal}
                onClearEntry={() => handleClearHabitEntry(habit)}
              />
            );
          })}
        </CategoryAccordion>
      ))}
      <div className="mt-6 flex items-center gap-2">
        {!isCreatingNew ? (
          <button
            type="button"
            onClick={() => void handleCreateCategory()}
            className="rounded-full bg-ink/5 px-4 py-2 text-sm font-medium text-ink/80"
          >
            New Category
          </button>
        ) : null}
        {isCreatingNew ? (
          <>
            <button
              type="button"
              onClick={() => void handleCreateFromDraft()}
              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper"
            >
              Create
            </button>
            <button
              type="button"
              onClick={handleCancelDraft}
              className="rounded-full bg-black/5 px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </>
        ) : null}
      </div>
      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        title="Delete Routine"
        message="Are you sure you want to delete this routine? This action cannot be undone."
        onConfirm={confirmDeleteRoutine}
        onCancel={() => setIsConfirmDeleteDialogOpen(false)}
      />
      <ConfirmationDialog
        isOpen={isLeaveDialogOpen}
        title="Save before leaving?"
        message="You have unsaved changes. Would you like to save this routine before leaving?"
        onConfirm={() => void handleSaveBeforeLeaving()}
        onCancel={handleLeaveWithoutSaving}
        confirmLabel="Save"
        cancelLabel="Leave without saving"
      />
    </section>
  );
}
