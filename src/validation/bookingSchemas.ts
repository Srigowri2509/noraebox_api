import { z } from "zod";

/** Strict body for POST /bookings (unknown keys rejected). */
export const createBookingBodySchema = z
  .object({
    roomId: z
      .string({ required_error: "roomId is required" })
      .trim()
      .min(1, "roomId is required"),
    date: z.string().min(1, "date is required"),
    timeSlot: z
      .string({ required_error: "timeSlot is required" })
      .trim()
      .min(1, "timeSlot is required"),
  })
  .strict();

export type CreateBookingBody = z.infer<typeof createBookingBodySchema>;
