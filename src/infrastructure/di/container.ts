import 'reflect-metadata';
import { container } from 'tsyringe';
import { ScriptGeneratorService } from '@/application/services';
import { GenerateShellScriptUseCase, FetchYouTubeMetadataUseCase } from '@/application/use-cases';
import type { IYouTubeMetadataRepository } from '@/domain/repositories';
import { YoutubeMetadataRepository } from '@/infrastructure/repositories';

// Register repositories
container.registerSingleton<IYouTubeMetadataRepository>('IYouTubeMetadataRepository', YoutubeMetadataRepository);

// Register services
container.registerSingleton(ScriptGeneratorService);

// Register use cases
container.registerSingleton(GenerateShellScriptUseCase);
container.registerSingleton(FetchYouTubeMetadataUseCase);

export { container };
