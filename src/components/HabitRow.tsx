import { useState } from 'react';
import type { HabitTimeframe, HabitTrackingType } from '../db/schema';

interface HabitRowProps {
  title: string;
  trackingType: HabitTrackingType;
  timeframe: HabitTimeframe;
}

export function HabitRow({ title, trackingType, timeframe }: HabitRowProps) {
  const [count, setCount] = useState(0);
  const [value, setValue] = useState('');
  const [completed, setCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  return (
    <div className="rounded-2xl border border-black/5 bg-paper px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={`font-medium ${completed ? 'line-through opacity-70' : ''}`}>{title}</p>
          <p className="text-xs uppercase tracking-[0.25em] text-ink/40">
            {timeframe} • {trackingType}
          </p>
        </div>

        {trackingType === 'yesno' ? (
          <button
            type="button"
            onClick={() => setCompleted((current) => !current)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${completed ? 'bg-sage' : 'bg-white'}`}
          >
            {completed ? 'Done' : 'Mark complete'}
          </button>
        ) : null}

        {trackingType === 'counter' ? (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setCount((current) => Math.max(0, current - 1))} className="rounded-full bg-white px-3 py-2 text-sm">
              −
            </button>
            <span className="min-w-8 text-center font-semibold">{count}</span>
            <button type="button" onClick={() => setCount((current) => current + 1)} className="rounded-full bg-white px-3 py-2 text-sm">
              +
            </button>
          </div>
        ) : null}

        {trackingType === 'measurement' ? (
          isEditing ? (
            <input
              aria-label={title}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onBlur={() => setIsEditing(false)}
              className="w-full rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none sm:max-w-xs"
              placeholder="Add a note or value"
            />
          ) : (
            <button type="button" onClick={() => setIsEditing(true)} className="text-sm font-medium underline-offset-4 hover:underline">
              {value || 'Add value'} ✎
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
