'use client';

import { useState } from 'react';
import { Typography, Box, Container, Paper, Stack, Alert, Link } from '@mui/material';
import '../infrastructure/di/container';
import { useAppStore } from '../application/stores/app-store';
import { usePersistStore } from '../application/stores/storage-store';
import { BookList } from '../components/book-list';
import { FilenameTemplateInput } from '../components/filename-template-input';
import { GenerateScriptButton } from '../components/generate-script-button';
import { Lightbox } from '../components/lightbox';
import { AppHeader } from '../components/app-header';

export default function Home() {
  // Initialize persistence and wait for hydration
  const isHydrated = usePersistStore();

  // Get state from store
  const books = useAppStore((state) => state.books);
  const filenameTemplate = useAppStore((state) => state.filenameTemplate);
  const setBooks = useAppStore((state) => state.setBooks);
  const setFilenameTemplate = useAppStore((state) => state.setFilenameTemplate);

  // Local UI state (not persisted)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Prevent hydration mismatch by not rendering until state is loaded
  if (!isHydrated) {
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
              <Typography variant="body1" sx={{ mb: 2 }}>
                The YouTube Audiobook Script Generator is a client-side tool designed to simplify the process of downloading audiobooks from YouTube. 
                It allows you to compile a list of YouTube video URLs and associated book metadata (title, author, narrator, series, year). 
                The application then generates a shell script that leverages{' '}
                <Typography component="code" variant="inherit" sx={{ bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5, fontFamily: 'monospace' }}>
                  yt-dlp
                </Typography>
                {' '}and{' '}
                <Typography component="code" variant="inherit" sx={{ bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5, fontFamily: 'monospace' }}>
                  ffmpeg
                </Typography>
                {' '}to download the audio, 
                embed comprehensive metadata, chapters, and cover art thumbnails directly into the audio files. 
                This ensures your downloaded audiobooks are well-organized and ready for your preferred media player.
              </Typography>
            </Paper>

            {/* Book Table Section */}
            <Paper elevation={0} sx={{ bgcolor: 'background.paper', overflow: 'hidden' }}>
              <Typography variant="h6" component="h2" sx={{ p: 3, pb: 2, fontWeight: 500 }}>
                Books
              </Typography>
              <BookList
                books={books}
                onBooksChange={setBooks}
                onThumbnailClick={setLightboxImage}
              />
            </Paper>

            {/* Script Generation Section */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Stack spacing={2}>
                <FilenameTemplateInput value={filenameTemplate} onChange={setFilenameTemplate} />
                <Alert severity="warning">
                  <Link href="https://github.com/yt-dlp/yt-dlp" target="_blank" rel="noopener noreferrer" underline="hover">
                    yt-dlp
                  </Link>
                  {' '}and{' '}
                  <Link href="https://ffmpeg.org/" target="_blank" rel="noopener noreferrer" underline="hover">
                    ffmpeg
                  </Link>
                  {' '}need to be installed in order for the script to work.
                </Alert>
                <GenerateScriptButton books={books} filenameTemplate={filenameTemplate} />
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>

      <Lightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
    </Box>
  );
}
