export class BookMetadata {
  public readonly title: string;
  public readonly author: string;
  public readonly narrator: string;
  public readonly series?: string;
  public readonly seriesNumber: number;
  public readonly year?: number;

  private constructor(
    title: string,
    author: string,
    narrator: string,
    series?: string,
    seriesNumber: number = 1,
    year?: number
  ) {
    BookMetadata.validate(title, author, narrator, seriesNumber, year);
    this.title = title;
    this.author = author;
    this.narrator = narrator;
    this.series = series;
    this.seriesNumber = seriesNumber;
    this.year = year;
  }

  public static create(
    title: string,
    author: string,
    narrator: string,
    series?: string,
    seriesNumber: number = 1,
    year?: number
  ): BookMetadata {
    return new BookMetadata(title, author, narrator, series, seriesNumber, year);
  }

  private static validate(
    title: string,
    author: string,
    narrator: string,
    seriesNumber: number,
    year?: number
  ): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Book title is required');
    }

    if (!author || author.trim().length === 0) {
      throw new Error('Book author is required');
    }

    if (!narrator || narrator.trim().length === 0) {
      throw new Error('Narrator is required');
    }

    if (seriesNumber < 1) {
      throw new Error('Series number must be at least 1');
    }

    if (year !== undefined && (year < 1000 || year > 9999)) {
      throw new Error('Year must be a valid 4-digit number');
    }
  }

  public equals(other: BookMetadata): boolean {
    return (
      this.title === other.title &&
      this.author === other.author &&
      this.narrator === other.narrator &&
      this.series === other.series &&
      this.seriesNumber === other.seriesNumber &&
      this.year === other.year
    );
  }
}

