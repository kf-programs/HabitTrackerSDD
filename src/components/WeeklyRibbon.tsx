export function WeeklyRibbon() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-10 min-w-14 rounded-xl bg-sage/80" />
      ))}
    </div>
  );
}
