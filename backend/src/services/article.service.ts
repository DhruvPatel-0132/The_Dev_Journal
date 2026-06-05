import mongoose from "mongoose";
import Article, { IArticle } from "../models/Article";
import { AppError } from "../utils/AppError";

interface CreateArticleData {
  title: string;
  seoSlug: string;
  bannerImage?: {
    url?: string;
    publicId?: string;
  };
  content: string;
  summary: string;
  category: string;
  tags?: string[];
  seoKeywords?: string[];
  status?: 'draft' | 'published' | 'archived';
}

const calculateReadTime = (content: string): number => {
  if (!content) return 1;
  const wordsPerMinute = 225; // Average reading speed
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

export const createArticle = async (
  userId: string,
  articleData: CreateArticleData
): Promise<IArticle> => {
  try {
    // Check if slug is already taken
    const existingArticle = await Article.findOne({ seoSlug: articleData.seoSlug });
    if (existingArticle) {
      throw new AppError("An article with this SEO slug already exists", 400);
    }

    const readTime = calculateReadTime(articleData.content);

    const newArticle = new Article({
      ...articleData,
      author: userId,
      readTime,
      publishedAt: articleData.status === 'published' ? new Date() : undefined,
    });

    const savedArticle = await newArticle.save();
    return savedArticle;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error creating article:", error);
    throw new AppError("Failed to create article", 500);
  }
};

// ─── Dashboard Stats ─────────────────────────
export const getDashboardStats = async (userId: string) => {
  const [totalArticles, publishedArticles, draftArticles, viewsAgg] = await Promise.all([
    Article.countDocuments({ author: userId }),
    Article.countDocuments({ author: userId, status: "published" }),
    Article.countDocuments({ author: userId, status: "draft" }),
    Article.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalViews: { $sum: "$viewCount" }, totalLikes: { $sum: "$likeCount" } } },
    ]),
  ]);

  const totals = viewsAgg[0] || { totalViews: 0, totalLikes: 0 };

  return {
    totalViews: totals.totalViews,
    totalLikes: totals.totalLikes,
    totalArticles,
    publishedArticles,
    draftArticles,
  };
};

// ─── My Articles (paginated) ─────────────────
export const getMyArticles = async (
  userId: string,
  options: { page?: number; limit?: number; status?: string }
) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const filter: any = { author: userId };
  if (options.status && ["draft", "published", "archived"].includes(options.status)) {
    filter.status = options.status;
  }

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("title seoSlug summary category status viewCount likeCount readTime publishedAt createdAt updatedAt"),
    Article.countDocuments(filter),
  ]);

  return {
    articles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
