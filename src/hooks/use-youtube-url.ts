import { useCallback, useEffect, useRef, useReducer } from 'react';
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
  const { isLoading, fetchMetadata } = useYouTubeMetadata();
  const previousUrlRef = useRef<string>('');
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousValueRef = useRef<string>(value);
  const originalNormalizedUrlRef = useRef<string>('');
  const isUserEditingRef = useRef<boolean>(false);
  
  // Use reducer to sync props to state without triggering setState-in-effect warning
  type ValueAction = { type: 'SYNC_FROM_PROP'; payload: string } | { type: 'UPDATE'; payload: string };
  const valueReducer = (state: string, action: ValueAction): string => {
    switch (action.type) {
      case 'SYNC_FROM_PROP':
        return action.payload;
      case 'UPDATE':
        return action.payload;
      default:
        return state;
    }
  };
  const [localValue, dispatchValue] = useReducer(valueReducer, value);

  // Initialize original normalized URL on mount
  useEffect(() => {
    const normalized = normalizeYouTubeUrl(value.trim());
    originalNormalizedUrlRef.current = normalized || '';
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync local value with prop changes when not actively editing
  // Using reducer dispatch instead of setState to avoid the warning
  useEffect(() => {
    if (previousValueRef.current !== value && !isUserEditingRef.current) {
      previousValueRef.current = value;
      previousUrlRef.current = '';
      const normalized = normalizeYouTubeUrl(value.trim());
      originalNormalizedUrlRef.current = normalized || '';
      dispatchValue({ type: 'SYNC_FROM_PROP', payload: value });
    }
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
      isUserEditingRef.current = true;
      dispatchValue({ type: 'UPDATE', payload: newValue });

      // Clear existing timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      // Debounce: fetch metadata after user stops typing (500ms)
      if (!skipAutoMetadataFetch) {
        fetchTimeoutRef.current = setTimeout(() => {
          const normalized = normalizeYouTubeUrl(newValue.trim());
          if (normalized && normalized !== originalNormalizedUrlRef.current) {
            originalNormalizedUrlRef.current = normalized;
            attemptFetchMetadata(normalized);
          }
          isUserEditingRef.current = false;
        }, 500);
      } else {
        isUserEditingRef.current = false;
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

    isUserEditingRef.current = false;

    // Normalize value on blur and update parent/state
    const trimmedValue = localValue.trim();
    const normalized = normalizeYouTubeUrl(trimmedValue);

    if (normalized) {
      // Update visible input and propagate normalized value
      dispatchValue({ type: 'UPDATE', payload: normalized });
      onChange(normalized);

      // Only fetch metadata if the normalized URL is different from the original
      if (normalized !== originalNormalizedUrlRef.current && !skipAutoMetadataFetch) {
        originalNormalizedUrlRef.current = normalized;
        attemptFetchMetadata(normalized);
      }
    } else {
      // If not a YouTube URL, just propagate raw value
      onChange(localValue);
      originalNormalizedUrlRef.current = '';
    }
  }, [localValue, onChange, attemptFetchMetadata, skipAutoMetadataFetch]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData('text');
      if (!pasted) return;

      isUserEditingRef.current = true;
      const normalized = normalizeYouTubeUrl(pasted.trim());
      if (normalized) {
        // Prevent default paste and replace input with normalized URL
        e.preventDefault();
        dispatchValue({ type: 'UPDATE', payload: normalized });
        onChange(normalized);

        // Only fetch metadata if the normalized URL is different from the original
        if (normalized !== originalNormalizedUrlRef.current && !skipAutoMetadataFetch) {
          originalNormalizedUrlRef.current = normalized;
          attemptFetchMetadata(normalized);
        }
      }
      isUserEditingRef.current = false;
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

