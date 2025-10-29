import { ensureDownloadedFilesDir } from './tests/gcloudCliCommands/fixtures/baseCliCmdFixture';

async function globalSetup() {
  console.log('\n🚀 Global Setup: Running once before all tests...');
  ensureDownloadedFilesDir();
  console.log('✅ Global Setup: Complete\n');
}

export default globalSetup;

