import { injectable, inject } from 'tsyringe';
import { ScriptGeneratorService } from '../services/script-generator-service';
import { ScriptGenerationDto, ScriptGenerationResult } from '../dto/script-generation-dto';

@injectable()
export class GenerateShellScriptUseCase {
  constructor(
    @inject(ScriptGeneratorService)
    private readonly scriptGenerator: ScriptGeneratorService
  ) {}

  public execute(input: ScriptGenerationDto): ScriptGenerationResult {
    const scriptContent = this.scriptGenerator.generateScript(
      input.books,
      input.filenameTemplate
    );

    return {
      scriptContent,
    };
  }
}

