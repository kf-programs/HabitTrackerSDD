import type { TimelineTileSnapshot } from '../services/timelineService';
import { getPastelClassName } from '../utils/pastelPalette';

interface DailyGridProps {
  tiles: TimelineTileSnapshot[];
}

export function DailyGrid({ tiles }: DailyGridProps) {
  return (
    <div role="list" aria-label="Daily timeline" className="grid grid-cols-10 gap-2 sm:grid-cols-12">
      {tiles.map((tile) => (
        <div
          key={tile.periodKey}
          role="listitem"
          aria-label={`${tile.periodKey} ${tile.completed ? 'completed' : 'not completed'}`}
          title={tile.periodKey}
          className={`aspect-square rounded-xl ${tile.completed ? getPastelClassName(tile.pastelToken) : 'bg-black/5'} transition-colors`}
        />
      ))}
    </div>
  );
}
