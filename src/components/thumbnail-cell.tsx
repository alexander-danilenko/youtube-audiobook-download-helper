'use client';

import { TableCell, IconButton, Box } from '@mui/material';
import { useThumbnail } from '../hooks/use-thumbnail';

interface ThumbnailCellProps {
  url: string;
  onThumbnailClick: (imageUrl: string) => void;
  widthPercent?: number;
}

export function ThumbnailCell({ url, onThumbnailClick, widthPercent }: ThumbnailCellProps) {
  const { thumbnailUrl, fullSizeThumbnailUrl } = useThumbnail(url);

  const handleClick = (): void => {
    if (fullSizeThumbnailUrl) {
      onThumbnailClick(fullSizeThumbnailUrl);
    }
  };

  if (!thumbnailUrl) {
    return (
      <TableCell
        sx={{
          width: widthPercent ? `${widthPercent}%` : undefined,
          minWidth: '50px',
          maxWidth: widthPercent ? `${widthPercent}%` : undefined,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
          }}
        >
          No preview
        </Box>
      </TableCell>
    );
  }

  return (
    <TableCell
      sx={{
        width: widthPercent ? `${widthPercent}%` : undefined,
        minWidth: '50px',
        maxWidth: widthPercent ? `${widthPercent}%` : undefined,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <IconButton
        onClick={handleClick}
        sx={{
          width: 56,
          height: 40,
          overflow: 'hidden',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          padding: 0,
          '&:hover': {
            opacity: 0.8,
          },
        }}
      >
        <Box
          component="img"
          src={thumbnailUrl}
          alt="Video thumbnail"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </IconButton>
    </TableCell>
  );
}

