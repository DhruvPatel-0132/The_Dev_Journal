import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function getArticles() {
  try {
    const res = await fetch(`${API_URL}/articles`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles || [];
  } catch (error) {
    console.error("Failed to fetch articles for sitemap", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Article routes
  const articles = await getArticles();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article: any) => ({
    url: `${SITE_URL}/blog/${article.seoSlug}`,
    lastModified: new Date(article.updatedAt || article.createdAt || new Date()),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...routes, ...articleRoutes];
}
