import { BookDto } from '../dto/book-dto';

export class ScriptGeneratorService {
  private readonly defaultTemplate = '$author - [$series - $series_num] - $title [$narrator].%(ext)s';

  public generateScript(books: BookDto[], filenameTemplate: string): string {
    const template = filenameTemplate || this.defaultTemplate;
    const commands = books.map((book) => this.generateCommand(book, template));
    return commands.join('\n\n');
  }

  private generateCommand(book: BookDto, template: string): string {
    const filename = this.processFilenameTemplate(book, template);
    const escapedFilename = this.escapeShellString(filename);
    const escapedUrl = this.escapeShellString(book.url);

    return `yt-dlp --extract-audio --audio-format m4a --embed-chapters --embed-metadata \\
  --embed-thumbnail --convert-thumbnails jpg \\
  --replace-in-metadata "genre" ".*" "Audiobook" \\
  --parse-metadata "${this.escapeShellString(book.title)}:%(title)s" \\
  --parse-metadata "${this.escapeShellString(book.author)}:%(artist)s" \\
  --parse-metadata "${this.escapeShellString(book.series || '')}:%(album)s" \\
  --parse-metadata "${this.escapeShellString(book.narrator)}:%(composer)s" \\
  --parse-metadata "${book.seriesNumber}:%(track_number)s" \\
  --postprocessor-args "ffmpeg:-c:a copy" \\
  -o "${escapedFilename}" \\
  "${escapedUrl}"`;
  }

  private processFilenameTemplate(book: BookDto, template: string): string {
    let result = template;

    // Replace custom variables - replace longer variable names first to avoid partial matches
    result = result.replace(/\$series_num/g, book.seriesNumber?.toString() || '1');
    result = result.replace(/\$author/g, book.author || '');
    result = result.replace(/\$title/g, book.title || '');
    result = result.replace(/\$narrator/g, book.narrator || '');
    result = result.replace(/\$series/g, book.series || '');
    result = result.replace(/\$year/g, book.year?.toString() || '');

    // Handle optional brackets - remove empty brackets and their contents after variable substitution
    result = result.replace(/\[([^\]]*)\]/g, (match, content) => {
      // Remove variables that were empty and separators, then check if anything remains
      const cleaned = content
        .trim()
        .replace(/\s*-\s*/g, '') // Remove separators
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      
      // If bracket content is empty after cleaning, remove the entire bracket
      if (!cleaned) {
        return '';
      }
      
      // Otherwise keep the bracket but clean up its content
      return `[${content.trim()}]`;
    });
    
    // Clean up any remaining empty brackets
    result = result.replace(/\[\s*\]/g, '');

    // Clean up multiple spaces and separators
    result = result.replace(/\s*-\s*-\s*/g, ' - ');
    result = result.replace(/\s+/g, ' ');
    result = result.trim();

    return result;
  }

  private escapeShellString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\$/g, '\\$')
      .replace(/`/g, '\\`');
  }
}

