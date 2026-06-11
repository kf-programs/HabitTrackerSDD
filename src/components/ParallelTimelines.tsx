import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { DailyGrid } from './DailyGrid';
import { WeeklyRibbon } from './WeeklyRibbon';
import { db } from '../db/client';
import { listHabitsForRoutine } from '../repositories/habitsRepository';
import { buildDailyTimeline, buildWeeklyTimeline, buildVisibleWeekKeys } from '../services/timelineService';

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

  const showDaily = dailyHabits.length > 0;
  const showWeekly = weeklyHabits.length > 0;

  const weekColumnCount = useMemo(() => {
    if (showDaily) {
      return buildVisibleWeekKeys().length;
    }

    return weeklyTiles.length;
  }, [showDaily, weeklyTiles.length]);

  return (
    <section className="space-y-4 rounded-3xl bg-white/80 p-5 shadow-soft">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-ink/50">Visual Fabric</p>
        <h2 className="mt-2 text-xl font-semibold">Parallel Timelines</h2>
      </div>
      {!showDaily && !showWeekly ? (
        <p className="text-sm text-ink/65">Add at least one daily or weekly habit to generate timeline visuals.</p>
      ) : null}
      {showDaily ? <DailyGrid tiles={dailyTiles} /> : null}
      {showWeekly ? <WeeklyRibbon tiles={weeklyTiles} columnCount={weekColumnCount} /> : null}
    </section>
  );
}
