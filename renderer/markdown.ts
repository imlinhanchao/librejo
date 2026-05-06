/**
 * Sanitize HTML to prevent XSS when rendering markdown.
 * Uses isomorphic-dompurify which works both in SSR (Node) and browser.
 */
import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'

export function renderMarkdown(content: string): string {
  if (!content) return ''
  const raw = marked.parse(content) as string
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'del', 'ins', 'span'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
  })
}
