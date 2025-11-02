'use client';

import { TextField, Box, Paper, Typography, IconButton, InputAdornment } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { BookDto } from '../application/dto/book-dto';
import { useThumbnail } from '../hooks/use-thumbnail';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { TextTransformMenu } from './text-transform-menu';

interface BookCardProps {
  book: BookDto;
  onBookChange: (updatedBook: BookDto) => void;
  onRemove: () => void;
  onThumbnailClick: (imageUrl: string) => void;
}

export function BookCard({ book, onBookChange, onRemove, onThumbnailClick }: BookCardProps) {
  const [localBook, setLocalBook] = useState<BookDto>(book);
  const { thumbnailUrl, fullSizeThumbnailUrl } = useThumbnail(book.url);

  useEffect(() => {
    setLocalBook(book);
  }, [book]);

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
  }, [localBook, onBookChange]);

  const handleThumbnailClick = (): void => {
    if (fullSizeThumbnailUrl) {
      onThumbnailClick(fullSizeThumbnailUrl);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <TextTransformMenu
                  currentText={localBook.url || ''}
                  onTransform={(transformedText) => handleChange('url', transformedText)}
                />
              </InputAdornment>
            ),
          }}
        />
        <IconButton onClick={onRemove} color="error" aria-label="remove book" sx={{ flexShrink: 0 }}>
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
        />
        <TextField
          label="Year"
          type="number"
          value={localBook.year}
          onChange={(e) => handleChange('year', e.target.value)}
          sx={{ width: 100, flexShrink: 0 }}
          variant="outlined"
          size="small"
        />
      </Box>
    </Paper>
  );
}
