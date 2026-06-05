import { Metadata } from "next";
import { articleApi } from "@/lib/api";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const res = await articleApi.getArticleBySlug(resolvedParams.slug);
    const article = res.article;

    return {
      title: `${article.title} | The Dev Journal`,
      description: article.summary || (article.content ? article.content.replace(/<[^>]*>?/gm, '').substring(0, 160) : ""),
      keywords: article.seoKeywords?.length ? article.seoKeywords : (article.tags || []),
      authors: article.author?.name ? [{ name: article.author.name }] : undefined,
      category: article.category,
      openGraph: {
        title: article.title,
        description: article.summary || (article.content ? article.content.replace(/<[^>]*>?/gm, '').substring(0, 160) : ""),
        url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/blog/${article.seoSlug || resolvedParams.slug}`,
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
