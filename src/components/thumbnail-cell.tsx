'use client';

import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import Image from 'next/image';
import { useThumbnail } from '@/hooks';

interface ThumbnailCellProps {
  videoUrl: string;
  onThumbnailClick: (imageUrl: string) => void;
}

export const ThumbnailCell: React.FC<ThumbnailCellProps> = ({ videoUrl, onThumbnailClick }) => {
  const { thumbnailUrl, fullSizeThumbnailUrl } = useThumbnail(videoUrl);

  const handleThumbnailClick = (): void => {
    if (fullSizeThumbnailUrl) {
      onThumbnailClick(fullSizeThumbnailUrl);
    }
  };

  return (
    <>
      {thumbnailUrl ? (
        <IconButton onClick={handleThumbnailClick} sx={{ width: 80, height: 60, p: 0, flexShrink: 0 }}>
          <Image src={thumbnailUrl} alt="Video thumbnail" width={80} height={60} style={{ objectFit: 'cover', borderRadius: 4 }} />
        </IconButton>
      ) : (
        <Box sx={{ width: 80, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.disabledBackground', borderRadius: 1, flexShrink: 0 }}>
          <Typography variant="caption" color="text.secondary">No preview</Typography>
        </Box>
      )}
    </>
  );
};
