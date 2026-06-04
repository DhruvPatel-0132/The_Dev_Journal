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

    const newArticle = new Article({
      ...articleData,
      author: userId,
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
