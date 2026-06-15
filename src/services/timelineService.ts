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

function isCounterConditionConfigured(habit: HabitRecord) {
  return habit.trackingType === 'counter'
    && typeof habit.counterGoalValue === 'number'
    && Number.isInteger(habit.counterGoalValue)
    && ['gt', 'lt', 'eq'].includes(habit.counterGoalOperator ?? '');
}

export function evaluateCounterCompletion(habit: HabitRecord, value?: number) {
  if (!isCounterConditionConfigured(habit)) {
    return false;
  }

  if (typeof value !== 'number') {
    return false;
  }

  if (!Number.isInteger(value)) {
    return false;
  }

  const goal = habit.counterGoalValue as number;

  if (habit.counterGoalOperator === 'gt') {
    return value > goal;
  }

  if (habit.counterGoalOperator === 'lt') {
    return value < goal;
  }

  return value === goal;
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
  const dailyHabits = input.habits.filter((habit) => habit.timeframe === 'daily');
  const dailyHabitIds = new Set(dailyHabits.map((habit) => habit.id));
  const habitsById = new Map(dailyHabits.map((habit) => [habit.id, habit]));
  const dayKeys = buildDailyWindow(today);

  const generated = dayKeys.map((periodKey) => {
    const completed = input.entries.some(
      (entry) => {
        if (!dailyHabitIds.has(entry.habitId) || entry.periodKey !== periodKey) {
          return false;
        }

        const habit = habitsById.get(entry.habitId);
        if (habit?.trackingType === 'counter') {
          return evaluateCounterCompletion(habit, entry.intValue);
        }

        return isCompletedEntry(entry);
      },
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
  const weeklyHabits = input.habits.filter((habit) => habit.timeframe === 'weekly');
  const weeklyHabitIds = new Set(weeklyHabits.map((habit) => habit.id));
  const habitsById = new Map(weeklyHabits.map((habit) => [habit.id, habit]));
  const weekKeys = buildVisibleWeekKeys(today);

  const generated = weekKeys.map((periodKey) => {
    const completed = input.entries.some(
      (entry) => {
        if (!weeklyHabitIds.has(entry.habitId) || entry.periodKey !== periodKey) {
          return false;
        }

        const habit = habitsById.get(entry.habitId);
        if (habit?.trackingType === 'counter') {
          return evaluateCounterCompletion(habit, entry.intValue);
        }

        return isCompletedEntry(entry);
      },
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

    const completed = habit.trackingType === 'counter'
      ? evaluateCounterCompletion(habit, entry.intValue)
      : isCompletedEntry(entry);

    return {
      habit,
      entry,
      completed,
      numericValue: entry.intValue,
      textValue: entry.textValue,
      fallbackApplied: false,
    } satisfies SelectedDateChecklistItem;
  });
}
