'use client';

import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { BookDto } from '../application/dto/book-dto';
import { CsvImportExport } from './csv-import-export';
import { BookCard } from './book-card';
import { useRef } from 'react';


interface BookListProps {
  books: BookDto[];
  onBooksChange: (books: BookDto[]) => void;
  onThumbnailClick: (imageUrl: string) => void;
}

export function BookList({ books, onBooksChange, onThumbnailClick }: BookListProps) {
  // Track book IDs that were imported via CSV to skip metadata fetching
  const importedBookIdsRef = useRef<Set<string>>(new Set());
  
  const handleImportedBooks = (importedBooks: BookDto[]): void => {
    // Mark all imported books
    importedBooks.forEach(book => {
      importedBookIdsRef.current.add(book.id);
    });
    // Clear the set after a delay to allow initial render
    // The imported flag only applies to the initial render, not future updates
    setTimeout(() => {
      importedBookIdsRef.current.clear();
    }, 1000);
  };
  const handleAddRow = (): void => {
    const newBook: BookDto = {
      id: Date.now().toString(),
      url: '',
      title: '',
      author: '',
      narrator: '',
      series: '',
      seriesNumber: 1,
      year: undefined,
    };
    onBooksChange([...books, newBook]);
  };

  const handleBookChange = (updatedBook: BookDto): void => {
    onBooksChange(books.map((book) => (book.id === updatedBook.id ? updatedBook : book)));
  };

  const handleBookRemove = (bookId: string): void => {
    // If this is the last book, replace it with a new empty book instead of removing it
    if (books.length === 1) {
      const newBook: BookDto = {
        id: Date.now().toString(),
        url: '',
        title: '',
        author: '',
        narrator: '',
        series: '',
        seriesNumber: 1,
        year: undefined,
      };
      onBooksChange([newBook]);
    } else {
      onBooksChange(books.filter((book) => book.id !== bookId));
    }
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden', maxWidth: 'none', p: 2 }}>
      <Box>
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onBookChange={handleBookChange}
            onRemove={() => handleBookRemove(book.id)}
            onThumbnailClick={onThumbnailClick}
            skipAutoMetadataFetch={importedBookIdsRef.current.has(book.id)}
          />
        ))}
      </Box>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, width: '100%', maxWidth: 'none' }}>
        <CsvImportExport books={books} onBooksChange={onBooksChange} onImport={handleImportedBooks} />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddRow}
        >
          Add New Book
        </Button>
      </Box>
    </Box>
  );
}

