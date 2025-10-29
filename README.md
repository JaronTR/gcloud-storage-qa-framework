# GCloud Storage QA Framework

A comprehensive test automation framework for Google Cloud Storage CLI operations, built with Playwright and TypeScript. This framework validates GCloud Storage commands through both happy flow and error state testing, ensuring robust cloud storage operations.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Running Tests via GitHub Actions](#running-tests-via-github-actions)
- [Test Structure](#test-structure)
- [Test Data](#test-data)
- [Extending the Framework](#extending-the-framework)
- [Troubleshooting](#troubleshooting)

## Overview

This framework provides automated testing for Google Cloud Storage operations including:

- **`ls`** - List buckets and objects
- **`cp`** - Copy files and objects
- **`mv`** - Move/rename objects  
- **`sign-url`** - Generate and validate signed URLs

Each command includes comprehensive test coverage for both successful operations (happy flow) and error handling (error states).

## Features

- **Modular Architecture**: OOP-based design with clear separation of concerns
- **Type-Safe**: Full TypeScript support with strict typing
- **Parallel Execution**: 2 workers in CI for optimal performance
- **Global Setup/Teardown**: Automated test file uploads and cleanup
- **Docker Support**: Containerized execution for consistent CI/CD
- **Comprehensive Validation**: URL safety checks, HTTP request validation, expiration testing
- **Structured Logging**: Detailed execution logs for debugging
- **Fixture Composition**: Reusable test fixtures following Playwright best practices

## Architecture

### Assumptions
-The project will only need to use a single gcloud account & gcloud project - so the sections regarding them weren't built in a way that could be expanded easily
-Only basic test cases were covered in order to keep the repository in a reasonable size.
There are many more cases that could have been covered as well. (and in a work situation, all relevant test cases would have been covered)

### Project Structure

```
gcloud-storage-qa-framework/
├── .github/
│   └── workflows/
│       └── manual-docker-tests.yml    # GitHub Actions workflow
├── config/
│   └── SecretsManager.ts              # Centralized secrets management
├── tests/
│   ├── BaseTestFixture.ts             # Base fixture for test metadata
│   └── gcloudCliCommands/
│       ├── fixtures/                   # Command-specific fixtures
│       │   ├── baseCliCmdFixture.ts   # Shared CLI functionality
│       │   ├── cpFixtures.ts          # Copy command fixtures
│       │   ├── lsFixtures.ts          # List command fixtures
│       │   ├── mvFixtures.ts          # Move command fixtures
│       │   └── signUrlFixtures.ts     # Sign URL fixtures
│       └── test-suites/                # Test specifications
│           ├── cpTest.spec.ts
│           ├── lsTest.spec.ts
│           ├── mvTest.spec.ts
│           └── signUrlTest.spec.ts
├── test-data/                          # Test data definitions
│   ├── cp-test-data.ts
│   ├── ls-test-data.ts
│   ├── mv-test-data.ts
│   ├── sign-url-test-data.ts
│   └── local-files/                    # Local test files
│       ├── cp/
│       ├── mv/
│       ├── sign-url/
│       └── downloaded-files/
├── utils/
│   ├── cli-helpers/
│   │   ├── BaseCliCommand.ts          # Base CLI execution
│   │   ├── gcloudCliCommands.ts       # GCloud command builder
│   │   ├── GcloudCliClient.ts         # Command interface
│   │   ├── gcloudTestData.ts          # Test data interface
│   │   └── signUrlValidations.ts      # URL validation utilities
│   ├── commands/
│   │   ├── CommandType.ts             # Command type enum
│   │   └── CommandFactory.ts          # Factory pattern for commands
│   └── constants/
│       ├── clousObjectPaths.ts        # Path constants
│       └── expectedOutputs.ts         # Expected output constants
├── global-setup.ts                     # Global setup (auth, file uploads)
├── global-teardown.ts                  # Global teardown (cleanup)
├── playwright.config.ts                # Playwright configuration
├── Dockerfile                          # Multi-stage Docker build
├── docker-compose.yml                  # Docker Compose configuration
└── package.json                        # Dependencies and scripts
```

### Design Patterns

#### Singleton Pattern
`SecretsManager` ensures a single instance manages all environment secrets:

```typescript
const secrets = SecretsManager.getInstance();
const bucket = secrets.getBucket('MAIN');
```

#### Factory Pattern
`CommandFactory` creates command instances based on type:

```typescript
const command = CommandFactory.createCommand(GcloudCommandType.CP);
```

#### Fixture Composition
Fixtures are composed to separate concerns:

```
BaseTestFixture (test metadata, logging, annotations)
    ↓
baseCliCmdFixture (CLI execution, validation, cleanup)
    ↓
Command-specific fixtures (command-specific logic)
```

## Prerequisites

### Required IAM Permissions

Your service account must have the following IAM role at the **project level**:

- **Storage Admin** (`roles/storage.admin`)

This role provides:
- Read/write/delete access to objects
- List buckets and objects
- Generate signed URLs
- Full storage management capabilities

### Required GCP Resources

- Active GCP project
- Three Cloud Storage buckets:
  - Main bucket (for test operations)
  - Empty bucket (for empty bucket tests)
  - Move destination bucket (for cross-bucket move operations)
- Service account with JSON key
- Service account authenticated at the project level

### All Prerequisites were already fulfilled in the gcloud project, no need for actual actions

## Running Tests via GitHub Actions

This framework is designed to run tests remotely via GitHub Actions. Follow these steps to set up and execute tests.

### Step 1: Login with a GitHub account that is a collaborator on this repository

Credentials were sent via email along with the link to this repository.

### Step 2: Manually Trigger Workflow

1. Click **Actions** tab
2. Select **GCloud Storage Tests** workflow
3. Click **Run workflow** button (right side)
4. Select test suite to run:
   - `all` - Run all 22 tests
   - `ls` - Run list command tests only
   - `cp` - Run copy command tests only
   - `mv` - Run move command tests only
   - `sign-url` - Run signed URL tests only
5. Click **Run workflow**

### Step 3: View Test Results

#### Real-time Logs

1. Click on the running workflow
2. Click on the **test** job
3. Expand **Run tests in Docker** step to see live logs

#### Test Artifacts

After the workflow completes:

1. Scroll to the bottom of the workflow run page
2. Under **Artifacts**, download **playwright-report-{suite}-{run-number}**
3. Unzip the downloaded file
4. Open `index.html` in a browser to view the interactive test report

The Playwright HTML report includes:
- Test execution timeline
- Individual test results with status
- Detailed error messages and stack traces
- Test annotations and metadata
- Screenshot attachments (if any)

### Workflow Configuration

The GitHub Actions workflow (`.github/workflows/manual-docker-tests.yml`):

- **Trigger**: Manual workflow dispatch
- **Runner**: Ubuntu latest
- **Timeout**: 15 minutes
- **Docker Image**: Built from repository Dockerfile
- **Test Execution**: Runs in isolated Docker container
- **Artifacts**: Playwright HTML report (30-day retention)
- **Parallel Workers**: 2 (optimized for CI)

## Test Structure

### Test Organization

Tests are organized by command type with two categories:

1. **Happy Flow Tests**: Validate successful command execution
   - Proper command syntax
   - Valid file paths
   - Expected successful outputs
   - File existence verification

2. **Error State Tests**: Validate proper error handling
   - Invalid arguments
   - Non-existent files/buckets
   - Permission errors
   - Expected failure scenarios

### Test Data Structure

Each test case follows this structure:

```typescript
{
  testId: 'CP-001',                    // Unique test identifier
  description: 'Copy a local file to a bucket',
  commandArguments: {
    cmdPrefix: 'gcloud storage',
    cmdName: GcloudCommandType.CP,
    sourcePath: './local-file.json',
    destinationPath: 'gs://bucket/file.json',
    cmdFlags: ['--no-clobber']         // Optional flags
  },
  expectedSuccess: true,               // Expected outcome
  expectedOutput: 'Copying file'       // Expected output text (optional)
}
```

### Test Execution Flow

1. **Global Setup** (`global-setup.ts`)
   - Authenticates with GCloud using service account key
   - Creates the downloaded files directory
   - Uploads test files to cloud buckets

2. **Test Execution** (parallel with 2 workers)
   - Builds GCloud CLI command
   - Executes command via `execSync`
   - Validates output/errors
   - Verifies file operations
   - Performs additional validations (for sign-url tests)

3. **Global Teardown** (`global-teardown.ts`)
   - Cleans up cloud files
   - Removes downloaded local files
   - Restores moved files to original locations

## Test Data

### Test Data Files

Test data is defined in separate files for each command:

- `test-data/cp-test-data.ts` - Copy command test cases
- `test-data/ls-test-data.ts` - List command test cases
- `test-data/mv-test-data.ts` - Move command test cases
- `test-data/sign-url-test-data.ts` - Sign URL command test cases

### Local Test Files

Local files used in tests are stored in:

- `test-data/local-files/cp/` - Files for copy operations
- `test-data/local-files/mv/` - Files for move operations
- `test-data/local-files/sign-url/` - Files for signed URL operations
- `test-data/local-files/downloaded-files/` - Downloaded files (created during tests)

### Cloud Test Files

The framework automatically uploads required test files to your cloud bucket during global setup. Files are uploaded only if they don't already exist.

## Extending the Framework

### Adding a New Test Case

1. **Add test data** to the appropriate file (e.g., `cp-test-data.ts`):

```typescript
export const cpHappyFlowTestData: GcloudTestData[] = [
  // ... existing tests
  {
    testId: 'CP-009',
    description: 'Your new test description',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.CP,
      sourcePath: './source-file.json',
      destinationPath: 'gs://bucket/dest-file.json'
    },
    expectedSuccess: true
  }
];
```

2. **Create local test file** (if needed) in `test-data/local-files/{command}/`

3. **Run tests** via GitHub Actions to verify

### Adding a New Command

1. **Add command type** to `utils/commands/CommandType.ts`:

```typescript
export enum GcloudCommandType {
  LS = 'ls',
  CP = 'cp',
  MV = 'mv',
  SIGN_URL = 'sign-url',
  RM = 'rm'  // New command
}
```

2. **Create test data file**: `test-data/rm-test-data.ts`

3. **Create fixtures**: `tests/gcloudCliCommands/fixtures/rmFixtures.ts`

4. **Create test spec**: `tests/gcloudCliCommands/test-suites/rmTest.spec.ts`

5. **Add cleanup logic** to `global-teardown.ts` if needed

6. **Update package.json** with new test script:

```json
"test:rm": "playwright test tests/gcloudCliCommands/test-suites/rmTest.spec.ts"
```

## Troubleshooting

### All Tests Failing with Authentication Error

**Error**: `You do not currently have an active account selected`

**Solution**: 
- Verify `SERVICE_ACCOUNT_KEY` secret is correctly configured
- Ensure the JSON key is valid and not expired
- Check that the service account exists in your GCP project

### Tests Fail: "Insufficient permissions (storage.objects.delete required)"

**Error**: `HTTPError 403: ... does not have storage.objects.delete access`

**Solution**:
- Grant **Storage Admin** role at the **project level** (not bucket level)
- Wait 2-3 minutes for IAM changes to propagate
- Re-run the workflow

### Test LS-001 Fails: "List all accessible buckets"

**Error**: Test expects `true` but receives `false`

**Solution**:
- Ensure **Storage Admin** role is granted at **project level**
- Bucket-level permissions are insufficient for listing all buckets
- Verify with: `gcloud projects get-iam-policy YOUR-PROJECT-ID`

### Move (MV) Tests Fail

**Error**: `Command failed: gcloud storage mv ...`

**Solution**:
- Ensure source files exist in the bucket
- Check that **Storage Admin** role includes delete permissions
- Verify files weren't already moved by a previous test run

### Sign-URL Tests Fail: "IAM Service Account Credentials API disabled"

**Error**: `PERMISSION_DENIED: IAM Service Account Credentials API has not been used`

**Solution**:
1. Visit the URL provided in the error message
2. Enable **IAM Service Account Credentials API**
3. Wait 5 minutes for API enablement to propagate
4. Re-run tests

### Docker Build Fails

**Error**: `Error response from daemon: ...`

**Solution**:
- Check Dockerfile syntax
- Ensure all referenced files exist
- Verify base image `node:20-bullseye-slim` is accessible
- Check `.dockerignore` isn't excluding required files

### Workflow Timeout

**Error**: `The job running on runner ... has exceeded the maximum execution time of 15 minutes`

**Solution**:
- Check for network issues accessing GCP
- Verify service account authentication is working
- Increase timeout in `.github/workflows/manual-docker-tests.yml`:
  ```yaml
  timeout-minutes: 30
  ```

### Test Artifacts Not Generated

**Issue**: No Playwright report available after workflow completes

**Solution**:
- Check that tests actually ran (not just build step)
- Verify the `playwright-report` directory was created
- Check workflow logs for artifact upload errors
- Ensure workflow has `if: always()` on upload step

## Test Coverage

Current test coverage:

| Command | Happy Flow | Error States | Total |
|---------|-----------|--------------|-------|
| ls | 3 | 1 | 4 |
| cp | 3 | 3 | 6 |
| mv | 3 | 2 | 5 |
| sign-url | 3 | 4 | 7 |
| **Total** | **12** | **10** | **22** |

## Performance

- **Total Runtime**: ~55 seconds for all 22 tests
- **Workers**: 2 parallel workers in CI
- **Retries**: 2 retries on failure (CI only)
- **Timeout**: 10 seconds per test

## Support

For issues or questions:
- Open an issue in the GitHub repository
- Check existing issues for solutions
- Review the troubleshooting section above
