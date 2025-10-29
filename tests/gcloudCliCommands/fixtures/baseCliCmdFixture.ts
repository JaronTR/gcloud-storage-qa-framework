import { test as base, expect, TestInfo } from '@playwright/test';
import { GcloudCliCommands } from '../../../utils/cli-helpers/gcloudCliCommands';
import { GcloudTestData } from '../../../utils/cli-helpers/gcloudTestData';
import { BaseTestFixture } from '../../fixtures/BaseTestFixture';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const DOWNLOADED_FILES_DIR = './test-data/local-files/downloaded-files/';

export function ensureDownloadedFilesDir() {
  if (!fs.existsSync(DOWNLOADED_FILES_DIR)) {
    fs.mkdirSync(DOWNLOADED_FILES_DIR, { recursive: true });
  }
}

export function cleanupDownloadedFiles() {
  if (fs.existsSync(DOWNLOADED_FILES_DIR)) {
    const files = fs.readdirSync(DOWNLOADED_FILES_DIR);
    for (const file of files) {
      const filePath = path.join(DOWNLOADED_FILES_DIR, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        fs.unlinkSync(filePath);
      } else if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      }
    }
  }
}

export function verifyFileExists(destinationPath: string): boolean {
  if (destinationPath.startsWith('gs://')) {
    try {
      const output = execSync(`gcloud storage ls ${destinationPath}`, { stdio: 'pipe' }).toString();
      return output.includes(destinationPath);
    } catch (error) {
      return false;
    }
  } else {

    return fs.existsSync(destinationPath);
  }
}

export function cleanupCloudFiles(testDataArray: GcloudTestData[]) {
  for (const testData of testDataArray) {
    // Skip cleanup for tests that are expected to fail (they don't create files)
    if (testData.expectedSuccess === false) {
      continue;
    }

    if (testData.commandArguments.destinationPath?.startsWith('gs://')) {
      try {
        // Check if the destination file exists immediately before cleanup
        // This prevents race conditions when multiple workers clean up simultaneously
        const destinationExists = verifyFileExists(testData.commandArguments.destinationPath);
        
        if (!destinationExists) {
          // File doesn't exist at destination, nothing to clean up
          // This is expected for tests with --no-clobber, tests that failed, or already cleaned up by another worker
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
        // Handle errors gracefully - log permission errors but don't fail
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
        // Silently ignore "file not found" errors - they mean cleanup already happened
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

