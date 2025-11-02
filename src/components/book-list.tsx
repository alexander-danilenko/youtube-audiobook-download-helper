'use client';

import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { BookDto } from '../application/dto/book-dto';
import { CsvImportExport } from './csv-import-export';
import { BookCard } from './book-card';


interface BookListProps {
  books: BookDto[];
  onBooksChange: (books: BookDto[]) => void;
  onThumbnailClick: (imageUrl: string) => void;
}

export function BookList({ books, onBooksChange, onThumbnailClick }: BookListProps) {
  const [cleanDialogOpen, setCleanDialogOpen] = useState<boolean>(false);

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

  const handleCleanClick = (): void => {
    setCleanDialogOpen(true);
  };

  const handleCleanConfirm = (): void => {
    onBooksChange([]);
    setCleanDialogOpen(false);
  };

  const handleCleanCancel = (): void => {
    setCleanDialogOpen(false);
  };

  const handleBookChange = (updatedBook: BookDto): void => {
    onBooksChange(books.map((book) => (book.id === updatedBook.id ? updatedBook : book)));
  };

  const handleBookRemove = (bookId: string): void => {
    onBooksChange(books.filter((book) => book.id !== bookId));
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
          />
        ))}
      </Box>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, width: '100%', maxWidth: 'none' }}>
        <CsvImportExport books={books} onBooksChange={onBooksChange} />
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleCleanClick}
          disabled={books.length === 0}
        >
          Clean
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddRow}
        >
          Add New Book
        </Button>
      </Box>

      <Dialog
        open={cleanDialogOpen}
        onClose={handleCleanCancel}
      >
        <DialogTitle>Clear Table</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear all books from the table? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCleanCancel}>Cancel</Button>
          <Button onClick={handleCleanConfirm} color="error" variant="contained">
            Clear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

