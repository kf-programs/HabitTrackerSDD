import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils';
import { screen, waitFor } from '@testing-library/react';
import { HabitRow } from '../../components/HabitRow';
import type { CounterGoalOperator } from '../../db/schema';

function CounterHabitFixture({
  goalOperator,
  goalValue,
  initialValue = 0,
  initialCompleted = false,
  initialHasEntry = false,
}: {
  goalOperator: CounterGoalOperator;
  goalValue: number;
  initialValue?: number;
  initialCompleted?: boolean;
  initialHasEntry?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [completed, setCompleted] = useState(initialCompleted);
  const [hasEntry, setHasEntry] = useState(initialHasEntry);

  return (
    <HabitRow
      habitId="habit-counter"
      title="Steps"
      trackingType="counter"
      timeframe="daily"
      initialInteger={value}
      initialBoolean={completed}
      counterGoalOperator={goalOperator}
      counterGoalValue={goalValue}
      onSave={async (_, nextValue) => {
        const next = Number(nextValue);
        setValue(next);
        setCompleted(goalOperator === 'gt' ? next > goalValue : goalOperator === 'lt' ? next < goalValue : next === goalValue);
        setHasEntry(true);
      }}
      hasEntry={hasEntry}
      onClearEntry={async () => {
        setHasEntry(false);
        setCompleted(false);
      }}
      onUpdateCounterGoal={async () => undefined}
    />
  );
}

describe('HabitRow counter goals', () => {
  it('renders and edits a configured counter goal', async () => {
    const user = userEvent.setup();
    const onUpdateCounterGoal = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <HabitRow
        habitId="habit-counter"
        title="Steps"
        trackingType="counter"
        timeframe="daily"
        initialInteger={0}
        counterGoalOperator="gt"
        counterGoalValue={8}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onUpdateCounterGoal={onUpdateCounterGoal}
      />,
    );

    expect(screen.getByText('Goal: > 8')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit goal' }));
    await user.clear(screen.getByLabelText('Edit counter goal value'));
    await user.type(screen.getByLabelText('Edit counter goal value'), '10');
    await user.click(screen.getByRole('button', { name: 'Save goal' }));

    await waitFor(() => {
      expect(onUpdateCounterGoal).toHaveBeenCalledWith('habit-counter', 'gt', 10);
    });
    expect(screen.getByText('Goal: > 10')).toBeInTheDocument();
  });

  it('rejects decimal counter goal values when editing', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <HabitRow
        habitId="habit-counter"
        title="Steps"
        trackingType="counter"
        timeframe="daily"
        initialInteger={0}
        counterGoalOperator="gt"
        counterGoalValue={8}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onUpdateCounterGoal={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit goal' }));
    await user.clear(screen.getByLabelText('Edit counter goal value'));
    await user.type(screen.getByLabelText('Edit counter goal value'), '10.5');
    await user.click(screen.getByRole('button', { name: 'Save goal' }));

    expect(await screen.findByText('Counter goal must be an integer.')).toBeInTheDocument();
  });

  it('sets counter values and reflects completion for configured goals', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CounterHabitFixture goalOperator="gt" goalValue={2} initialValue={0} initialCompleted={false} />,
    );

    await user.clear(screen.getByLabelText('Steps counter value'));
    await user.type(screen.getByLabelText('Steps counter value'), '3');
    await user.click(screen.getByRole('button', { name: 'Set' }));

    await waitFor(() => {
      expect(screen.getByText('Steps')).toHaveClass('line-through');
    });
  });

  it('locks input and shows Unset after Set', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CounterHabitFixture goalOperator="gt" goalValue={2} initialValue={0} initialCompleted={false} />,
    );

    await user.clear(screen.getByLabelText('Steps counter value'));
    await user.type(screen.getByLabelText('Steps counter value'), '3');
    await user.click(screen.getByRole('button', { name: 'Set' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Unset' })).toBeInTheDocument();
      expect(screen.getByLabelText('Steps counter value')).toBeDisabled();
    });
  });

  it('unset clears completion and unlocks counter input', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CounterHabitFixture goalOperator="gt" goalValue={2} initialValue={3} initialCompleted initialHasEntry />,
    );

    expect(screen.getByText('Steps')).toHaveClass('line-through');
    expect(screen.getByRole('button', { name: 'Unset' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Unset' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Set' })).toBeInTheDocument();
      expect(screen.getByLabelText('Steps counter value')).not.toBeDisabled();
      expect(screen.getByText('Steps')).not.toHaveClass('line-through');
    });
  });

  it('adjusts counter draft with increase and decrease buttons while unset', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CounterHabitFixture goalOperator="gt" goalValue={5} initialValue={0} initialCompleted={false} />,
    );

    await user.click(screen.getByRole('button', { name: 'Increase counter' }));
    await user.click(screen.getByRole('button', { name: 'Increase counter' }));
    await user.click(screen.getByRole('button', { name: 'Decrease counter' }));

    expect(screen.getByLabelText('Steps counter value')).toHaveValue('1');
  });

  it('hides increase and decrease buttons in set state', () => {
    renderWithProviders(
      <CounterHabitFixture goalOperator="gt" goalValue={2} initialValue={3} initialCompleted initialHasEntry />,
    );

    expect(screen.queryByRole('button', { name: 'Increase counter' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Decrease counter' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unset' })).toBeInTheDocument();
  });
});