import type { TimelineTileSnapshot } from '../services/timelineService';
import { getPastelClassName } from '../utils/pastelPalette';

interface WeeklyRibbonProps {
  tiles: TimelineTileSnapshot[];
}

export function WeeklyRibbon({ tiles }: WeeklyRibbonProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tiles.map((tile) => (
        <div
          key={tile.periodKey}
          title={tile.periodKey}
          className={`h-10 min-w-14 rounded-xl ${tile.completed ? getPastelClassName(tile.pastelToken) : 'bg-black/5'} transition-colors`}
        />
      ))}
    </div>
  );
}
