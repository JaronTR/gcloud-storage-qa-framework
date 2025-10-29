import * as dotenv from 'dotenv';

export class SecretsManager {
  private static instance: SecretsManager;
  
  private constructor() {
    // Load .env only if not in Docker (check NODE_ENV or custom flag)
    if (process.env.CI !== 'true' && process.env.DOCKER !== 'true') {
      dotenv.config();
    }
  }
  
  static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }
  
  getBucket(key: 'MAIN' | 'EMPTY' | 'MOVE_DEST'): string {
    const envVarMap = {
      'MAIN': 'GCLOUD_BUCKET_MAIN',
      'EMPTY': 'GCLOUD_BUCKET_EMPTY',
      'MOVE_DEST': 'GCLOUD_BUCKET_MOVE_DEST'
    };
    
    const envVar = envVarMap[key];
    const value = process.env[envVar];
    
    if (!value) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
    
    return value;
  }
  
  getServiceAccount(): string {
    const value = process.env.SERVICE_ACCOUNT;
    if (!value) {
      throw new Error('Missing required environment variable: SERVICE_ACCOUNT');
    }
    return value;
  }
  
  getProjectId(): string {
    const value = process.env.PROJECT_ID;
    if (!value) {
      throw new Error('Missing required environment variable: PROJECT_ID');
    }
    return value;
  }
  
  getRegion(): string {
    const value = process.env.GCLOUD_BUCKET_REGION;
    if (!value) {
      throw new Error('Missing required environment variable: GCLOUD_BUCKET_REGION');
    }
    return value;
  }
  
  getUsername(): string {
    const value = process.env.TEST_GCLOUD_USERNAME;
    if (!value) {
      throw new Error('Missing required environment variable: TEST_GCLOUD_USERNAME');
    }
    return value;
  }
  
  getPassword(): string {
    const value = process.env.TEST_GCLOUD_PASS;
    if (!value) {
      throw new Error('Missing required environment variable: TEST_GCLOUD_PASS');
    }
    return value;
  }
}

