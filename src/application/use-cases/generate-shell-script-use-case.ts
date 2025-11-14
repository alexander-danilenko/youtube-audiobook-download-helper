import { injectable, inject } from 'tsyringe';
import { ScriptGeneratorService } from '@/application/services';
import { ScriptGenerationDto, ScriptGenerationResult } from '@/application/dto';

@injectable()
export class GenerateShellScriptUseCase {
  constructor(
    @inject(ScriptGeneratorService)
    private readonly scriptGenerator: ScriptGeneratorService
  ) {}

  public execute(input: ScriptGenerationDto): ScriptGenerationResult {
    const scriptContent = this.scriptGenerator.generateScript(
      input.books,
      input.filenameTemplate,
      input.cookiesBrowser
    );

    return {
      scriptContent,
    };
  }

  public executeDownloadString(input: ScriptGenerationDto): string {
    return this.scriptGenerator.generateDownloadString(
      input.books,
      input.filenameTemplate,
      input.cookiesBrowser
    );
  }
}

