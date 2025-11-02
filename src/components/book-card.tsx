'use client';

import { TextField, Box, Paper, Typography, IconButton, InputAdornment, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Radio, FormControlLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { BookDto } from '../application/dto/book-dto';
import { useThumbnail } from '../hooks/use-thumbnail';
import { useYouTubeMetadata } from '../hooks/use-youtube-metadata';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { TextTransformMenu } from './text-transform-menu';

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
  const [localBook, setLocalBook] = useState<BookDto>(book);
  const { thumbnailUrl, fullSizeThumbnailUrl } = useThumbnail(book.url);
  const { isLoading, fetchMetadata, error: metadataError } = useYouTubeMetadata();
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Validation state
  const [isUrlValid, setIsUrlValid] = useState<boolean>(false);
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState<boolean>(false);
  const [metadataFetchError, setMetadataFetchError] = useState<boolean>(false);
  
  // Comparison dialog state
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [comparisons, setComparisons] = useState<MetadataComparison[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, 'current' | 'fetched'>>({});

  useEffect(() => {
    setLocalBook(book);
  }, [book]);

  // Validate URL format and reset thumbnail state when URL changes
  useEffect(() => {
    if (!localBook.url || localBook.url.trim().length === 0) {
      setIsUrlValid(false);
      setIsThumbnailLoaded(false);
      setMetadataFetchError(false);
      return;
    }

    try {
      const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
      const isValid = youtubePattern.test(localBook.url.trim());
      setIsUrlValid(isValid);
      
      // Reset thumbnail and metadata error state when URL changes
      if (isValid) {
        setIsThumbnailLoaded(false);
        setMetadataFetchError(false);
      }
    } catch {
      setIsUrlValid(false);
      setIsThumbnailLoaded(false);
      setMetadataFetchError(false);
    }
  }, [localBook.url]);

  // Reset thumbnail loaded state when thumbnail URL becomes null
  useEffect(() => {
    if (!thumbnailUrl) {
      setIsThumbnailLoaded(false);
    }
  }, [thumbnailUrl]);

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
      // else keep current value (no change needed)
    });
    setLocalBook(updatedBook);
    onBookChange(updatedBook);
    setComparisonDialogOpen(false);
  };

  const attemptFetchMetadata = useCallback(async (url: string) => {
    console.log('BookCard: attemptFetchMetadata called with URL:', url);
    
    if (!url || url.trim().length === 0) {
      console.log('BookCard: Skipping fetch - empty URL');
      setMetadataFetchError(false);
      return;
    }

    // Allow re-fetching without checking previousUrlRef
    // This enables manual refresh via the button
    
    try {
      const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
      const isValid = youtubePattern.test(url.trim());
      console.log('BookCard: URL validation result:', isValid);
      
      if (isValid) {
        console.log('BookCard: Calling fetchMetadata...');
        setMetadataFetchError(false);
        
        // Clear error state before fetch
        const metadata = await fetchMetadata(url);
        console.log('BookCard: fetchMetadata returned:', metadata);
        
        if (metadata) {
          console.log('BookCard: Checking for conflicting data...');
          
          // Check if there's existing data that differs from fetched metadata
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
            console.log('BookCard: Conflicts found, showing comparison dialog...');
            setComparisons(diffs);
            setSelectedValues(Object.fromEntries(diffs.map(d => [d.fieldName, 'current'])));
            setComparisonDialogOpen(true);
          } else {
            console.log('BookCard: No conflicts, updating book with metadata...');
            const updatedBook = { 
              ...localBook, 
              url: url,
              title: localBook.title.trim() === '' ? metadata.title : localBook.title,
              author: localBook.author.trim() === '' ? metadata.authorName : localBook.author,
            };
            setLocalBook(updatedBook);
            onBookChange(updatedBook);
          }
          setMetadataFetchError(false);
        } else {
          // Metadata fetch returned null, which indicates an error (non-ok response or missing video)
          setMetadataFetchError(true);
        }
      } else {
        setMetadataFetchError(false);
      }
    } catch (error) {
      console.error('BookCard: Error fetching YouTube metadata:', error);
      // Mark as error if metadata fetch failed
      setMetadataFetchError(true);
    }
  }, [localBook, fetchMetadata, onBookChange]);
  
  // Update metadata error state when hook error changes
  useEffect(() => {
    if (metadataError) {
      setMetadataFetchError(true);
    }
  }, [metadataError]);

  const handleChange = useCallback((key: keyof BookDto, value: string | number | undefined) => {
    let parsedValue: string | number | undefined = value;
    if (key === 'seriesNumber') {
      parsedValue = parseInt(value as string, 10);
      if (isNaN(parsedValue)) parsedValue = 1;
    } else if (key === 'year') {
      parsedValue = parseInt(value as string, 10);
      if (isNaN(parsedValue)) parsedValue = undefined;
    }
    
    const updatedBook = { ...localBook, [key]: parsedValue };
    setLocalBook(updatedBook);
    onBookChange(updatedBook);

    if (key === 'url' && typeof parsedValue === 'string') {
      console.log('BookCard: URL changed, scheduling metadata fetch...');
      
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      // Only auto-fetch metadata if skipAutoMetadataFetch is false
      if (!skipAutoMetadataFetch) {
        fetchTimeoutRef.current = setTimeout(() => {
          attemptFetchMetadata(parsedValue.trim());
        }, 500);
      }
    }
  }, [localBook, onBookChange, attemptFetchMetadata]);

  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
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

  // Calculate validation state
  // URL is fully valid when: format is valid, thumbnail URL exists and is loaded, no metadata errors, and not currently loading
  const isUrlFullyValid = isUrlValid && !!thumbnailUrl && isThumbnailLoaded && !metadataFetchError && !isLoading;

  return (
    <>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
          transition: 'opacity 0.2s ease-in-out',
        }}
      >
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
            <Typography variant="caption" color="text.secondary">No preview</Typography>
          </Box>
        )}
        <TextField
          label="YouTube URL"
          value={localBook.url}
          onChange={(e) => handleChange('url', e.target.value)}
          fullWidth
          variant="outlined"
          size="small"
          disabled={isLoading}
          error={isUrlValid && (metadataFetchError || (!!thumbnailUrl && !isThumbnailLoaded))}
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
                    disabled={!localBook.url.trim() || skipAutoMetadataFetch}
                    title="Refresh metadata from YouTube"
                  >
                    <AutorenewIcon fontSize="small" />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
          <IconButton onClick={onRemove} color="error" aria-label="remove book" sx={{ flexShrink: 0 }} disabled={isLoading}>
          <DeleteIcon />
        </IconButton>
      </Box>
      <TextField
        label="Book Title"
        value={localBook.title}
        onChange={(e) => handleChange('title', e.target.value)}
        fullWidth
        variant="outlined"
        size="small"
          disabled={isLoading}
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
        label="Author"
        value={localBook.author}
        onChange={(e) => handleChange('author', e.target.value)}
        fullWidth
        variant="outlined"
        size="small"
          disabled={isLoading}
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
        label="Narrator"
        value={localBook.narrator}
        onChange={(e) => handleChange('narrator', e.target.value)}
        fullWidth
        variant="outlined"
        size="small"
          disabled={isLoading}
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
          label="Series Name"
          value={localBook.series}
          onChange={(e) => handleChange('series', e.target.value)}
          fullWidth
          variant="outlined"
          size="small"
            disabled={isLoading}
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
          label="Series #"
          type="number"
          value={localBook.seriesNumber}
          onChange={(e) => handleChange('seriesNumber', e.target.value)}
          sx={{ width: 120, flexShrink: 0 }}
          variant="outlined"
          size="small"
            disabled={isLoading}
        />
        <TextField
          label="Year"
          type="number"
          value={localBook.year}
          onChange={(e) => handleChange('year', e.target.value)}
          sx={{ width: 100, flexShrink: 0 }}
          variant="outlined"
          size="small"
            disabled={isLoading}
        />
      </Box>
    </Paper>

      {/* Metadata Comparison Dialog */}
      <Dialog open={comparisonDialogOpen} onClose={() => setComparisonDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Conflicting Metadata</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            The fetched metadata differs from your current data. Please select which values to keep:
          </Typography>
          
          {comparisons.map((comparison) => (
            <Box key={comparison.fieldName} sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, textTransform: 'capitalize' }}>
                {comparison.fieldName}
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
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Current</Typography>
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
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>From YouTube</Typography>
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
          <Button onClick={() => setComparisonDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApplyComparison} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
