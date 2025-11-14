'use client';

import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { BookDto } from '@/application/dto';
import { CsvImportExport } from './csv-import-export';
import { BookCard } from './book-card';
import { useBookList } from '@/hooks/use-book-list';
import { useAutoFetchMetadata } from '@/hooks/use-auto-fetch-metadata';
import { useTranslation } from '@/i18n';

interface BookListProps {
  books: BookDto[];
  onBooksChange: (books: BookDto[]) => void;
  onThumbnailClick: (imageUrl: string) => void;
}

export function BookList({ books, onBooksChange, onThumbnailClick }: BookListProps) {
  const { t } = useTranslation();
  const { handleAddRow, handleBookChange, handleBookRemove, handleCloneBook, handleImportedBooks, isImported } = useBookList({
    books,
    onBooksChange,
  });
  
  // Auto-fetch metadata for all books with URLs (without showing dialog)
  // Note: Auto-fetch doesn't trigger dialogs - it just updates books directly
  const { fetchingState } = useAutoFetchMetadata({
    books,
    onBookChange: handleBookChange,
    skipAutoFetch: false,
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
            onClone={() => handleCloneBook(book.id)}
            onThumbnailClick={onThumbnailClick}
            skipAutoMetadataFetch={isImported(book.id)}
            isFetchingMetadata={fetchingState[book.id] || false}
            showMetadataDialog={true}
          />
        ))}
      </Box>
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'flex-end',
          gap: 1,
          width: '100%',
          maxWidth: 'none',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddRow}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            whiteSpace: 'nowrap',
            order: { xs: 1, sm: 2 },
          }}
        >
          {t('books_add_new_book')}
        </Button>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            order: { xs: 2, sm: 1 },
          }}
        >
          <CsvImportExport books={books} onBooksChange={onBooksChange} onImport={handleImportedBooks} />
        </Box>
      </Box>
    </Box>
  );
}
