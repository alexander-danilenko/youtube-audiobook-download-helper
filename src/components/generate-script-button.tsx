'use client';

import { useState } from 'react';
import { Button, Box, Snackbar, Alert } from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { BookDto } from '../application/dto/book-dto';
import { CookiesBrowser } from '../application/stores/app-store';
import { useScriptGenerator } from '../hooks/use-script-generator';

interface GetDownloadCommandButtonProps {
  books: BookDto[];
  filenameTemplate: string;
  cookiesBrowser: CookiesBrowser;
}

export function GetDownloadCommandButton({ books, filenameTemplate, cookiesBrowser }: GetDownloadCommandButtonProps) {
  const { copyDownloadString } = useScriptGenerator();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleClick = async (): Promise<void> => {
    const validBooks = books.filter(
      (book) => book.url && book.title && book.author && book.narrator
    );

    if (validBooks.length === 0) {
      alert('Please add at least one book with URL, title, author, and narrator.');
      return;
    }

    try {
      await copyDownloadString(validBooks, filenameTemplate, cookiesBrowser);
      setSnackbarOpen(true);
    } catch (error) {
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  return (
    <>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          onClick={handleClick}
          variant="contained"
          color="primary"
          size="large"
          startIcon={<ContentCopyIcon />}
        >
          Get Download Command
        </Button>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Download command copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}

