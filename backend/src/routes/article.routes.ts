import { Router } from "express";
import { createArticle, getDashboardStats, getMyArticles, getAllArticles, getArticleBySlug, toggleLikeArticle, toggleDislikeArticle, updateArticle, getArticleForEdit } from "../controllers/article.controller";
import { protectRoute } from "../middlewares/auth.middleware";

const router = Router();

// Dashboard stats (aggregated counts & views)
router.get("/dashboard-stats", protectRoute, getDashboardStats);

// My articles (paginated, filterable by status)
router.get("/my-articles", protectRoute, getMyArticles);

// Get all published articles (feed)
router.get("/", getAllArticles);

// Get article for edit
router.get("/edit/:slug", protectRoute, getArticleForEdit);

// Get article by slug
router.get("/slug/:slug", getArticleBySlug);

// Toggle like
router.post("/slug/:slug/like", toggleLikeArticle);

// Toggle dislike
router.post("/slug/:slug/dislike", toggleDislikeArticle);

// Create an article
router.post("/", protectRoute, createArticle);

// Update an article
router.put("/slug/:slug", protectRoute, updateArticle);

export default router;
