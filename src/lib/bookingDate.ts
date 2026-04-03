/**
 * Calendar day in UTC only (00:00:00.000Z).
 * Same local calendar day must always map to one DB value for @@unique([roomId, date, timeSlot]).
 */
export function normalizeBookingDateUtc(input: string | Date): Date {
  const d =
    typeof input === "string"
      ? new Date(input)
      : new Date(input.getTime());
  if (Number.isNaN(d.getTime())) {
    return d;
  }
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
