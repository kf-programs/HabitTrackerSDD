import type { HabitRecord } from '../db/schema';
import { getDayKey, getWeekKey, getRollingDayKeys } from '../utils/dateBoundaries';
import { pickPastelToken } from '../utils/pastelPalette';

export interface TimelineTileSnapshot {
  periodKey: string;
  completed: boolean;
  pastelToken: string;
}

export function buildDailyWindow(today = new Date()) {
  return getRollingDayKeys(120, today);
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
