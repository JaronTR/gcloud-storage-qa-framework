# Stage 1: Base with system dependencies
FROM node:20-bullseye-slim as base

# Install gcloud SDK (latest)
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    ca-certificates \
    && echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list \
    && curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add - \
    && apt-get update && apt-get install -y google-cloud-cli \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Install dependencies (no browser needed for CLI tests)
FROM base as dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci --production=false

# Stage 3: Application
FROM dependencies as app

COPY . .

# Set environment for Docker
ENV DOCKER=true
ENV CI=true
ENV NO_COLOR=0

# Default command
CMD ["npm", "run", "test:all"]

