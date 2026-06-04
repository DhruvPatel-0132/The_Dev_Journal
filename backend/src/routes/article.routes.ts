import { Router } from "express";
import { createArticle } from "../controllers/article.controller";
import { protectRoute } from "../middlewares/auth.middleware";

const router = Router();

// Create an article
router.post("/", protectRoute, createArticle);

export default router;
