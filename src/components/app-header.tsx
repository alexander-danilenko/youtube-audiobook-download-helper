'use client';

import { AppBar, Typography, Box, Container, Select, MenuItem, FormControl } from '@mui/material';
import { useTranslation } from '../i18n/use-translation';
import { useLanguageStore } from '../i18n/language-store';
import { useRouter, useParams } from 'next/navigation';
import { Language } from '../i18n/translations';
import { themeColors } from '../config/theme';

export function AppHeader() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const currentLang = (params?.lang as Language) || 'en';

  const handleLanguageChange = (newLang: Language): void => {
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(/^\/(en|ukr)/, `/${newLang}`);
    router.push(newPath);
  };

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: themeColors.headerBackground, color: themeColors.headerText }}>
      <Container maxWidth="xl" sx={{ width: '100%', py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/icon.svg"
              alt="YouTube"
              sx={{
                width: 64,
                height: 64,
                flexShrink: 0,
              }}
            />
            <Box>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
                {t('app_title')}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
                {t('app_subtitle')}
              </Typography>
            </Box>
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              sx={{
                bgcolor: `rgba(255, 255, 255, 0.1)`,
                color: themeColors.headerText,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '& .MuiSelect-icon': {
                  color: themeColors.headerText,
                },
              }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ukr">Українська</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Container>
    </AppBar>
  );
}

