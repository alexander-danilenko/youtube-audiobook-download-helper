import { BookDto } from './book-dto';

export interface ScriptGenerationDto {
  books: BookDto[];
  filenameTemplate: string;
}

export interface ScriptGenerationResult {
  scriptContent: string;
}

