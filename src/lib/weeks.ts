// Week math for the reports calendar. All in UTC to match how weekStart is
// stored (UTC-midnight Monday), so calendar keys line up with DB rows.

export function startOfWeekMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getUTCDay() || 7; // Sunday(0) → 7
  if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1));
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

// Most-recent first: [thisWeekMonday, lastWeekMonday, ...].
export function lastNWeeks(n: number): Date[] {
  const thisMonday = startOfWeekMonday(new Date());
  const out: Date[] = [];
  for (let i = 0; i < n; i++) {
    out.push(new Date(thisMonday.getTime() - i * 7 * 86_400_000));
  }
  return out;
}

export function weekKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
