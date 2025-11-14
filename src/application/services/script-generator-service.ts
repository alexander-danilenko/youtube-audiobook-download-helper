import { BookDto } from '@/application/dto';
import { CookiesBrowser, AudioBitrate } from '@/application/stores';

export class ScriptGeneratorService {
  private readonly defaultTemplate = '$author - [$series - $series_num] - $title [$narrator].%(ext)s';

  public generateScript(books: BookDto[], filenameTemplate: string, cookiesBrowser: CookiesBrowser, maxAudioBitrate: AudioBitrate): string {
    const template = filenameTemplate || this.defaultTemplate;
    const commands = books.map((book) => this.generateCommand(book, template, cookiesBrowser, maxAudioBitrate));
    return commands.join('\n\n');
  }

  public generateDownloadString(books: BookDto[], filenameTemplate: string, cookiesBrowser: CookiesBrowser, maxAudioBitrate: AudioBitrate): string {
    const template = filenameTemplate || this.defaultTemplate;
    const commands = books.map((book) => this.generateOneLineCommand(book, template, cookiesBrowser, maxAudioBitrate));
    return commands.join(' && ');
  }

  private generateCommand(book: BookDto, template: string, cookiesBrowser: CookiesBrowser, maxAudioBitrate: AudioBitrate): string {
    const filename = this.processFilenameTemplate(book, template);
    const escapedFilename = this.escapeShellString(filename);
    const escapedUrl = this.escapeShellString(book.url);
    const cookiesOption = cookiesBrowser !== 'none' ? `  --cookies-from-browser "${cookiesBrowser}" \\\n` : '';
    const formatFilter = this.buildFormatFilter(maxAudioBitrate);

    return `yt-dlp -f "${formatFilter}" --extract-audio --audio-format m4a --embed-chapters --embed-metadata \\
  --embed-thumbnail --convert-thumbnails jpg \\${cookiesOption}
  --replace-in-metadata "genre" ".*" "Audiobook" \\
  --parse-metadata "${this.escapeShellString(book.title)}:%(title)s" \\
  --parse-metadata "${this.escapeShellString(book.author)}:%(artist)s" \\
  --parse-metadata "${this.escapeShellString(book.series || '')}:%(album)s" \\
  --parse-metadata "${this.escapeShellString(book.narrator || '')}:%(composer)s" \\
  --parse-metadata "${this.escapeShellString(book.seriesNumber?.toString() || '')}:%(track_number)s" \\
  --postprocessor-args "ffmpeg:-c:a copy" \\
  -o "${escapedFilename}" \\
  "${escapedUrl}"`;
  }

  private generateOneLineCommand(book: BookDto, template: string, cookiesBrowser: CookiesBrowser, maxAudioBitrate: AudioBitrate): string {
    const filename = this.processFilenameTemplate(book, template);
    const escapedFilename = this.escapeShellString(filename);
    const escapedUrl = this.escapeShellString(book.url);
    const cookiesOption = cookiesBrowser !== 'none' ? ` --cookies-from-browser "${cookiesBrowser}"` : '';
    const formatFilter = this.buildFormatFilter(maxAudioBitrate);

    return `yt-dlp -f "${formatFilter}" --extract-audio --audio-format m4a --embed-chapters --embed-metadata --embed-thumbnail --convert-thumbnails jpg${cookiesOption} --replace-in-metadata "genre" ".*" "Audiobook" --parse-metadata "${this.escapeShellString(book.title)}:%(title)s" --parse-metadata "${this.escapeShellString(book.author)}:%(artist)s" --parse-metadata "${this.escapeShellString(book.series || '')}:%(album)s" --parse-metadata "${this.escapeShellString(book.narrator || '')}:%(composer)s" --parse-metadata "${this.escapeShellString(book.seriesNumber?.toString() || '')}:%(track_number)s" --postprocessor-args "ffmpeg:-c:a copy" -o "${escapedFilename}" "${escapedUrl}"`;
  }

  private buildFormatFilter(maxAudioBitrate: AudioBitrate): string {
    if (maxAudioBitrate === 'original') {
      return 'bestaudio[ext=m4a]';
    }
    // yt-dlp abr filter accepts just an integer
    return `bestaudio[ext=m4a][abr<=${maxAudioBitrate}]`;
  }

  private processFilenameTemplate(book: BookDto, template: string): string {
    let result = template;

    // Sanitize and replace custom variables - replace longer variable names first to avoid partial matches
    // Sanitize book data before insertion to prevent injection
    result = result.replace(/\$series_num/g, this.sanitizeForFilename(book.seriesNumber?.toString() || '1'));
    result = result.replace(/\$author/g, this.sanitizeForFilename(book.author || ''));
    result = result.replace(/\$title/g, this.sanitizeForFilename(book.title || ''));
    result = result.replace(/\$narrator/g, this.sanitizeForFilename(book.narrator || ''));
    result = result.replace(/\$series/g, this.sanitizeForFilename(book.series || ''));
    result = result.replace(/\$year/g, this.sanitizeForFilename(book.year?.toString() || ''));

    // Handle optional brackets - remove empty brackets and their contents after variable substitution
    result = result.replace(/\[([^\]]*)\]/g, (_match, content) => {
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

  /**
   * Escapes a string for safe use inside double quotes in bash scripts.
   * Escapes: backslash, double quote, dollar sign, backtick, and removes control characters.
   */
  private escapeShellString(str: string): string {
    return str
      // Remove control characters (including newlines and carriage returns)
      // These should not appear in filenames anyway
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Escape backslash first (must be first to avoid double-escaping)
      .replace(/\\/g, '\\\\')
      // Escape double quotes
      .replace(/"/g, '\\"')
      // Escape dollar signs (prevents variable expansion)
      .replace(/\$/g, '\\$')
      // Escape backticks (prevents command substitution)
      .replace(/`/g, '\\`');
  }

  /**
   * Sanitizes input data before inserting into filename template.
   * Removes dangerous characters that could lead to shell injection.
   * This is a defense-in-depth measure before final escaping.
   */
  private sanitizeForFilename(input: string): string {
    if (!input) {
      return '';
    }

    return input
      // Remove control characters (newlines, tabs, etc.)
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Remove shell command separators
      .replace(/[;&|<>]/g, '')
      // Remove parentheses (could be used for command substitution)
      .replace(/[()]/g, '')
      // Remove curly braces (could be used for variable expansion in some contexts)
      .replace(/[{}]/g, '')
      // Trim whitespace
      .trim();
  }
}

