import { BookDto } from '@/application/dto';

export interface MetadataComparison {
  fieldName: 'title' | 'author';
  current: string;
  fetched: string;
}

export interface YouTubeMetadata {
  title: string;
  authorName: string;
}

export class MetadataComparisonService {
  /**
   * Compares current book data with fetched metadata and returns differences
   */
  public compareMetadata(book: BookDto, metadata: YouTubeMetadata): MetadataComparison[] {
    const diffs: MetadataComparison[] = [];

    if (book.title.trim() && book.title !== metadata.title) {
      diffs.push({
        fieldName: 'title',
        current: book.title,
        fetched: metadata.title,
      });
    }

    if (book.author.trim() && book.author !== metadata.authorName) {
      diffs.push({
        fieldName: 'author',
        current: book.author,
        fetched: metadata.authorName,
      });
    }

    return diffs;
  }

  /**
   * Merges selected values from comparison into a book
   */
  public mergeSelectedValues(
    book: BookDto,
    comparisons: MetadataComparison[],
    selectedValues: Record<string, 'current' | 'fetched'>
  ): BookDto {
    const updatedBook = { ...book };

    comparisons.forEach((comparison) => {
      const selected = selectedValues[comparison.fieldName] || 'fetched';
      if (selected === 'fetched') {
        updatedBook[comparison.fieldName] = comparison.fetched;
      }
    });

    return updatedBook;
  }

  /**
   * Auto-updates empty fields in a book with metadata values
   */
  public autoUpdateEmptyFields(book: BookDto, metadata: YouTubeMetadata): BookDto {
    return {
      ...book,
      title: book.title.trim() || metadata.title,
      author: book.author.trim() || metadata.authorName,
    };
  }

  /**
   * Creates default selected values for comparisons (defaults to 'current')
   */
  public createDefaultSelectedValues(comparisons: MetadataComparison[]): Record<string, 'current' | 'fetched'> {
    return Object.fromEntries(comparisons.map((d) => [d.fieldName, 'current']));
  }
}

