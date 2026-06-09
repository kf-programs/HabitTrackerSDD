export function getDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getWeekKey(date = new Date()) {
  const local = new Date(date);
  const day = local.getDay();
  const diffToSunday = day;
  local.setDate(local.getDate() - diffToSunday);
  return `${local.toISOString().slice(0, 10)}-SUN`;
}

export function getRollingDayKeys(count: number, today = new Date()) {
  const keys: string[] = [];
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);

  for (let index = count - 1; index >= 0; index -= 1) {
    const day = new Date(cursor);
    day.setDate(cursor.getDate() - index);
    keys.push(getDayKey(day));
  }

  return keys;
}
