import { Link } from 'react-router-dom';

export function DashboardView() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-white/75 p-6 shadow-soft backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-ink/50">Home</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{greeting}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-ink/70">
          A calm place to return to your routines without streak pressure or noise.
        </p>
      </header>

      <div className="rounded-3xl border border-dashed border-ink/10 bg-white/60 p-6">
        <h2 className="text-lg font-semibold">Create your first routine</h2>
        <p className="mt-2 text-sm text-ink/65">
          No routines yet. Begin with a gentle ritual that fits your day.
        </p>
        <Link
          to="/routines"
          className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper"
        >
          Go to All Routines
        </Link>
      </div>
    </section>
  );
}
