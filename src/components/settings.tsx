'use client';

import { Typography, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Stack } from '@mui/material';
import { FilenameTemplateInput } from './filename-template-input';
import { CookiesBrowser } from '../application/stores/app-store';
import { useTranslation } from '../i18n/use-translation';

interface SettingsProps {
  filenameTemplate: string;
  cookiesBrowser: CookiesBrowser;
  onFilenameTemplateChange: (value: string) => void;
  onCookiesBrowserChange: (browser: CookiesBrowser) => void;
}

const BROWSER_OPTIONS: CookiesBrowser[] = ['none', 'brave', 'chrome', 'chromium', 'edge', 'firefox', 'opera', 'safari', 'vivaldi', 'whale'];

export function Settings({ filenameTemplate, cookiesBrowser, onFilenameTemplateChange, onCookiesBrowserChange }: SettingsProps) {
  const { t } = useTranslation();
  const handleCookiesBrowserChange = (event: SelectChangeEvent<CookiesBrowser>): void => {
    onCookiesBrowserChange(event.target.value as CookiesBrowser);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 500 }}>
        {t('settings_title')}
      </Typography>
      <Stack spacing={2}>
        <FilenameTemplateInput value={filenameTemplate} onChange={onFilenameTemplateChange} />
        
        <FormControl fullWidth size="small">
          <InputLabel id="cookies-browser-label">{t('settings_cookies_browser')}</InputLabel>
          <Select
            labelId="cookies-browser-label"
            id="cookies-browser"
            value={cookiesBrowser}
            label={t('settings_cookies_browser')}
            onChange={handleCookiesBrowserChange}
          >
            {BROWSER_OPTIONS.map((browser) => (
              <MenuItem key={browser} value={browser}>
                {browser === 'none' ? t('settings_browser_none') : browser.charAt(0).toUpperCase() + browser.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          {t('settings_cookies_browser_helper')}
        </Typography>
      </Stack>
    </Stack>
  );
}

