/**
 * Use before DELETE/PATCH /bookings/:id so users cannot act on others' bookings.
 */
export class ForbiddenError extends Error {
  readonly statusCode = 403 as const;

  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function bookingBelongsToUser(
  bookingUserId: string,
  requestUserId: string
): boolean {
  return bookingUserId === requestUserId;
}

export function assertBookingOwnedBy(
  booking: { userId: string },
  requestUserId: string
): void {
  if (!bookingBelongsToUser(booking.userId, requestUserId)) {
    throw new ForbiddenError();
  }
}
