# Eliza Project Development Guidelines

## Build Commands
- Build all packages: `pnpm build`
- Start development: `pnpm dev`
- Start client only: `pnpm start:client`
- Run Dockerfile: `pnpm docker`

## Test Commands
- Run all tests: `pnpm test`
- Run single test: `cd packages/PACKAGE_NAME && pnpm test -- -t "test name"`
- Run tests with coverage: `cd packages/PACKAGE_NAME && pnpm test:coverage`
- Watch tests: `cd packages/PACKAGE_NAME && pnpm test:watch`

## Lint & Format
- Run linter: `pnpm lint`
- Format code: `pnpm prettier`
- Check formatting: `pnpm prettier-check`

## Code Style Guidelines
- Use TypeScript for type safety
- Indentation: 4 spaces (no tabs)
- Line length: 80 characters max
- Use double quotes for strings
- Use semicolons
- Use camelCase for variables and functions, PascalCase for classes/interfaces
- Prefix interfaces with 'I' (e.g., `IAgentConfig`)
- Mark unused variables with underscore prefix
- Avoid explicit `any` types when possible
- Use modern ES features (async/await, destructuring, etc.)
- Organize imports alphabetically
- Handle errors explicitly with try/catch blocks