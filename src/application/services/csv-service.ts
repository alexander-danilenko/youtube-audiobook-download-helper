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
      if (!line) continue;
      const cells = this.parseCsvLine(line);
      
      if (cells.length < expectedColumns) {
        continue; // Skip incomplete rows
      }

      idCounter += 1;
      const url = cells[0] ?? '';
      const title = cells[1] ?? '';
      const author = cells[2] ?? '';
      const narrator = cells[3] ?? '';
      const series = cells[4] ?? '';
      const seriesNumberStr = cells[5] ?? '1';
      const yearStr = cells[6] ?? '';
      const book: BookDto = {
        id: `imported-${idCounter}-${i}`,
        url: url.trim(),
        title: title.trim(),
        author: author.trim(),
        narrator: narrator.trim(),
        series: series.trim(),
        seriesNumber: parseInt(seriesNumberStr.trim(), 10) || 1,
        year: yearStr.trim() ? parseInt(yearStr.trim(), 10) : undefined,
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

