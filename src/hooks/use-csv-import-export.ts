import { useState, useRef, useCallback } from 'react';
import { BookDto } from '@/application/dto';
import { CsvService, type CsvColumn } from '@/application/services';
import { useTranslation } from '@/i18n';

interface UseCsvImportExportProps {
  books: BookDto[];
  onBooksChange: (books: BookDto[]) => void;
  onImport?: (importedBooks: BookDto[]) => void;
  columns: CsvColumn[];
}

export function useCsvImportExport({
  books,
  onBooksChange,
  onImport,
  columns,
}: UseCsvImportExportProps) {
  const { t } = useTranslation();
  const csvService = useRef(new CsvService()).current;
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [hasHeaders, setHasHeaders] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToCsv = useCallback((): void => {
    const csvContent = csvService.exportToCsv(books, columns);

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'audiobooks.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [books, columns, csvService]);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) {
          return;
        }

        try {
          const importedBooks = csvService.parseCsv(text, hasHeaders, columns.length);
          onBooksChange(importedBooks);
          // Notify parent about imported books so they can skip metadata fetching
          if (onImport) {
            onImport(importedBooks);
          }
          setImportDialogOpen(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          alert(t('csv_error_import', { error: error instanceof Error ? error.message : 'Unknown error' }) as string);
        }
      };
      reader.readAsText(file);
    },
    [hasHeaders, columns.length, csvService, onBooksChange, onImport, t]
  );

  const openImportDialog = useCallback(() => {
    setImportDialogOpen(true);
  }, []);

  const closeImportDialog = useCallback(() => {
    setImportDialogOpen(false);
  }, []);

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    importDialogOpen,
    hasHeaders,
    setHasHeaders,
    fileInputRef,
    exportToCsv,
    handleFileSelect,
    openImportDialog,
    closeImportDialog,
    triggerFileSelect,
  };
}

