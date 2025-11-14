import { useState, useCallback, useEffect, useRef } from 'react';
import { normalizeYouTubeUrl } from '@/application/services';
import { useYouTubeMetadata } from './use-youtube-metadata';

interface UseYouTubeUrlProps {
  value: string;
  onChange: (value: string) => void;
  onMetadataFetched?: (title: string, authorName: string) => void;
  skipAutoMetadataFetch?: boolean;
}

export function useYouTubeUrl({
  value,
  onChange,
  onMetadataFetched,
  skipAutoMetadataFetch = false,
}: UseYouTubeUrlProps) {
  const [localValue, setLocalValue] = useState<string>(value);
  const { isLoading, fetchMetadata } = useYouTubeMetadata();
  const previousUrlRef = useRef<string>('');
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
    // Reset previous URL ref when value prop changes (e.g., when book changes)
    // This allows re-fetching if the same URL is set from props
    previousUrlRef.current = '';
  }, [value]);

  const attemptFetchMetadata = useCallback(
    async (rawUrl: string) => {
      const normalized = normalizeYouTubeUrl(rawUrl);

      if (!normalized || normalized === previousUrlRef.current) {
        return;
      }

      previousUrlRef.current = normalized;

      try {
        const metadata = await fetchMetadata(normalized);

        if (metadata && onMetadataFetched) {
          onMetadataFetched(metadata.title, metadata.authorName);
        }
      } catch (error) {
        console.error('YouTubeUrlCell: Error fetching YouTube metadata:', error);
      }
    },
    [fetchMetadata, onMetadataFetched]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      // Clear existing timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      // Debounce: fetch metadata after user stops typing (500ms)
      if (!skipAutoMetadataFetch) {
        fetchTimeoutRef.current = setTimeout(() => {
          attemptFetchMetadata(newValue.trim());
        }, 500);
      }
    },
    [attemptFetchMetadata, skipAutoMetadataFetch]
  );

  const handleBlur = useCallback(() => {
    // Clear timeout on blur
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }

    // Normalize value on blur and update parent/state
    const trimmedValue = localValue.trim();
    const normalized = normalizeYouTubeUrl(trimmedValue);

    if (normalized) {
      // Update visible input and propagate normalized value
      setLocalValue(normalized);
      onChange(normalized);

      if (normalized !== previousUrlRef.current && !skipAutoMetadataFetch) {
        attemptFetchMetadata(normalized);
      }
    } else {
      // If not a YouTube URL, just propagate raw value
      onChange(localValue);
    }
  }, [localValue, onChange, attemptFetchMetadata, skipAutoMetadataFetch]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData('text');
      if (!pasted) return;

      const normalized = normalizeYouTubeUrl(pasted.trim());
      if (normalized) {
        // Prevent default paste and replace input with normalized URL
        e.preventDefault();
        setLocalValue(normalized);
        onChange(normalized);

        if (normalized !== previousUrlRef.current && !skipAutoMetadataFetch) {
          attemptFetchMetadata(normalized);
        }
      }
      // If not normalized, allow default paste behavior
    },
    [onChange, attemptFetchMetadata, skipAutoMetadataFetch]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  return {
    localValue,
    isLoading,
    handleChange,
    handleBlur,
    handlePaste,
  };
}

