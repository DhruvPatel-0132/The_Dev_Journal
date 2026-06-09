import { notFound } from "next/navigation";
import ArticleContent from "./ArticleContent";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getArticle(slug: string) {
  try {
    const res = await fetch(`${API_URL}/articles/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.article || null;
  } catch {
    return null;
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    image: article.bannerImage?.url ? [article.bannerImage.url] : [],
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    author: [{
      "@type": "Person",
      name: article.author?.name || "The Dev Journal Author",
    }],
    description: article.summary,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleContent article={article} slug={slug} />
    </>
  );
}