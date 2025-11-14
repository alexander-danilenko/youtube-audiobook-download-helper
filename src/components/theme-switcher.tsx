'use client';

import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeStore } from '@/config/theme-store';
import { useTranslation, useTranslationString } from '@/i18n';

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const tString = useTranslationString();
  const mode = useThemeStore((state) => state.mode);
  const toggleMode = useThemeStore((state) => state.toggleMode);

  return (
    <Tooltip title={mode === 'light' ? t('theme_switch_to_dark') : t('theme_switch_to_light')}>
      <IconButton
        onClick={toggleMode}
        sx={{
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
        aria-label={mode === 'light' ? tString('theme_switch_to_dark') : tString('theme_switch_to_light')}
      >
        {mode === 'light' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
}
