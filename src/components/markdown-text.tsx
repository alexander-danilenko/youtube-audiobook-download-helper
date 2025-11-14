'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Typography, TypographyProps, Box } from '@mui/material';
import { Link } from '@mui/material';

interface MarkdownTextProps {
  children: string | React.ReactNode[];
  variant?: TypographyProps['variant'];
  component?: React.ElementType;
  sx?: TypographyProps['sx'];
  /** ReactNode placeholders to inject into markdown (for {key: node} replacements) */
  placeholders?: Record<string, React.ReactNode>;
}

// Types for react-markdown component props
interface MarkdownLinkProps {
  href?: string;
  target?: string;
  rel?: string;
  children?: React.ReactNode;
}

interface MarkdownParagraphProps {
  children?: React.ReactNode;
}

interface MarkdownTextElementProps {
  children?: React.ReactNode;
}

interface MarkdownImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | Blob;
  alt?: string;
  children?: React.ReactNode;
}

interface MarkdownListProps {
  children?: React.ReactNode;
}

interface MarkdownHeadingProps {
  children?: React.ReactNode;
}

interface MarkdownBlockquoteProps {
  children?: React.ReactNode;
}

/**
 * Component that renders markdown text with Material-UI Typography styling
 * Supports all standard markdown features including links, images, bold, italic, etc.
 * Can also handle ReactNode placeholders injected into markdown.
 */
export function MarkdownText({ children, variant = 'body1', component, sx, placeholders }: MarkdownTextProps): React.ReactElement {
  // If children is an array, it's already processed with ReactNodes - render directly
  if (Array.isArray(children)) {
    const typographyProps = component ? { component } : {};
    return (
      <Typography variant={variant} {...typographyProps} sx={sx}>
        {children}
      </Typography>
    );
  }

  // Handle string with ReactNode placeholders
  const markdownString = children as string;
  
  // If we have placeholders, we need to split and render parts
  if (placeholders && Object.keys(placeholders).length > 0) {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /\{(\w+)\}/g;
    let match;

    while ((match = regex.exec(markdownString)) !== null) {
      // Add markdown text before placeholder
      if (match.index > lastIndex) {
        const beforeText = markdownString.substring(lastIndex, match.index);
        parts.push(
          <ReactMarkdown
            key={`md-${lastIndex}`}
            components={getMarkdownComponents(variant)}
          >
            {beforeText}
          </ReactMarkdown>
        );
      }

      // Add placeholder ReactNode if it exists
      const placeholderKey = match[1];
      if (placeholderKey && placeholders[placeholderKey]) {
        parts.push(
          <React.Fragment key={`placeholder-${placeholderKey}-${match.index}`}>
            {placeholders[placeholderKey]}
          </React.Fragment>
        );
      } else {
        // Placeholder not found, render as plain text
        parts.push(<React.Fragment key={`missing-${match.index}`}>{match[0]}</React.Fragment>);
      }

      lastIndex = regex.lastIndex;
    }

    // Add remaining markdown text
    if (lastIndex < markdownString.length) {
      const remainingText = markdownString.substring(lastIndex);
      parts.push(
        <ReactMarkdown
          key={`md-${lastIndex}`}
          components={getMarkdownComponents(variant)}
        >
          {remainingText}
        </ReactMarkdown>
      );
    }

    const boxProps = component ? { component } : {};
    return (
      <Box {...boxProps} sx={sx}>
        {parts}
      </Box>
    );
  }

  // Simple case: just render markdown
  // Don't wrap in Typography for multiple paragraphs - let markdown handle structure
  const boxProps = component ? { component } : {};
  return (
    <Box {...boxProps} sx={sx}>
      <ReactMarkdown components={getMarkdownComponents(variant)}>
        {markdownString}
      </ReactMarkdown>
    </Box>
  );
}

/**
 * Returns the markdown component overrides for consistent styling
 */
function getMarkdownComponents(variant: TypographyProps['variant'] = 'body1') {
  return {
    // Render links using Material-UI Link component
    // Automatically add target="_blank" and rel="noopener noreferrer" for external links
    a: ({ href, target, rel, children }: MarkdownLinkProps) => {
      const hrefValue = href || '';
      const isExternal = hrefValue.startsWith('http://') || hrefValue.startsWith('https://');
      const linkProps = isExternal 
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : { target, rel };
      
      return (
        <Link href={hrefValue} {...linkProps} underline="hover">
          {children}
        </Link>
      );
    },
    // Render paragraphs with proper spacing
    p: ({ children }: MarkdownParagraphProps) => (
      <Typography variant={variant} component="p" sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
        {children}
      </Typography>
    ),
    // Render strong as strong (default is fine)
    strong: ({ children }: MarkdownTextElementProps) => <strong>{children}</strong>,
    // Render emphasis (italic) as em (default is fine)
    em: ({ children }: MarkdownTextElementProps) => <em>{children}</em>,
    // Render images
    // Using img instead of Next.js Image because markdown images don't have known dimensions
    // and may come from external sources that can't be optimized by Next.js Image
    img: (props: MarkdownImageProps) => {
      const { src, alt, ...rest } = props;
      // Convert Blob to object URL if needed
      const imageSrc = src instanceof Blob ? URL.createObjectURL(src) : src;
      return <img src={imageSrc} alt={alt} style={{ maxWidth: '100%', height: 'auto' }} {...rest} />;
    },
    // Render code blocks (always inline)
    code: ({ children }: MarkdownTextElementProps) => (
      <code style={{ backgroundColor: 'rgba(0, 0, 0, 0.06)', padding: '2px 4px', borderRadius: '3px', fontFamily: 'monospace' }}>
        {children}
      </code>
    ),
    // Render lists
    ul: ({ children }: MarkdownListProps) => <ul style={{ paddingLeft: '20px' }}>{children}</ul>,
    ol: ({ children }: MarkdownListProps) => <ol style={{ paddingLeft: '20px' }}>{children}</ol>,
    // Render list items
    li: ({ children }: MarkdownTextElementProps) => <li>{children}</li>,
    // Render headings (h1-h6)
    h1: ({ children }: MarkdownHeadingProps) => <h1 style={{ fontSize: '2em', fontWeight: 'bold', margin: '16px 0 8px 0' }}>{children}</h1>,
    h2: ({ children }: MarkdownHeadingProps) => <h2 style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '14px 0 6px 0' }}>{children}</h2>,
    h3: ({ children }: MarkdownHeadingProps) => <h3 style={{ fontSize: '1.25em', fontWeight: 'bold', margin: '12px 0 4px 0' }}>{children}</h3>,
    h4: ({ children }: MarkdownHeadingProps) => <h4 style={{ fontSize: '1.1em', fontWeight: 'bold', margin: '10px 0 4px 0' }}>{children}</h4>,
    h5: ({ children }: MarkdownHeadingProps) => <h5 style={{ fontSize: '1em', fontWeight: 'bold', margin: '8px 0 2px 0' }}>{children}</h5>,
    h6: ({ children }: MarkdownHeadingProps) => <h6 style={{ fontSize: '0.9em', fontWeight: 'bold', margin: '8px 0 2px 0' }}>{children}</h6>,
    // Render blockquotes
    blockquote: ({ children }: MarkdownBlockquoteProps) => (
      <blockquote style={{ borderLeft: '4px solid #ccc', margin: '8px 0', paddingLeft: '16px', color: '#666' }}>
        {children}
      </blockquote>
    ),
    // Render horizontal rules
    hr: () => <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '16px 0' }} />,
  };
}

