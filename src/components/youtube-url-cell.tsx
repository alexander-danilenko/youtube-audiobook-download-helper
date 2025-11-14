'use client';

import React from 'react';
import { TextField, InputAdornment, CircularProgress } from '@mui/material';
import { TextTransformMenu } from './text-transform-menu';
import { useYouTubeUrl } from '@/hooks/use-youtube-url';

interface YouTubeUrlCellProps {
  value: string;
  onChange: (value: string) => void;
  onMetadataFetched?: (title: string, authorName: string) => void;
  error?: boolean;
}

export const YouTubeUrlCell: React.FC<YouTubeUrlCellProps> = ({ value, onChange, onMetadataFetched, error = false }) => {
  const { localValue, isLoading, handleChange, handleBlur, handlePaste } = useYouTubeUrl({
    value,
    onChange,
    onMetadataFetched,
  });

  return (
    <TextField
      value={localValue || ''}
      onChange={handleChange}
      onBlur={handleBlur}
      onPaste={handlePaste}
      variant="outlined"
      size="small"
      fullWidth
      error={error || !localValue?.trim()}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {isLoading ? (
              <CircularProgress size={20} />
            ) : (
              <TextTransformMenu currentText={localValue || ''} onTransform={(transformedText) => onChange(transformedText)} />
            )}
          </InputAdornment>
        ),
      }}
    />
  );
};
