import { injectable } from 'tsyringe';
import { IThumbnailRepository } from '../../domain/repositories/i-thumbnail-repository';

@injectable()
export class YoutubeThumbnailRepository implements IThumbnailRepository {
  public getThumbnailUrl(
    videoId: string,
    quality: 'default' | 'medium' | 'high' | 'max' = 'medium'
  ): string {
    const qualityMap: Record<'default' | 'medium' | 'high' | 'max', string> = {
      default: 'default.jpg',
      medium: 'mqdefault.jpg',
      high: 'hqdefault.jpg',
      max: 'maxresdefault.jpg',
    };

    const qualityPath = qualityMap[quality];
    return `https://img.youtube.com/vi/${videoId}/${qualityPath}`;
  }
}

