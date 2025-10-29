import { cleanupDownloadedFiles, cleanupCloudFiles } from './tests/gcloudCliCommands/fixtures/baseCliCmdFixture';
import { cpHappyFlowTestData, cpErrorStateTestData } from './test-data/cp-test-data';
import { lsHappyFlowTestData, lsErrorStateTestData } from './test-data/ls-test-data';
import { mvHappyFlowTestData, mvErrorStateTestData } from './test-data/mv-test-data';

async function globalTeardown() {
  console.log('\n🧹 Global Teardown: Running once after all tests...');
  
  const allTestData = [
    ...cpHappyFlowTestData,
    ...cpErrorStateTestData,
    ...lsHappyFlowTestData,
    ...lsErrorStateTestData,
    ...mvHappyFlowTestData,
    ...mvErrorStateTestData
  ];
  
  cleanupCloudFiles(allTestData);
  cleanupDownloadedFiles();
  
  console.log('✅ Global Teardown: Complete\n');
}

export default globalTeardown;

