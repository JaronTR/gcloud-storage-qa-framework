# Docker Setup and Usage Guide

This guide covers how to run the GCloud Storage QA Framework tests in Docker containers, both locally and in CI/CD environments.

## Prerequisites

- Docker installed (version 20.x or higher)
- Docker Compose installed (version 2.x or higher)
- GCloud Storage credentials and service account configuration

## Building the Docker Image

The Dockerfile uses a multi-stage build to optimize the image size and build time:

1. **Stage 1 (base)**: Installs system dependencies and the latest gcloud SDK
2. **Stage 2 (playwright)**: Installs Node.js dependencies and Playwright browsers
3. **Stage 3 (app)**: Copies application code and sets environment variables

### Build Command

```bash
npm run docker:build
```

Or directly with Docker:

```bash
docker build -t gcloud-tests .
```

## Running Tests in Docker

### Option 1: Using Docker Compose (Recommended)

Docker Compose simplifies running tests by managing environment variables and volumes.

1. Ensure your `.env` file is configured (or export environment variables)
2. Run tests:

```bash
npm run docker:run
```

Or use Docker Compose directly:

```bash
docker-compose up
```

To run tests and remove containers afterward:

```bash
docker-compose run --rm gcloud-tests npm run test:all
```

### Option 2: Using Docker Run

For more control, use `docker run` with explicit environment variables:

```bash
docker run \
  -e GCLOUD_BUCKET_MAIN="gs://your-bucket" \
  -e GCLOUD_BUCKET_EMPTY="gs://your-empty-bucket" \
  -e GCLOUD_BUCKET_MOVE_DEST="gs://your-move-destination-bucket" \
  -e SERVICE_ACCOUNT="your-service-account@project.iam.gserviceaccount.com" \
  -e PROJECT_ID="your-project-id" \
  -e TEST_GCLOUD_USERNAME="your-username" \
  -e TEST_GCLOUD_PASS="your-password" \
  -e GCLOUD_BUCKET_REGION="US" \
  -v $(pwd)/test-results:/app/test-results \
  -v $(pwd)/playwright-report:/app/playwright-report \
  gcloud-tests
```

## Environment Variables

The following environment variables must be set when running tests in Docker:

| Variable | Description | Example |
|----------|-------------|---------|
| `GCLOUD_BUCKET_MAIN` | Main test bucket | `gs://gcloud-testing-hometask-bucket` |
| `GCLOUD_BUCKET_EMPTY` | Empty bucket for testing | `gs://gcloud-testing-hometask-empty-bucket` |
| `GCLOUD_BUCKET_MOVE_DEST` | Destination bucket for move operations | `gs://gcloud-testing-hometask-move-destination-bucket` |
| `SERVICE_ACCOUNT` | Service account for signed URLs | `signed-url-generator@project.iam.gserviceaccount.com` |
| `PROJECT_ID` | GCloud project ID | `gcloud-testing-container` |
| `TEST_GCLOUD_USERNAME` | Test user email | `testuser@gmail.com` |
| `TEST_GCLOUD_PASS` | Test user password | `SecurePassword123` |
| `GCLOUD_BUCKET_REGION` | Bucket region | `US` |

## Running Specific Test Suites

You can run specific test suites by overriding the default command:

```bash
# Run only LS tests
docker-compose run gcloud-tests npm run test:ls

# Run only CP tests
docker-compose run gcloud-tests npm run test:cp

# Run only MV tests
docker-compose run gcloud-tests npm run test:mv

# Run only sign-url tests
docker-compose run gcloud-tests npm run test:sign-url
```

## Viewing Test Results

Test results and reports are saved to volumes that persist after container shutdown:

- **Test results**: `./test-results/`
- **Playwright HTML report**: `./playwright-report/`

To view the Playwright report:

```bash
npm run test:report
```

Or open `playwright-report/index.html` in your browser.

## CI/CD Integration (GitHub Actions)

The repository includes a GitHub Actions workflow (`.github/workflows/test.yml`) that:

1. Builds the Docker image on every push or pull request
2. Runs all tests using environment variables from GitHub Secrets
3. Uploads test results as artifacts

### Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

- `GCLOUD_BUCKET_MAIN`
- `GCLOUD_BUCKET_EMPTY`
- `GCLOUD_BUCKET_MOVE_DEST`
- `SERVICE_ACCOUNT`
- `PROJECT_ID`
- `TEST_GCLOUD_USERNAME`
- `TEST_GCLOUD_PASS`
- `GCLOUD_BUCKET_REGION`

### Viewing CI Test Results

After a workflow run completes:

1. Go to the Actions tab in your GitHub repository
2. Click on the workflow run
3. Download the `playwright-report` artifact
4. Extract and open `index.html`

## Troubleshooting

### gcloud SDK Authentication Issues

If you encounter authentication issues:

1. Ensure the `SERVICE_ACCOUNT` has the necessary permissions
2. For local development, you may need to mount your service account key:

```bash
docker run \
  -v /path/to/service-account-key.json:/app/service-account-key.json:ro \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/service-account-key.json \
  ... other env vars ...
  gcloud-tests
```

### Permission Denied Errors

If you see permission denied errors for volumes:

```bash
# On Linux/Mac, ensure proper permissions
chmod -R 777 test-results playwright-report
```

### Container Not Stopping

If the container doesn't stop gracefully:

```bash
docker-compose down --remove-orphans
```

### Outdated gcloud SDK

The Dockerfile always installs the latest gcloud SDK. To rebuild with the latest version:

```bash
docker build --no-cache -t gcloud-tests .
```

### Network Issues

If tests fail due to network issues:

1. Check your internet connection
2. Verify firewall settings allow Docker container network access
3. Try running with `--network=host` (Linux only):

```bash
docker run --network=host ... gcloud-tests
```

## Development Tips

### Interactive Shell Access

To access a shell inside the container for debugging:

```bash
docker-compose run --rm gcloud-tests /bin/bash
```

### Watching Logs

To follow test execution logs in real-time:

```bash
docker-compose logs -f gcloud-tests
```

### Cleaning Up

Remove all test containers and images:

```bash
docker-compose down
docker rmi gcloud-tests
```

Clean up test artifacts:

```bash
rm -rf test-results playwright-report
```

## Performance Optimization

### Build Cache

Docker caches build layers. To leverage this:

1. Keep `package.json` and `package-lock.json` changes minimal
2. Use `.dockerignore` to exclude unnecessary files

### Parallel Test Execution

To run tests in parallel (if your infrastructure supports it):

```bash
docker-compose run gcloud-tests npm run test:all -- --workers=4
```

## Security Best Practices

1. **Never commit `.env` files** - They're gitignored by default
2. **Use GitHub Secrets** for CI/CD, not hardcoded values
3. **Rotate credentials** regularly
4. **Limit service account permissions** to only what's needed for tests
5. **Review test logs** before sharing to ensure no secrets are leaked

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Playwright Docker Documentation](https://playwright.dev/docs/docker)
- [GCloud SDK Docker](https://cloud.google.com/sdk/docs/downloads-docker)

