# GCloud Storage QA Framework

A comprehensive, enterprise-grade test automation framework for Google Cloud Storage operations, built with Playwright and TypeScript following industry best practices.

## Features

- ✅ **Modular Architecture**: OOP-based design with clear separation of concerns
- ✅ **Type-Safe**: Full TypeScript support with strict typing
- ✅ **Secrets Management**: Environment-based configuration for secure credential handling
- ✅ **Docker Support**: Containerized execution for CI/CD and local development
- ✅ **Comprehensive Testing**: Happy flow and error state validation for all GCloud storage commands
- ✅ **Advanced Validations**: URL safety checks, HTTP request validation, and expiration duration testing
- ✅ **Playwright Best Practices**: Fixture composition, test annotations, and proper async/await patterns
- ✅ **Optimized Performance**: Parallel test execution with 4 workers (73% faster than sequential)
- ✅ **Centralized Test Expectations**: ExpectedOutputs class for maintainable output validation

## Supported Commands

- **`ls`** - List buckets and objects
- **`cp`** - Copy files and objects
- **`mv`** - Move/rename objects
- **`sign-url`** - Generate signed URLs with comprehensive validation

## Architecture

### Project Structure

```
gcloud-storage-qa-framework/
├── config/
│   └── SecretsManager.ts          # Centralized secrets management
├── fixtures/
│   └── BaseTestFixture.ts          # Base fixture for test metadata
├── tests/
│   ├── gcloudCliCommands/
│   │   └── fixtures/               # Command-specific fixtures
│   │       ├── baseCliCmdFixture.ts
│   │       ├── lsFixtures.ts
│   │       ├── cpFixtures.ts
│   │       ├── mvFixtures.ts
│   │       └── signUrlFixtures.ts
│   ├── lsTest.spec.ts
│   ├── cpTest.spec.ts
│   ├── mvTest.spec.ts
│   └── signUrlTest.spec.ts
├── test-data/                      # Test data definitions
│   ├── ls-test-data.ts
│   ├── cp-test-data.ts
│   ├── mv-test-data.ts
│   └── sign-url-test-data.ts
├── utils/
│   ├── commands/
│   │   ├── CommandType.ts          # Command type enum
│   │   └── CommandFactory.ts       # Factory pattern for commands
│   ├── constants/
│   │   └── clousObjectPaths.ts     # Path and file name constants
│   ├── BaseCliCommand.ts           # Base CLI execution
│   ├── gcloudCliCommands.ts        # GCloud command builder
│   └── signUrlValidations.ts      # URL validation utilities
├── Dockerfile                      # Multi-stage Docker build
├── docker-compose.yml              # Docker Compose configuration
├── .env.example                    # Environment variables template
└── playwright.config.ts            # Playwright configuration
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Google Cloud SDK (for local execution)
- Docker (optional, for containerized execution)
- Active GCloud project with storage buckets

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd gcloud-storage-qa-framework
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
GCLOUD_BUCKET_MAIN=gs://your-main-bucket
GCLOUD_BUCKET_EMPTY=gs://your-empty-bucket
GCLOUD_BUCKET_MOVE_DEST=gs://your-move-destination-bucket
SERVICE_ACCOUNT=your-service-account@project.iam.gserviceaccount.com
PROJECT_ID=your-project-id
TEST_GCLOUD_USERNAME=your-username
TEST_GCLOUD_PASS=your-password
GCLOUD_BUCKET_REGION=US
```

4. Authenticate with GCloud:

```bash
gcloud auth login
gcloud config set project your-project-id
```

## Running Tests

### Local Execution

Run all tests (optimized with 4 parallel workers):

```bash
npm run test:all
```

Run specific test suites:

```bash
npm run test:ls        # List command tests
npm run test:cp        # Copy command tests
npm run test:mv        # Move command tests
npm run test:sign-url  # Sign URL command tests
```

Run in headed mode (with browser):

```bash
npm run test:headed
```

Debug mode (sequential execution):

```bash
npm run test:debug
# Or run with single worker for easier debugging
npx playwright test tests/ --workers=1
```

View HTML report:

```bash
npm run test:report
```

### Performance

- **Parallel Execution**: 4 workers (local) / 2 workers (CI)
- **Total Runtime**: ~32 seconds for all 22 tests
- **Performance Gain**: 73% faster than sequential execution
- See [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) for details

### Docker Execution

Build and run tests in Docker:

```bash
npm run docker:build
npm run docker:run
```

Or use Docker Compose directly:

```bash
docker-compose up
```

For detailed Docker usage, see [DOCKER.md](DOCKER.md).

