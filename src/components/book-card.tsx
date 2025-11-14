'use client';

import { TextField, Box, Paper, Typography, IconButton, InputAdornment, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Radio, FormControlLabel, Collapse } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { BookDto, bookDtoSchema } from '../application/dto/book-dto';
import { useThumbnail } from '../hooks/use-thumbnail';
import { useYouTubeMetadata } from '../hooks/use-youtube-metadata';
import { normalizeYouTubeUrl } from '../application/services/youtube-service';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { TextTransformMenu } from './text-transform-menu';
import { useAppStore } from '../application/stores/app-store';
import { useTranslation, useTranslationString } from '../i18n/use-translation';
import { TranslationKey } from '../i18n/translations';

interface BookCardProps {
  book: BookDto;
  onBookChange: (updatedBook: BookDto) => void;
  onRemove: () => void;
  onThumbnailClick: (imageUrl: string) => void;
  skipAutoMetadataFetch?: boolean;
}

interface MetadataComparison {
  fieldName: 'title' | 'author';
  current: string;
  fetched: string;
}

export function BookCard({ book, onBookChange, onRemove, onThumbnailClick, skipAutoMetadataFetch = false }: BookCardProps) {
  const { t } = useTranslation();
  const tString = useTranslationString();
  const { thumbnailUrl, fullSizeThumbnailUrl } = useThumbnail(book.url);
  const { isLoading, fetchMetadata, error: metadataError } = useYouTubeMetadata();
  const changeThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pasteIgnoreRef = useRef<boolean>(false);
  
  // Local state for immediate UI updates (no lag)
  const [localBook, setLocalBook] = useState<BookDto>(book);
  
  // Sync local state with prop changes from parent
  useEffect(() => {
    setLocalBook(book);
  }, [book]);
  
  // Comparison dialog state
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [comparisons, setComparisons] = useState<MetadataComparison[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, 'current' | 'fetched'>>({});
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false);
  
  // Collapsed state from store
  const collapsedBookIds = useAppStore((state) => state.collapsedBookIds);
  const toggleBookCollapsed = useAppStore((state) => state.toggleBookCollapsed);
  const isCollapsed = collapsedBookIds.has(book.id);

  // Zod validation state - computed reactively from local state for immediate feedback
  const validationResult = useMemo(() => {
    return bookDtoSchema.safeParse(localBook);
  }, [localBook]);

  // Field-level validation errors (translated)
  const fieldErrors = useMemo(() => {
    if (validationResult.success) {
      return {};
    }
    const errors: Record<string, string> = {};
    if (validationResult.error) {
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        // Check if the message is a translation key (starts with 'validation_')
        const message = issue.message;
        const translatedMessage = message.startsWith('validation_') 
          ? (t(message as TranslationKey) as string)
          : message;
        errors[path] = translatedMessage;
      });
    }
    return errors;
  }, [validationResult, t]);

  // Derived validation state - computed reactively from local state for immediate feedback
  const isUrlValid = useMemo(() => {
    if (!localBook.url?.trim()) return false;
    try {
      const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
      return youtubePattern.test(localBook.url.trim());
    } catch {
      return false;
    }
  }, [localBook.url]);

  const isUrlFullyValid = useMemo(() => {
    return isUrlValid && !!thumbnailUrl && isThumbnailLoaded && !metadataError && !isLoading;
  }, [isUrlValid, thumbnailUrl, isThumbnailLoaded, metadataError, isLoading]);

  const handleComparisonSelect = (fieldName: string, value: 'current' | 'fetched') => {
    setSelectedValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleApplyComparison = () => {
    const updatedBook = { ...localBook };
    comparisons.forEach(comparison => {
      const selected = selectedValues[comparison.fieldName] || 'fetched';
      if (selected === 'fetched') {
        updatedBook[comparison.fieldName] = comparison.fetched;
      }
    });
    setLocalBook(updatedBook);
    onBookChange(updatedBook);
    setComparisonDialogOpen(false);
  };

  // Reset thumbnail loaded state when URL changes
  useEffect(() => {
    setIsThumbnailLoaded(false);
  }, [localBook.url]);

  useEffect(() => {
    if (!thumbnailUrl) {
      setIsThumbnailLoaded(false);
    }
  }, [thumbnailUrl]);

  const attemptFetchMetadata = useCallback(async (url: string) => {
    if (!url?.trim() || !isUrlValid) return;
    
    try {
      const metadata = await fetchMetadata(url);
      
      if (metadata) {
        // Check for conflicts with existing data
        const diffs: MetadataComparison[] = [];
        
        if (localBook.title.trim() && localBook.title !== metadata.title) {
          diffs.push({
            fieldName: 'title',
            current: localBook.title,
            fetched: metadata.title,
          });
        }
        
        if (localBook.author.trim() && localBook.author !== metadata.authorName) {
          diffs.push({
            fieldName: 'author',
            current: localBook.author,
            fetched: metadata.authorName,
          });
        }

        if (diffs.length > 0) {
          setComparisons(diffs);
          setSelectedValues(Object.fromEntries(diffs.map(d => [d.fieldName, 'current'])));
          setComparisonDialogOpen(true);
        } else {
          // Auto-update empty fields
          const updatedBook = {
            ...localBook,
            title: localBook.title.trim() || metadata.title,
            author: localBook.author.trim() || metadata.authorName,
          };
          setLocalBook(updatedBook);
          onBookChange(updatedBook);
        }
      }
    } catch (error) {
      console.error('BookCard: Error fetching YouTube metadata:', error);
    }
  }, [localBook, isUrlValid, fetchMetadata, onBookChange]);

  const handleChange = useCallback((key: keyof BookDto, value: string | number | undefined) => {
    let parsedValue: string | number | undefined = value;
    if (key === 'seriesNumber') {
      parsedValue = parseInt(value as string, 10);
      if (isNaN(parsedValue) || parsedValue < 1) parsedValue = 1;
    } else if (key === 'year') {
      parsedValue = parseInt(value as string, 10);
      if (isNaN(parsedValue) || parsedValue < 1) parsedValue = undefined;
    }
    
    // Update local state immediately for responsive UI (no lag)
    setLocalBook((prev) => {
      const updatedBook = { ...prev, [key]: parsedValue };
      
      // Debounce parent updates
      if (changeThrottleRef.current) {
        clearTimeout(changeThrottleRef.current);
      }
      
      changeThrottleRef.current = setTimeout(() => {
        onBookChange(updatedBook);
        
        // Auto-fetch metadata for URL changes
        if (key === 'url' && typeof parsedValue === 'string' && parsedValue && !skipAutoMetadataFetch) {
          const urlValue = parsedValue.trim();
          if (urlValue) {
            if (fetchTimeoutRef.current) {
              clearTimeout(fetchTimeoutRef.current);
            }
            fetchTimeoutRef.current = setTimeout(() => {
              attemptFetchMetadata(urlValue);
            }, 500);
          }
        }
      }, 500);
      
      return updatedBook;
    });
  }, [onBookChange, attemptFetchMetadata, skipAutoMetadataFetch]);

  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (changeThrottleRef.current) {
        clearTimeout(changeThrottleRef.current);
      }
    };
  }, []);

  const handleThumbnailClick = (): void => {
    if (fullSizeThumbnailUrl) {
      onThumbnailClick(fullSizeThumbnailUrl);
    }
  };

  const handleThumbnailLoad = (): void => {
    setIsThumbnailLoaded(true);
  };

  const handleThumbnailError = (): void => {
    setIsThumbnailLoaded(false);
  };

  const handleUrlBlur = useCallback(() => {
    const trimmed = localBook.url?.trim() || '';
    const normalized = normalizeYouTubeUrl(trimmed);
    if (normalized && normalized !== localBook.url) {
      // Use existing handleChange to keep update flow consistent (debounce, validation)
      handleChange('url', normalized);
      if (!skipAutoMetadataFetch) {
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = setTimeout(() => attemptFetchMetadata(normalized), 500);
      }
    }
  }, [localBook, normalizeYouTubeUrl, handleChange, attemptFetchMetadata, skipAutoMetadataFetch]);

  const handleUrlPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedRaw = e.clipboardData.getData('text') || '';
    const pasted = pastedRaw.trim();
    const normalized = normalizeYouTubeUrl(pasted);

    // Prevent default to avoid DOM-only paste into controlled input
    e.preventDefault();

    if (normalized) {
      // Immediately update native input and controlled state with normalized URL
      try {
        const input = e.currentTarget as HTMLInputElement;
        input.value = normalized;
        input.setSelectionRange(normalized.length, normalized.length);
      } catch (err) {
        // ignore
      }
      setLocalBook((prev) => ({ ...prev, url: normalized }));
      handleChange('url', normalized);

      if (!skipAutoMetadataFetch) {
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = setTimeout(() => attemptFetchMetadata(normalized), 500);
      }
    } else {
      // If normalization fails, keep the raw pasted value in the input (do not fetch metadata)
      try {
        const input = e.currentTarget as HTMLInputElement;
        input.value = pasted;
        input.setSelectionRange(pasted.length, pasted.length);
      } catch (err) {
        // ignore
      }
      setLocalBook((prev) => ({ ...prev, url: pasted }));
      // Propagate via handleChange so parent state and validation remain consistent
      handleChange('url', pasted);
    }
  }, [normalizeYouTubeUrl, handleChange, attemptFetchMetadata, skipAutoMetadataFetch]);

  // Derived computed values - use local state for immediate UI updates
  const isEmpty = useMemo(() => (
    !localBook.url.trim() &&
    !localBook.title.trim() &&
    !localBook.author.trim() &&
    (!localBook.series || !localBook.series.trim()) &&
    localBook.seriesNumber === 1 &&
    !localBook.year
  ), [localBook]);

  const formatCollapsedHeading = useMemo(() => {
    const author = localBook.author.trim();
    const title = localBook.title.trim();
    
    if (author && title) return `${author} - ${title}`;
    if (author) return author;
    if (title) return title;
    return tString('books_new_book');
  }, [localBook.author, localBook.title, tString]);

  return (
    <>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: isCollapsed ? 0 : 2,
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
          transition: 'opacity 0.2s ease-in-out',
        }}
      >
      {/* Collapsed Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': {
            bgcolor: 'action.hover',
          },
          p: 1,
          borderRadius: 1,
          mb: isCollapsed ? 0 : 1,
          m: isCollapsed ? 0 : undefined,
        }}
        onClick={() => toggleBookCollapsed(book.id)}
      >
        <IconButton size="small" sx={{ flexShrink: 0 }}>
          {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
        <Typography
          variant="subtitle1"
          sx={{
            flex: 1,
            fontWeight: 500,
            color: 'text.primary',
          }}
        >
          {isEmpty ? t('books_add_new_book_placeholder') : formatCollapsedHeading || t('books_new_book')}
        </Typography>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          color="error"
          aria-label={tString('book_card_remove_book')}
          sx={{ flexShrink: 0 }}
          disabled={isLoading}
        >
          <DeleteIcon />
        </IconButton>
      </Box>

      {/* Collapsible Content */}
      <Collapse in={!isCollapsed}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {thumbnailUrl ? (
          <IconButton onClick={handleThumbnailClick} sx={{ width: 80, height: 60, p: 0, flexShrink: 0 }}>
            <Image 
              src={thumbnailUrl} 
              alt="" 
              width={80} 
              height={60} 
              style={{ objectFit: 'cover', borderRadius: 4 }} 
              onLoad={handleThumbnailLoad}
              onError={handleThumbnailError}
            />
          </IconButton>
        ) : (
          <Box sx={{ width: 80, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.disabledBackground', borderRadius: 1, flexShrink: 0 }}>
            <Typography variant="caption" color="text.secondary">{t('book_card_no_preview')}</Typography>
          </Box>
        )}
      <TextField
        label={
          <>
            {t('book_card_youtube_url')} <Typography component="span" sx={{ color: 'error.main' }}>{t('book_card_required')}</Typography>
          </>
        }
        value={localBook.url}
        onChange={(e) => handleChange('url', e.target.value)} onBlur={handleUrlBlur} onPaste={handleUrlPaste}
        fullWidth
        variant="outlined"
        size="small"
        disabled={isLoading}
        helperText={fieldErrors.url || t('book_card_youtube_url_helper')}
        error={Boolean(fieldErrors.url || (!localBook.url?.trim() || (isUrlValid && (metadataError || (!!thumbnailUrl && !isThumbnailLoaded)))))}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: isUrlFullyValid ? 'success.main' : undefined,
              },
              '&:hover fieldset': {
                borderColor: isUrlFullyValid ? 'success.main' : undefined,
              },
              '&.Mui-focused fieldset': {
                borderColor: isUrlFullyValid ? 'success.main' : undefined,
                borderWidth: isUrlFullyValid ? 2 : undefined,
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <IconButton
                    size="small"
                    onClick={() => attemptFetchMetadata(localBook.url.trim())}
                    disabled={!localBook.url.trim() || isLoading}
                    title={tString('book_card_refresh_metadata')}
                  >
                    <AutorenewIcon fontSize="small" />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <TextField
        label={
          <>
            {t('book_card_book_title')} <Typography component="span" sx={{ color: 'error.main' }}>{t('book_card_required')}</Typography>
          </>
        }
        value={localBook.title}
        onChange={(e) => handleChange('title', e.target.value)}
        fullWidth
        variant="outlined"
        size="small"
        disabled={isLoading}
        helperText={fieldErrors.title || t('book_card_book_title_helper')}
        error={Boolean(fieldErrors.title)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <TextTransformMenu
                currentText={localBook.title || ''}
                onTransform={(transformedText) => handleChange('title', transformedText)}
              />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label={
          <>
            {t('book_card_author')} <Typography component="span" sx={{ color: 'error.main' }}>{t('book_card_required')}</Typography>
          </>
        }
        value={localBook.author}
        onChange={(e) => handleChange('author', e.target.value)}
        fullWidth
        variant="outlined"
        size="small"
        disabled={isLoading}
        helperText={fieldErrors.author || t('book_card_author_helper')}
        error={Boolean(fieldErrors.author)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <TextTransformMenu
                currentText={localBook.author || ''}
                onTransform={(transformedText) => handleChange('author', transformedText)}
              />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label={t('book_card_narrator')}
        value={localBook.narrator}
        onChange={(e) => handleChange('narrator', e.target.value)}
        fullWidth
        variant="outlined"
        size="small"
        disabled={isLoading}
        helperText={fieldErrors.narrator || t('book_card_narrator_helper')}
        error={Boolean(fieldErrors.narrator)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <TextTransformMenu
                currentText={localBook.narrator || ''}
                onTransform={(transformedText) => handleChange('narrator', transformedText)}
              />
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label={t('book_card_series_name')}
          value={localBook.series}
          onChange={(e) => handleChange('series', e.target.value)}
          fullWidth
          variant="outlined"
          size="small"
          disabled={isLoading}
          helperText={t('book_card_series_helper')}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <TextTransformMenu
                  currentText={localBook.series || ''}
                  onTransform={(transformedText) => handleChange('series', transformedText)}
                />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label={t('book_card_series_number')}
          type="number"
          value={localBook.seriesNumber}
          onChange={(e) => handleChange('seriesNumber', e.target.value)}
          sx={{ width: 120, flexShrink: 0 }}
          variant="outlined"
          size="small"
          disabled={isLoading}
          inputProps={{ min: 1 }}
          helperText={fieldErrors.seriesNumber || t('book_card_series_number_helper')}
          error={Boolean(fieldErrors.seriesNumber)}
        />
        <TextField
          label={t('book_card_year')}
          type="number"
          value={localBook.year}
          onChange={(e) => handleChange('year', e.target.value)}
          sx={{ width: 100, flexShrink: 0 }}
          variant="outlined"
          size="small"
          disabled={isLoading}
          inputProps={{ min: 1 }}
          helperText={fieldErrors.year}
          error={Boolean(fieldErrors.year)}
        />
      </Box>
        </Box>
      </Collapse>
    </Paper>

      {/* Metadata Comparison Dialog */}
      <Dialog open={comparisonDialogOpen} onClose={() => setComparisonDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('metadata_dialog_title')}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            {t('metadata_dialog_description')}
          </Typography>
          
          {comparisons.map((comparison) => (
            <Box key={comparison.fieldName} sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, textTransform: 'capitalize' }}>
                {comparison.fieldName === 'title' ? t('book_card_book_title') : t('book_card_author')}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {/* Current Value */}
                <FormControlLabel
                  control={
                    <Radio
                      checked={selectedValues[comparison.fieldName] === 'current'}
                      onChange={() => handleComparisonSelect(comparison.fieldName, 'current')}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t('metadata_dialog_current')}</Typography>
                      <Typography variant="body2">{comparison.current}</Typography>
                    </Box>
                  }
                  sx={{ flex: 1 }}
                />
                
                {/* Fetched Value */}
                <FormControlLabel
                  control={
                    <Radio
                      checked={selectedValues[comparison.fieldName] === 'fetched'}
                      onChange={() => handleComparisonSelect(comparison.fieldName, 'fetched')}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t('metadata_dialog_from_youtube')}</Typography>
                      <Typography variant="body2">{comparison.fetched}</Typography>
                    </Box>
                  }
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComparisonDialogOpen(false)}>{t('metadata_dialog_cancel')}</Button>
          <Button onClick={handleApplyComparison} variant="contained">{t('metadata_dialog_apply')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
