export function DailyGrid() {
  return (
    <div className="grid grid-cols-10 gap-2 sm:grid-cols-12">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="aspect-square rounded-xl bg-blush/70" />
      ))}
    </div>
  );
}
