'use client';

import React, { useState } from 'react';
import { TextField, Box, Paper, Typography, IconButton, InputAdornment, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Radio, FormControlLabel, Collapse, Tooltip, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ClearIcon from '@mui/icons-material/Clear';
import Image from 'next/image';
import { BookDto } from '@/application/dto';
import { useBookCard } from '@/hooks/use-book-card';
import { TextTransformMenu } from './text-transform-menu';
import { useTranslation, useTranslationString } from '@/i18n';

interface BookCardProps {
  book: BookDto;
  onBookChange: (updatedBook: BookDto) => void;
  onRemove: () => void;
  onClone: () => void;
  onThumbnailClick: (imageUrl: string) => void;
  skipAutoMetadataFetch?: boolean;
}

export function BookCard({ book, onBookChange, onRemove, onClone, onThumbnailClick, skipAutoMetadataFetch = false }: BookCardProps) {
  const { t } = useTranslation();
  const tString = useTranslationString();
  const urlInputRef = React.useRef<HTMLInputElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const {
    localBook,
    isLoading,
    fieldErrors,
    isUrlValid,
    isUrlFullyValid,
    thumbnailUrl,
    fullSizeThumbnailUrl,
    isThumbnailLoaded,
    isCollapsed,
    isEmpty,
    formatCollapsedHeading,
    comparisonDialogOpen,
    comparisons,
    selectedValues,
    metadataError,
    handleChange,
    handleUrlBlur,
    handleUrlPaste,
    handleThumbnailLoad,
    handleThumbnailError,
    handleComparisonSelect,
    handleApplyComparison,
    setComparisonDialogOpen,
    toggleBookCollapsed,
    attemptFetchMetadata,
  } = useBookCard({ 
    book, 
    onBookChange, 
    skipAutoMetadataFetch,
    onMetadataFetchSuccess: () => {
      setSnackbarMessage(t('book_card_metadata_fetch_success') as string);
      setSnackbarOpen(true);
    }
  });

  const handleThumbnailClick = (): void => {
    if (fullSizeThumbnailUrl) {
      onThumbnailClick(fullSizeThumbnailUrl);
    }
  };

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
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {isEmpty ? t('books_add_new_book_placeholder') : formatCollapsedHeading || t('books_new_book')}
          </Typography>
          <Tooltip title={tString('book_card_clone_book')}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onClone();
                setSnackbarMessage(t('book_card_clone_success') as string);
                setSnackbarOpen(true);
              }}
              aria-label={tString('book_card_clone_book')}
              sx={{ flexShrink: 0 }}
              disabled={isLoading}
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2,
              }}
            >
              {thumbnailUrl ? (
                <IconButton
                  onClick={handleThumbnailClick}
                  sx={{
                    width: { xs: '100%', sm: 80 },
                    height: { xs: 'auto', sm: 60 },
                    aspectRatio: { xs: '16/9', sm: 'auto' },
                    p: 0,
                    flexShrink: 0,
                    alignSelf: { xs: 'center', sm: 'flex-start' },
                    maxWidth: { xs: 200, sm: 80 },
                  }}
                >
                  <Image
                    src={thumbnailUrl}
                    alt=""
                    width={80}
                    height={60}
                    style={{ objectFit: 'cover', borderRadius: 4, width: '100%', height: '100%' }}
                    onLoad={handleThumbnailLoad}
                    onError={handleThumbnailError}
                  />
                </IconButton>
              ) : (
                <Box
                  sx={{
                    width: { xs: '100%', sm: 80 },
                    height: { xs: 'auto', sm: 60 },
                    aspectRatio: { xs: '16/9', sm: 'auto' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.disabledBackground',
                    borderRadius: 1,
                    flexShrink: 0,
                    alignSelf: { xs: 'center', sm: 'flex-start' },
                    maxWidth: { xs: 200, sm: 80 },
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {t('book_card_no_preview')}
                  </Typography>
                </Box>
              )}
              <TextField
                label={
                  <>
                    {t('book_card_youtube_url')}{' '}
                    <Typography component="span" sx={{ color: 'error.main' }}>
                      {t('book_card_required')}
                    </Typography>
                  </>
                }
                value={localBook.url}
                onChange={(e) => handleChange('url', e.target.value)}
                onBlur={handleUrlBlur}
                fullWidth
                variant="outlined"
                size="small"
                disabled={isLoading}
                onPaste={handleUrlPaste}
                inputRef={urlInputRef}
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
                  startAdornment: (
                    <InputAdornment position="start">
                      {localBook.url?.trim() ? (
                        <Tooltip title={tString('book_card_clear_url')}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Clear immediately without debounce to prevent value from being restored
                              handleChange('url', '', { skipDebounce: true });
                            }}
                            disabled={isLoading}
                            sx={{ pointerEvents: 'auto' }}
                            aria-label={tString('book_card_clear_url')}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </InputAdornment>
                  ),
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
                  {t('book_card_book_title')}{' '}
                  <Typography component="span" sx={{ color: 'error.main' }}>
                    {t('book_card_required')}
                  </Typography>
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
                    <TextTransformMenu currentText={localBook.title || ''} onTransform={(transformedText) => handleChange('title', transformedText)} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label={
                <>
                  {t('book_card_author')}{' '}
                  <Typography component="span" sx={{ color: 'error.main' }}>
                    {t('book_card_required')}
                  </Typography>
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
                    <TextTransformMenu currentText={localBook.author || ''} onTransform={(transformedText) => handleChange('author', transformedText)} />
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
                    <TextTransformMenu currentText={localBook.narrator || ''} onTransform={(transformedText) => handleChange('narrator', transformedText)} />
                  </InputAdornment>
                ),
              }}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
              }}
            >
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
                      <TextTransformMenu currentText={localBook.series || ''} onTransform={(transformedText) => handleChange('series', transformedText)} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label={t('book_card_series_number')}
                type="number"
                value={localBook.seriesNumber}
                onChange={(e) => handleChange('seriesNumber', e.target.value)}
                sx={{ width: { xs: '100%', sm: 120 }, flexShrink: 0 }}
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
                sx={{ width: { xs: '100%', sm: 100 }, flexShrink: 0 }}
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
                  control={<Radio checked={selectedValues[comparison.fieldName] === 'current'} onChange={() => handleComparisonSelect(comparison.fieldName, 'current')} />}
                  label={
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('metadata_dialog_current')}
                      </Typography>
                      <Typography variant="body2">{comparison.current}</Typography>
                    </Box>
                  }
                  sx={{ flex: 1 }}
                />

                {/* Fetched Value */}
                <FormControlLabel
                  control={<Radio checked={selectedValues[comparison.fieldName] === 'fetched'} onChange={() => handleComparisonSelect(comparison.fieldName, 'fetched')} />}
                  label={
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('metadata_dialog_from_youtube')}
                      </Typography>
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
          <Button onClick={handleApplyComparison} variant="contained">
            {t('metadata_dialog_apply')}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
