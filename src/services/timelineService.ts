import type { EntryRecord, HabitRecord } from '../db/schema';
import { getDayKey, getWeekKey, getRollingDayKeys } from '../utils/dateBoundaries';
import { pickPastelToken } from '../utils/pastelPalette';
import type { PastelToken } from '../utils/pastelPalette';

export interface TimelineTileSnapshot {
  periodKey: string;
  completed: boolean;
  pastelToken: PastelToken;
}

export interface SelectedDateChecklistItem {
  habit: HabitRecord;
  entry?: EntryRecord;
  completed: boolean;
  numericValue?: number;
  textValue?: string;
  fallbackApplied: boolean;
}

function isCompletedEntry(entry: EntryRecord) {
  if (entry.valueType === 'boolean') {
    return entry.boolValue === true;
  }

  if (entry.valueType === 'integer') {
    return (entry.intValue ?? 0) > 0;
  }

  return Boolean(entry.textValue?.trim());
}

export function buildDailyWindow(today = new Date()) {
  return getRollingDayKeys(120, today);
}

export function buildVisibleWeekKeys(today = new Date()) {
  return Array.from(
    new Set(buildDailyWindow(today).map((dayKey) => getWeekKey(new Date(`${dayKey}T12:00:00`)))),
  );
}

export function getPeriodKeyForHabit(habit: HabitRecord, date = new Date()) {
  return habit.timeframe === 'daily' ? getDayKey(date) : getWeekKey(date);
}

export function getTileToken(seed?: string) {
  return pickPastelToken(seed);
}

export function mergeTimelineTiles(existing: TimelineTileSnapshot[], generated: TimelineTileSnapshot[]) {
  const existingByPeriod = new Map(existing.map((tile) => [tile.periodKey, tile]));

  return generated.map((tile) => {
    const preserved = existingByPeriod.get(tile.periodKey);
    if (!preserved) {
      return tile;
    }

    return {
      ...tile,
      pastelToken: preserved.pastelToken,
    };
  });
}

interface BuildTimelineInput {
  routineId: string;
  habits: HabitRecord[];
  entries: EntryRecord[];
}

export function buildDailyTimeline(input: BuildTimelineInput, existingTiles: TimelineTileSnapshot[] = [], today = new Date()) {
  const dailyHabitIds = new Set(input.habits.filter((habit) => habit.timeframe === 'daily').map((habit) => habit.id));
  const dayKeys = buildDailyWindow(today);

  const generated = dayKeys.map((periodKey) => {
    const completed = input.entries.some(
      (entry) => dailyHabitIds.has(entry.habitId) && entry.periodKey === periodKey && isCompletedEntry(entry),
    );

    return {
      periodKey,
      completed,
      pastelToken: completed ? getTileToken(`${input.routineId}:${periodKey}`) : 'mist-2',
    } satisfies TimelineTileSnapshot;
  });

  return mergeTimelineTiles(existingTiles, generated);
}

export function buildWeeklyTimeline(input: BuildTimelineInput, existingTiles: TimelineTileSnapshot[] = [], today = new Date()) {
  const weeklyHabitIds = new Set(input.habits.filter((habit) => habit.timeframe === 'weekly').map((habit) => habit.id));
  const weekKeys = buildVisibleWeekKeys(today);

  const generated = weekKeys.map((periodKey) => {
    const completed = input.entries.some(
      (entry) => weeklyHabitIds.has(entry.habitId) && entry.periodKey === periodKey && isCompletedEntry(entry),
    );

    return {
      periodKey,
      completed,
      pastelToken: completed ? getTileToken(`${input.routineId}:${periodKey}`) : 'mist-2',
    } satisfies TimelineTileSnapshot;
  });

  return mergeTimelineTiles(existingTiles, generated);
}

export function buildSelectedDateChecklistItems(
  habits: HabitRecord[],
  entries: EntryRecord[],
  selectedDate = new Date(),
): SelectedDateChecklistItem[] {
  return habits.map((habit) => {
    const periodKey = getPeriodKeyForHabit(habit, selectedDate);
    const entry = entries.find((candidate) => candidate.habitId === habit.id && candidate.periodKey === periodKey);

    if (!entry) {
      return {
        habit,
        completed: false,
        fallbackApplied: false,
      } satisfies SelectedDateChecklistItem;
    }

    const isTypeMismatch =
      (habit.trackingType === 'yesno' && entry.valueType !== 'boolean')
      || (habit.trackingType === 'counter' && entry.valueType !== 'integer')
      || (habit.trackingType === 'measurement' && entry.valueType !== 'string');

    if (isTypeMismatch) {
      return {
        habit,
        entry,
        completed: true,
        numericValue: undefined,
        textValue: undefined,
        fallbackApplied: true,
      } satisfies SelectedDateChecklistItem;
    }

    return {
      habit,
      entry,
      completed: isCompletedEntry(entry),
      numericValue: entry.intValue,
      textValue: entry.textValue,
      fallbackApplied: false,
    } satisfies SelectedDateChecklistItem;
  });
}
