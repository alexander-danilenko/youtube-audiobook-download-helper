'use client';

import { useState } from 'react';
import { Button, Box, Snackbar, Alert } from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { BookDto } from '@/application/dto';
import { CookiesBrowser, AudioBitrate } from '@/application/stores';
import { BookService } from '@/application/services';
import { useScriptGenerator } from '@/hooks/use-script-generator';
import { useTranslation } from '@/i18n';
import { useMemo } from 'react';

interface GetDownloadCommandButtonProps {
  books: BookDto[];
  filenameTemplate: string;
  cookiesBrowser: CookiesBrowser;
  maxAudioBitrate: AudioBitrate;
}

export function GetDownloadCommandButton({ books, filenameTemplate, cookiesBrowser, maxAudioBitrate }: GetDownloadCommandButtonProps) {
  const { t } = useTranslation();
  const { copyDownloadString } = useScriptGenerator();
  const bookService = useMemo(() => new BookService(), []);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Validate all books using BookService
  const validBooks = bookService.getValidBooks(books);
  const hasInvalidBooks = bookService.hasInvalidBooks(books);
  const isDisabled = validBooks.length === 0 || hasInvalidBooks;

  const handleClick = async (): Promise<void> => {
    try {
      await copyDownloadString(validBooks, filenameTemplate, cookiesBrowser, maxAudioBitrate);
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
      <Box
        sx={{
          mt: { xs: 2, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          width: '100%',
        }}
      >
        <Button
          onClick={handleClick}
          variant="contained"
          color="primary"
          size="large"
          startIcon={<ContentCopyIcon />}
          disabled={isDisabled}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {t('script_generation_get_download_command')}
        </Button>
        {hasInvalidBooks && (
          <Alert severity="error" sx={{ width: '100%', maxWidth: { xs: '100%', sm: 600 } }}>
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
