import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const protectRoute = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.accessToken;

  if (!token) {
    res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};

/**
 * Must be used AFTER `protectRoute`.
 * Rejects authenticated users who are not creators (role !== "creator").
 */
export const creatorOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const role = req.user?.role;

  if (role !== "creator") {
    res.status(403).json({
      success: false,
      message: "Access denied. This action requires a creator account.",
    });
    return;
  }

  next();
};