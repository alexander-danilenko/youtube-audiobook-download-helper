import React, { useState, useCallback } from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

interface TextTransformMenuProps {
  onTransform: (transformedText: string) => void;
  currentText: string;
}

export const TextTransformMenu: React.FC<TextTransformMenuProps> = ({
  onTransform,
  currentText,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const applyTransform = useCallback((transformFunc: (text: string) => string) => {
    onTransform(transformFunc(currentText));
    handleClose();
  }, [onTransform, currentText, handleClose]);

  const toSentenceCase = (text: string): string => {
    if (!text) return '';
    const firstChar = text.charAt(0).toUpperCase();
    const rest = text.slice(1).toLowerCase();
    return firstChar + rest;
  };

  const toNameCase = (text: string): string => {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const toUpperCase = (text: string): string => {
    return text.toUpperCase();
  };

  const toLowerCase = (text: string): string => {
    return text.toLowerCase();
  };

  return (
    <>
      <IconButton
        aria-label="text-transform-menu"
        aria-controls={open ? 'text-transform-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        size="small"
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <Menu
        id="text-transform-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'text-transform-menu',
        }}
      >
        <MenuItem onClick={() => applyTransform(toSentenceCase)}>Sentence case</MenuItem>
        <MenuItem onClick={() => applyTransform(toNameCase)}>Name Case</MenuItem>
        <MenuItem onClick={() => applyTransform(toUpperCase)}>UPPERCASE</MenuItem>
        <MenuItem onClick={() => applyTransform(toLowerCase)}>lowercase</MenuItem>
      </Menu>
    </>
  );
};
