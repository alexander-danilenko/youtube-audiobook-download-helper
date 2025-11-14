import React, { useState, useCallback } from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useTranslation, useTranslationString } from '@/i18n';

interface TextTransformMenuProps {
  onTransform: (transformedText: string) => void;
  currentText: string;
}

export const TextTransformMenu: React.FC<TextTransformMenuProps> = ({
  onTransform,
  currentText,
}) => {
  const { t } = useTranslation();
  const tString = useTranslationString();
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
        aria-label={tString('text_transform_menu_label')}
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
        <MenuItem onClick={() => applyTransform(toSentenceCase)}>{t('text_transform_sentence_case')}</MenuItem>
        <MenuItem onClick={() => applyTransform(toNameCase)}>{t('text_transform_name_case')}</MenuItem>
        <MenuItem onClick={() => applyTransform(toUpperCase)}>{t('text_transform_uppercase')}</MenuItem>
        <MenuItem onClick={() => applyTransform(toLowerCase)}>{t('text_transform_lowercase')}</MenuItem>
      </Menu>
    </>
  );
};
