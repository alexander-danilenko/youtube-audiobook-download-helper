'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { TableCell, TextField, Box } from '@mui/material';
import { BookDto } from '../application/dto/book-dto';
import { CellPosition } from '../hooks/use-book-table';

interface EditableCellProps {
  value: string | number | undefined;
  rowIndex: number;
  columnKey: keyof BookDto;
  isSelected: boolean;
  isEditing: boolean;
  widthPercent?: number;
  onSelect: (rowIndex: number, columnKey: keyof BookDto, isMultiSelect: boolean) => void;
  onEdit: (position: CellPosition | null) => void;
  onUpdate: (rowIndex: number, columnKey: keyof BookDto, value: string | number | undefined) => void;
  onUpdateSelected: (value: string | number | undefined) => void;
  onMoveToNextCell: (rowIndex: number, columnKey: keyof BookDto, direction: 'tab' | 'enter' | 'shift-tab' | 'shift-enter') => CellPosition | null;
}

export function EditableCell({
  value,
  rowIndex,
  columnKey,
  isSelected,
  isEditing,
  widthPercent,
  onSelect,
  onEdit,
  onUpdate,
  onUpdateSelected,
  onMoveToNextCell,
}: EditableCellProps) {
  const [localValue, setLocalValue] = useState<string>(value?.toString() || '');
  const textFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  useEffect(() => {
    if (isEditing && textFieldRef.current) {
      textFieldRef.current.focus();
      textFieldRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent): void => {
    const isMultiSelect = e.ctrlKey || e.metaKey;
    onSelect(rowIndex, columnKey, isMultiSelect);
    if (!isMultiSelect) {
      onEdit({ rowIndex, columnKey });
    }
  };

  const handleDoubleClick = (): void => {
    onEdit({ rowIndex, columnKey });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const nextCell = onMoveToNextCell(rowIndex, columnKey, 'enter');
      if (nextCell) {
        onUpdate(rowIndex, columnKey, parseValue(localValue, columnKey));
        onEdit(nextCell);
      } else {
        onUpdate(rowIndex, columnKey, parseValue(localValue, columnKey));
        onEdit(null);
      }
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      const nextCell = onMoveToNextCell(rowIndex, columnKey, 'shift-enter');
      if (nextCell) {
        onUpdate(rowIndex, columnKey, parseValue(localValue, columnKey));
        onEdit(nextCell);
      } else {
        onUpdate(rowIndex, columnKey, parseValue(localValue, columnKey));
        onEdit(null);
      }
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const nextCell = onMoveToNextCell(rowIndex, columnKey, 'tab');
      if (nextCell) {
        onUpdate(rowIndex, columnKey, parseValue(localValue, columnKey));
        onEdit(nextCell);
      } else {
        onUpdate(rowIndex, columnKey, parseValue(localValue, columnKey));
        onEdit(null);
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const nextCell = onMoveToNextCell(rowIndex, columnKey, 'shift-tab');
      if (nextCell) {
        onUpdate(rowIndex, columnKey, parseValue(localValue, columnKey));
        onEdit(nextCell);
      } else {
        onUpdate(rowIndex, columnKey, parseValue(localValue, columnKey));
        onEdit(null);
      }
    } else if (e.key === 'Escape') {
      setLocalValue(value?.toString() || '');
      onEdit(null);
    }
  };

  const handleBlur = (): void => {
    onUpdate(rowIndex, columnKey, parseValue(localValue, columnKey));
    onEdit(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (isSelected) {
      onUpdateSelected(parseValue(newValue, columnKey));
    }
  };

  const parseValue = (val: string, key: keyof BookDto): string | number | undefined => {
    if (key === 'seriesNumber') {
      const num = parseInt(val, 10);
      return isNaN(num) ? 1 : num;
    }
    if (key === 'year') {
      const num = parseInt(val, 10);
      return isNaN(num) ? undefined : num;
    }
    return val;
  };

  const displayValue = value?.toString() || '';

  return (
    <TableCell
      sx={{
        width: widthPercent ? `${widthPercent}%` : undefined,
        minWidth: '50px',
        maxWidth: widthPercent ? `${widthPercent}%` : undefined,
        cursor: 'pointer',
        overflow: 'hidden',
        bgcolor: isEditing ? 'background.paper' : isSelected ? 'action.selected' : 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        '&:focus-within': {
          outline: isEditing ? '2px solid' : 'none',
          outlineColor: isEditing ? 'primary.main' : 'transparent',
        },
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <TextField
          inputRef={textFieldRef}
          type={columnKey === 'seriesNumber' || columnKey === 'year' ? 'number' : 'text'}
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          size="small"
          variant="standard"
          sx={{
            width: '100%',
            '& .MuiInputBase-input': {
              padding: 0,
            },
          }}
        />
      ) : (
        <Box
          sx={{
            display: 'block',
            minHeight: '1.25rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={displayValue}
        >
          {displayValue}
        </Box>
      )}
    </TableCell>
  );
}

