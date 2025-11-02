'use client';

import { Dialog, DialogContent, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface LightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function Lightbox({ imageUrl, onClose }: LightboxProps) {
  return (
    <Dialog
      open={!!imageUrl}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          boxShadow: 'none',
          maxHeight: '90vh',
        },
      }}
      BackdropProps={{
        sx: {
          bgcolor: 'rgba(0, 0, 0, 0.75)',
        },
      }}
    >
      <DialogContent
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
        onClick={onClose}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10,
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>
        <Box
          component="img"
          src={imageUrl || undefined}
          alt="Thumbnail preview"
          sx={{
            maxWidth: '100%',
            maxHeight: '90vh',
            objectFit: 'contain',
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </DialogContent>
    </Dialog>
  );
}

