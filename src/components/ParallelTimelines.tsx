import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { DailyGrid } from './DailyGrid';
import { db } from '../db/client';
import { listHabitsForRoutine } from '../repositories/habitsRepository';
import { buildDailyTimeline, buildWeeklyTimeline, buildDailyWindow } from '../services/timelineService';

interface ParallelTimelinesProps {
  routineId: string;
}

export function ParallelTimelines({ routineId }: ParallelTimelinesProps) {
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

  return (
    <section className="max-w-xl mx-auto space-y-4 rounded-3xl bg-white/80 p-5 shadow-soft">
      {!hasTimelineHabits ? (
        <p className="text-sm text-ink/65">Add at least one daily or weekly habit to generate timeline visuals.</p>
      ) : null}
      {hasTimelineHabits ? (
        <DailyGrid dailyTiles={dailyTiles} weeklyTiles={weeklyTiles} startLabel={startLabel} endLabel={endLabel} />
      ) : null}
    </section>
  );
}
