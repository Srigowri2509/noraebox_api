import { z } from "zod";

export const bookingIdParamSchema = z.object({
  id: z.string().uuid("Invalid booking id"),
});
