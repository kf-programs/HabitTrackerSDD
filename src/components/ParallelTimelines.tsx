import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { DailyGrid } from './DailyGrid';
import { db } from '../db/client';
import { listHabitsForRoutine } from '../repositories/habitsRepository';
import { buildDailyTimeline, buildWeeklyTimeline, buildDailyWindow } from '../services/timelineService';
import { compareDayKeys, getDayKey, shiftDayKey } from '../utils/dateBoundaries';

interface ParallelTimelinesProps {
  routineId: string;
  selectedDayKey: string;
  onSelectedDayKeyChange: (nextDayKey: string) => void;
}

export function ParallelTimelines({ routineId, selectedDayKey, onSelectedDayKeyChange }: ParallelTimelinesProps) {
  const habits = useLiveQuery(async () => listHabitsForRoutine(routineId), [routineId], []);

  const entries = useLiveQuery(async () => {
    if (habits.length === 0) {
      return [];
    }

    const habitIds = habits.map((habit) => habit.id);
    return db.entries.where('habitId').anyOf(habitIds).toArray();
  }, [habits], []);

  const dailyHabits = habits.filter((habit) => habit.timeframe === 'daily');
  const weeklyHabits = habits.filter((habit) => habit.timeframe === 'weekly');

  const dailyTiles = useMemo(() => {
    return buildDailyTimeline({ routineId, habits: dailyHabits, entries });
  }, [routineId, dailyHabits, entries]);

  const weeklyTiles = useMemo(() => {
    return buildWeeklyTimeline({ routineId, habits: weeklyHabits, entries });
  }, [routineId, weeklyHabits, entries]);

  const hasTimelineHabits = dailyHabits.length > 0 || weeklyHabits.length > 0;

  const [startLabel, endLabel] = useMemo(() => {
    const dailyWindow = buildDailyWindow();
    const startDay = dailyWindow[0];
    const endDay = dailyWindow[dailyWindow.length - 1];

    const start = startDay ? new Date(`${startDay}T12:00:00`) : new Date();
    const end = endDay ? new Date(`${endDay}T12:00:00`) : new Date();

    const formatter = new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return [formatter.format(start), formatter.format(end)];
  }, []);

  const todayKey = getDayKey();
  const earliestDayKey = useMemo(() => buildDailyWindow()[0] ?? todayKey, [todayKey]);

  const canGoBack = compareDayKeys(selectedDayKey, earliestDayKey) > 0;
  const canGoForward = compareDayKeys(selectedDayKey, todayKey) < 0;

  const selectedLabel = useMemo(
    () => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${selectedDayKey}T12:00:00`)),
    [selectedDayKey],
  );

  return (
    <section className="max-w-xl mx-auto space-y-4 rounded-3xl bg-white/80 p-5 shadow-soft">
      <div className="flex items-center justify-between rounded-2xl bg-black/5 px-3 py-2 text-sm">
        <button
          type="button"
          aria-label="Previous day"
          disabled={!canGoBack}
          onClick={() => onSelectedDayKeyChange(shiftDayKey(selectedDayKey, -1))}
          className="rounded-full bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        <p className="font-medium text-ink/80">{selectedLabel}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Today"
            disabled={selectedDayKey === todayKey}
            onClick={() => onSelectedDayKeyChange(todayKey)}
            className="rounded-full bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Next day"
            disabled={!canGoForward}
            onClick={() => onSelectedDayKeyChange(shiftDayKey(selectedDayKey, 1))}
            className="rounded-full bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
      {!hasTimelineHabits ? (
        <p className="text-sm text-ink/65">Add at least one daily or weekly habit to generate timeline visuals.</p>
      ) : null}
      {hasTimelineHabits ? (
        <DailyGrid
          dailyTiles={dailyTiles}
          weeklyTiles={weeklyTiles}
          startLabel={startLabel}
          endLabel={endLabel}
          selectedDayKey={selectedDayKey}
        />
      ) : null}
    </section>
  );
}
