export type YouTubeMetadata = {
  title: string;
  authorName: string;
};

export type IYouTubeMetadataRepository = {
  fetchMetadata(videoId: string): Promise<YouTubeMetadata>;
};
