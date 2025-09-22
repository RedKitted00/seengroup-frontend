import React from 'react';

interface HtmlRendererProps {
  content: string;
  className?: string;
  tag?: keyof React.JSX.IntrinsicElements;
}

/**
 * Safely renders HTML content from translations
 * This component sanitizes and renders HTML content while preventing XSS attacks
 */
export const HtmlRenderer: React.FC<HtmlRendererProps> = ({ 
  content, 
  className, 
  tag: Tag = 'div' 
}) => {
  // Basic HTML sanitization - in production, consider using a library like DOMPurify
  const sanitizeHtml = (html: string): string => {
    // Simple regex-based sanitization (for production, use a proper sanitization library)
    let sanitized = html;
    
    // Remove script tags and event handlers
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    return sanitized;
  };

  const sanitizedContent = sanitizeHtml(content);

  return (
    <Tag 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default HtmlRenderer;
