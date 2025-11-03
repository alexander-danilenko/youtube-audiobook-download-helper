'use client';

import { Box, Container, Typography, Link, Stack, Divider } from '@mui/material';
import { GitHub as GitHubIcon } from '@mui/icons-material';
import { useTranslation } from '../i18n/use-translation';

export function AppFooter() {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear().toString();

  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        mt: 'auto',
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Typography variant="body2" color="text.secondary">
              {t('footer_copyright', { year: currentYear })}
            </Typography>
            <Link
              href="https://github.com/alexander-danilenko/youtube-audiobook-download-helper"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              variant="body2"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <GitHubIcon sx={{ fontSize: 18 }} />
              {t('footer_link_github')}
            </Link>
          </Stack>
          <Divider />
          <Typography variant="body2" color="text.secondary" align="center">
            {t('footer_disclaimer')}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

