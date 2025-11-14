import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
}

export function useBookCard({ book, onBookChange, skipAutoMetadataFetch = false }: UseBookCardProps) {
  const { t } = useTranslation();
  const tString = useTranslationString();
  const { thumbnailUrl, fullSizeThumbnailUrl } = useThumbnail(book.url);
  const { isLoading, fetchMetadata, error: metadataError } = useYouTubeMetadata();
  const bookService = useMemo(() => new BookService(), []);
  const metadataComparisonService = useMemo(() => new MetadataComparisonService(), []);

  const changeThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local state for immediate UI updates (no lag)
  const [localBook, setLocalBook] = useState<BookDto>(book);

  // Sync local state with prop changes from parent — only when the book id changes
  useEffect(() => {
    setLocalBook(book);
  }, [book.id]);

  // Comparison dialog state
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [comparisons, setComparisons] = useState<MetadataComparison[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, 'current' | 'fetched'>>({});
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false);

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

  // Reset thumbnail loaded state when URL changes
  useEffect(() => {
    setIsThumbnailLoaded(false);
  }, [localBook.url]);

  useEffect(() => {
    if (!thumbnailUrl) {
      setIsThumbnailLoaded(false);
    }
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
          } else {
            // Auto-update empty fields
            const updatedBook = metadataComparisonService.autoUpdateEmptyFields(localBook, metadata);
            setLocalBook(updatedBook);
            onBookChange(updatedBook);
          }
        }
      } catch (error) {
        console.error('BookCard: Error fetching YouTube metadata:', error);
      }
    },
    [localBook, isUrlValid, fetchMetadata, onBookChange, metadataComparisonService]
  );

  const handleChange = useCallback(
    (key: keyof BookDto, value: string | number | undefined, options?: { skipDebounce?: boolean }) => {
      const skipDebounce = options?.skipDebounce ?? false;
      let parsedValue: string | number | undefined = value;
      if (key === 'seriesNumber') {
        parsedValue = parseInt(value as string, 10);
        if (isNaN(parsedValue) || parsedValue < 1) parsedValue = 1;
      } else if (key === 'year') {
        parsedValue = parseInt(value as string, 10);
        if (isNaN(parsedValue) || parsedValue < 1) parsedValue = undefined;
      }

      // Update local state immediately for responsive UI (no lag)
      setLocalBook((prev) => {
        const updatedBook = { ...prev, [key]: parsedValue };

        if (!skipDebounce) {
          // Debounce parent updates
          if (changeThrottleRef.current) {
            clearTimeout(changeThrottleRef.current);
          }

          changeThrottleRef.current = setTimeout(() => {
            onBookChange(updatedBook);

            // Auto-fetch metadata for URL changes
            if (key === 'url' && typeof parsedValue === 'string' && parsedValue && !skipAutoMetadataFetch) {
              const urlValue = parsedValue.trim();
              if (urlValue) {
                if (fetchTimeoutRef.current) {
                  clearTimeout(fetchTimeoutRef.current);
                }
                fetchTimeoutRef.current = setTimeout(() => {
                  attemptFetchMetadata(urlValue);
                }, 500);
              }
            }
          }, 500);
        }

        return updatedBook;
      });
    },
    [onBookChange, attemptFetchMetadata, skipAutoMetadataFetch]
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
    setIsThumbnailLoaded(true);
  };

  const handleThumbnailError = (): void => {
    setIsThumbnailLoaded(false);
  };

  const handleUrlBlur = useCallback(() => {
    const trimmed = localBook.url?.trim() || '';
    const normalized = normalizeYouTubeUrl(trimmed);
    if (normalized && normalized !== localBook.url) {
      // Use existing handleChange to keep update flow consistent (debounce, validation)
      handleChange('url', normalized);
      if (!skipAutoMetadataFetch) {
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = setTimeout(() => attemptFetchMetadata(normalized), 500);
      }
    }
  }, [localBook, handleChange, attemptFetchMetadata, skipAutoMetadataFetch]);

  const handlePasteClick = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      const raw = text.trim();
      const normalized = normalizeYouTubeUrl(raw);

      const valueToSet = normalized || raw;
      // set local state immediately so disabled input shows value
      const updatedImmediate = { ...localBook, url: valueToSet };
      setLocalBook(updatedImmediate);
      handleChange('url', valueToSet, { skipDebounce: true });
      // Immediately propagate to parent to avoid later debounce overwriting
      onBookChange(updatedImmediate);

      // Clear any pending debounced change just in case
      if (changeThrottleRef.current) {
        clearTimeout(changeThrottleRef.current);
        changeThrottleRef.current = null;
      }

      // If normalized, fetch metadata immediately (don't rely on isUrlValid timing)
      if (normalized && !skipAutoMetadataFetch) {
        try {
          const metadata = await fetchMetadata(normalized);
          if (metadata) {
            const diffs = metadataComparisonService.compareMetadata(localBook, metadata);

            if (diffs.length > 0) {
              setComparisons(diffs);
              setSelectedValues(metadataComparisonService.createDefaultSelectedValues(diffs));
              setComparisonDialogOpen(true);
            } else {
              const updatedBook = metadataComparisonService.autoUpdateEmptyFields(
                { ...localBook, url: valueToSet },
                metadata
              );
              setLocalBook(updatedBook);
              onBookChange(updatedBook);
            }
          }
        } catch (err) {
          console.error('Failed to fetch metadata after paste:', err);
        }
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  }, [handleChange, fetchMetadata, localBook, onBookChange, skipAutoMetadataFetch, metadataComparisonService]);

  const handleUrlPaste = useCallback(
    async (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedRaw = e.clipboardData.getData('text') || '';
      const pasted = pastedRaw.trim();
      if (!pasted) return;

      e.preventDefault();

      const normalized = normalizeYouTubeUrl(pasted);
      const valueToSet = normalized || pasted;

      const updatedImmediate = { ...localBook, url: valueToSet };
      // Update local and parent immediately, skip debounce to avoid later overwrite
      setLocalBook(updatedImmediate);
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
            } else {
              const updatedBook = metadataComparisonService.autoUpdateEmptyFields(
                { ...localBook, url: valueToSet },
                metadata
              );
              setLocalBook(updatedBook);
              onBookChange(updatedBook);
            }
          }
        } catch (err) {
          console.error('Failed to fetch metadata after paste:', err);
        }
      }
    },
    [normalizeYouTubeUrl, handleChange, fetchMetadata, localBook, onBookChange, skipAutoMetadataFetch, metadataComparisonService]
  );

  const handleComparisonSelect = (fieldName: string, value: 'current' | 'fetched') => {
    setSelectedValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleApplyComparison = () => {
    const updatedBook = metadataComparisonService.mergeSelectedValues(localBook, comparisons, selectedValues);
    setLocalBook(updatedBook);
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
    handlePasteClick,
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

