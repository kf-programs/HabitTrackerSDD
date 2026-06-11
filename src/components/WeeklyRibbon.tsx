import type { TimelineTileSnapshot } from '../services/timelineService';
import { getPastelClassName } from '../utils/pastelPalette';

interface WeeklyRibbonProps {
  tiles: TimelineTileSnapshot[];
  columnCount?: number;
}

export function WeeklyRibbon({ tiles, columnCount }: WeeklyRibbonProps) {
  const totalColumns = Math.max(columnCount ?? tiles.length, tiles.length);

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-ink/55">Weekly</h3>
      <div
        role="list"
        aria-label="Weekly timeline"
        className="grid gap-1.5 overflow-x-auto pb-1"
        data-week-columns={totalColumns}
        style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 0.625rem))` }}
      >
        {Array.from({ length: totalColumns }, (_, index) => {
          const tile = tiles[index];

          if (!tile) {
            return <div key={`weekly-empty-${index}`} aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-transparent" />;
          }

          return (
            <div
              key={tile.periodKey}
              role="listitem"
              aria-label={`${tile.periodKey} ${tile.completed ? 'completed' : 'not completed'}`}
              title={tile.periodKey}
              className={`h-2.5 w-2.5 rounded-full ${tile.completed ? getPastelClassName(tile.pastelToken) : 'bg-black/10'} transition-colors`}
            />
          );
        })}
      </div>
    </section>
  );
}
