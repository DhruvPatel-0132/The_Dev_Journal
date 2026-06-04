import { Request, Response } from "express";
import { z } from "zod";
import { createArticleSchema } from "../validators/article.validator";
import * as articleService from "../services/article.service";
import { AppError } from "../utils/AppError";

const handleError = (res: Response, error: any, defaultMessage: string) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ message: "Validation failed", issues: error.issues });
    return;
  }
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  console.error(`[Article Controller Error] ${defaultMessage}:`, error);
  res.status(500).json({ success: false, message: defaultMessage });
};

export const createArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createArticleSchema.parse(req.body);
    
    // @ts-ignore - user is attached by the protectRoute middleware
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: "Not authorized" });
      return;
    }

    const article = await articleService.createArticle(userId, validatedData);

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      article,
    });
  } catch (error) {
    handleError(res, error, "Failed to create article");
  }
};
