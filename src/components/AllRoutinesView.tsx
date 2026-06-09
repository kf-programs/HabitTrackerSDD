import { Link } from 'react-router-dom';

export function AllRoutinesView() {
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
            <span className="rounded-full bg-sage px-3 py-1 text-xs font-medium">1</span>
          </div>
          <Link to="/routines/morning" className="mt-4 inline-flex text-sm font-medium text-ink/75 underline-offset-4 hover:underline">
            Open example workspace
          </Link>
        </article>

        <article className="rounded-3xl bg-white/60 p-5 shadow-soft opacity-85">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Paused routines</h2>
              <p className="text-sm text-ink/60">Softened to signal they are on hold.</p>
            </div>
            <span className="rounded-full bg-blush px-3 py-1 text-xs font-medium">0</span>
          </div>
        </article>
      </div>
    </section>
  );
}
