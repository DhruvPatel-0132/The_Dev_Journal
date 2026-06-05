import { z } from 'zod';

export const createArticleSchema = z.object({
  title: z.string().min(1, "Title is required").max(150, "Title is too long"),
  seoSlug: z.string().min(1, "SEO slug is required"),
  bannerImage: z.object({
    url: z.string().optional(),
    publicId: z.string().optional(),
  }).optional(),
  content: z.string().min(1, "Content is required"),
  summary: z.string().min(1, "Summary is required").max(500, "Summary cannot exceed 500 characters"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  seoKeywords: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export const updateArticleSchema = z.object({
  title: z.string().min(1, "Title is required").max(150, "Title is too long").optional(),
  seoSlug: z.string().min(1, "SEO slug is required").optional(),
  bannerImage: z.object({
    url: z.string().optional(),
    publicId: z.string().optional(),
  }).optional(),
  content: z.string().min(1, "Content is required").optional(),
  summary: z.string().min(1, "Summary is required").max(500, "Summary cannot exceed 500 characters").optional(),
  category: z.string().min(1, "Category is required").optional(),
  tags: z.array(z.string()).optional(),
  seoKeywords: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});
