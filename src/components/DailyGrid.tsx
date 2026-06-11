import type { TimelineTileSnapshot } from '../services/timelineService';
import { getPastelClassName } from '../utils/pastelPalette';

interface DailyGridProps {
  tiles: TimelineTileSnapshot[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function formatDayKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getWeekStart(periodKey: string) {
  const date = new Date(`${periodKey}T12:00:00`);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

function getWeekColumns(tiles: TimelineTileSnapshot[]) {
  const columns: Date[] = [];
  const seen = new Set<string>();

  for (const tile of tiles) {
    const weekStart = getWeekStart(tile.periodKey);
    const key = formatDayKey(weekStart);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    columns.push(weekStart);
  }

  return columns;
}

export function DailyGrid({ tiles }: DailyGridProps) {
  const weekColumns = getWeekColumns(tiles);
  const tilesByDay = new Map(tiles.map((tile) => [tile.periodKey, tile]));

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-ink/55">Daily</h3>
      <div className="grid grid-cols-[auto_auto_1fr] items-start gap-2">
        <div className="flex h-full items-center justify-center px-1 text-[10px] font-medium uppercase tracking-[0.2em] text-ink/45 [writing-mode:vertical-rl]">
          Days
        </div>
        <div className="pt-6">
          <div className="grid grid-rows-7 gap-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-ink/45">
            {DAY_LABELS.map((label) => (
              <span key={label} className="flex h-2.5 items-center justify-end pr-1">
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-2 overflow-x-auto pb-1">
          <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink/45">Weeks</div>
          <div
            role="list"
            aria-label="Daily timeline"
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${weekColumns.length}, minmax(0, 0.625rem))`,
              gridTemplateRows: 'repeat(7, minmax(0, 0.625rem))',
            }}
          >
            {weekColumns.flatMap((weekStart) =>
              DAY_LABELS.map((_, dayIndex) => {
                const periodDate = new Date(weekStart);
                periodDate.setDate(weekStart.getDate() + dayIndex);
                const periodKey = formatDayKey(periodDate);
                const tile = tilesByDay.get(periodKey);

                if (!tile) {
                  return <div key={periodKey} aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-transparent" />;
                }

                return (
                  <div
                    key={tile.periodKey}
                    role="listitem"
                    aria-label={`${tile.periodKey} ${tile.completed ? 'completed' : 'not completed'}`}
                    title={tile.periodKey}
                    className={`h-2 w-2 rounded-full ${tile.completed ? getPastelClassName(tile.pastelToken) : 'bg-black/10'} transition-colors`}
                  />
                );
              }),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
