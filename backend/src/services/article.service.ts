import mongoose from "mongoose";
import Article, { IArticle } from "../models/Article";
import Profile from "../models/Profile";
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

interface UpdateArticleData {
  title?: string;
  seoSlug?: string;
  bannerImage?: {
    url?: string;
    publicId?: string;
  };
  content?: string;
  summary?: string;
  category?: string;
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

// ─── Update Article ──────────────────────────
export const updateArticle = async (
  slug: string,
  userId: string,
  articleData: UpdateArticleData
): Promise<IArticle> => {
  const article = await Article.findOne({ seoSlug: slug });
  if (!article) {
    throw new AppError("Article not found", 404);
  }
  if (article.author.toString() !== userId) {
    throw new AppError("Not authorized to update this article", 403);
  }

  // If slug is being updated, check if it's already taken
  if (articleData.seoSlug && articleData.seoSlug !== slug) {
    const existingArticle = await Article.findOne({ seoSlug: articleData.seoSlug });
    if (existingArticle) {
      throw new AppError("An article with this SEO slug already exists", 400);
    }
  }

  // If publishing for the first time
  if (articleData.status === 'published' && !article.publishedAt) {
    (articleData as any).publishedAt = new Date();
  }

  if (articleData.content) {
    (articleData as any).readTime = calculateReadTime(articleData.content);
  }

  Object.assign(article, articleData);

  const updatedArticle = await article.save();
  return updatedArticle;
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

// ─── All Published Articles (paginated) ──────
export const getAllPublishedArticles = async (
  options: { page?: number; limit?: number; search?: string; category?: string; tag?: string }
) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const filter: any = { status: "published" };
  
  if (options.search) {
    const searchRegex = new RegExp(options.search, 'i');
    filter.$or = [
      { title: searchRegex },
      { summary: searchRegex },
      { tags: { $in: [searchRegex] } },
      { category: searchRegex }
    ];
  }

  if (options.category) {
    const safeCategory = options.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.category = new RegExp(`^${safeCategory}$`, 'i');
  }

  if (options.tag) {
    const safeTag = options.tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.tags = new RegExp(`^${safeTag}$`, 'i');
  }

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("title seoSlug summary category tags viewCount likeCount readTime publishedAt bannerImage author")
      .lean(),
    Article.countDocuments(filter),
  ]);

  const authorIds = articles.map(a => a.author);
  const profiles = await Profile.find({ user: { $in: authorIds } }).lean();
  const profileMap = profiles.reduce((acc: any, p: any) => {
    acc[p.user.toString()] = p;
    return acc;
  }, {});

  const populatedArticles = articles.map((a: any) => ({
    ...a,
    author: profileMap[a.author.toString()] || { name: 'Unknown Author', role: 'visitor' }
  }));

  return {
    articles: populatedArticles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─── Get Categories ──────────────────────────
export const getCategories = async () => {
  const categories = await Article.aggregate([
    { $match: { status: "published" } },
    { $group: { _id: { $toLower: "$category" }, original: { $first: "$category" }, count: { $sum: 1 } } },
    { $project: { _id: 0, name: "$original", count: 1 } },
    { $sort: { count: -1 } }
  ]);
  return categories;
};

// ─── Get Tags ────────────────────────────────
export const getTags = async () => {
  const tags = await Article.aggregate([
    { $match: { status: "published" } },
    { $unwind: "$tags" },
    { $group: { _id: { $toLower: "$tags" }, original: { $first: "$tags" }, count: { $sum: 1 } } },
    { $project: { _id: 0, name: "$original", count: 1 } },
    { $sort: { count: -1 } }
  ]);
  return tags;
};

// ─── Get Single Article by Slug ──────────────
export const getArticleBySlug = async (slug: string, ip: string) => {
  const article = await Article.findOne({ seoSlug: slug, status: "published" }).select("-__v");
    
  if (!article) {
    throw new AppError("Article not found", 404);
  }

  const authorProfile = await Profile.findOne({ user: article.author }).lean();

  // Increment view count if not already viewed by this IP
  if (ip && !article.viewedIps.includes(ip)) {
    article.viewedIps.push(ip);
    article.viewCount += 1;
    await article.save();
  }

  const articleObj = article.toObject() as any;
  articleObj.author = authorProfile || { name: 'Unknown Author', role: 'visitor' };

  if (ip) {
    if (article.likedIps.includes(ip)) {
      articleObj.userAction = 'liked';
    } else if (article.dislikedIps.includes(ip)) {
      articleObj.userAction = 'disliked';
    } else {
      articleObj.userAction = 'none';
    }
  } else {
    articleObj.userAction = 'none';
  }

  // Do not leak IPs to frontend
  delete articleObj.viewedIps;
  delete articleObj.likedIps;
  delete articleObj.dislikedIps;

  return articleObj;
};

// ─── Get Single Article For Edit ──────────────
export const getArticleForEdit = async (slug: string, userId: string) => {
  const article = await Article.findOne({ seoSlug: slug }).select("-__v");
    
  if (!article) {
    throw new AppError("Article not found", 404);
  }

  if (article.author.toString() !== userId) {
    throw new AppError("Not authorized to edit this article", 403);
  }

  return article;
};

// ─── Toggle Like Article ─────────────────────
export const toggleLikeArticle = async (slug: string, ip: string) => {
  const article = await Article.findOne({ seoSlug: slug, status: "published" });
  if (!article) {
    throw new AppError("Article not found", 404);
  }

  if (article.likedIps.includes(ip)) {
    // Remove like
    article.likedIps = article.likedIps.filter(i => i !== ip);
    article.likeCount = Math.max(0, article.likeCount - 1);
  } else {
    // Add like
    article.likedIps.push(ip);
    article.likeCount += 1;
    // Remove dislike if it exists
    if (article.dislikedIps.includes(ip)) {
      article.dislikedIps = article.dislikedIps.filter(i => i !== ip);
      article.dislikeCount = Math.max(0, article.dislikeCount - 1);
    }
  }

  await article.save();
  return { likeCount: article.likeCount, dislikeCount: article.dislikeCount, userAction: article.likedIps.includes(ip) ? 'liked' : 'none' };
};

// ─── Toggle Dislike Article ──────────────────
export const toggleDislikeArticle = async (slug: string, ip: string) => {
  const article = await Article.findOne({ seoSlug: slug, status: "published" });
  if (!article) {
    throw new AppError("Article not found", 404);
  }

  if (article.dislikedIps.includes(ip)) {
    // Remove dislike
    article.dislikedIps = article.dislikedIps.filter(i => i !== ip);
    article.dislikeCount = Math.max(0, article.dislikeCount - 1);
  } else {
    // Add dislike
    article.dislikedIps.push(ip);
    article.dislikeCount += 1;
    // Remove like if it exists
    if (article.likedIps.includes(ip)) {
      article.likedIps = article.likedIps.filter(i => i !== ip);
      article.likeCount = Math.max(0, article.likeCount - 1);
    }
  }

  await article.save();
  return { likeCount: article.likeCount, dislikeCount: article.dislikeCount, userAction: article.dislikedIps.includes(ip) ? 'disliked' : 'none' };
};

// ─── Delete Article ──────────────────────────
export const deleteArticle = async (slug: string, userId: string): Promise<void> => {
  const article = await Article.findOne({ seoSlug: slug });

  if (!article) {
    throw new AppError("Article not found", 404);
  }

  if (article.author.toString() !== userId) {
    throw new AppError("Not authorized to delete this article", 403);
  }

  await article.deleteOne();
};

// ─── Archive Article ─────────────────────────
export const archiveArticle = async (slug: string, userId: string): Promise<IArticle> => {
  const article = await Article.findOne({ seoSlug: slug });

  if (!article) {
    throw new AppError("Article not found", 404);
  }

  if (article.author.toString() !== userId) {
    throw new AppError("Not authorized to archive this article", 403);
  }

  if (article.status === "archived") {
    throw new AppError("Article is already archived", 400);
  }

  article.status = "archived";
  await article.save();
  return article;
};
