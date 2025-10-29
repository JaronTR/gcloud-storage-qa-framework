import { ensureDownloadedFilesDir } from './tests/gcloudCliCommands/fixtures/baseCliCmdFixture';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup() {
  console.log('\n🚀 Global Setup: Running once before all tests...');
  console.log(`   Environment: DOCKER=${process.env.DOCKER}, CI=${process.env.CI}`);
  
  // Authenticate gcloud if running in Docker/CI
  if (process.env.DOCKER || process.env.CI) {
    console.log('🔐 Authenticating gcloud...');
    
    try {
      const serviceAccount = process.env.SERVICE_ACCOUNT;
      const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY;
      const projectId = process.env.PROJECT_ID;
      
      console.log(`   SERVICE_ACCOUNT: ${serviceAccount ? 'Set' : 'Not set'}`);
      console.log(`   SERVICE_ACCOUNT_KEY: ${serviceAccountKey ? 'Set (' + serviceAccountKey.length + ' chars)' : 'Not set'}`);
      console.log(`   PROJECT_ID: ${projectId || 'Not set'}`);
      
      if (serviceAccountKey) {
        // Method 1: Service Account Key (JSON)
        console.log('   Using Service Account Key authentication');
        
        const keyPath = path.join(process.cwd(), 'temp-sa-key.json');
        fs.writeFileSync(keyPath, serviceAccountKey);
        
        execSync(`gcloud auth activate-service-account --key-file="${keyPath}"`, {
          stdio: 'inherit'
        });
        
        // Clean up key file
        fs.unlinkSync(keyPath);
        
        if (projectId) {
          execSync(`gcloud config set project ${projectId}`, { stdio: 'pipe' });
          console.log(`   Set project: ${projectId}`);
        }
        
        console.log('✅ GCloud authentication successful (Service Account)');
      } else if (serviceAccount) {
        // Method 2: Impersonation (requires host to be authenticated)
        console.log(`   Using Service Account impersonation: ${serviceAccount}`);
        execSync(`gcloud config set auth/impersonate_service_account ${serviceAccount}`, {
          stdio: 'pipe'
        });
        
        if (projectId) {
          execSync(`gcloud config set project ${projectId}`, { stdio: 'pipe' });
          console.log(`   Set project: ${projectId}`);
        }
        
        console.log('✅ GCloud impersonation configured');
      } else {
        console.warn('⚠️  Warning: No authentication credentials provided');
        console.warn('   Set SERVICE_ACCOUNT_KEY (JSON) for service account auth');
      }
      
      // Verify authentication
      try {
        const authList = execSync('gcloud auth list --format="value(account)"', { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        console.log(`   Active account: ${authList.trim()}`);
      } catch (e) {
        console.warn('⚠️  Could not verify authentication');
      }
      
    } catch (error) {
      console.error('❌ GCloud authentication failed:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  ensureDownloadedFilesDir();
  
  // Upload test files to cloud buckets if in Docker/CI
  if (process.env.DOCKER || process.env.CI) {
    await uploadTestFilesToCloud();
  }
  
  console.log('✅ Global Setup: Complete\n');
}

async function uploadTestFilesToCloud() {
  console.log('📤 Uploading test files to cloud buckets...');
  
  try {
    const mainBucket = process.env.GCLOUD_BUCKET_MAIN;
    
    if (!mainBucket) {
      console.warn('⚠️  GCLOUD_BUCKET_MAIN not set, skipping test file upload');
      return;
    }
    
    // Define test files to upload
    const testFiles = [
      { local: './test-data/local-files/cp/local-file-cp-001.json', cloud: 'cloud-file-cp-002.json' },
      { local: './test-data/local-files/cp/local-file-cp-001.json', cloud: 'original-cloud-file-cp-003.json' },
      { local: './test-data/local-files/mv/original-cloud-file-mv-001.json', cloud: 'original-cloud-file-mv-001.json' },
      { local: './test-data/local-files/mv/original-cloud-file-mv-002.json', cloud: 'original-cloud-file-mv-002.json' },
      { local: './test-data/local-files/mv/original-cloud-file-mv-004.json', cloud: 'original-cloud-file-mv-004.json' },
      { local: './test-data/local-files/mv/original-cloud-file-mv-005.json', cloud: 'original-cloud-file-mv-005.json' },
      { local: './test-data/local-files/mv/original-cloud-file-mv-005.json', cloud: 'test-mv-directory/original-cloud-file-mv-005.json' }, // For MV-005 no-clobber test
      { local: './test-data/local-files/sign-url/cloud-file-su-001.json', cloud: 'cloud-file-su-001.json' },
      { local: './test-data/local-files/sign-url/cloud-file-su-002.json', cloud: 'cloud-file-su-002.json' },
      { local: './test-data/local-files/sign-url/cloud-file-su-003.json', cloud: 'cloud-file-su-003.json' },
      { local: './test-data/local-files/sign-url/cloud-file-su-005.json', cloud: 'cloud-file-su-005.json' },
      { local: './test-data/local-files/sign-url/cloud-file-su-006.json', cloud: 'cloud-file-su-006.json' },
      { local: './test-data/local-files/cp/local-file-cp-001.json', cloud: 'ls-002-test-file.json' },
    ];
    
    for (const file of testFiles) {
      const destination = `${mainBucket}/${file.cloud}`;
      
      // Check if file already exists
      try {
        execSync(`gcloud storage ls ${destination}`, { stdio: 'pipe' });
        console.log(`   ✓ ${file.cloud} already exists`);
        continue;
      } catch {
        // File doesn't exist, upload it
      }
      
      // Upload file
      try {
        execSync(`gcloud storage cp ${file.local} ${destination}`, { stdio: 'pipe' });
        console.log(`   ✓ Uploaded ${file.cloud}`);
      } catch (error) {
        console.warn(`   ⚠️  Failed to upload ${file.cloud}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    console.log('✅ Test files uploaded to cloud');
  } catch (error) {
    console.error('❌ Failed to upload test files:', error instanceof Error ? error.message : String(error));
    // Don't throw - tests can still run, they'll just fail if files are missing
  }
}

export default globalSetup;

