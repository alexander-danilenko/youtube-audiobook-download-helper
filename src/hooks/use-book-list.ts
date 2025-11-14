import { useCallback, useRef } from 'react';
import { BookDto } from '@/application/dto';
import { BookService } from '@/application/services';
import { useAppStore } from '@/application/stores';

interface UseBookListProps {
  books: BookDto[];
  onBooksChange: (books: BookDto[]) => void;
}

export function useBookList({ books, onBooksChange }: UseBookListProps) {
  const bookService = useRef(new BookService()).current;
  const expandAllBooks = useAppStore((state) => state.expandAllBooks);
  const cleanupCollapsedState = useAppStore((state) => state.cleanupCollapsedState);
  // Track book IDs that were imported via CSV to skip metadata fetching
  const importedBookIdsRef = useRef<Set<string>>(new Set());

  const handleImportedBooks = useCallback(
    (importedBooks: BookDto[]): void => {
      // Mark all imported books
      importedBooks.forEach((book) => {
        importedBookIdsRef.current.add(book.id);
      });
      // Expand all imported books
      expandAllBooks(importedBooks.map((book) => book.id));
      // Clear the set after a delay to allow initial render
      // The imported flag only applies to the initial render, not future updates
      setTimeout(() => {
        importedBookIdsRef.current.clear();
      }, 1000);
    },
    [expandAllBooks]
  );

  const handleAddRow = useCallback((): void => {
    const newBook = bookService.createEmptyBook();
    onBooksChange([...books, newBook]);
  }, [books, onBooksChange, bookService]);

  const handleBookChange = useCallback(
    (updatedBook: BookDto): void => {
      onBooksChange(books.map((book) => (book.id === updatedBook.id ? updatedBook : book)));
    },
    [books, onBooksChange]
  );

  const handleBookRemove = useCallback(
    (bookId: string): void => {
      // If this is the last book, replace it with a new empty book instead of removing it
      if (books.length === 1) {
        const newBook = bookService.createEmptyBook();
        onBooksChange([newBook]);
        // Clean up collapsed state for removed books
        cleanupCollapsedState([newBook.id]);
      } else {
        const updatedBooks = books.filter((book) => book.id !== bookId);
        onBooksChange(updatedBooks);
        // Clean up collapsed state for removed books
        cleanupCollapsedState(updatedBooks.map((book) => book.id));
      }
    },
    [books, onBooksChange, bookService, cleanupCollapsedState]
  );

  const handleCloneBook = useCallback(
    (bookId: string): void => {
      const sourceBook = books.find((book) => book.id === bookId);
      if (!sourceBook) return;

      // Create a new book with a unique ID
      const newBook = bookService.createEmptyBook();
      
      // Copy all metadata fields from source book (excluding URL)
      const clonedBook: BookDto = {
        ...newBook,
        title: sourceBook.title,
        author: sourceBook.author,
        narrator: sourceBook.narrator,
        series: sourceBook.series,
        seriesNumber: sourceBook.seriesNumber,
        year: sourceBook.year,
        // URL is already empty from createEmptyBook()
      };

      // Add the cloned book to the list
      onBooksChange([...books, clonedBook]);
      
      // Expand the new book
      expandAllBooks([clonedBook.id]);
    },
    [books, onBooksChange, bookService, expandAllBooks]
  );

  const isImported = useCallback(
    (bookId: string): boolean => {
      return importedBookIdsRef.current.has(bookId);
    },
    []
  );

  return {
    handleAddRow,
    handleBookChange,
    handleBookRemove,
    handleCloneBook,
    handleImportedBooks,
    isImported,
  };
}

