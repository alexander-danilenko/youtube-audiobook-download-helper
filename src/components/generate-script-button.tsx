'use client';

import { useState } from 'react';
import { Button, Box, Snackbar, Alert } from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { BookDto, bookDtoSchema } from '../application/dto/book-dto';
import { CookiesBrowser } from '../application/stores/app-store';
import { useScriptGenerator } from '../hooks/use-script-generator';
import { useTranslation } from '../i18n/use-translation';

interface GetDownloadCommandButtonProps {
  books: BookDto[];
  filenameTemplate: string;
  cookiesBrowser: CookiesBrowser;
}

export function GetDownloadCommandButton({ books, filenameTemplate, cookiesBrowser }: GetDownloadCommandButtonProps) {
  const { t } = useTranslation();
  const { copyDownloadString } = useScriptGenerator();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Validate all books using zod schema
  const validationResults = books.map((book) => ({
    book,
    result: bookDtoSchema.safeParse(book),
  }));

  const validBooks = validationResults.filter(({ result }) => result.success).map(({ book }) => book) as BookDto[];

  const hasInvalidBooks = validationResults.some(({ result }) => !result.success);

  const isDisabled = validBooks.length === 0 || hasInvalidBooks;

  const handleClick = async (): Promise<void> => {
    try {
      await copyDownloadString(validBooks, filenameTemplate, cookiesBrowser);
      setSnackbarMessage(t('script_generation_copy_success') as string);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch {
      setSnackbarMessage(t('script_generation_error_copy_failed') as string);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Button
          onClick={handleClick}
          variant="contained"
          color="primary"
          size="large"
          startIcon={<ContentCopyIcon />}
          disabled={isDisabled}
        >
          {t('script_generation_get_download_command')}
        </Button>
        {hasInvalidBooks && (
          <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
            {t('script_generation_error_invalid_books')}
          </Alert>
        )}
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={snackbarSeverity === 'error' ? 6000 : 3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

