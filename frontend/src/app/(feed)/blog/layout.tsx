import { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Blog | The Dev Journal",
  description:
    "Explore our collection of tutorials, insights, and thoughts on software engineering, web development, and design.",
  alternates: {
    canonical: `${APP_URL}/blog`,
  },
  openGraph: {
    title: "Blog | The Dev Journal",
    description:
      "Explore our collection of tutorials, insights, and thoughts on software engineering, web development, and design.",
    url: `${APP_URL}/blog`,
    siteName: "The Dev Journal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | The Dev Journal",
    description:
      "Explore our collection of tutorials, insights, and thoughts on software engineering, web development, and design.",
  },
};

export default function BlogFeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
