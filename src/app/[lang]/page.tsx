'use client';

import { useState, useEffect } from 'react';
import { Typography, Box, Container, Paper, Stack, Alert, Link, Button } from '@mui/material';
import '../../infrastructure/di/container';
import { useAppStore } from '../../application/stores/app-store';
import { usePersistStore } from '../../application/stores/storage-store';
import { BookList } from '../../components/book-list';
import { Settings } from '../../components/settings';
import { GetDownloadCommandButton } from '../../components/generate-script-button';
import { Lightbox } from '../../components/lightbox';
import { AppHeader } from '../../components/app-header';
import { AppFooter } from '../../components/app-footer';
import { useTranslation } from '../../i18n/use-translation';
import { useLanguageStore } from '../../i18n/language-store';
import { useParams, useRouter } from 'next/navigation';
import { Language } from '../../i18n/translations';

export default function Home() {
  const params = useParams();
  const router = useRouter();
  const lang = params?.lang as Language | undefined;
  
  // Initialize persistence and wait for hydration
  const isHydrated = usePersistStore();
  const { t } = useTranslation();
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
  const setBooks = useAppStore((state) => state.setBooks);
  const setFilenameTemplate = useAppStore((state) => state.setFilenameTemplate);
  const setCookiesBrowser = useAppStore((state) => state.setCookiesBrowser);
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
      
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            {/* Introduction Section */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Stack spacing={2}>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
                  {t('page_description_heading')}
                </Typography>
                <Typography variant="body1">
                  {t('introduction_paragraph_1')}
                </Typography>
                
                <Typography variant="body1">
                  {t('introduction_paragraph_2', {
                    ytdlp: (
                      <Typography component="code" variant="inherit" sx={{ bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5, fontFamily: 'monospace' }}>
                        {t('introduction_ytdlp')}
                      </Typography>
                    ),
                    downloadAudio: <strong>{t('introduction_download_audio')}</strong>,
                    ffmpeg: (
                      <Typography component="code" variant="inherit" sx={{ bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5, fontFamily: 'monospace' }}>
                        {t('introduction_ffmpeg')}
                      </Typography>
                    ),
                  })}
                </Typography>
                
                <Typography variant="body1">
                  {t('introduction_paragraph_3')}
                </Typography>
              </Stack>
            </Paper>

            {/* Book Table Section */}
            <Paper elevation={0} sx={{ bgcolor: 'background.paper', overflow: 'hidden' }}>
              <Box sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 500 }}>
                  {t('books_title')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => collapseAllBooks(books.map(book => book.id))}
                    disabled={books.length === 0}
                    sx={{
                      borderWidth: 2,
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
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Settings
                filenameTemplate={filenameTemplate}
                cookiesBrowser={cookiesBrowser}
                onFilenameTemplateChange={setFilenameTemplate}
                onCookiesBrowserChange={setCookiesBrowser}
              />
            </Paper>

            {/* Script Generation Section */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Stack spacing={2}>
                <Alert severity="warning">
                  <strong>{t('script_generation_warning')}</strong>: {t('script_generation_warning_text', {
                    ytdlpLink: (
                      <Link href="https://github.com/yt-dlp/yt-dlp" target="_blank" rel="noopener noreferrer" underline="hover">
                        yt-dlp
                      </Link>
                    ),
                    ffmpegLink: (
                      <Link href="https://ffmpeg.org/" target="_blank" rel="noopener noreferrer" underline="hover">
                        ffmpeg
                      </Link>
                    ),
                  })}
                </Alert>
                <GetDownloadCommandButton books={books} filenameTemplate={filenameTemplate} cookiesBrowser={cookiesBrowser} />
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
