import 'reflect-metadata';
import { container } from 'tsyringe';
import { ScriptGeneratorService } from '../../application/services/script-generator-service';
import { GenerateShellScriptUseCase } from '../../application/use-cases/generate-shell-script-use-case';
import { FetchYouTubeMetadataUseCase } from '../../application/use-cases/fetch-youtube-metadata-use-case';
import type { IYouTubeMetadataRepository } from '../../domain/repositories/i-youtube-metadata-repository';
import { YoutubeMetadataRepository } from '../repositories/youtube-metadata-repository';

// Register repositories
container.registerSingleton<IYouTubeMetadataRepository>('IYouTubeMetadataRepository', YoutubeMetadataRepository);

// Register services
container.registerSingleton(ScriptGeneratorService);

// Register use cases
container.registerSingleton(GenerateShellScriptUseCase);
container.registerSingleton(FetchYouTubeMetadataUseCase);

export { container };

