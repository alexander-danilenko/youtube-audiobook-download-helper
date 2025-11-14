import { useMemo } from 'react';
import React from 'react';
import { useLanguageStore } from './language-store';
import { translations, TranslationKey } from './translations';
import { MarkdownText } from '@/components/markdown-text';

/**
 * Replaces placeholders in translation strings
 * Example: "Hello {name}" with {name: "World"} -> "Hello World"
 */
function replacePlaceholders(
  template: string,
  values: Record<string, string | React.ReactNode>
): string | React.ReactNode[] {
  // Check if all replacements are strings - if so, return a string
  const allStrings = Object.values(values).every(v => typeof v === 'string');
  
  if (allStrings) {
    // Simple string replacement for performance
    let result = template;
    Object.entries(values).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value as string);
    });
    return result;
  }

  // Complex replacement with React nodes
  const parts: (string | React.ReactNode)[] = [];
  let currentIndex = 0;
  const regex = /\{(\w+)\}/g;
  let match;

  while ((match = regex.exec(template)) !== null) {
    // Add text before placeholder
    if (match.index > currentIndex) {
      parts.push(template.substring(currentIndex, match.index));
    }

    // Add placeholder replacement
    const key = match[1];
    const replacement = values[key];
    if (replacement !== undefined) {
      parts.push(replacement);
    } else {
      parts.push(match[0]); // Keep original if no replacement
    }

    currentIndex = regex.lastIndex;
  }

  // Add remaining text
  if (currentIndex < template.length) {
    parts.push(template.substring(currentIndex));
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
}

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);

  const t = useMemo(
    () => (key: TranslationKey, values?: Record<string, string | React.ReactNode>): string | React.ReactNode[] => {
      const translation = translations[language][key];

      if (!translation) {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }

      // Always return string if no placeholders or all placeholders are strings
      if (!values) {
        return translation;
      }

      // Check if all replacements are strings - if so, return a string
      const allStrings = Object.values(values).every(v => typeof v === 'string');
      if (allStrings) {
        let result = translation;
        Object.entries(values).forEach(([k, v]) => {
          result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), v as string);
        });
        return result;
      }

      // Complex replacement with React nodes
      return replacePlaceholders(translation, values);
    },
    [language]
  );

  /**
   * Returns a React component that renders the translation as markdown.
   * Use this for JSX contexts where you want markdown support.
   * 
   * @param key - Translation key
   * @param values - Optional placeholder values (can be strings or ReactNodes)
   * @param options - Optional rendering options (variant, component, sx)
   */
  const tMarkdown = useMemo(
    () => (
      key: TranslationKey,
      values?: Record<string, string | React.ReactNode>,
      options?: {
        variant?: 'body1' | 'body2' | 'caption' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        component?: React.ElementType;
        sx?: React.CSSProperties;
      }
    ): React.ReactElement => {
      const translation = translations[language][key];

      if (!translation) {
        console.warn(`Translation missing for key: ${key}`);
        return <MarkdownText {...options}>{key}</MarkdownText>;
      }

      // Separate string and ReactNode placeholders
      const stringPlaceholders: Record<string, string> = {};
      const reactNodePlaceholders: Record<string, React.ReactNode> = {};

      if (values) {
        Object.entries(values).forEach(([k, v]) => {
          if (typeof v === 'string') {
            stringPlaceholders[k] = v;
          } else {
            reactNodePlaceholders[k] = v;
          }
        });
      }

      // Replace string placeholders first
      let processedTranslation = translation;
      Object.entries(stringPlaceholders).forEach(([k, v]) => {
        processedTranslation = processedTranslation.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });

      // If we have ReactNode placeholders, pass them to MarkdownText
      if (Object.keys(reactNodePlaceholders).length > 0) {
        return (
          <MarkdownText {...options} placeholders={reactNodePlaceholders}>
            {processedTranslation}
          </MarkdownText>
        );
      }

      // Simple case: just render markdown
      return <MarkdownText {...options}>{processedTranslation}</MarkdownText>;
    },
    [language]
  );

  return { t, tMarkdown, language };
}

/**
 * Helper function to ensure a translation returns a string
 * Useful for props that require string types (aria-label, title, etc.)
 */
export function useTranslationString() {
  const { t } = useTranslation();
  
  return (key: TranslationKey, values?: Record<string, string>): string => {
    const result = t(key, values);
    if (typeof result === 'string') {
      return result;
    }
    // Fallback: convert to string
    return String(result);
  };
}
