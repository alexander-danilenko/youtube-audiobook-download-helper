'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TextField, InputAdornment, CircularProgress } from '@mui/material';
import { TextTransformMenu } from './text-transform-menu';
import { useYouTubeMetadata } from '../hooks/use-youtube-metadata';
import { normalizeYouTubeUrl } from '../application/services/youtube-service';

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

  const attemptFetchMetadata = useCallback(async (rawUrl: string) => {
    console.log('YouTubeUrlCell: attemptFetchMetadata called with URL:', rawUrl);
    const normalized = normalizeYouTubeUrl(rawUrl);
    console.log('YouTubeUrlCell: normalized URL:', normalized);

    if (!normalized || normalized === previousUrlRef.current) {
      console.log('YouTubeUrlCell: Skipping fetch - empty or already fetched after normalization');
      return;
    }

    previousUrlRef.current = normalized;

    try {
      console.log('YouTubeUrlCell: Calling fetchMetadata with normalized URL...');
      const metadata = await fetchMetadata(normalized);
      console.log('YouTubeUrlCell: fetchMetadata returned:', metadata);

      if (metadata && onMetadataFetched) {
        console.log('YouTubeUrlCell: Calling onMetadataFetched with:', metadata.title, metadata.authorName);
        onMetadataFetched(metadata.title, metadata.authorName);
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

    // Normalize value on blur and update parent/state
    const trimmedValue = localValue.trim();
    const normalized = normalizeYouTubeUrl(trimmedValue);

    if (normalized) {
      // Update visible input and propagate normalized value
      setLocalValue(normalized);
      onChange(normalized);

      if (normalized !== previousUrlRef.current) {
        attemptFetchMetadata(normalized);
      }
    } else {
      // If not a YouTube URL, just propagate raw value
      onChange(localValue);
    }
  }, [localValue, onChange, attemptFetchMetadata]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted) return;

    const normalized = normalizeYouTubeUrl(pasted.trim());
    if (normalized) {
      // Prevent default paste and replace input with normalized URL
      e.preventDefault();
      setLocalValue(normalized);
      onChange(normalized);

      if (normalized !== previousUrlRef.current) {
        attemptFetchMetadata(normalized);
      }
    }
    // If not normalized, allow default paste behavior
  }, [onChange, attemptFetchMetadata]);

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

