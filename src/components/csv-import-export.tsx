'use client';

import { useState, useRef } from 'react';
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Typography } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import { BookDto } from '../application/dto/book-dto';

interface CsvImportExportProps {
  books: BookDto[];
  onBooksChange: (books: BookDto[]) => void;
  onImport?: (importedBooks: BookDto[]) => void;
}

const CSV_COLUMNS = [
  { key: 'url', label: 'YouTube URL' },
  { key: 'title', label: 'Book Title' },
  { key: 'author', label: 'Author' },
  { key: 'narrator', label: 'Narrator' },
  { key: 'series', label: 'Series Name' },
  { key: 'seriesNumber', label: 'Series #' },
  { key: 'year', label: 'Year' },
];

export function CsvImportExport({ books, onBooksChange, onImport }: CsvImportExportProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [hasHeaders, setHasHeaders] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToCsv = (): void => {
    // Create header row
    const headers = CSV_COLUMNS.map(col => col.label);
    
    // Create data rows
    const rows = books.map(book => [
      book.url || '',
      book.title || '',
      book.author || '',
      book.narrator || '',
      book.series || '',
      book.seriesNumber?.toString() || '1',
      book.year?.toString() || '',
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape commas and quotes in cell content
        const escaped = cell.replace(/"/g, '""');
        return cell.includes(',') || cell.includes('"') || cell.includes('\n') 
          ? `"${escaped}"` 
          : escaped;
      }).join(','))
    ].join('\n');

    // Add UTF-8 BOM for Excel compatibility with Cyrillic and other non-ASCII characters
    const BOM = '\uFEFF';
    const csvWithBom = BOM + csvContent;

    // Create blob and download
    const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'audiobooks.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
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
        const importedBooks = parseCsv(text, hasHeaders);
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
        alert('Error importing CSV: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    };
    reader.readAsText(file);
  };

  const parseCsv = (csvText: string, skipFirstRow: boolean): BookDto[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return [];
    }

    let startIndex = 0;
    if (skipFirstRow) {
      startIndex = 1;
    }

    const books: BookDto[] = [];
    let idCounter = 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const cells = parseCsvLine(line);
      
      if (cells.length < CSV_COLUMNS.length) {
        continue; // Skip incomplete rows
      }

      idCounter += 1;
      const book: BookDto = {
        id: `imported-${idCounter}-${i}`,
        url: cells[0]?.trim() || '',
        title: cells[1]?.trim() || '',
        author: cells[2]?.trim() || '',
        narrator: cells[3]?.trim() || '',
        series: cells[4]?.trim() || '',
        seriesNumber: parseInt(cells[5]?.trim() || '1', 10) || 1,
        year: cells[6]?.trim() ? parseInt(cells[6].trim(), 10) : undefined,
      };

      books.push(book);
    }

    return books;
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={exportToCsv}
        disabled={books.length === 0}
      >
        Export CSV
      </Button>
      <Button
        variant="outlined"
        startIcon={<UploadIcon />}
        onClick={() => setImportDialogOpen(true)}
      >
        Import CSV
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>Import CSV File</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Select a CSV file to import. Make sure the columns match the expected format:
            YouTube URL, Book Title, Author, Narrator, Series Name, Series #, Year
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={hasHeaders}
                onChange={(e) => setHasHeaders(e.target.checked)}
              />
            }
            label="CSV file contains header row"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              fileInputRef.current?.click();
            }}
            variant="contained"
          >
            Select File
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

