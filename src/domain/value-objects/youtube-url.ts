export class YoutubeUrl {
  private readonly value: string;

  private constructor(url: string) {
    this.value = url;
  }

  public static create(url: string): YoutubeUrl {
    const sanitized = YoutubeUrl.sanitize(url);
    YoutubeUrl.validate(sanitized);
    return new YoutubeUrl(sanitized);
  }

  private static sanitize(url: string): string {
    return url.trim();
  }

  private static validate(url: string): void {
    if (!url) {
      throw new Error('YouTube URL cannot be empty');
    }

    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
    if (!youtubePattern.test(url)) {
      throw new Error('Invalid YouTube URL format');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public extractVideoId(): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = this.value.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  public equals(other: YoutubeUrl): boolean {
    return this.value === other.value;
  }
}

