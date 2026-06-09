"use client";

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ArticlePDF } from './ArticlePDF';
import { Article } from '@/types';
import { Download } from 'lucide-react';

interface PDFDownloadButtonProps {
  article: Article;
}

export default function PDFDownloadButton({ article }: PDFDownloadButtonProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <button 
        className="p-2 hover:bg-white/5 rounded-full transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-white" 
        title="Export as PDF"
        aria-label="Export as PDF"
      >
        <Download className="w-5 h-5 group-hover:text-white" />
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ArticlePDF article={article} />}
      fileName={`${article.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`}
      className="p-2 hover:bg-white/5 rounded-full transition-colors group flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-white"
      title="Export as PDF"
      aria-label="Export as PDF"
    >
      {({ blob, url, loading, error }) => (
        <Download className={`w-5 h-5 ${loading ? 'animate-pulse text-indigo-400' : 'group-hover:text-white'}`} />
      )}
    </PDFDownloadLink>
  );
}
