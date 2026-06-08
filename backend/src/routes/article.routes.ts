import { Router } from "express";
import { createArticle, getDashboardStats, getMyArticles, getAllArticles, getArticleBySlug, toggleLikeArticle, toggleDislikeArticle, updateArticle, getArticleForEdit, deleteArticle, archiveArticle } from "../controllers/article.controller";
import { protectRoute, creatorOnly } from "../middlewares/auth.middleware";

const router = Router();

// Dashboard stats (aggregated counts & views) — creators only
router.get("/dashboard-stats", protectRoute, creatorOnly, getDashboardStats);

// My articles (paginated, filterable by status) — creators only
router.get("/my-articles", protectRoute, creatorOnly, getMyArticles);

// Get all published articles (feed) — public
router.get("/", getAllArticles);

// Get article for edit — creators only
router.get("/edit/:slug", protectRoute, creatorOnly, getArticleForEdit);

// Get article by slug — public
router.get("/slug/:slug", getArticleBySlug);

// Toggle like — public
router.post("/slug/:slug/like", toggleLikeArticle);

// Toggle dislike — public
router.post("/slug/:slug/dislike", toggleDislikeArticle);

// Create an article — creators only
router.post("/", protectRoute, creatorOnly, createArticle);

// Update an article — creators only
router.put("/slug/:slug", protectRoute, creatorOnly, updateArticle);

// Delete an article — creators only (permanent)
router.delete("/slug/:slug", protectRoute, creatorOnly, deleteArticle);

// Archive an article — creators only
router.patch("/slug/:slug/archive", protectRoute, creatorOnly, archiveArticle);

export default router;
