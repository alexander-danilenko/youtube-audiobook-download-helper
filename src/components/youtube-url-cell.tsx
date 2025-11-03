'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TextField, InputAdornment, CircularProgress } from '@mui/material';
import { TextTransformMenu } from './text-transform-menu';
import { useYouTubeMetadata } from '../hooks/use-youtube-metadata';

interface YouTubeUrlCellProps {
  value: string;
  onChange: (value: string) => void;
  onMetadataFetched?: (title: string, authorName: string) => void;
  error?: boolean;
}

export const YouTubeUrlCell: React.FC<YouTubeUrlCellProps> = ({ value, onChange, onMetadataFetched, error = false }) => {
  const [localValue, setLocalValue] = useState<string>(value);
  const { isLoading, fetchMetadata } = useYouTubeMetadata();
  const previousUrlRef = useRef<string>('');
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
    // Reset previous URL ref when value prop changes (e.g., when book changes)
    // This allows re-fetching if the same URL is set from props
    previousUrlRef.current = '';
  }, [value]);

  const attemptFetchMetadata = useCallback(async (url: string) => {
    console.log('YouTubeUrlCell: attemptFetchMetadata called with URL:', url);
    console.log('YouTubeUrlCell: previousUrlRef.current:', previousUrlRef.current);
    console.log('YouTubeUrlCell: onMetadataFetched:', typeof onMetadataFetched);

    if (!url || url.trim().length === 0 || url === previousUrlRef.current) {
      console.log('YouTubeUrlCell: Skipping fetch - empty URL or already fetched');
      return;
    }

    previousUrlRef.current = url;

    // Validate it's a YouTube URL first
    try {
      const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
      const isValid = youtubePattern.test(url.trim());
      console.log('YouTubeUrlCell: URL validation result:', isValid);
      
      if (isValid) {
        console.log('YouTubeUrlCell: Calling fetchMetadata...');
        const metadata = await fetchMetadata(url);
        console.log('YouTubeUrlCell: fetchMetadata returned:', metadata);
        
        if (metadata && onMetadataFetched) {
          console.log('YouTubeUrlCell: Calling onMetadataFetched with:', metadata.title, metadata.authorName);
          onMetadataFetched(metadata.title, metadata.authorName);
        } else {
          console.log('YouTubeUrlCell: Not calling onMetadataFetched - metadata:', metadata, 'callback:', onMetadataFetched);
        }
      } else {
        console.log('YouTubeUrlCell: URL does not match YouTube pattern');
      }
    } catch (error) {
      console.error('YouTubeUrlCell: Error fetching YouTube metadata:', error);
    }
  }, [fetchMetadata, onMetadataFetched]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Clear existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Debounce: fetch metadata after user stops typing (500ms)
    fetchTimeoutRef.current = setTimeout(() => {
      attemptFetchMetadata(newValue.trim());
    }, 500);
  }, [attemptFetchMetadata]);

  const handleBlur = useCallback(() => {
    // Clear timeout on blur
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
    
    // Trigger fetch immediately if URL is valid and changed
    const trimmedValue = localValue.trim();
    if (trimmedValue && trimmedValue !== previousUrlRef.current) {
      attemptFetchMetadata(trimmedValue);
    }
    
    onChange(localValue);
  }, [localValue, onChange, attemptFetchMetadata]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <TextField
      value={localValue || ''}
      onChange={handleChange}
      onBlur={handleBlur}
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
              <TextTransformMenu
                currentText={localValue || ''}
                onTransform={(transformedText) => setLocalValue(transformedText)}
              />
            )}
          </InputAdornment>
        ),
      }}
    />
  );
};

