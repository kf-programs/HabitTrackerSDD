import { Link, useNavigate } from 'react-router-dom';
import type { RoutineRecord } from '../db/schema';

interface DashboardViewProps {
  routines: RoutineRecord[];
}

export function DashboardView({ routines }: DashboardViewProps) {
  const navigate = useNavigate();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const activeRoutines = routines.filter((routine) => routine.status === 'active');
  const recentRoutines = [...activeRoutines]
    .sort((a, b) => Date.parse(b.lastAccessedAt) - Date.parse(a.lastAccessedAt))
    .slice(0, 3);

  function handleCreateRoutine() {
    navigate('/routines/new');
  }

  return (
    <section className="space-y-6">
      <header className="md:mt-32 text-center">
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{greeting}</h1>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          A calm place to return to your routines without streak anxiety or noise.
        </p>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          Create routines, customize habits that work for you, and share with others who could benefit as well. 
        </p>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          No accounts. No pressure. No competition. Just your routines, your way. 
        </p>
      </header>

      {recentRoutines.length > 0 && (
        <div className="rounded-3xl bg-white/80 p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Recent routines</h2>
          <div className="mt-3 space-y-2">
            {recentRoutines.map((routine) => (
              <Link
                key={routine.id}
                to={`/routines/${routine.id}`}
                className="flex items-center justify-between rounded-2xl bg-paper px-4 py-3 text-sm hover:bg-white"
              >
                <span className="font-medium">{routine.title}</span>
                <span className="text-ink/55">Open</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className={`rounded-3xl p-6 border border-dashed border-ink/10 bg-white/60`}>
        <h2 className="text-lg font-semibold">{recentRoutines.length === 0 ? 'Create your first routine' : 'Start a new routine'}</h2>
        <p className="mt-2 text-sm text-ink/65">
          {recentRoutines.length === 0
            ? 'No active routines yet. Begin with a gentle ritual that fits your day.'
            : 'A new routine can be a simple step towards a more mindful day.'}
        </p>
        <button
          type="button"
          onClick={() => void handleCreateRoutine()}
          className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper"
        >
          {recentRoutines.length === 0 ? 'Create your first routine' : 'Create routine'}
        </button>
      </div>
    </section>
  );
}
