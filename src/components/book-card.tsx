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
}

interface MetadataComparison {
  fieldName: 'title' | 'author';
  current: string;
  fetched: string;
}

export function BookCard({ book, onBookChange, onRemove, onThumbnailClick }: BookCardProps) {
  const [localBook, setLocalBook] = useState<BookDto>(book);
  const { thumbnailUrl, fullSizeThumbnailUrl } = useThumbnail(book.url);
  const { isLoading, fetchMetadata } = useYouTubeMetadata();
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Comparison dialog state
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [comparisons, setComparisons] = useState<MetadataComparison[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, 'current' | 'fetched'>>({});

  useEffect(() => {
    setLocalBook(book);
  }, [book]);

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
        }
      }
    } catch (error) {
      console.error('BookCard: Error fetching YouTube metadata:', error);
    }
  }, [localBook, fetchMetadata, onBookChange]);

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

      fetchTimeoutRef.current = setTimeout(() => {
        attemptFetchMetadata(parsedValue.trim());
      }, 500);
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

  // Validate YouTube URL
  const isValidYoutubeUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
    return youtubePattern.test(url.trim());
  };

  // Determine if URL and thumbnail are valid
  const isUrlValid = isValidYoutubeUrl(localBook.url);
  const isThumbnailFetched = !!thumbnailUrl;
  const isValidated = isUrlValid && isThumbnailFetched;

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
            <Image src={thumbnailUrl} alt="Video thumbnail" width={80} height={60} style={{ objectFit: 'cover', borderRadius: 4 }} />
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
            error={isUrlValid && !isThumbnailFetched}
            helperText={
              isUrlValid && !isThumbnailFetched ? 'Loading thumbnail...' :
              isValidated ? '✓ Valid' :
              ''
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                ...(isValidated && {
                  '& fieldset': {
                    borderColor: '#4caf50',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#45a049',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4caf50',
                  },
                }),
              },
              '& .MuiOutlinedInput-input': {
                ...(isValidated && {
                  color: '#2e7d32',
                  fontWeight: 500,
                }),
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
                      disabled={!localBook.url.trim()}
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
