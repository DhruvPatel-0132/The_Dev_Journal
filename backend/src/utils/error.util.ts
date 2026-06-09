import { Response } from "express";
import { z } from "zod";
import { AppError } from "./AppError";

export const handleError = (res: Response, error: any, defaultMessage: string, context?: string) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ message: "Validation failed", issues: error.issues });
    return;
  }
  if (error instanceof AppError) {
    // Attach unverified flag so frontend can show resend option
    const extra = error.statusCode === 403 && error.message.includes("verify your email")
      ? { unverified: true }
      : {};
    res.status(error.statusCode).json({ success: false, message: error.message, ...extra });
    return;
  }
  console.error(`[${context || 'Controller'} Error] ${defaultMessage}:`, error);
  res.status(500).json({ success: false, message: defaultMessage });
};
