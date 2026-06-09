import { CategoryAccordion } from './CategoryAccordion';
import { ParallelTimelines } from './ParallelTimelines';
import { HabitRow } from './HabitRow';

export function RoutineWorkspace() {
  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-white/80 p-6 shadow-soft">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-ink/50">Routine Workspace</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Morning Ritual</h1>
        <p className="mt-3 text-sm text-ink/70">Tap to expand or collapse details, then record today&apos;s practice.</p>
      </header>

      <ParallelTimelines />
      <CategoryAccordion title="Gentle Start" defaultOpen>
        <HabitRow title="Drink water" trackingType="yesno" timeframe="daily" />
      </CategoryAccordion>
      <CategoryAccordion title="Movement" defaultOpen={false}>
        <HabitRow title="Stretch" trackingType="counter" timeframe="daily" />
      </CategoryAccordion>
    </section>
  );
}
