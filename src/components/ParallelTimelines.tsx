import { DailyGrid } from './DailyGrid';
import { WeeklyRibbon } from './WeeklyRibbon';

export function ParallelTimelines() {
  return (
    <section className="space-y-4 rounded-3xl bg-white/80 p-5 shadow-soft">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-ink/50">Visual Fabric</p>
        <h2 className="mt-2 text-xl font-semibold">Parallel Timelines</h2>
      </div>
      <DailyGrid />
      <WeeklyRibbon />
    </section>
  );
}
