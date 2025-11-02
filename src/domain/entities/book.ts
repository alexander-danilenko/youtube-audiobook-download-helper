import { YoutubeUrl } from '../value-objects/youtube-url';
import { BookMetadata } from '../value-objects/book-metadata';

export class Book {
  public readonly url: YoutubeUrl;
  public readonly metadata: BookMetadata;

  private constructor(url: YoutubeUrl, metadata: BookMetadata) {
    this.url = url;
    this.metadata = metadata;
  }

  public static create(url: string, metadata: BookMetadata): Book {
    const youtubeUrl = YoutubeUrl.create(url);
    return new Book(youtubeUrl, metadata);
  }

  public equals(other: Book): boolean {
    return this.url.equals(other.url) && this.metadata.equals(other.metadata);
  }
}
