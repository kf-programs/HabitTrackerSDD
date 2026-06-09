import type { TimelineTileSnapshot } from '../services/timelineService';
import { getPastelClassName } from '../utils/pastelPalette';

interface WeeklyRibbonProps {
  tiles: TimelineTileSnapshot[];
}

export function WeeklyRibbon({ tiles }: WeeklyRibbonProps) {
  return (
    <div role="list" aria-label="Weekly timeline" className="flex gap-2 overflow-x-auto pb-1">
      {tiles.map((tile) => (
        <div
          key={tile.periodKey}
          role="listitem"
          aria-label={`${tile.periodKey} ${tile.completed ? 'completed' : 'not completed'}`}
          title={tile.periodKey}
          className={`h-10 min-w-14 rounded-xl ${tile.completed ? getPastelClassName(tile.pastelToken) : 'bg-black/5'} transition-colors`}
        />
      ))}
    </div>
  );
}
