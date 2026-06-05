import mongoose, { Document, Schema } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  seoSlug: string;
  bannerImage: {
    url: string;
    publicId: string;
  };
  content: string;
  summary: string;
  category: string;
  tags: string[];
  seoKeywords: string[];
  author: mongoose.Types.ObjectId;
  readTime: number;
  viewCount: number;
  viewedIps: string[];
  likeCount: number;
  likedIps: string[];
  dislikeCount: number;
  dislikedIps: string[];
  isFeatured: boolean;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    seoSlug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bannerImage: {
      url: String,
      publicId: String,
    },
    content: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
      maxlength: 500,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    seoKeywords: [String],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    readTime: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    viewedIps: {
      type: [String],
      default: [],
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    likedIps: {
      type: [String],
      default: [],
    },
    dislikeCount: {
      type: Number,
      default: 0,
    },
    dislikedIps: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: Date,
  },
  {
    timestamps: true,
  }
);

articleSchema.index({
  title: 'text',
  summary: 'text',
  tags: 'text',
});

articleSchema.index({ seoSlug: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ publishedAt: -1 });

const Article = mongoose.model<IArticle>('Article', articleSchema);

export default Article;
