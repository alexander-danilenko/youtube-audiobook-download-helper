'use client';

import { useState, useEffect } from 'react';
import { Typography, Box, Container, Paper, Stack, Alert, Button } from '@mui/material';
import '@/infrastructure/di/container';
import { useAppStore, usePersistStore } from '@/application/stores';
import { BookList, Settings, GetDownloadCommandButton, Lightbox, AppHeader, AppFooter } from '@/components';
import { useTranslation, useLanguageStore, type Language } from '@/i18n';
import { useParams, useRouter } from 'next/navigation';

export default function Home() {
  const params = useParams();
  const router = useRouter();
  const lang = params?.lang as Language | undefined;
  
  // Initialize persistence and wait for hydration
  const isHydrated = usePersistStore();
  const { t, tMarkdown } = useTranslation();
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  // Sync URL language with store
  useEffect(() => {
    if (lang && (lang === 'en' || lang === 'ukr')) {
      setLanguage(lang);
    } else if (lang && lang !== 'en' && lang !== 'ukr') {
      // Invalid language, redirect to English
      router.replace('/en');
    }
  }, [lang, setLanguage, router]);

  // Get state from store
  const books = useAppStore((state) => state.books);
  const filenameTemplate = useAppStore((state) => state.filenameTemplate);
  const cookiesBrowser = useAppStore((state) => state.cookiesBrowser);
  const maxAudioBitrate = useAppStore((state) => state.maxAudioBitrate);
  const setBooks = useAppStore((state) => state.setBooks);
  const setFilenameTemplate = useAppStore((state) => state.setFilenameTemplate);
  const setCookiesBrowser = useAppStore((state) => state.setCookiesBrowser);
  const setMaxAudioBitrate = useAppStore((state) => state.setMaxAudioBitrate);
  const expandAllBooks = useAppStore((state) => state.expandAllBooks);
  const collapseAllBooks = useAppStore((state) => state.collapseAllBooks);

  // Local UI state (not persisted)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Prevent hydration mismatch by not rendering until state is loaded
  if (!isHydrated || !lang || (lang !== 'en' && lang !== 'ukr')) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppHeader />
      
      <Box component="main" sx={{ flexGrow: 1, py: { xs: 0, sm: 3 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 3 } }}>
          <Stack spacing={{ xs: 0, sm: 3 }}>
            {/* Introduction Section */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper' }}>
              {tMarkdown('introduction_section')}
            </Paper>

            {/* Book Table Section */}
            <Paper elevation={0} sx={{ bgcolor: 'background.paper', overflow: 'hidden' }}>
              <Box
                sx={{
                  p: { xs: 2, sm: 3 },
                  pb: 2,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: { xs: 2, sm: 0 },
                }}
              >
                <Typography variant="h6" component="h2" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {t('books_title')}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => collapseAllBooks(books.map(book => book.id))}
                    disabled={books.length === 0}
                    sx={{
                      borderWidth: 2,
                      width: { xs: '100%', sm: 'auto' },
                      '&.MuiButton-outlined': {
                        borderColor: (theme) => theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.5)' 
                          : undefined,
                        color: (theme) => theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.9)' 
                          : undefined,
                        '&:hover': {
                          borderWidth: 2,
                          borderColor: (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.8)' 
                            : undefined,
                          backgroundColor: (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : undefined,
                        },
                      },
                    }}
                  >
                    {t('books_collapse_all')}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => expandAllBooks(books.map(book => book.id))}
                    disabled={books.length === 0}
                    sx={{
                      borderWidth: 2,
                      width: { xs: '100%', sm: 'auto' },
                      '&.MuiButton-outlined': {
                        borderColor: (theme) => theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.5)' 
                          : undefined,
                        color: (theme) => theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.9)' 
                          : undefined,
                        '&:hover': {
                          borderWidth: 2,
                          borderColor: (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.8)' 
                            : undefined,
                          backgroundColor: (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : undefined,
                        },
                      },
                    }}
                  >
                    {t('books_expand_all')}
                  </Button>
                </Box>
              </Box>
              <BookList
                books={books}
                onBooksChange={setBooks}
                onThumbnailClick={setLightboxImage}
              />
            </Paper>

            {/* Settings Section */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper' }}>
              <Settings
                filenameTemplate={filenameTemplate}
                cookiesBrowser={cookiesBrowser}
                maxAudioBitrate={maxAudioBitrate}
                onFilenameTemplateChange={setFilenameTemplate}
                onCookiesBrowserChange={setCookiesBrowser}
                onMaxAudioBitrateChange={setMaxAudioBitrate}
              />
            </Paper>

            {/* Script Generation Section */}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper' }}>
              <Stack spacing={2}>
                <Alert severity="warning">
                  {tMarkdown('script_generation_warning_text')}
                </Alert>
                <GetDownloadCommandButton books={books} filenameTemplate={filenameTemplate} cookiesBrowser={cookiesBrowser} maxAudioBitrate={maxAudioBitrate} />
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>

      <AppFooter />

      <Lightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
    </Box>
  );
}
