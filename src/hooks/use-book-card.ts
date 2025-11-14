import { useState, useEffect, useCallback, useRef, useMemo, useReducer } from 'react';
import { BookDto } from '@/application/dto';
import { BookService } from '@/application/services';
import { MetadataComparisonService, type MetadataComparison } from '@/application/services';
import { normalizeYouTubeUrl } from '@/application/services';
import { useThumbnail } from './use-thumbnail';
import { useYouTubeMetadata } from './use-youtube-metadata';
import { useAppStore } from '@/application/stores';
import { useTranslation, useTranslationString, type TranslationKey } from '@/i18n';

interface UseBookCardProps {
  book: BookDto;
  onBookChange: (updatedBook: BookDto) => void;
  skipAutoMetadataFetch?: boolean;
  onMetadataFetchSuccess?: () => void;
}

export function useBookCard({ book, onBookChange, skipAutoMetadataFetch = false, onMetadataFetchSuccess }: UseBookCardProps) {
  const { t } = useTranslation();
  const tString = useTranslationString();
  const { thumbnailUrl, fullSizeThumbnailUrl } = useThumbnail(book.url);
  const { isLoading, fetchMetadata, error: metadataError } = useYouTubeMetadata();
  const bookService = useMemo(() => new BookService(), []);
  const metadataComparisonService = useMemo(() => new MetadataComparisonService(), []);

  const changeThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local state for immediate UI updates (no lag)
  // Use reducer to sync props to state without triggering setState-in-effect warning
  type BookAction = { type: 'SYNC_FROM_PROP'; payload: BookDto } | { type: 'UPDATE'; payload: Partial<BookDto> };
  const bookReducer = (state: BookDto, action: BookAction): BookDto => {
    switch (action.type) {
      case 'SYNC_FROM_PROP':
        return action.payload;
      case 'UPDATE':
        return { ...state, ...action.payload };
      default:
        return state;
    }
  };
  const [localBook, dispatchBook] = useReducer(bookReducer, book);
  const previousBookIdRef = useRef<string>(book.id);

  // Sync local state with prop changes from parent — only when the book id changes
  // Using reducer dispatch instead of setState to avoid the warning
  useEffect(() => {
    if (previousBookIdRef.current !== book.id) {
      previousBookIdRef.current = book.id;
      dispatchBook({ type: 'SYNC_FROM_PROP', payload: book });
    }
  }, [book, book.id]);

  // Comparison dialog state
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [comparisons, setComparisons] = useState<MetadataComparison[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, 'current' | 'fetched'>>({});
  
  // Use reducer for thumbnail loaded state to avoid setState-in-effect warning
  type ThumbnailAction = { type: 'RESET' } | { type: 'SET_LOADED'; payload: boolean };
  const thumbnailReducer = (state: boolean, action: ThumbnailAction): boolean => {
    switch (action.type) {
      case 'RESET':
        return false;
      case 'SET_LOADED':
        return action.payload;
      default:
        return state;
    }
  };
  const [isThumbnailLoaded, dispatchThumbnail] = useReducer(thumbnailReducer, false);

  // Collapsed state from store
  const collapsedBookIds = useAppStore((state) => state.collapsedBookIds);
  const toggleBookCollapsed = useAppStore((state) => state.toggleBookCollapsed);
  const isCollapsed = collapsedBookIds.has(book.id);

  // Validation state
  const validationResult = useMemo(() => {
    return bookService.validateBook(localBook);
  }, [localBook, bookService]);

  // Field-level validation errors (translated)
  const fieldErrors = useMemo(() => {
    const errors = bookService.extractFieldErrors(validationResult);
    return bookService.translateFieldErrors(errors, (key) => t(key as TranslationKey) as string);
  }, [validationResult, bookService, t]);

  // URL validation
  const isUrlValid = useMemo(() => {
    return bookService.isValidYouTubeUrl(localBook.url);
  }, [localBook.url, bookService]);

  const isUrlFullyValid = useMemo(() => {
    return isUrlValid && !!thumbnailUrl && isThumbnailLoaded && !metadataError && !isLoading;
  }, [isUrlValid, thumbnailUrl, isThumbnailLoaded, metadataError, isLoading]);

  // Track previous URL to reset thumbnail loaded state when URL changes
  const previousUrlRef = useRef<string>(localBook.url);
  const previousThumbnailUrlRef = useRef<string | null>(thumbnailUrl);

  // Reset thumbnail loaded state when URL changes using reducer pattern
  useEffect(() => {
    if (previousUrlRef.current !== localBook.url) {
      previousUrlRef.current = localBook.url;
      dispatchThumbnail({ type: 'RESET' });
    }
  }, [localBook.url]);

  // Reset thumbnail loaded state when thumbnailUrl becomes empty
  useEffect(() => {
    if (previousThumbnailUrlRef.current && !thumbnailUrl) {
      dispatchThumbnail({ type: 'RESET' });
    }
    previousThumbnailUrlRef.current = thumbnailUrl;
  }, [thumbnailUrl]);

  const attemptFetchMetadata = useCallback(
    async (url: string) => {
      if (!url?.trim() || !isUrlValid) return;

      try {
        const metadata = await fetchMetadata(url);

        if (metadata) {
          const diffs = metadataComparisonService.compareMetadata(localBook, metadata);

          if (diffs.length > 0) {
            setComparisons(diffs);
            setSelectedValues(metadataComparisonService.createDefaultSelectedValues(diffs));
            setComparisonDialogOpen(true);
            // Show success toast even when there are differences (metadata was fetched)
            if (onMetadataFetchSuccess) {
              onMetadataFetchSuccess();
            }
          } else {
            // Auto-update empty fields
            const updatedBook = metadataComparisonService.autoUpdateEmptyFields(localBook, metadata);
            dispatchBook({ type: 'SYNC_FROM_PROP', payload: updatedBook });
            onBookChange(updatedBook);
            // Show success toast when metadata is auto-applied
            if (onMetadataFetchSuccess) {
              onMetadataFetchSuccess();
            }
          }
        }
      } catch (error) {
        console.error('BookCard: Error fetching YouTube metadata:', error);
      }
    },
    [localBook, isUrlValid, fetchMetadata, onBookChange, metadataComparisonService, onMetadataFetchSuccess]
  );

  const handleChange = useCallback(
    (key: keyof BookDto, value: string | number | undefined, options?: { skipDebounce?: boolean }) => {
      const skipDebounce = options?.skipDebounce ?? false;
      let parsedValue: string | number | undefined = value;
      
      // Normalize URL immediately if it's a URL field (but allow empty strings to stay empty)
      if (key === 'url' && typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') {
          parsedValue = '';
        } else {
          const normalized = normalizeYouTubeUrl(trimmed);
          parsedValue = normalized || trimmed;
        }
      } else if (key === 'seriesNumber') {
        parsedValue = parseInt(value as string, 10);
        if (isNaN(parsedValue) || parsedValue < 1) parsedValue = 1;
      } else if (key === 'year') {
        parsedValue = parseInt(value as string, 10);
        if (isNaN(parsedValue) || parsedValue < 1) parsedValue = undefined;
      }

      // Update local state immediately for responsive UI (no lag)
      dispatchBook({ type: 'UPDATE', payload: { [key]: parsedValue } });
      const updatedBook = { ...localBook, [key]: parsedValue };

      if (skipDebounce) {
        // Immediately update parent without debounce
        onBookChange(updatedBook);
      } else {
        // Debounce parent updates
        if (changeThrottleRef.current) {
          clearTimeout(changeThrottleRef.current);
        }

        changeThrottleRef.current = setTimeout(() => {
          onBookChange(updatedBook);

          // Auto-fetch metadata for URL changes (normalize before fetching)
          if (key === 'url' && typeof parsedValue === 'string' && parsedValue && !skipAutoMetadataFetch) {
            const urlValue = parsedValue.trim();
            if (urlValue) {
              const normalized = normalizeYouTubeUrl(urlValue);
              // Only fetch if we have a valid normalized YouTube URL
              if (normalized) {
                // Update input with normalized URL before fetching (if different)
                if (normalized !== urlValue) {
                  dispatchBook({ type: 'UPDATE', payload: { url: normalized } });
                  onBookChange({ ...updatedBook, url: normalized });
                }
                
                if (fetchTimeoutRef.current) {
                  clearTimeout(fetchTimeoutRef.current);
                }
                fetchTimeoutRef.current = setTimeout(() => {
                  attemptFetchMetadata(normalized);
                }, 500);
              }
            }
          }
        }, 500);
      }
    },
    [localBook, onBookChange, attemptFetchMetadata, skipAutoMetadataFetch]
  );

  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (changeThrottleRef.current) {
        clearTimeout(changeThrottleRef.current);
      }
    };
  }, []);

  const handleThumbnailLoad = (): void => {
    dispatchThumbnail({ type: 'SET_LOADED', payload: true });
  };

  const handleThumbnailError = (): void => {
    dispatchThumbnail({ type: 'RESET' });
  };

  const handleUrlBlur = useCallback(() => {
    const trimmed = localBook.url?.trim() || '';
    if (!trimmed) return;
    
    const normalized = normalizeYouTubeUrl(trimmed);
    // Always update with normalized URL (or original if not a YouTube URL)
    const valueToSet = normalized || trimmed;
    
    if (valueToSet !== localBook.url) {
      // Update input with normalized URL before fetching metadata
      const updatedImmediate = { ...localBook, url: valueToSet };
      dispatchBook({ type: 'SYNC_FROM_PROP', payload: updatedImmediate });
      handleChange('url', valueToSet, { skipDebounce: true });
      onBookChange(updatedImmediate);
    }
    
    // Only fetch metadata if we have a normalized YouTube URL
    if (normalized && !skipAutoMetadataFetch) {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = setTimeout(() => attemptFetchMetadata(normalized), 500);
    }
  }, [localBook, handleChange, onBookChange, attemptFetchMetadata, skipAutoMetadataFetch]);

  const handleUrlPaste = useCallback(
    async (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedRaw = e.clipboardData.getData('text') || '';
      const pasted = pastedRaw.trim();
      if (!pasted) return;

      e.preventDefault();

      const normalized = normalizeYouTubeUrl(pasted);
      // Only use normalized URL, don't allow non-YouTube URLs
      if (!normalized) {
        return;
      }
      const valueToSet = normalized;

      const updatedImmediate = { ...localBook, url: valueToSet };
      // Update local and parent immediately, skip debounce to avoid later overwrite
      dispatchBook({ type: 'SYNC_FROM_PROP', payload: updatedImmediate });
      handleChange('url', valueToSet, { skipDebounce: true });
      onBookChange(updatedImmediate);

      // Clear any pending debounced change
      if (changeThrottleRef.current) {
        clearTimeout(changeThrottleRef.current);
        changeThrottleRef.current = null;
      }

      if (normalized && !skipAutoMetadataFetch) {
        try {
          const metadata = await fetchMetadata(normalized);
          if (metadata) {
            const diffs = metadataComparisonService.compareMetadata(localBook, metadata);

            if (diffs.length > 0) {
              setComparisons(diffs);
              setSelectedValues(metadataComparisonService.createDefaultSelectedValues(diffs));
              setComparisonDialogOpen(true);
              if (onMetadataFetchSuccess) {
                onMetadataFetchSuccess();
              }
            } else {
              const updatedBook = metadataComparisonService.autoUpdateEmptyFields(
                { ...localBook, url: valueToSet },
                metadata
              );
              dispatchBook({ type: 'SYNC_FROM_PROP', payload: updatedBook });
              onBookChange(updatedBook);
              if (onMetadataFetchSuccess) {
                onMetadataFetchSuccess();
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch metadata after paste:', err);
        }
      }
    },
    [handleChange, fetchMetadata, localBook, onBookChange, skipAutoMetadataFetch, metadataComparisonService, onMetadataFetchSuccess]
  );

  const handleComparisonSelect = (fieldName: string, value: 'current' | 'fetched') => {
    setSelectedValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleApplyComparison = () => {
    const updatedBook = metadataComparisonService.mergeSelectedValues(localBook, comparisons, selectedValues);
    dispatchBook({ type: 'SYNC_FROM_PROP', payload: updatedBook });
    onBookChange(updatedBook);
    setComparisonDialogOpen(false);
  };

  // Derived computed values - use local state for immediate UI updates
  const isEmpty = useMemo(
    () =>
      !localBook.url.trim() &&
      !localBook.title.trim() &&
      !localBook.author.trim() &&
      (!localBook.series || !localBook.series.trim()) &&
      localBook.seriesNumber === 1 &&
      !localBook.year,
    [localBook]
  );

  const formatCollapsedHeading = useMemo(() => {
    const author = localBook.author.trim();
    const title = localBook.title.trim();

    if (author && title) return `${author} - ${title}`;
    if (author) return author;
    if (title) return title;
    return tString('books_new_book');
  }, [localBook.author, localBook.title, tString]);

  return {
    // State
    localBook,
    isLoading,
    fieldErrors,
    isUrlValid,
    isUrlFullyValid,
    thumbnailUrl,
    fullSizeThumbnailUrl,
    isThumbnailLoaded,
    isCollapsed,
    isEmpty,
    formatCollapsedHeading,
    comparisonDialogOpen,
    comparisons,
    selectedValues,
    metadataError,
    // Handlers
    handleChange,
    handleUrlBlur,
    handleUrlPaste,
    handleThumbnailLoad,
    handleThumbnailError,
    handleComparisonSelect,
    handleApplyComparison,
    setComparisonDialogOpen,
    toggleBookCollapsed,
    attemptFetchMetadata,
  };
}

