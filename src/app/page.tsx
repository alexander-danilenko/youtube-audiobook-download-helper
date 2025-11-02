'use client';

import { useState } from 'react';
import { Typography, Box, Container } from '@mui/material';
import '../infrastructure/di/container';
import { useAppStore } from '../application/stores/app-store';
import { usePersistStore } from '../application/stores/storage-store';
import { BookTable } from '../components/book-table';
import { FilenameTemplateInput } from '../components/filename-template-input';
import { GenerateScriptButton } from '../components/generate-script-button';
import { Lightbox } from '../components/lightbox';

export default function Home() {
  // Initialize persistence
  usePersistStore();

  // Get state from store
  const books = useAppStore((state) => state.books);
  const filenameTemplate = useAppStore((state) => state.filenameTemplate);
  const setBooks = useAppStore((state) => state.setBooks);
  const setFilenameTemplate = useAppStore((state) => state.setFilenameTemplate);

  // Local UI state (not persisted)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          YouTube Audiobook Script Generator
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1.5 }}>
            The YouTube Audiobook Script Generator is a client-side tool designed to simplify the process of downloading audiobooks from YouTube. 
            It allows you to compile a list of YouTube video URLs and associated book metadata (title, author, narrator, series, year). 
            The application then generates a shell script that leverages `yt-dlp` and `ffmpeg` to download the audio, 
            embed comprehensive metadata, chapters, and cover art thumbnails directly into the audio files. 
            This ensures your downloaded audiobooks are well-organized and ready for your preferred media player.
          </Typography>
          <Typography variant="h6" component="h2" sx={{ mb: 1, mt: 2 }}>
            Prerequisites
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 0, mt: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              yt-dlp installed and available in your system PATH
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0 }}>
              ffmpeg installed and available in your system PATH
            </Typography>
          </Box>
        </Box>
      </Container>
      
      <BookTable
        books={books}
        onBooksChange={setBooks}
        onThumbnailClick={setLightboxImage}
      />
      
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <FilenameTemplateInput value={filenameTemplate} onChange={setFilenameTemplate} />
        <GenerateScriptButton books={books} filenameTemplate={filenameTemplate} />
      </Container>
      
      <Lightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
    </Box>
  );
}
