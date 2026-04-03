import { BookingStatus, Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../db";
import { normalizeBookingDateUtc } from "../lib/bookingDate";
import { assertBookingOwnedBy, ForbiddenError } from "../lib/bookingOwnership";
import { requireAuth } from "../middleware/requireAuth";
import { bookingIdParamSchema } from "../validation/bookingParams";
import { createBookingBodySchema } from "../validation/bookingSchemas";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = createBookingBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
      return;
    }

    const { roomId, date: dateInput, timeSlot } = parsed.data;
    const userId = req.user!.id;

    const date = normalizeBookingDateUtc(dateInput);
    if (Number.isNaN(date.getTime())) {
      res.status(400).json({ error: "Invalid date" });
      return;
    }

    const clash = await prisma.booking.findFirst({
      where: { roomId, date, timeSlot },
      select: { id: true },
    });
    if (clash) {
      res.status(400).json({ error: "Slot already booked" });
      return;
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        roomId,
        date,
        timeSlot,
        status: BookingStatus.pending,
      },
    });

    res.status(201).json(booking);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      res.status(400).json({ error: "Slot already booked" });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
    });
    res.json(bookings);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const params = bookingIdParamSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({
        error: "Validation failed",
        details: params.error.flatten(),
      });
      return;
    }

    const { id } = params.data;
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    assertBookingOwnedBy(booking, req.user!.id);

    await prisma.booking.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    if (e instanceof ForbiddenError) {
      res.status(e.statusCode).json({ error: e.message });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
