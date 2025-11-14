import { useState, useCallback, useRef } from 'react';
import { BookDto } from '@/application/dto';
import { BookService } from '@/application/services';

interface UseBookTableProps {
  books: BookDto[];
  onBooksChange: (books: BookDto[]) => void;
}

export function useBookTable({ books, onBooksChange }: UseBookTableProps) {
  const bookService = useRef(new BookService()).current;
  const [cleanDialogOpen, setCleanDialogOpen] = useState<boolean>(false);

  const handleAddRow = useCallback((): void => {
    const newBook = bookService.createEmptyBook();
    onBooksChange([...books, newBook]);
  }, [books, onBooksChange, bookService]);

  const handleCleanClick = useCallback((): void => {
    setCleanDialogOpen(true);
  }, []);

  const handleCleanConfirm = useCallback((): void => {
    onBooksChange([]);
    setCleanDialogOpen(false);
  }, [onBooksChange]);

  const handleCleanCancel = useCallback((): void => {
    setCleanDialogOpen(false);
  }, []);

  const handleBookChange = useCallback(
    (updatedBook: BookDto) => {
      onBooksChange(books.map((book) => (book.id === updatedBook.id ? updatedBook : book)));
    },
    [books, onBooksChange]
  );

  const handleUrlChange = useCallback(
    (bookId: string, url: string) => {
      const book = books.find((b) => b.id === bookId);
      if (!book) return;
      onBooksChange(books.map((b) => (b.id === bookId ? { ...b, url } : b)));
    },
    [books, onBooksChange]
  );

  const handleMetadataFetched = useCallback(
    (bookId: string, title: string, authorName: string) => {
      const book = books.find((b) => b.id === bookId);
      if (!book) return;

      // Only auto-populate if fields are currently empty
      const updatedBook: BookDto = {
        ...book,
        title: book.title.trim() === '' ? title : book.title,
        author: book.author.trim() === '' ? authorName : book.author,
      };

      onBooksChange(books.map((b) => (b.id === bookId ? updatedBook : b)));
    },
    [books, onBooksChange]
  );

  const handleBookRemove = useCallback(
    (bookId: string): void => {
      // If this is the last book, replace it with a new empty book instead of removing it
      if (books.length === 1) {
        const newBook = bookService.createEmptyBook();
        onBooksChange([newBook]);
      } else {
        onBooksChange(books.filter((book) => book.id !== bookId));
      }
    },
    [books, onBooksChange, bookService]
  );

  return {
    cleanDialogOpen,
    handleAddRow,
    handleCleanClick,
    handleCleanConfirm,
    handleCleanCancel,
    handleBookChange,
    handleUrlChange,
    handleMetadataFetched,
    handleBookRemove,
  };
}
