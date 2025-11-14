import { BookDto, bookDtoSchema } from '@/application/dto';

export interface FieldErrors {
  [fieldPath: string]: string;
}

export class BookService {
  /**
   * Validates a book using the bookDtoSchema
   */
  public validateBook(book: BookDto): ReturnType<typeof bookDtoSchema.safeParse> {
    return bookDtoSchema.safeParse(book);
  }

  /**
   * Validates multiple books and returns validation results
   */
  public validateBooks(books: BookDto[]): Array<{ book: BookDto; result: ReturnType<typeof bookDtoSchema.safeParse> }> {
    return books.map((book) => ({
      book,
      result: this.validateBook(book),
    }));
  }

  /**
   * Extracts field-level validation errors from a validation result
   * Returns errors with translation keys (caller should translate them)
   */
  public extractFieldErrors(validationResult: ReturnType<typeof bookDtoSchema.safeParse>): FieldErrors {
    if (validationResult.success) {
      return {};
    }

    const errors: FieldErrors = {};
    if (validationResult.error) {
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
    }
    return errors;
  }

  /**
   * Translates field errors using a translation function
   * Translation keys starting with 'validation_' are treated as translation keys
   */
  public translateFieldErrors(
    errors: FieldErrors,
    translate: (key: string) => string
  ): FieldErrors {
    const translated: FieldErrors = {};
    Object.entries(errors).forEach(([path, message]) => {
      translated[path] = message.startsWith('validation_') ? translate(message) : message;
    });
    return translated;
  }

  /**
   * Validates if a URL is a valid YouTube URL
   */
  public isValidYouTubeUrl(url: string | null | undefined): boolean {
    if (!url?.trim()) return false;
    try {
      const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
      return youtubePattern.test(url.trim());
    } catch {
      return false;
    }
  }

  /**
   * Creates a new empty book instance with a unique ID
   */
  public createEmptyBook(): BookDto {
    return {
      id: Date.now().toString(),
      url: '',
      title: '',
      author: '',
      narrator: '',
      series: '',
      seriesNumber: 1,
      year: undefined,
    };
  }

  /**
   * Filters valid books from an array
   */
  public getValidBooks(books: BookDto[]): BookDto[] {
    return this.validateBooks(books)
      .filter(({ result }) => result.success)
      .map(({ book }) => book);
  }

  /**
   * Checks if any books in an array are invalid
   */
  public hasInvalidBooks(books: BookDto[]): boolean {
    return this.validateBooks(books).some(({ result }) => !result.success);
  }
}

