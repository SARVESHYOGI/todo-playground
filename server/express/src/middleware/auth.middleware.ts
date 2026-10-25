import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/token.ts";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  const result = verifyToken(token);
  if (!result) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  req.userId = result.userId;
  next();
}
