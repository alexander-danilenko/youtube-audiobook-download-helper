import { useState, useCallback } from 'react';
import { BookDto } from '../application/dto/book-dto';

export interface CellPosition {
  rowIndex: number;
  columnKey: keyof BookDto;
}

export function useBookTable(booksCount: number) {
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);

  const updateSelectedCells = useCallback((value: string | number | undefined, onUpdate: (rowIndex: number, columnKey: keyof BookDto, value: string | number | undefined) => void) => {
    selectedCells.forEach((cellKey) => {
      const [rowIdx, colKey] = cellKey.split(':');
      const rowIndex = parseInt(rowIdx, 10);
      const columnKey = colKey as keyof BookDto;
      onUpdate(rowIndex, columnKey, value);
    });
  }, [selectedCells]);

  const selectCell = useCallback((rowIndex: number, columnKey: keyof BookDto, isMultiSelect: boolean = false) => {
    const cellKey = `${rowIndex}:${columnKey}`;
    if (isMultiSelect) {
      setSelectedCells((prev) => {
        const next = new Set(prev);
        if (next.has(cellKey)) {
          next.delete(cellKey);
        } else {
          next.add(cellKey);
        }
        return next;
      });
    } else {
      setSelectedCells(new Set([cellKey]));
    }
  }, []);

  const moveToNextCell = useCallback((rowIndex: number, columnKey: keyof BookDto, direction: 'tab' | 'enter' | 'shift-tab' | 'shift-enter'): CellPosition | null => {
    const columns: (keyof BookDto)[] = ['url', 'title', 'author', 'narrator', 'series', 'seriesNumber', 'year'];
    const currentColIndex = columns.indexOf(columnKey);

    let nextRowIndex = rowIndex;
    let nextColIndex = currentColIndex;

    if (direction === 'tab') {
      nextColIndex = currentColIndex + 1;
      if (nextColIndex >= columns.length) {
        nextRowIndex = rowIndex + 1;
        nextColIndex = 0;
      }
    } else if (direction === 'shift-tab') {
      nextColIndex = currentColIndex - 1;
      if (nextColIndex < 0) {
        nextRowIndex = rowIndex - 1;
        nextColIndex = columns.length - 1;
      }
    } else if (direction === 'enter') {
      nextRowIndex = rowIndex + 1;
    } else if (direction === 'shift-enter') {
      nextRowIndex = rowIndex - 1;
    }

    if (nextRowIndex < 0 || nextRowIndex >= booksCount) {
      return null;
    }

    return {
      rowIndex: nextRowIndex,
      columnKey: columns[nextColIndex],
    };
  }, [booksCount]);

  return {
    selectedCells,
    editingCell,
    draggedRowIndex,
    setEditingCell,
    setDraggedRowIndex,
    updateSelectedCells,
    selectCell,
    moveToNextCell,
  };
}

