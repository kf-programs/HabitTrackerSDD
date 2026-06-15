function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getDayKey(date = new Date()) {
  return formatLocalDate(date);
}

export function getWeekKey(date = new Date()) {
  const local = new Date(date);
  const day = local.getDay();
  const diffToSunday = day;
  local.setDate(local.getDate() - diffToSunday);
  return `${formatLocalDate(local)}-SUN`;
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

export function getRollingWeekKeys(count: number, today = new Date()) {
  const keys: string[] = [];
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);

  for (let index = count - 1; index >= 0; index -= 1) {
    const weekDate = new Date(cursor);
    weekDate.setDate(cursor.getDate() - index * 7);
    keys.push(getWeekKey(weekDate));
  }

  return keys;
}

export function parseDayKey(dayKey: string) {
  return new Date(`${dayKey}T12:00:00`);
}

export function shiftDayKey(dayKey: string, offsetDays: number) {
  const date = parseDayKey(dayKey);
  date.setDate(date.getDate() + offsetDays);
  return getDayKey(date);
}

export function compareDayKeys(a: string, b: string) {
  return parseDayKey(a).getTime() - parseDayKey(b).getTime();
}
