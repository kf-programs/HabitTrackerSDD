import { NavLink, matchPath, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { getRoutineById } from '../repositories/routinesRepository';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-ink text-paper shadow-soft' : 'text-ink/70 hover:bg-black/5',
  ].join(' ');

export function BottomNavBar() {
  const location = useLocation();
  const routineMatch = matchPath('/routines/:routineId', location.pathname);
  const routineId = routineMatch?.params.routineId;

  const routine = useLiveQuery(async () => {
    if (!routineId) return null;
    return getRoutineById(routineId);
  }, [routineId]);

  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 border-t border-black/5 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className={linkClass} aria-label="Home view" end>
          Home
        </NavLink>
        {routine ? (
          <NavLink to={`/routines/${routine.id}`} className={linkClass} aria-label={routine.title}>
            {routine.title}
          </NavLink>
        ) : (
          <NavLink to="/routines" className={linkClass} aria-label="All routines view">
            All Routines
          </NavLink>
        )}
      </div>
    </nav>
  );
}
