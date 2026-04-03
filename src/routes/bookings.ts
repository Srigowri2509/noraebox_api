import { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const roomId = String(req.body?.roomId ?? "").trim();
    const dateRaw = req.body?.date;
    const timeSlot = String(req.body?.timeSlot ?? "").trim();

    if (!roomId || dateRaw == null || dateRaw === "" || !timeSlot) {
      res.status(400).json({ error: "roomId, date, and timeSlot are required" });
      return;
    }

    const date =
      typeof dateRaw === "string" ? new Date(dateRaw) : new Date(String(dateRaw));
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
        status: "pending",
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

export default router;
