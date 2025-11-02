'use client';

import { Box, Typography, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Stack } from '@mui/material';
import { FilenameTemplateInput } from './filename-template-input';
import { CookiesBrowser } from '../application/stores/app-store';

interface SettingsProps {
  filenameTemplate: string;
  cookiesBrowser: CookiesBrowser;
  onFilenameTemplateChange: (value: string) => void;
  onCookiesBrowserChange: (browser: CookiesBrowser) => void;
}

const BROWSER_OPTIONS: CookiesBrowser[] = ['none', 'brave', 'chrome', 'chromium', 'edge', 'firefox', 'opera', 'safari', 'vivaldi', 'whale'];

export function Settings({ filenameTemplate, cookiesBrowser, onFilenameTemplateChange, onCookiesBrowserChange }: SettingsProps) {
  const handleCookiesBrowserChange = (event: SelectChangeEvent<CookiesBrowser>): void => {
    onCookiesBrowserChange(event.target.value as CookiesBrowser);
  };

  return (
    <Box component="fieldset" sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
      <Typography component="legend" variant="body2" sx={{ px: 1 }}>
        Settings
      </Typography>
      <Stack spacing={2} sx={{ mt: 2 }}>
        <FilenameTemplateInput value={filenameTemplate} onChange={onFilenameTemplateChange} />
        
        <FormControl fullWidth size="small">
          <InputLabel id="cookies-browser-label">Cookies from Browser</InputLabel>
          <Select
            labelId="cookies-browser-label"
            id="cookies-browser"
            value={cookiesBrowser}
            label="Cookies from Browser"
            onChange={handleCookiesBrowserChange}
          >
            {BROWSER_OPTIONS.map((browser) => (
              <MenuItem key={browser} value={browser}>
                {browser === 'none' ? 'None' : browser.charAt(0).toUpperCase() + browser.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          Attach cookies from your browser to bypass 403 errors and access non-public videos.
        </Typography>
      </Stack>
    </Box>
  );
}

