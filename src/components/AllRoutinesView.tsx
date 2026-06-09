import { Link } from 'react-router-dom';
import { updateRoutine } from '../repositories/routinesRepository';
import type { RoutineRecord } from '../db/schema';

interface AllRoutinesViewProps {
  routines: RoutineRecord[];
}

export function AllRoutinesView({ routines }: AllRoutinesViewProps) {
  const activeRoutines = routines.filter((routine) => routine.status === 'active');
  const pausedRoutines = routines.filter((routine) => routine.status === 'paused');

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-ink/50">All Routines</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Routine Directory</h1>
      </header>

      <div className="space-y-4">
        <article className="rounded-3xl bg-white/80 p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Active routines</h2>
              <p className="text-sm text-ink/60">Currently available and shown first.</p>
            </div>
            <span className="rounded-full bg-sage px-3 py-1 text-xs font-medium">{activeRoutines.length}</span>
          </div>
          <div className="mt-4 space-y-2">
            {activeRoutines.map((routine) => (
              <div key={routine.id} className="flex items-center justify-between gap-2 rounded-2xl bg-paper px-4 py-3">
                <Link to={`/routines/${routine.id}`} className="text-sm font-medium text-ink/80 underline-offset-4 hover:underline">
                  {routine.title}
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await updateRoutine(routine.id, { status: 'paused' });
                  }}
                  className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium"
                >
                  Pause
                </button>
              </div>
            ))}
            {activeRoutines.length === 0 ? <p className="text-sm text-ink/55">No active routines yet.</p> : null}
          </div>
        </article>

        <article className="rounded-3xl bg-white/60 p-5 shadow-soft opacity-85">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Paused routines</h2>
              <p className="text-sm text-ink/60">Softened to signal they are on hold.</p>
            </div>
            <span className="rounded-full bg-blush px-3 py-1 text-xs font-medium">{pausedRoutines.length}</span>
          </div>
          <div className="mt-4 space-y-2">
            {pausedRoutines.map((routine) => (
              <div key={routine.id} className="flex items-center justify-between gap-2 rounded-2xl bg-paper px-4 py-3">
                <Link to={`/routines/${routine.id}`} className="text-sm font-medium text-ink/80 underline-offset-4 hover:underline">
                  {routine.title}
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await updateRoutine(routine.id, { status: 'active' });
                  }}
                  className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium"
                >
                  Resume
                </button>
              </div>
            ))}
            {pausedRoutines.length === 0 ? <p className="text-sm text-ink/55">No paused routines.</p> : null}
          </div>
        </article>
      </div>
    </section>
  );
}
