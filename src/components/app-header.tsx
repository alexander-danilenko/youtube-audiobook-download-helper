'use client';

import { AppBar, Typography, Box, Container } from '@mui/material';

export function AppHeader() {
  return (
    <AppBar position="static" elevation={0}>
      <Container maxWidth="xl" sx={{ width: '100%', py: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
            YouTube Audiobook Script Generator
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
            Generate shell scripts for downloading YouTube audiobooks with yt-dlp
          </Typography>
        </Box>
      </Container>
    </AppBar>
  );
}

