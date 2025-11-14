import { BookDto } from '@/application/dto';

export interface CsvColumn {
  key: keyof BookDto;
  label: string;
}

export class CsvService {
  public parseCsv(csvText: string, skipFirstRow: boolean, expectedColumns: number): BookDto[] {
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
      const cells = this.parseCsvLine(line);
      
      if (cells.length < expectedColumns) {
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
  }

  public exportToCsv(books: BookDto[], columns: CsvColumn[]): string {
    // Create header row
    const headers = columns.map(col => col.label);
    
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
    return BOM + csvContent;
  }

  private parseCsvLine(line: string): string[] {
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
  }
}