## Environment Configuration

### Local Development (.env)

When running tests locally, the framework automatically loads secrets from a `.env` file in the project root. This file is gitignored and should never be committed.

### Docker/CI Environment

When running in Docker (with `DOCKER=true` or `CI=true` environment variables), the framework uses environment variables directly without loading `.env`. This is the recommended approach for CI/CD pipelines.

## Test Structure

### Test Data

Test data is organized into separate files for each command:

- **Happy Flow Tests**: Validate successful command execution
- **Error State Tests**: Validate proper error handling

Example test data structure:

```typescript
import { GcloudCommandType } from '../utils/commands/CommandType';

export const cpHappyFlowTestData: GcloudTestData[] = [
  {
    testId: 'CP-001',
    description: 'Copy a local file to a bucket',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.CP,
      sourcePath: LocalPaths.LOCAL_FILE_CP_001,
      destinationPath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/uploaded-file.json`
    },
    expectedSuccess: true
  }
];
```

### Fixtures

The framework uses Playwright's fixture system with composition:

1. **BaseTestFixture**: Pure test utilities (logging, annotations, attachments)
2. **baseCliCmdFixture**: CLI-specific functionality (execution, cleanup, validation)
3. **Command-specific fixtures**: Inherit from base fixtures and add command-specific logic

## CI/CD Integration

### GitHub Actions

The repository includes a GitHub Actions workflow that:

1. Builds the Docker image on every push/PR
2. Runs all tests with secrets from GitHub repository settings
3. Uploads test results as artifacts

### Required GitHub Secrets

Configure these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

- `GCLOUD_BUCKET_MAIN`
- `GCLOUD_BUCKET_EMPTY`
- `GCLOUD_BUCKET_MOVE_DEST`
- `SERVICE_ACCOUNT`
- `PROJECT_ID`
- `TEST_GCLOUD_USERNAME`
- `TEST_GCLOUD_PASS`
- `GCLOUD_BUCKET_REGION`

## Design Patterns

### Singleton Pattern

`SecretsManager` uses the singleton pattern to ensure a single instance manages all secrets:

```typescript
const secrets = SecretsManager.getInstance();
const bucket = secrets.getBucket('MAIN');
```

### Factory Pattern

`CommandFactory` creates command instances based on type:

```typescript
const command = CommandFactory.createCommand(GcloudCommandType.CP);
```

### Fixture Composition

Fixtures are composed to separate concerns:

```typescript
BaseTestFixture (test metadata)
    ↓
baseCliCmdFixture (CLI execution)
    ↓
Command-specific fixtures (command logic)
```

## Best Practices

### TypeScript

- Strict typing enabled
- Enums for type-safe constants
- Interfaces for test data structures

### Playwright

- Proper use of `testInfo` for annotations
- Async/await patterns throughout
- Fixture composition for reusability

### Security

- Secrets never hardcoded
- `.env` file gitignored
- Environment-based configuration
- Service account with minimal permissions

### Testing

- Clear test IDs and descriptions
- Comprehensive assertions
- Cleanup after each test
- File existence validation

## Troubleshooting

### Authentication Issues

```bash
# Re-authenticate with gcloud
gcloud auth login
gcloud auth application-default login

# Verify authentication
gcloud auth list
```

### Permission Errors

Ensure your service account has these IAM roles:

- `Storage Object Viewer`
- `Storage Object Creator`
- `Storage Object Admin` (for sign-url)

### Environment Variable Issues

Verify environment variables are loaded:

```typescript
// In your test or utility file
console.log('GCLOUD_BUCKET_MAIN:', process.env.GCLOUD_BUCKET_MAIN);
```

### Docker Issues

See [DOCKER.md](DOCKER.md) for comprehensive Docker troubleshooting.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow existing TypeScript patterns
- Use Playwright best practices
- Write clear, descriptive test names
- Add comments for complex logic
- Update documentation when adding features

## License

This project is licensed under the ISC License.

## Support

For issues, questions, or contributions, please open an issue in the GitHub repository.

## Roadmap

- [ ] Add support for `rm` command
- [ ] Implement parallel test execution
- [ ] Add performance benchmarking
- [ ] Create custom Playwright reporters
- [ ] Add support for multiple cloud providers
- [ ] Implement visual regression testing for CLI output
- [ ] Add API-level testing alongside CLI testing

## Acknowledgments

- Built with [Playwright](https://playwright.dev/)
- Powered by [TypeScript](https://www.typescriptlang.org/)
- Cloud operations via [Google Cloud SDK](https://cloud.google.com/sdk)

