export interface IThumbnailRepository {
  getThumbnailUrl(videoId: string, quality?: 'default' | 'medium' | 'high' | 'max'): string;
}
