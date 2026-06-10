import { Metadata } from "next";
import { articleApi } from "@/lib/api";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL 
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  try {
    const resolvedParams = await params;
    const res = await articleApi.getArticleBySlug(resolvedParams.slug);
    const article = res.article;
    const canonicalUrl = `${APP_URL}/blog/${article.seoSlug || resolvedParams.slug}`;

    return {
      title: `${article.title} | The Dev Journal`,
      description: article.summary || (article.content ? article.content.replace(/<[^>]*>?/gm, '').substring(0, 160) : ""),
      keywords: article.seoKeywords?.length ? article.seoKeywords : (article.tags || []),
      authors: article.author?.name ? [{ name: article.author.name }] : undefined,
      category: article.category,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: article.title,
        description: article.summary || (article.content ? article.content.replace(/<[^>]*>?/gm, '').substring(0, 160) : ""),
        url: canonicalUrl,
        siteName: 'The Dev Journal',
        images: article.bannerImage?.url ? [
          {
            url: article.bannerImage.url,
            alt: article.title,
          }
        ] : [],
        type: 'article',
        publishedTime: article.publishedAt,
        modifiedTime: article.updatedAt,
        authors: article.author?.name ? [article.author.name] : [],
        tags: article.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.summary || (article.content ? article.content.replace(/<[^>]*>?/gm, '').substring(0, 160) : ""),
        images: article.bannerImage?.url ? [article.bannerImage.url] : [],
      }
    };
  } catch (error) {
    return {
      title: "Article Not Found | The Dev Journal",
    };
  }
}

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
