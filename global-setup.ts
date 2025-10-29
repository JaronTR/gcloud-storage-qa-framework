import { ensureDownloadedFilesDir } from './tests/gcloudCliCommands/fixtures/baseCliCmdFixture';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup() {
  console.log('\n🚀 Global Setup: Running once before all tests...');
  
  // Authenticate gcloud if running in Docker/CI
  if (process.env.DOCKER || process.env.CI) {
    console.log('🔐 Authenticating gcloud...');
    
    try {
      const serviceAccount = process.env.SERVICE_ACCOUNT;
      const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY;
      const projectId = process.env.PROJECT_ID;
      
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
  console.log('✅ Global Setup: Complete\n');
}

export default globalSetup;

