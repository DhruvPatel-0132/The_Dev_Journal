import { notFound } from "next/navigation";
import ArticleContent from "./ArticleContent";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getArticle(slug: string) {
  try {
    const res = await fetch(`${API_URL}/articles/slug/${slug}`, {
      cache: "no-store",
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

  return <ArticleContent article={article} slug={slug} />;
}