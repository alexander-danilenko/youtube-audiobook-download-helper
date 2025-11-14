'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BookDto } from '@/application/dto';
import { BookService } from '@/application/services';
import { useYouTubeMetadata } from './use-youtube-metadata';
import { MetadataComparisonService } from '@/application/services';

interface UseAutoFetchMetadataProps {
  books: BookDto[];
  onBookChange: (book: BookDto) => void;
  skipAutoFetch?: boolean;
}

interface FetchingState {
  [bookId: string]: boolean;
}

export function useAutoFetchMetadata({ books, onBookChange, skipAutoFetch = false }: UseAutoFetchMetadataProps): {
  fetchingState: FetchingState;
} {
  const [fetchingState, setFetchingState] = useState<FetchingState>({});
  const bookService = useRef(new BookService()).current;
  const metadataComparisonService = useRef(new MetadataComparisonService()).current;
  const { fetchMetadata } = useYouTubeMetadata();
  const processedUrlsRef = useRef<Set<string>>(new Set());
  const isProcessingRef = useRef(false);

  const fetchMetadataForBook = useCallback(
    async (book: BookDto): Promise<void> => {
      // Skip if no URL
      if (!book.url?.trim()) {
        return;
      }

      // Check if URL is valid
      if (!bookService.isValidYouTubeUrl(book.url)) {
        return;
      }

      // Normalize URL for tracking
      const normalizedUrl = book.url.trim().toLowerCase();
      
      // Skip if already processed (track by URL, not book ID)
      if (processedUrlsRef.current.has(normalizedUrl)) {
        return;
      }

      // Mark as processing
      processedUrlsRef.current.add(normalizedUrl);
      setFetchingState((prev) => ({ ...prev, [book.id]: true }));

      try {
        const metadata = await fetchMetadata(book.url);

        if (metadata) {
          // Auto-update empty fields only (don't overwrite existing data)
          const updatedBook = metadataComparisonService.autoUpdateEmptyFields(book, metadata);
          
          // Only update if something changed
          if (updatedBook.title !== book.title || updatedBook.author !== book.author) {
            onBookChange(updatedBook);
          }
        }
      } catch (error) {
        console.error(`Failed to fetch metadata for book ${book.id}:`, error);
        // Remove from processed set on error so it can be retried
        processedUrlsRef.current.delete(normalizedUrl);
      } finally {
        setFetchingState((prev) => {
          const newState = { ...prev };
          delete newState[book.id];
          return newState;
        });
      }
    },
    [fetchMetadata, onBookChange, bookService, metadataComparisonService]
  );

  // Process all books that need metadata fetching
  useEffect(() => {
    if (skipAutoFetch || isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;

    // Find books that need metadata fetching
    const booksToFetch = books.filter((book) => {
      // Must have a URL
      if (!book.url?.trim()) {
        return false;
      }

      // Must be a valid YouTube URL
      if (!bookService.isValidYouTubeUrl(book.url)) {
        return false;
      }

      // Must not be already processed (check by normalized URL)
      const normalizedUrl = book.url.trim().toLowerCase();
      if (processedUrlsRef.current.has(normalizedUrl)) {
        return false;
      }

      return true;
    });

    // Fetch metadata for all books sequentially (with small delay between each to avoid rate limiting)
    const fetchAll = async (): Promise<void> => {
      for (const book of booksToFetch) {
        await fetchMetadataForBook(book);
        // Small delay between fetches to avoid rate limiting
        if (booksToFetch.indexOf(book) < booksToFetch.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
      isProcessingRef.current = false;
    };

    fetchAll();
  }, [books, skipAutoFetch, fetchMetadataForBook, bookService]);

  // Clean up processed URLs when books are removed (keep URLs that still exist)
  useEffect(() => {
    const currentUrls = new Set(
      books
        .filter((b) => b.url?.trim())
        .map((b) => b.url.trim().toLowerCase())
    );
    
    // Remove URLs that no longer exist in the books list
    processedUrlsRef.current.forEach((url) => {
      if (!currentUrls.has(url)) {
        processedUrlsRef.current.delete(url);
      }
    });
  }, [books]);

  return {
    fetchingState,
  };
}

