import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import Html from 'react-pdf-html';
import { Article } from '@/types';

// ─── Page Layout Constants ──────────────────────────────────────────────────
// Centralised so footer height is accounted for in page padding.
const PAGE_HORIZONTAL_PADDING = 40;
const PAGE_TOP_PADDING = 40;
const FOOTER_HEIGHT = 30;        // space the footer text occupies
const FOOTER_BOTTOM_MARGIN = 25; // distance from bottom edge of paper
// Bottom padding = enough room for footer + its bottom margin + a breathing gap
const PAGE_BOTTOM_PADDING = FOOTER_HEIGHT + FOOTER_BOTTOM_MARGIN + 15;

// ─── Page Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    paddingTop: PAGE_TOP_PADDING,
    paddingBottom: PAGE_BOTTOM_PADDING,
    paddingHorizontal: PAGE_HORIZONTAL_PADDING,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#333',
  },

  // ── Header ──────────────────────────────────────────────────────────────
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111',
    lineHeight: 1.3,
  },

  // FIX: `gap` is NOT supported by react-pdf. Use `marginRight` on children.
  authorInfo: {
    fontSize: 11,
    color: '#666',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  authorText: {
    marginRight: 4,
  },

  // FIX: `objectFit` is valid on <Image> but `borderRadius` on images can
  // cause rendering artefacts in some renderers — keep it small.
  bannerImage: {
    width: '100%',
    height: 180,
    objectFit: 'cover',
    marginBottom: 16,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },

  // Separator line between header & body
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 16,
  },

  // ── Body ────────────────────────────────────────────────────────────────
  content: {
    fontSize: 11,
    lineHeight: 1.6,
  },

  // ── Tags ────────────────────────────────────────────────────────────────
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  tag: {
    fontSize: 9,
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },

  // ── Footer (fixed on every page) ────────────────────────────────────────
  // FIX: Uses `position: 'absolute'` with enough bottom padding on page to
  // prevent content/footer overlap.
  footer: {
    position: 'absolute',
    bottom: FOOTER_BOTTOM_MARGIN,
    left: PAGE_HORIZONTAL_PADDING,
    right: PAGE_HORIZONTAL_PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 9,
    color: '#999',
  },
});

// ─── HTML Stylesheet ────────────────────────────────────────────────────────
// Applied by react-pdf-html to parsed HTML nodes. Every value must be a
// property supported by @react-pdf/renderer's style engine.
const htmlStylesheet = {
  h1: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold' as const,
    marginTop: 20,
    marginBottom: 8,
    color: '#111',
    lineHeight: 1.3,
  },
  h2: {
    fontSize: 17,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold' as const,
    marginTop: 18,
    marginBottom: 6,
    color: '#222',
    lineHeight: 1.3,
  },
  h3: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold' as const,
    marginTop: 14,
    marginBottom: 5,
    color: '#333',
    lineHeight: 1.3,
  },
  h4: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold' as const,
    marginTop: 12,
    marginBottom: 4,
    color: '#333',
    lineHeight: 1.4,
  },
  h5: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold' as const,
    marginTop: 10,
    marginBottom: 4,
    color: '#444',
    lineHeight: 1.4,
  },
  h6: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold' as const,
    marginTop: 8,
    marginBottom: 4,
    color: '#555',
    lineHeight: 1.4,
  },
  p: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 8,
    color: '#333',
  },
  strong: {
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold' as const,
  },
  em: {
    fontStyle: 'italic' as const,
  },
  a: {
    color: '#4F46E5',
    textDecoration: 'underline',
  },
  ul: {
    marginBottom: 8,
    paddingLeft: 18,
  },
  ol: {
    marginBottom: 8,
    paddingLeft: 18,
  },
  li: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 4,
    color: '#333',
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
    paddingLeft: 10,
    marginLeft: 0,
    marginTop: 8,
    marginBottom: 8,
    color: '#555',
    fontSize: 11,
    lineHeight: 1.5,
  },
  pre: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginTop: 8,
    marginBottom: 8,
    fontSize: 9,
    fontFamily: 'Courier',
    lineHeight: 1.4,
  },
  code: {
    fontFamily: 'Courier',
    fontSize: 9,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  img: {
    maxWidth: '100%',
    marginTop: 8,
    marginBottom: 8,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 12,
    marginBottom: 12,
  },
  table: {
    marginTop: 8,
    marginBottom: 8,
  },
  th: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold' as const,
    padding: 6,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  td: {
    fontSize: 10,
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
};

// ─── HTML Sanitisation Helper ───────────────────────────────────────────────
// Cleans up common HTML patterns that break react-pdf-html:
//  • <br> / <br/> → newlines (react-pdf-html renders \n as line breaks
//    when collapse=false, but we keep collapse=true so we convert to
//    explicit paragraph breaks)
//  • Empty <p></p> → removed
//  • &nbsp; → regular space
//  • Strips <script>, <iframe>, <video>, <audio>, <canvas> (unsupported)
//  • Removes class/id attributes (not needed, avoids selector noise)
//  • Normalises multiple blank lines
function sanitizeContentForPDF(html: string): string {
  if (!html) return '<p>No content available.</p>';

  let cleaned = html;

  // Remove unsupported / dangerous tags entirely
  cleaned = cleaned.replace(
    /<(script|iframe|video|audio|canvas|style|link|meta|noscript|object|embed|form|input|textarea|select|button)[^>]*>[\s\S]*?<\/\1>/gi,
    ''
  );
  // Self-closing variants
  cleaned = cleaned.replace(
    /<(script|iframe|video|audio|canvas|link|meta|input|embed|source)[^>]*\/?>/gi,
    ''
  );

  // Replace <br> variants with a closing + opening paragraph to avoid
  // react-pdf-html swallowing them or rendering empty Views.
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '</p><p>');

  // Replace &nbsp; with a regular space
  cleaned = cleaned.replace(/&nbsp;/gi, ' ');

  // Remove empty paragraphs (with optional whitespace)
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/gi, '');

  // Remove class and id attributes (react-pdf-html supports them via
  // stylesheet selectors, but our stylesheet only uses tag selectors)
  cleaned = cleaned.replace(/\s+(class|id)="[^"]*"/gi, '');

  // Collapse excessive whitespace between tags
  cleaned = cleaned.replace(/>\s{2,}</g, '> <');

  return cleaned;
}

