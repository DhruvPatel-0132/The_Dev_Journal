import { Request, Response } from "express";
import { z } from "zod";
import { createArticleSchema, updateArticleSchema } from "../validators/article.validator";
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

// ─── Dashboard Stats ─────────────────────────
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - user is attached by the protectRoute middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Not authorized" });
      return;
    }

    const stats = await articleService.getDashboardStats(userId);

    res.status(200).json({ success: true, stats });
  } catch (error) {
    handleError(res, error, "Failed to fetch dashboard stats");
  }
};

// ─── My Articles ─────────────────────────────
export const getMyArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - user is attached by the protectRoute middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Not authorized" });
      return;
    }

    const { page, limit, status } = req.query;
    const result = await articleService.getMyArticles(userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string | undefined,
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    handleError(res, error, "Failed to fetch articles");
  }
};

// ─── Create Article ──────────────────────────
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

// ─── Update Article ──────────────────────────
export const updateArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = updateArticleSchema.parse(req.body);
    const { slug } = req.params;
    
    // @ts-ignore - user is attached by the protectRoute middleware
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: "Not authorized" });
      return;
    }

    const article = await articleService.updateArticle(slug as string, userId, validatedData);

    res.status(200).json({
      success: true,
      message: "Article updated successfully",
      article,
    });
  } catch (error) {
    handleError(res, error, "Failed to update article");
  }
};

// ─── All Published Articles ──────────────────
export const getAllArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search } = req.query;
    const result = await articleService.getAllPublishedArticles({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    handleError(res, error, "Failed to fetch articles");
  }
};

// ─── Get Single Article by Slug ──────────────
export const getArticleBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const ip = req.ip || req.socket.remoteAddress || '';
    const article = await articleService.getArticleBySlug(slug as string, ip);

    res.status(200).json({ success: true, article });
  } catch (error) {
    handleError(res, error, "Failed to fetch article");
  }
};

// ─── Get Article For Edit ────────────────────
export const getArticleForEdit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Not authorized" });
      return;
    }

    const article = await articleService.getArticleForEdit(slug as string, userId);

    res.status(200).json({ success: true, article });
  } catch (error) {
    handleError(res, error, "Failed to fetch article for edit");
  }
};

// ─── Toggle Like Article ─────────────────────
export const toggleLikeArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await articleService.toggleLikeArticle(slug as string, ip);

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    handleError(res, error, "Failed to toggle like");
  }
};

// ─── Toggle Dislike Article ──────────────────
export const toggleDislikeArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const ip = req.ip || req.socket.remoteAddress || '';
    const result = await articleService.toggleDislikeArticle(slug as string, ip);

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    handleError(res, error, "Failed to toggle dislike");
  }
};

// ─── Delete Article ──────────────────────────
export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Not authorized" });
      return;
    }

    await articleService.deleteArticle(slug as string, userId);

    res.status(200).json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    handleError(res, error, "Failed to delete article");
  }
};

// ─── Archive Article ─────────────────────────
export const archiveArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Not authorized" });
      return;
    }

    const article = await articleService.archiveArticle(slug as string, userId);

    res.status(200).json({
      success: true,
      message: "Article archived successfully",
      article,
    });
  } catch (error) {
    handleError(res, error, "Failed to archive article");
  }
};

