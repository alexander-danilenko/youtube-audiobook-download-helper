# Project: YouTube Audiobook Download Helper | Tech: Next.js + TypeScript | AI Agent Rules

## ARCHITECTURE PRINCIPLES (STRICT - ALWAYS FOLLOW)

### Domain Driven Development (DDD)

- **MANDATORY**: DDD layered architecture:
  - **Domain** (`src/domain/`): Entities (business logic/invariants), Value Objects (immutable, self-validating), Domain Services, Repository Interfaces (contracts only)
  - **Application** (`src/application/`): Use Cases (orchestrate domain), Application Services, DTOs
  - **Infrastructure** (`src/infrastructure/`): Repository implementations, External Services (APIs, file system)
  - **Presentation** (`src/app/`, `src/components/`): Thin UI components (depend on Application layer ONLY, never Domain/Infrastructure directly)

- **Dependency Rule**: INWARD only - Presentation → Application → Domain; Infrastructure → Domain (implements interfaces); prefer DI over direct Application→Infrastructure

- **Domain Entities**: Enforce invariants, self-contained logic, factory/constructor validation
- **Value Objects**: Immutable, self-validating constructors, value-based equality

### SOLID Principles (STRICT COMPLIANCE REQUIRED)

1. **SRP**: One reason to change per class/function. Separate UI, business logic, data access, validation
2. **OCP**: Extend via interfaces/abstractions/strategy pattern/DI, don't modify existing code
3. **LSP**: Derived classes/interfaces fully substitutable, honor contracts
4. **ISP**: Focused interfaces, avoid fat interfaces, clients depend only on what they use
5. **DIP**: Depend on abstractions (interfaces), not concretions. Use DI for all dependencies

## BUILD & TEST

- **Package Manager**: This project uses **Yarn exclusively**. Do not use npm or other package managers.
- Build: `yarn build` (verify: `tsc --noEmit`)
- Test: `yarn test` (if configured)
- Lint: `yarn lint` (auto-fix: `yarn lint --fix`)

## TASK COMPLETION

- **MANDATORY**: Before considering any task complete, run the following scripts and fix ALL errors:
  1. `yarn typecheck` - Must pass with zero TypeScript errors
  2. `yarn lint` - Must pass with zero ESLint errors
- **No exceptions**: A task is NOT complete if typecheck or lint fail, even if the functionality works
- **Fix all errors**: Address all reported errors before marking the task as done
- **Verification**: Run both scripts after making changes to ensure code quality standards are met

## SPECIFICATIONS & REQUIREMENTS

- **MANDATORY**: Keep `SPECS.md` and code implementation synchronized at all times
- **Code → Specs**: When making functionality/behavior/experience changes in code, update `SPECS.md` to reflect those changes
- **Specs → Code**: When requirements are added or modified in `SPECS.md`, implement corresponding changes in code
- Both directions must be kept in sync:
  - New features require both code implementation AND spec updates
  - Bug fixes that change behavior require spec updates if they affect documented requirements
  - Refactoring that changes user experience requires spec updates
- Review `SPECS.md` before and after making significant changes to ensure alignment

## CODE STYLE

- TypeScript strict mode REQUIRED (`strict: true`)
- Explicit return types; explicit types when inference insufficient
- Avoid `any` (document exceptions); use `as const`; handle nullability (`?` or `| null`)
- Functional components + hooks only (no class components)
- kebab-case files, PascalCase components

## PATTERNS

- Next.js SPA (App Router 13+ or Pages Router 12-)
- Custom hooks for reusable logic; small, focused components
- DI for all services; Repository pattern for data access; Use Case pattern for application logic

## SECURITY

- No hardcoded secrets/keys; validate all user inputs; sanitize YouTube URLs before processing

## INTERNATIONALIZATION (i18n)

- **MANDATORY**: All user-facing strings in JSX components MUST use translation keys via `t()` function
- **NO HARDCODED STRINGS**: Never add plain text strings directly in JSX - always use translation keys
- **Translation Key Format**: Use strict snake_case (e.g., `app_title`, `book_card_youtube_url`) - no nested objects
- **Key Naming**: Translation keys must follow semantic grouping with underscores (e.g., `book_card_*`, `settings_*`, `csv_*`)
- **Type Safety**: Translation function `t()` is fully typed - use autocomplete to ensure correct key usage
- **Schema Validation**: All translation keys must be defined in `src/i18n/translations.schema.json`
- **Adding New Translations**:
  1. Add key to English translation file (`src/i18n/locales/en.json`)
  2. Add same key to all other language files (e.g., `uk.json`)
  3. Update JSON schema (`src/i18n/translations.schema.json`)
  4. Use `t('your_new_key')` in components
- **URL Routing**: Languages are accessed via `/en` and `/uk` URLs - middleware handles detection and redirects
- **Language Store**: Use `useLanguageStore` for language state management (synced with URL and localStorage)

## GIT

Conventional Commits: `<type>(<scope>): <subject>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

Example: `feat(audio): add YouTube audio extraction using yt-dlp`

## VERSIONING

- **MANDATORY**: Each change must bump the version in `package.json` following [Semantic Versioning (SemVer)](https://semver.org/)
- Format: `MAJOR.MINOR.PATCH` (e.g., `0.1.0`)
- **MAJOR** (X.0.0): Breaking changes that are incompatible with previous versions
- **MINOR** (0.X.0): New features added in a backward-compatible manner
- **PATCH** (0.0.X): Backward-compatible bug fixes
- Update version in `package.json` before committing changes
