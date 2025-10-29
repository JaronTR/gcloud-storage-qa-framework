import * as dotenv from 'dotenv';

export class SecretsManager {
  private static instance: SecretsManager;
  
  private constructor() {
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
      console.log(`❌ Failed to retrieve ${envVar}: Not set`);
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
    
    console.log(`✅ Retrieved ${envVar}: ${value}`);
    return value;
  }
  
  getServiceAccount(): string {
    const value = process.env.SERVICE_ACCOUNT;
    if (!value) {
      console.log(`❌ Failed to retrieve SERVICE_ACCOUNT: Not set`);
      throw new Error('Missing required environment variable: SERVICE_ACCOUNT');
    }
    console.log(`✅ Retrieved SERVICE_ACCOUNT: ${value}`);
    return value;
  }
  
  getProjectId(): string {
    const value = process.env.PROJECT_ID;
    if (!value) {
      console.log(`❌ Failed to retrieve PROJECT_ID: Not set`);
      throw new Error('Missing required environment variable: PROJECT_ID');
    }
    console.log(`✅ Retrieved PROJECT_ID: ${value}`);
    return value;
  }
  
  getRegion(): string {
    const value = process.env.GCLOUD_BUCKET_REGION;
    if (!value) {
      console.log(`❌ Failed to retrieve GCLOUD_BUCKET_REGION: Not set`);
      throw new Error('Missing required environment variable: GCLOUD_BUCKET_REGION');
    }
    console.log(`✅ Retrieved GCLOUD_BUCKET_REGION: ${value}`);
    return value;
  }
  
  getUsername(): string {
    const value = process.env.TEST_GCLOUD_USERNAME;
    if (!value) {
      console.log(`❌ Failed to retrieve TEST_GCLOUD_USERNAME: Not set`);
      throw new Error('Missing required environment variable: TEST_GCLOUD_USERNAME');
    }
    console.log(`✅ Retrieved TEST_GCLOUD_USERNAME: ${value}`);
    return value;
  }
  
  getPassword(): string {
    const value = process.env.TEST_GCLOUD_PASS;
    if (!value) {
      console.log(`❌ Failed to retrieve TEST_GCLOUD_PASS: Not set`);
      throw new Error('Missing required environment variable: TEST_GCLOUD_PASS');
    }
    console.log(`✅ Retrieved TEST_GCLOUD_PASS: [REDACTED]`);
    return value;
  }
}

