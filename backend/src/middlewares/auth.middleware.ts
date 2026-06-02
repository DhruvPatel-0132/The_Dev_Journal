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
    const decoded = jwt.verify(token, env.JWT_SECRET);
    // @ts-ignore
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};