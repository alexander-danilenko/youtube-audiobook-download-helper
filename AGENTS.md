# Project: YouTube Audiobook Downloader | Tech: Next.js + TypeScript | AI Agent Rules

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
- Build: `npm run build` (verify: `tsc --noEmit`)
- Test: `npm test` (if configured)
- Lint: `npm run lint` (auto-fix: `npm run lint -- --fix`)

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
