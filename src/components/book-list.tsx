'use client';

import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { BookDto } from '@/application/dto';
import { CsvImportExport } from './csv-import-export';
import { BookCard } from './book-card';
import { useBookList } from '@/hooks/use-book-list';
import { useTranslation } from '@/i18n';

interface BookListProps {
  books: BookDto[];
  onBooksChange: (books: BookDto[]) => void;
  onThumbnailClick: (imageUrl: string) => void;
}

export function BookList({ books, onBooksChange, onThumbnailClick }: BookListProps) {
  const { t } = useTranslation();
  const { handleAddRow, handleBookChange, handleBookRemove, handleImportedBooks, isImported } = useBookList({
    books,
    onBooksChange,
  });

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
            skipAutoMetadataFetch={isImported(book.id)}
          />
        ))}
      </Box>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, width: '100%', maxWidth: 'none' }}>
        <CsvImportExport books={books} onBooksChange={onBooksChange} onImport={handleImportedBooks} />
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddRow}>
          {t('books_add_new_book')}
        </Button>
      </Box>
    </Box>
  );
}
