export function useBookTable(_booksCount: number) {
  return {
    selectedCells: new Set(),
    editingCell: null,
    draggedRowIndex: null,
    setEditingCell: () => {},
    setDraggedRowIndex: () => {},
    updateSelectedCells: () => {},
    selectCell: () => {},
    moveToNextCell: () => null,
  };
}