// ─── Component ──────────────────────────────────────────────────────────────
interface ArticlePDFProps {
  article: Article;
}

export const ArticlePDF = ({ article }: ArticlePDFProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Prepare sanitised HTML for the PDF renderer
  const sanitizedContent = sanitizeContentForPDF(article.content);

  return (
    <Document
      title={article.title}
      author={article.author?.name || 'The Dev Journal'}
      subject={article.summary || ''}
      keywords={article.seoKeywords?.join(', ') || ''}
    >
      <Page size="A4" style={styles.page} wrap>
        {/* ── Article Title ─────────────────────────────────────────────── */}
        <Text style={styles.title}>{article.title || 'Untitled Article'}</Text>

        {/* ── Author & Date ─────────────────────────────────────────────── */}
        <View style={styles.authorInfo}>
          <Text style={styles.authorText}>
            By {article.author?.name || 'Unknown Author'}
          </Text>
          <Text style={styles.authorText}>|</Text>
          <Text style={styles.authorText}>
            {article.publishedAt
              ? formatDate(article.publishedAt)
              : 'Draft'}
          </Text>
          {article.readTime > 0 && (
            <>
              <Text style={styles.authorText}>|</Text>
              <Text style={styles.authorText}>
                {article.readTime} min read
              </Text>
            </>
          )}
        </View>

        {/* ── Banner Image (conditional) ────────────────────────────────── */}
        {article.bannerImage?.url ? (
          <Image
            src={article.bannerImage.url}
            style={styles.bannerImage}
          />
        ) : null}

        {/* ── Separator ─────────────────────────────────────────────────── */}
        <View style={styles.separator} />

        {/* ── HTML Content ──────────────────────────────────────────────── */}
        {/* wrap=true on the parent View lets react-pdf split long content
            across pages automatically. */}
        <View style={styles.content} wrap>
          <Html stylesheet={htmlStylesheet} collapse={true}>
            {sanitizedContent}
          </Html>
        </View>

        {/* ── Tags ──────────────────────────────────────────────────────── */}
        {article.tags && article.tags.length > 0 && (
          <View style={styles.tagsContainer} wrap={false}>
            {article.tags.map((tag: string) => (
              <Text key={tag} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}

        {/* ── Footer (fixed on every page) ──────────────────────────────── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated from The Dev Journal
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};
