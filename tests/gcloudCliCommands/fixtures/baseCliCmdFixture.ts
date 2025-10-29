import { test as base, expect, TestInfo } from '@playwright/test';
import { GcloudCliCommands } from '../../../utils/cli-helpers/gcloudCliCommands';
import { GcloudTestData } from '../../../utils/cli-helpers/gcloudTestData';
import { BaseTestFixture } from '../../BaseTestFixture';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const DOWNLOADED_FILES_DIR = './test-data/local-files/downloaded-files/';

export function ensureDownloadedFilesDir() {
  if (!fs.existsSync(DOWNLOADED_FILES_DIR)) {
    console.log(`📁 Creating downloaded files directory: ${DOWNLOADED_FILES_DIR}`);
    fs.mkdirSync(DOWNLOADED_FILES_DIR, { recursive: true });
    console.log(`✅ Downloaded files directory created`);
  } else {
    console.log(`✅ Downloaded files directory already exists: ${DOWNLOADED_FILES_DIR}`);
  }
}

export function cleanupDownloadedFiles() {
  console.log(`🧹 Cleaning up downloaded files from ${DOWNLOADED_FILES_DIR}`);
  
  if (fs.existsSync(DOWNLOADED_FILES_DIR)) {
    const files = fs.readdirSync(DOWNLOADED_FILES_DIR);
    
    if (files.length === 0) {
      console.log(`✅ No downloaded files to clean up`);
      return;
    }
    
    for (const file of files) {
      const filePath = path.join(DOWNLOADED_FILES_DIR, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        fs.unlinkSync(filePath);
        console.log(`   ✅ Removed file: ${file}`);
      } else if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
        console.log(`   ✅ Removed directory: ${file}`);
      }
    }
    
    console.log(`✅ Cleanup complete: ${files.length} item(s) removed`);
  } else {
    console.log(`✅ Downloaded files directory does not exist, nothing to clean up`);
  }
}

export function verifyFileExists(destinationPath: string): boolean {
  console.log(`🔍 Verifying file exists: ${destinationPath}`);
  
  if (destinationPath.startsWith('gs://')) {
    try {
      const output = execSync(`gcloud storage ls ${destinationPath}`, { stdio: 'pipe' }).toString();
      const exists = output.includes(destinationPath);
      if (exists) {
        console.log(`✅ Cloud file exists: ${destinationPath}`);
      } else {
        console.log(`❌ Cloud file not found: ${destinationPath}`);
      }
      return exists;
    } catch (error) {
      console.log(`❌ Cloud file verification failed: ${destinationPath}`);
      return false;
    }
  } else {
    const exists = fs.existsSync(destinationPath);
    if (exists) {
      console.log(`✅ Local file exists: ${destinationPath}`);
    } else {
      console.log(`❌ Local file not found: ${destinationPath}`);
    }
    return exists;
  }
}

