import type { TimelineTileSnapshot } from '../services/timelineService';
import { getPastelClassName } from '../utils/pastelPalette';

interface DailyGridProps {
  dailyTiles: TimelineTileSnapshot[];
  weeklyTiles: TimelineTileSnapshot[];
  startLabel: string;
  endLabel: string;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Week'];

// 1. Change this single variable to scale the entire grid up or down smoothly!
const TILE_SIZE = '1.25rem'; // 24px (Try '1.25rem', '1.75rem', etc.)

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function formatDayKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getWeekStart(periodKey: string) {
  const normalizedKey = periodKey.endsWith('-SUN') ? periodKey.slice(0, -4) : periodKey;
  const date = new Date(`${normalizedKey}T12:00:00`);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

function getWeekColumns(dailyTiles: TimelineTileSnapshot[], weeklyTiles: TimelineTileSnapshot[]) {
  const columns: Date[] = [];
  const seen = new Set<string>();

  for (const tile of dailyTiles) {
    const weekStart = getWeekStart(tile.periodKey);
    const key = formatDayKey(weekStart);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    columns.push(weekStart);
  }

  for (const tile of weeklyTiles) {
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

export function DailyGrid({ dailyTiles, weeklyTiles, startLabel, endLabel }: DailyGridProps) {
  const weekColumns = getWeekColumns(dailyTiles, weeklyTiles);
  const tilesByDay = new Map(dailyTiles.map((tile) => [tile.periodKey, tile]));
  const weeklyByKey = new Map(weeklyTiles.map((tile) => [tile.periodKey, tile]));

  return (
    <section className="space-y-2">
      <div className="grid grid-cols-[auto_auto_1fr] items-start gap-2">
        {/* Adjusted padding/height on the side label to match the new dynamic grid height */}
        <div 
          className="flex items-center justify-center px-1 text-[10px] font-medium uppercase tracking-[0.2em] text-ink/45 [writing-mode:vertical-rl]"
          style={{ height: `calc((${TILE_SIZE} * 8) + (0.5rem * 7))` }} // matches 8 rows + gaps
        >
          Days
        </div>
        
        {/* Adjusted line-height/spacing of side labels to align with the larger cells */}
        <div className="pt-6">
          <div className="grid grid-rows-8 gap-y-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-ink/45">
            {DAY_LABELS.map((label) => (
              <span 
                key={label} 
                className="flex items-center justify-end pr-1"
                style={{ height: TILE_SIZE }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="w-fit space-y-2">
            <div className="flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-ink/45">
              <span>{startLabel}</span>
              <span>{endLabel}</span>
            </div>
            <div
              role="list"
              aria-label="Timeline"
              className="grid grid-flow-col gap-y-0.5 gap-x-0.5"
              style={{
                // 2. The single constant now configures both rows and columns
                gridTemplateColumns: `repeat(${weekColumns.length}, minmax(0, ${TILE_SIZE}))`,
                gridTemplateRows: `repeat(8, minmax(0, ${TILE_SIZE}))`,
              }}
            >
              {weekColumns.flatMap((weekStart) =>
                DAY_LABELS.map((_, dayIndex) => {
                  if (dayIndex === 7) {
                    const weeklyKey = `${formatDayKey(weekStart)}-SUN`;
                    const tile = weeklyByKey.get(weeklyKey);
                    if (!tile) {
                      // 3. Replaced fixed sizes with w-full h-full
                      return <div key={`weekly-${weeklyKey}`} aria-hidden="true" className="h-full w-full rounded-full bg-transparent" />;
                    }

                    return (
                      <div
                        key={tile.periodKey}
                        role="listitem"
                        data-shape="weekly-pill"
                        aria-label={`${tile.periodKey} ${tile.completed ? 'completed' : 'not completed'}`}
                        title={tile.periodKey}
                        className={`h-full w-full rounded-full ${tile.completed ? getPastelClassName(tile.pastelToken) : 'bg-black/10'} transition-colors`}
                      />
                    );
                  }

                  const periodDate = new Date(weekStart);
                  periodDate.setDate(weekStart.getDate() + dayIndex);
                  const periodKey = formatDayKey(periodDate);
                  const tile = tilesByDay.get(periodKey);

                  if (!tile) {
                    return <div key={periodKey} aria-hidden="true" className="h-full w-full rounded-md bg-transparent" />;
                  }

                  return (
                    <div
                      key={tile.periodKey}
                      role="listitem"
                      aria-label={`${tile.periodKey} ${tile.completed ? 'completed' : 'not completed'}`}
                      title={tile.periodKey}
                      className={`h-full w-full rounded-md ${tile.completed ? getPastelClassName(tile.pastelToken) : 'bg-black/10'} transition-colors`}
                    />
                  );
                }),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}