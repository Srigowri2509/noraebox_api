import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";

/**
 * Requires `Authorization: Bearer <jwt>`.
 * JWT must include `sub` (user id). Sets `req.user = { id, email? }`.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const userId = typeof decoded.sub === "string" ? decoded.sub : undefined;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const email = typeof decoded.email === "string" ? decoded.email : undefined;
    req.user = { id: userId, email };
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}
