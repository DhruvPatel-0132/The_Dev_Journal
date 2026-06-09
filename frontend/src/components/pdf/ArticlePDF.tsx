import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import Html from 'react-pdf-html';
import { Article } from '@/types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  authorInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
    marginBottom: 20,
    borderRadius: 8,
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 10,
    borderTop: '1 solid #eee',
    paddingTop: 10,
  }
});

interface ArticlePDFProps {
  article: Article;
}

export const ArticlePDF = ({ article }: ArticlePDFProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{article.title}</Text>
        
        <View style={styles.authorInfo}>
          <Text>By {article.author?.name || 'Unknown'}</Text>
          <Text> | </Text>
          <Text>{article.publishedAt ? formatDate(article.publishedAt) : "Draft"}</Text>
        </View>

        {article.bannerImage?.url && (
          <Image src={article.bannerImage.url} style={styles.bannerImage} />
        )}

        <View style={styles.content}>
          <Html>{article.content}</Html>
        </View>

        <Text style={styles.footer} fixed>
          Generated from The Dev Journal | {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
};
