import 'reflect-metadata';
import { container } from 'tsyringe';
import { ScriptGeneratorService } from '../../application/services/script-generator-service';
import { GenerateShellScriptUseCase } from '../../application/use-cases/generate-shell-script-use-case';

// Register services
container.registerSingleton(ScriptGeneratorService);

// Register use cases
container.registerSingleton(GenerateShellScriptUseCase);

export { container };

