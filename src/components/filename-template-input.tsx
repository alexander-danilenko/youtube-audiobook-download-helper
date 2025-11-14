'use client';

import { TextField, FormHelperText, Box, Button, Typography, InputAdornment } from '@mui/material';
import { DEFAULT_FILENAME_TEMPLATE } from '@/application/stores';
import { TextTransformMenu } from './text-transform-menu';
import { useTranslation } from '@/i18n';

interface FilenameTemplateInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function FilenameTemplateInput({ value, onChange }: FilenameTemplateInputProps) {
  const { t } = useTranslation();
  const handleReset = (): void => {
    onChange(DEFAULT_FILENAME_TEMPLATE);
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        {t('settings_filename_template')}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
        id="filename-template"
        value={value}
        onChange={(e) => onChange(e.target.value)}
          placeholder={DEFAULT_FILENAME_TEMPLATE}
          fullWidth
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <TextTransformMenu
                  currentText={value}
                  onTransform={onChange}
                />
              </InputAdornment>
            ),
          }}
        />
        <Button
          onClick={handleReset}
          variant="outlined"
          size="small"
          sx={{ flexShrink: 0, height: '40px' }}
        >
          {t('settings_reset')}
        </Button>
      </Box>
      <FormHelperText sx={{ mt: 1, mx: 0 }}>
        {t('settings_filename_template_helper')}
      </FormHelperText>
    </Box>
  );
}

