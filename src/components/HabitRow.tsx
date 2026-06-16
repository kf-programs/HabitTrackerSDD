import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { CounterGoalOperator, HabitTimeframe, HabitTrackingType } from '../db/schema';

interface HabitRowProps {
  habitId: string;
  title: string;
  trackingType: HabitTrackingType;
  timeframe: HabitTimeframe;
  initialBoolean?: boolean;
  initialInteger?: number;
  initialText?: string;
  counterGoalOperator?: CounterGoalOperator;
  counterGoalValue?: number;
  fallbackApplied?: boolean;
  onSave: (habitId: string, value: boolean | number | string) => Promise<void>;
  onRenameHabit?: (habitId: string, title: string) => Promise<void>;
  onUpdateCounterGoal?: (habitId: string, operator: CounterGoalOperator, goalValue: number) => Promise<void>;
  onDeleteHabit?: (habitId: string) => Promise<void>;
  // True when a persisted entry already exists for this habit/period.
  hasEntry?: boolean;
  onClearEntry?: (habitId: string) => Promise<void>;
}

export function HabitRow({
  habitId,
  title,
  trackingType,
  timeframe,
  initialBoolean,
  initialInteger,
  initialText,
  counterGoalOperator,
  counterGoalValue,
  hasEntry = false,
  fallbackApplied = false,
  onSave,
  onRenameHabit,
  onUpdateCounterGoal,
  onDeleteHabit,
  onClearEntry,
}: HabitRowProps) {
  const [habitTitle, setHabitTitle] = useState(title);
  const [titleDraft, setTitleDraft] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [counterDraft, setCounterDraft] = useState((initialInteger ?? 0).toString());
  const [configuredGoalOperator, setConfiguredGoalOperator] = useState<CounterGoalOperator | undefined>(counterGoalOperator);
  const [isSet, setIsSet] = useState(hasEntry);

  const [configuredGoalValue, setConfiguredGoalValue] = useState<number | undefined>(counterGoalValue);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalOperatorDraft, setGoalOperatorDraft] = useState<CounterGoalOperator>(counterGoalOperator ?? 'gt');
  const [goalValueDraft, setGoalValueDraft] = useState(counterGoalValue?.toString() ?? '');
  const [value, setValue] = useState(initialText ?? '');
  const [completed, setCompleted] = useState(initialBoolean ?? false);
  const [isEditing, setIsEditing] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setCounterDraft((initialInteger ?? 0).toString());
    setValue(initialText ?? '');
    setCompleted(initialBoolean ?? false);
    setIsEditing(true);
  }, [initialBoolean, initialInteger, initialText]);

  useEffect(() => {
    setIsSet(hasEntry);
  }, [hasEntry]);

  useEffect(() => {
    setConfiguredGoalOperator(counterGoalOperator);
    setConfiguredGoalValue(counterGoalValue);
    setGoalOperatorDraft(counterGoalOperator ?? 'gt');
    setGoalValueDraft(counterGoalValue?.toString() ?? '');
  }, [counterGoalOperator, counterGoalValue]);

  function renderGoalSummary() {
    if (!configuredGoalOperator || configuredGoalValue === undefined) {
      return 'Goal not configured';
    }

    const symbol = configuredGoalOperator === 'gt' ? '>' : configuredGoalOperator === 'lt' ? '<' : '=';
    return `Goal: ${symbol} ${configuredGoalValue}`;
  }

  async function saveCounterGoal() {
    if (!onUpdateCounterGoal) {
      setIsEditingGoal(false);
      return;
    }

    const parsed = Number(goalValueDraft);
    if (!Number.isInteger(parsed)) {
      setError('Counter goal must be an integer.');
      return;
    }

    try {
      setError('');
      await onUpdateCounterGoal(habitId, goalOperatorDraft, parsed);
      setConfiguredGoalOperator(goalOperatorDraft);
      setConfiguredGoalValue(parsed);
      setIsEditingGoal(false);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Unable to save right now. Please retry.';
      setError(message);
    }
  }

  async function saveTitle() {
    const nextTitle = titleDraft.trim();
    if (!nextTitle) {
      setIsEditingTitle(false);
      setTitleDraft(habitTitle);
      return;
    }

    try {
      setError('');
      if (onRenameHabit) {
        await onRenameHabit(habitId, nextTitle);
      }
      setHabitTitle(nextTitle);
      setIsEditingTitle(false);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Unable to save right now. Please retry.';
      setError(message);
    }
  }

  async function saveValue(nextValue: boolean | number | string) {
    try {
      setError('');
      await onSave(habitId, nextValue);
      return true;
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Unable to save right now. Please retry.';
      setError(message);
      return false;
    }
  }

  function evaluateCounterCompletion(nextValue: number) {
    if (!configuredGoalOperator || configuredGoalValue === undefined) {
      return false;
    }

    if (configuredGoalOperator === 'gt') {
      return nextValue > configuredGoalValue;
    }

    if (configuredGoalOperator === 'lt') {
      return nextValue < configuredGoalValue;
    }

    return nextValue === configuredGoalValue;
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-paper px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                aria-label="Edit habit title"
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm outline-none"
              />
              <button type="button" onClick={saveTitle} className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper">
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitleDraft(habitTitle);
                  setIsEditingTitle(false);
                }}
                className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <p className={`min-w-0 break-words font-medium ${completed ? 'line-through opacity-70' : ''}`}>{habitTitle}</p>
              {onRenameHabit ? (
                <button type="button" onClick={() => setIsEditingTitle(true)} className="rounded-full bg-black/5 px-2 py-1 text-xs font-medium">
                  Edit
                </button>
              ) : null}
              {onDeleteHabit ? (
                <button
                  type="button"
                  onClick={() => void onDeleteHabit(habitId)}
                  className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                  aria-label={`Delete habit ${habitTitle}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          )}
          <p className="text-xs uppercase tracking-[0.25em] text-ink/40">
            {timeframe} • {trackingType}
          </p>
        </div>

        {trackingType === 'yesno' ? (
          <button
            type="button"
            onClick={async () => {
              const next = !completed;
              setCompleted(next);
              await saveValue(next);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium ${completed ? 'bg-sage' : 'bg-white'}`}
          >
            {completed ? 'Mark incomplete' : timeframe === 'weekly' ? 'Mark done this week' : 'Mark complete'}
          </button>
        ) : null}

        {trackingType === 'counter' ? (
          fallbackApplied ? (
            <div className="rounded-full bg-sage px-4 py-2 text-sm font-medium">Done (legacy value)</div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-ink/60">{renderGoalSummary()}</p>
              {isEditingGoal ? (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Edit counter goal operator"
                    value={goalOperatorDraft}
                    onChange={(event) => setGoalOperatorDraft(event.target.value as CounterGoalOperator)}
                    className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm"
                  >
                    <option value="gt">Greater than</option>
                    <option value="lt">Less than</option>
                    <option value="eq">Equal to</option>
                  </select>
                  <input
                    aria-label="Edit counter goal value"
                    value={goalValueDraft}
                    onChange={(event) => setGoalValueDraft(event.target.value)}
                    className="w-28 rounded-full border border-black/10 bg-white px-3 py-1 text-sm outline-none"
                    inputMode="numeric"
                  />
                  <button type="button" onClick={() => void saveCounterGoal()} className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper">
                    Save goal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGoalOperatorDraft(configuredGoalOperator ?? 'gt');
                      setGoalValueDraft(configuredGoalValue?.toString() ?? '');
                      setIsEditingGoal(false);
                    }}
                    className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(true)}
                  className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium"
                >
                  Edit goal
                </button>
              )}
              <div className="flex items-center gap-2">
                {!isSet ? (
                  <button
                    type="button"
                    aria-label="Decrease counter"
                    onClick={() => {
                      const parsed = Number(counterDraft);
                      const safeValue = Number.isFinite(parsed) ? parsed : 0;
                      setCounterDraft(String(safeValue - 1));
                    }}
                    className="rounded-full bg-white px-3 py-2 text-sm"
                  >
                    -
                  </button>
                ) : null}
                <input
                  aria-label={`${title} counter value`}
                  value={counterDraft}
                  onChange={(event) => setCounterDraft(event.target.value)}
                  className="w-28 rounded-full border border-black/10 bg-white px-3 py-2 text-sm outline-none"
                  inputMode="numeric"
                  disabled={isSet}
                />
                {!isSet ? (
                  <button
                    type="button"
                    aria-label="Increase counter"
                    onClick={() => {
                      const parsed = Number(counterDraft);
                      const safeValue = Number.isFinite(parsed) ? parsed : 0;
                      setCounterDraft(String(safeValue + 1));
                    }}
                    className="rounded-full bg-white px-3 py-2 text-sm"
                  >
                    +
                  </button>
                ) : null}
                {isSet ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (onClearEntry) {
                        try {
                          setError('');
                          await onClearEntry(habitId);
                        } catch (clearError) {
                          const message = clearError instanceof Error ? clearError.message : 'Unable to clear right now. Please retry.';
                          setError(message);
                          return;
                        }
                      }

                      setCompleted(false);
                      setIsSet(false);
                    }}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium"
                  >
                    Unset
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      const parsed = Number(counterDraft);
                      if (!Number.isInteger(parsed)) {
                        setError('Counter value must be an integer.');
                        return;
                      }

                      const saved = await saveValue(parsed);
                      if (!saved) {
                        return;
                      }

                      setCompleted(evaluateCounterCompletion(parsed));
                      setIsSet(true);
                    }}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium"
                  >
                    Set
                  </button>
                )}
              </div>
            </div>
          )
        ) : null}

        {trackingType === 'measurement' ? (
          isEditing ? (
            <input
              aria-label={title}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onBlur={async () => {
                setIsEditing(false);
                await saveValue(value);
              }}
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
      {fallbackApplied ? <p className="mt-2 text-xs text-ink/60">Historical fallback applied for incompatible legacy value.</p> : null}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
