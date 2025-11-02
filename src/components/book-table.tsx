'use client';

import { useState, useCallback, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Fab, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { BookDto } from '../application/dto/book-dto';
import { useAppStore } from '../application/stores/app-store';
import { useBookTable } from '../hooks/use-book-table';
import { EditableCell } from './editable-cell';
import { ThumbnailCell } from './thumbnail-cell';

const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  preview: 80,
  url: 200,
  title: 200,
  author: 150,
  narrator: 150,
  series: 150,
  seriesNumber: 80,
  year: 80,
  actions: 70, // Reduced width to fit "Remove" text
};

interface BookTableProps {
  books: BookDto[];
  onBooksChange: (books: BookDto[]) => void;
  onThumbnailClick: (imageUrl: string) => void;
}

export function BookTable({ books, onBooksChange, onThumbnailClick }: BookTableProps) {
  const {
    selectedCells,
    editingCell,
    draggedRowIndex,
    setEditingCell,
    setDraggedRowIndex,
    updateSelectedCells,
    selectCell,
    moveToNextCell,
  } = useBookTable(books.length);

  const columnWidths = useAppStore((state) => state.columnWidths);
  const setColumnWidths = useAppStore((state) => state.setColumnWidths);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState<number>(0);
  const [resizeStartWidth, setResizeStartWidth] = useState<number>(0);
  const [cleanDialogOpen, setCleanDialogOpen] = useState<boolean>(false);

  const handleDragStart = (index: number): void => {
    setDraggedRowIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, index: number): void => {
    e.preventDefault();
    if (draggedRowIndex === null || draggedRowIndex === index) {
      return;
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, toIndex: number): void => {
    e.preventDefault();
    if (draggedRowIndex === null) {
      return;
    }
    const reorderedBooks = [...books];
    const [removed] = reorderedBooks.splice(draggedRowIndex, 1);
    reorderedBooks.splice(toIndex, 0, removed);
    onBooksChange(reorderedBooks);
    setDraggedRowIndex(null);
  };

  const handleDragEnd = (): void => {
    setDraggedRowIndex(null);
  };

  const handleResizeStart = useCallback((columnKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(columnKey);
    setResizeStartX(e.clientX);
    setResizeStartWidth(columnWidths?.[columnKey] || DEFAULT_COLUMN_WIDTHS[columnKey] || 150);
  }, [columnWidths]);

  useEffect(() => {
    if (!resizingColumn) {
      return;
    }

    const handleMouseMove = (e: MouseEvent): void => {
      const diff = e.clientX - resizeStartX;
      const newWidth = Math.max(50, resizeStartWidth + diff);
      const currentWidths = useAppStore.getState().columnWidths || {};
      
      // Calculate current total width
      const defaultTotal = Object.values(DEFAULT_COLUMN_WIDTHS).reduce((sum, width) => sum + width, 0);
      const allColumnKeys = Object.keys(DEFAULT_COLUMN_WIDTHS);
      
      // Get current widths for all columns, using defaults if not set
      const allCurrentWidths: Record<string, number> = {};
      let currentTotal = 0;
      allColumnKeys.forEach((key) => {
        const width = currentWidths[key] || DEFAULT_COLUMN_WIDTHS[key] || 150;
        allCurrentWidths[key] = width;
        currentTotal += width;
      });
      
      // Update the resized column
      const oldTotal = currentTotal;
      const newTotal = oldTotal - resizeStartWidth + newWidth;
      
      // Normalize all widths to maintain the default total while preserving proportions
      // This ensures the table always fits within 100% width
      const normalizedWidths: Record<string, number> = {};
      
      if (newTotal <= defaultTotal) {
        // If new total is within limits, just update the resized column
        normalizedWidths[resizingColumn] = newWidth;
        allColumnKeys.forEach((key) => {
          if (key !== resizingColumn) {
            normalizedWidths[key] = allCurrentWidths[key];
          }
        });
      } else {
        // If new total exceeds limits, scale all columns proportionally
        normalizedWidths[resizingColumn] = newWidth;
        const remainingWidth = defaultTotal - newWidth;
        const otherColumnsTotal = oldTotal - resizeStartWidth;
        
        if (otherColumnsTotal > 0) {
          const scaleFactor = remainingWidth / otherColumnsTotal;
          allColumnKeys.forEach((key) => {
            if (key !== resizingColumn) {
              const scaledWidth = allCurrentWidths[key] * scaleFactor;
              normalizedWidths[key] = Math.max(50, scaledWidth);
            }
          });
        } else {
          // Fallback: distribute remaining width equally
          const otherColumns = allColumnKeys.filter(k => k !== resizingColumn);
          const equalWidth = remainingWidth / otherColumns.length;
          otherColumns.forEach((key) => {
            normalizedWidths[key] = Math.max(50, equalWidth);
          });
        }
      }
      
      setColumnWidths(normalizedWidths);
    };

    const handleMouseUp = (): void => {
      setResizingColumn(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizingColumn, resizeStartX, resizeStartWidth, setColumnWidths]);

  const columns: Array<{ key: keyof BookDto; label: string }> = [
    { key: 'url', label: 'YouTube URL' },
    { key: 'title', label: 'Book Title' },
    { key: 'author', label: 'Author' },
    { key: 'narrator', label: 'Narrator' },
    { key: 'series', label: 'Series Name' },
    { key: 'seriesNumber', label: 'Series #' },
    { key: 'year', label: 'Year' },
  ];

  const calculateTotalWidth = useCallback((): number => {
    const total = columnWidths ? Object.values(columnWidths).reduce((sum, width) => sum + width, 0) : 0;
    const defaultsTotal = Object.values(DEFAULT_COLUMN_WIDTHS).reduce((sum, width) => sum + width, 0);
    return total > 0 ? total : defaultsTotal;
  }, [columnWidths]);

  const getColumnWidthPercent = useCallback((columnKey: string): number => {
    const width = columnWidths?.[columnKey] || DEFAULT_COLUMN_WIDTHS[columnKey] || 150;
    const totalWidth = calculateTotalWidth();
    return (width / totalWidth) * 100;
  }, [columnWidths, calculateTotalWidth]);

  const renderResizableHeader = (columnKey: string, label: string, isButton: boolean = false) => {
    const widthPercent = getColumnWidthPercent(columnKey);
    const isResizable = columnKey !== 'preview' && columnKey !== 'actions';
    
    return (
      <TableCell
        key={columnKey}
        sx={{
          width: `${widthPercent}%`,
          minWidth: '50px',
          maxWidth: `${widthPercent}%`,
          position: 'relative',
          userSelect: 'none',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          fontWeight: 'bold',
          '&:hover .resize-handle': {
            bgcolor: 'primary.light',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isButton ? (
            <Button
              onClick={() => {
                // Optional: Add bulk action functionality here
              }}
              sx={{
                flex: 1,
                textAlign: 'left',
                textTransform: 'none',
                color: 'primary.contrastText',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
              title={label}
            >
              {label}
            </Button>
          ) : (
            <Box sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }} title={label}>
              {label}
            </Box>
          )}
          {isResizable && (
            <Box
              className="resize-handle"
            onMouseDown={(e) => handleResizeStart(columnKey, e)}
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                marginRight: '-2px',
                zIndex: 10,
                cursor: 'col-resize',
                '&:hover': {
                  bgcolor: 'primary.light',
                },
              }}
            title="Drag to resize column"
          />
          )}
        </Box>
      </TableCell>
    );
  };

  const handleAddRow = (): void => {
    const newBook: BookDto = {
      id: Date.now().toString(),
      url: '',
      title: '',
      author: '',
      narrator: '',
      series: '',
      seriesNumber: 1,
      year: undefined,
    };
    onBooksChange([...books, newBook]);
  };

  const handleCleanClick = (): void => {
    setCleanDialogOpen(true);
  };

  const handleCleanConfirm = (): void => {
    onBooksChange([]);
    setCleanDialogOpen(false);
  };

  const handleCleanCancel = (): void => {
    setCleanDialogOpen(false);
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden', maxWidth: 'none', p: 2 }}>
      <TableContainer component={Paper} sx={{ width: '100%', maxWidth: 'none', overflowX: 'hidden', overflowY: 'visible', '& .MuiTableCell-root': { overflow: 'visible' } }}>
        <Table sx={{ tableLayout: 'fixed', width: '100%', maxWidth: 'none' }}>
          <TableHead>
            <TableRow>
            {renderResizableHeader('preview', 'Preview')}
            {columns.map((col) => renderResizableHeader(col.key, col.label))}
              {renderResizableHeader('actions', '', false)}
            </TableRow>
          </TableHead>
          <TableBody>
          {books.map((book, rowIndex) => {
            const isRowSelected = Array.from(selectedCells).some((key) => key.startsWith(`${rowIndex}:`));

            return (
                <TableRow
                key={book.id}
                draggable
                onDragStart={() => handleDragStart(rowIndex)}
                onDragOver={(e) => handleDragOver(e, rowIndex)}
                onDrop={(e) => handleDrop(e, rowIndex)}
                onDragEnd={handleDragEnd}
                  sx={{
                    opacity: draggedRowIndex === rowIndex ? 0.5 : 1,
                    bgcolor: isRowSelected ? 'action.selected' : 'background.paper',
                  }}
              >
                <ThumbnailCell 
                  url={book.url} 
                  onThumbnailClick={onThumbnailClick}
                  widthPercent={getColumnWidthPercent('preview')}
                />
                {columns.map((col) => {
                  const isSelected = selectedCells.has(`${rowIndex}:${col.key}`);
                  const isEditing =
                    editingCell?.rowIndex === rowIndex && editingCell?.columnKey === col.key;
                  const widthPercent = getColumnWidthPercent(col.key);

                  return (
                    <EditableCell
                      key={col.key}
                      value={book[col.key]}
                      rowIndex={rowIndex}
                      columnKey={col.key}
                      isSelected={isSelected}
                      isEditing={isEditing}
                      widthPercent={widthPercent}
                      onSelect={(rowIdx, colKey, isMulti) => {
                        selectCell(rowIdx, colKey, isMulti);
                      }}
                      onEdit={setEditingCell}
                      onUpdate={(rowIdx, colKey, val) => {
                        const updatedBooks = [...books];
                        updatedBooks[rowIdx] = { ...updatedBooks[rowIdx], [colKey]: val };
                        onBooksChange(updatedBooks);
                      }}
                      onUpdateSelected={(val) => {
                        const updatedBooks = [...books];
                        updateSelectedCells(val, (rowIdx, colKey, value) => {
                          updatedBooks[rowIdx] = { ...updatedBooks[rowIdx], [colKey]: value };
                        });
                        onBooksChange(updatedBooks);
                      }}
                      onMoveToNextCell={moveToNextCell}
                    />
                  );
                })}
                  <TableCell 
                    sx={{
                      width: `${getColumnWidthPercent('actions')}%`,
                      maxWidth: `${getColumnWidthPercent('actions')}%`,
                      overflow: 'hidden',
                      textAlign: 'center',
                    }}
                >
                    <Button
                    onClick={() => {
                      const updatedBooks = books.filter((_, i) => i !== rowIndex);
                      onBooksChange(updatedBooks);
                    }}
                      variant="outlined"
                      color="secondary"
                      size="small"
                      sx={{ textTransform: 'none' }}
                  >
                    Remove
                    </Button>
                  </TableCell>
                </TableRow>
            );
          })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, width: '100%', maxWidth: 'none' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleCleanClick}
          disabled={books.length === 0}
        >
          Clean
        </Button>
        <Fab
          color="primary"
          aria-label="add row"
          onClick={handleAddRow}
        >
          <AddIcon />
        </Fab>
      </Box>

      <Dialog
        open={cleanDialogOpen}
        onClose={handleCleanCancel}
      >
        <DialogTitle>Clear Table</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear all books from the table? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCleanCancel}>Cancel</Button>
          <Button onClick={handleCleanConfirm} color="error" variant="contained">
            Clear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

