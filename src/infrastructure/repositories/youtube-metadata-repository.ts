import { injectable } from 'tsyringe';
import type { IYouTubeMetadataRepository, YouTubeMetadata } from '../../domain/repositories/i-youtube-metadata-repository';

@injectable()
export class YoutubeMetadataRepository implements IYouTubeMetadataRepository {
  public async fetchMetadata(videoId: string): Promise<YouTubeMetadata> {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    console.log('Fetching YouTube metadata for video ID:', videoId, 'URL:', oEmbedUrl);

    try {
      const response = await fetch(oEmbedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('YouTube oEmbed response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube oEmbed error response:', errorText);
        throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('YouTube oEmbed data received:', data);

      return {
        title: data.title || '',
        authorName: data.author_name || '',
      };
    } catch (error) {
      console.error('Error in fetchMetadata:', error);
      throw new Error(`Error fetching YouTube metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