export function cleanupCloudFiles(testDataArray: GcloudTestData[]) {
  for (const testData of testDataArray) {
    if (testData.expectedSuccess === false) {
      continue;
    }

    if (testData.commandArguments.destinationPath?.startsWith('gs://')) {
      try {
        const destinationExists = verifyFileExists(testData.commandArguments.destinationPath);
        
        if (!destinationExists) {
          continue;
        }

        if (testData.commandArguments.cmdName === 'mv') {
          if (testData.commandArguments.sourcePath?.startsWith('gs://')) {
            console.log(`🔄 Moving back: ${testData.commandArguments.destinationPath} → ${testData.commandArguments.sourcePath}`);
            execSync(`gcloud storage mv ${testData.commandArguments.destinationPath} ${testData.commandArguments.sourcePath}`, { stdio: 'pipe' });
            console.log(`✅ Successfully restored: ${testData.testId}`);
          }
        } else if (testData.commandArguments.cmdName === 'cp') {
          console.log(`🧹 Cleaning up: ${testData.commandArguments.destinationPath}`);
          execSync(`gcloud storage rm ${testData.commandArguments.destinationPath}`, { stdio: 'pipe' });
          console.log(`✅ Successfully cleaned up: ${testData.testId}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isFileNotFoundError = 
          errorMessage.includes('404') || 
          errorMessage.includes('not found') ||
          errorMessage.includes('matched no objects');
        const isPermissionError =
          errorMessage.includes('403') ||
          errorMessage.includes('storage.objects.delete');
        
        if (isPermissionError) {
          console.log(`⚠️  Skipping cleanup for ${testData.testId}: Insufficient permissions (storage.objects.delete required)`);
        } else if (!isFileNotFoundError) {
          console.log(`⚠️ Cleanup failed for ${testData.testId}: ${errorMessage}`);
        }
      }
    }
  }
}

export function createCommandFixtures(commandName: string) {
  type CommandTestFixtures = {
    happyFlowTest: (testData: GcloudTestData, testInfo: TestInfo) => void;
    errorStateTest: (testData: GcloudTestData, testInfo: TestInfo) => void;
  };

  const happyFlowTest = base.extend<CommandTestFixtures>({
    happyFlowTest: async ({}, use, testInfo) => {
      const baseFixture = new BaseTestFixture();
      
      await use((testData: GcloudTestData, testInfoParam: TestInfo) => {
        // Log test information using BaseTestFixture
        baseFixture.logTestInfo(testData.testId, testData.description, testInfoParam);
        baseFixture.addTestAnnotation(testInfoParam, 'test-id', testData.testId);
        baseFixture.addTestAnnotation(testInfoParam, 'command', testData.commandArguments.cmdName);
        
        // Execute the command
        baseFixture.logStep('Executing gcloud command', 'info');
        const cliCommand = new GcloudCliCommands();
        const result = cliCommand.executeGcloudCliCommand(testData.commandArguments);
        
        // Assert command execution success/failure
        expect(result.success).toBe(testData.expectedSuccess);     
        if (testData.expectedOutput) {
          expect(result.output).toContain(testData.expectedOutput);
        }
        
        // For successful cp/mv commands, verify the destination file exists
        if (result.success && testData.commandArguments.destinationPath && 
            (testData.commandArguments.cmdName === 'cp' || testData.commandArguments.cmdName === 'mv')) {
          baseFixture.logStep('Verifying file exists at destination', 'info');
          const fileExists = verifyFileExists(testData.commandArguments.destinationPath);
          expect(fileExists).toBe(true);
          
          if (fileExists) {
            baseFixture.logStep(`Verified: ${testData.commandArguments.destinationPath} exists`, 'success');
          } else {
            baseFixture.logStep(`Verification failed: ${testData.commandArguments.destinationPath} does not exist`, 'failure');
          }
        }
      });
    },
  });

  const errorStateTest = base.extend<CommandTestFixtures>({
    errorStateTest: async ({}, use, testInfo) => {
      const baseFixture = new BaseTestFixture();
      
      await use((testData: GcloudTestData, testInfoParam: TestInfo) => {
        // Log test information using BaseTestFixture
        baseFixture.logTestInfo(testData.testId, testData.description, testInfoParam);
        baseFixture.addTestAnnotation(testInfoParam, 'test-id', testData.testId);
        baseFixture.addTestAnnotation(testInfoParam, 'command', testData.commandArguments.cmdName);
        baseFixture.addTestAnnotation(testInfoParam, 'test-type', 'error-state');
        
        baseFixture.logStep('Executing gcloud command (expecting error)', 'info');
        const cliCommand = new GcloudCliCommands();
        const result = cliCommand.executeGcloudCliCommand(testData.commandArguments);
        
        expect(result.success).toBe(testData.expectedSuccess);
        
        if (testData.expectedOutput) {
          expect(result.error).toMatch(new RegExp(testData.expectedOutput, 'i'));
        }
      });
    },
  });

  return { happyFlowTest, errorStateTest };
}

