# Running Tests in Docker - Quick Start Guide

## Prerequisites

1. **Start Docker Desktop**
   - Open Docker Desktop application
   - Wait for it to fully start (status shows "Docker Desktop is running")
   - Verify by running: `docker --version`

2. **Ensure you have credentials** (service account key or authenticated gcloud)

## Step-by-Step Instructions

### 1. Build the Docker Image

```bash
npm run docker:build
```

Or directly:
```bash
docker build -t gcloud-tests .
```

**Build optimizations applied:**
- ✅ No browser installation (saves ~500MB and build time)
- ✅ Uses slim base image
- ✅ Optimized layer caching
- ✅ Removed unnecessary dependencies

### 2. Run All Tests

```bash
npm run docker:run
```

Or with Docker Compose:
```bash
docker-compose up
```

Or run and cleanup automatically:
```bash
docker-compose run --rm gcloud-tests
```

### 3. Run Specific Test Suites

```bash
# CP tests only
docker-compose run --rm gcloud-tests npm run test:cp

# LS tests only
docker-compose run --rm gcloud-tests npm run test:ls

# MV tests only
docker-compose run --rm gcloud-tests npm run test:mv

# Sign URL tests only
docker-compose run --rm gcloud-tests npm run test:sign-url
```

### 4. View Test Reports

After tests complete, reports are saved to your local machine:

```bash
# Open HTML report
npm run test:report
```

Or manually open: `playwright-report/index.html`

## Environment Variables Required

Create a `.env` file in the project root (it's gitignored):

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

Or export them in your shell:

```bash
export GCLOUD_BUCKET_MAIN="gs://gcloud-testing-hometask-bucket"
export GCLOUD_BUCKET_EMPTY="gs://gcloud-testing-hometask-empty-bucket"
# ... etc
```

## Authentication Setup

### Option 1: Service Account Key (Recommended for Docker)

1. Place your `service-account-key.json` in the project root
2. Docker Compose will mount it automatically
3. Tests will use it for authentication

### Option 2: Use Host's gcloud Auth

If you're already authenticated with gcloud on your host:

```bash
docker run \
  -v ~/.config/gcloud:/root/.config/gcloud:ro \
  -v $(pwd)/test-results:/app/test-results \
  -v $(pwd)/playwright-report:/app/playwright-report \
  gcloud-tests
```

## Performance Notes

**Optimizations Applied:**
- No browser launch overhead (tests run at CLI speed)
- Parallel execution with 2 workers in CI (Docker)
- Global setup/teardown runs once per suite
- Reduced timeout from 60s to 10s per test

**Expected Performance:**
- CP tests: 1.5-6s per test
- LS tests: 1.3-1.8s per test
- MV tests: 2.7-9.4s per test
- Sign URL tests: 1.1-1.9s per test
- **Total suite: ~50-60 seconds**

## Troubleshooting

### Docker Desktop Not Running
```bash
# Check if Docker is running
docker --version
docker ps

# If error, start Docker Desktop app and wait for it to fully start
```

### Permission Issues (Linux/Mac)
```bash
# Fix volume permissions
chmod -R 777 test-results playwright-report
```

### Authentication Errors
```bash
# Verify service account key exists
ls -la service-account-key.json

# Check gcloud auth
gcloud auth list
```

### Container Won't Stop
```bash
docker-compose down --remove-orphans
```

### Clean Rebuild (if issues persist)
```bash
# Remove old image and rebuild
docker rmi gcloud-tests
docker build --no-cache -t gcloud-tests .
```

## Interactive Debugging

Access container shell for debugging:

```bash
docker-compose run --rm gcloud-tests /bin/bash

# Inside container, you can:
# - Check gcloud auth: gcloud auth list
# - List buckets: gcloud storage ls
# - Run individual tests: npm run test:ls
# - Check Node version: node --version
```

## Cleanup

```bash
# Remove containers and images
docker-compose down
docker rmi gcloud-tests

# Clean test artifacts
rm -rf test-results playwright-report
```

## CI/CD Integration

This Docker setup works seamlessly with:
- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI
- Any CI platform with Docker support

Example GitHub Actions workflow is in `.github/workflows/test.yml`

