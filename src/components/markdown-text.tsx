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
      if (placeholders[placeholderKey]) {
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
    a: ({ ...props }: any) => {
      const href = props.href || '';
      const isExternal = href.startsWith('http://') || href.startsWith('https://');
      const linkProps = isExternal 
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : { target: props.target, rel: props.rel };
      
      return (
        <Link href={href} {...linkProps} underline="hover">
          {props.children}
        </Link>
      );
    },
    // Render paragraphs with proper spacing
    p: ({ ...props }: any) => (
      <Typography variant={variant} component="p" sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
        {props.children}
      </Typography>
    ),
    // Render strong as strong (default is fine)
    strong: ({ ...props }: any) => <strong>{props.children}</strong>,
    // Render emphasis (italic) as em (default is fine)
    em: ({ ...props }: any) => <em>{props.children}</em>,
    // Render images
    img: ({ ...props }: any) => (
      <img src={props.src} alt={props.alt} style={{ maxWidth: '100%', height: 'auto' }} />
    ),
    // Render code blocks (always inline)
    code: ({ ...props }: any) => (
      <code style={{ backgroundColor: 'rgba(0, 0, 0, 0.06)', padding: '2px 4px', borderRadius: '3px', fontFamily: 'monospace' }}>
        {props.children}
      </code>
    ),
    // Render lists
    ul: ({ ...props }: any) => <ul style={{ paddingLeft: '20px' }}>{props.children}</ul>,
    ol: ({ ...props }: any) => <ol style={{ paddingLeft: '20px' }}>{props.children}</ol>,
    // Render list items
    li: ({ ...props }: any) => <li>{props.children}</li>,
    // Render headings (h1-h6)
    h1: ({ ...props }: any) => <h1 style={{ fontSize: '2em', fontWeight: 'bold', margin: '16px 0 8px 0' }}>{props.children}</h1>,
    h2: ({ ...props }: any) => <h2 style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '14px 0 6px 0' }}>{props.children}</h2>,
    h3: ({ ...props }: any) => <h3 style={{ fontSize: '1.25em', fontWeight: 'bold', margin: '12px 0 4px 0' }}>{props.children}</h3>,
    h4: ({ ...props }: any) => <h4 style={{ fontSize: '1.1em', fontWeight: 'bold', margin: '10px 0 4px 0' }}>{props.children}</h4>,
    h5: ({ ...props }: any) => <h5 style={{ fontSize: '1em', fontWeight: 'bold', margin: '8px 0 2px 0' }}>{props.children}</h5>,
    h6: ({ ...props }: any) => <h6 style={{ fontSize: '0.9em', fontWeight: 'bold', margin: '8px 0 2px 0' }}>{props.children}</h6>,
    // Render blockquotes
    blockquote: ({ ...props }: any) => (
      <blockquote style={{ borderLeft: '4px solid #ccc', margin: '8px 0', paddingLeft: '16px', color: '#666' }}>
        {props.children}
      </blockquote>
    ),
    // Render horizontal rules
    hr: () => <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '16px 0' }} />,
  };
}

