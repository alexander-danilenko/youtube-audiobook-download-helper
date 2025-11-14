import { injectable, inject } from 'tsyringe';
import type { IYouTubeMetadataRepository } from '@/domain/repositories';
import { YoutubeUrl } from '@/domain/value-objects';

export interface FetchYouTubeMetadataResult {
  title: string;
  authorName: string;
}

@injectable()
export class FetchYouTubeMetadataUseCase {
  constructor(
    @inject('IYouTubeMetadataRepository') private readonly metadataRepository: IYouTubeMetadataRepository
  ) {}

  public async execute(url: string): Promise<FetchYouTubeMetadataResult> {
    console.log('FetchYouTubeMetadataUseCase: execute called with URL:', url);
    console.log('FetchYouTubeMetadataUseCase: metadataRepository:', this.metadataRepository);

    const youtubeUrl = YoutubeUrl.create(url);
    const videoId = youtubeUrl.extractVideoId();

    console.log('FetchYouTubeMetadataUseCase: Extracted video ID:', videoId);

    if (!videoId) {
      throw new Error('Could not extract video ID from YouTube URL');
    }

    if (!this.metadataRepository) {
      throw new Error('Metadata repository is not initialized');
    }

    const metadata = await this.metadataRepository.fetchMetadata(videoId);

    console.log('FetchYouTubeMetadataUseCase: Metadata fetched:', metadata);

    return {
      title: metadata.title,
      authorName: metadata.authorName,
    };
  }
}

