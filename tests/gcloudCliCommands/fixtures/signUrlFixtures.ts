import { test as base, expect, TestInfo } from '@playwright/test';
import { GcloudCliCommands } from '../../../utils/cli-helpers/gcloudCliCommands';
import { SignUrlTestData } from '../../../test-data/sign-url-test-data';
import { BaseTestFixture } from '../../BaseTestFixture';
import { SecretsManager } from '../../../config/SecretsManager';
import {
  validateUrlSafety,
  validateHttpGetRequest,
  validateHttpPostRequest,
  validateExpirationDuration
} from '../../../utils/cli-helpers/signUrlValidations';

type SignUrlTestFixtures = {
  happyFlowTest: (testData: SignUrlTestData, testInfo: TestInfo) => Promise<void>;
  errorStateTest: (testData: SignUrlTestData, testInfo: TestInfo) => Promise<void>;
};

function extractSignedUrl(output: string): string | null {
  const lines = output.split('\n');
  for (const line of lines) {
    if (line.includes('https://storage.googleapis.com')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('https://')) {
        return trimmed;
      }
    }
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const signUrlHappyFlowTests = base.extend<SignUrlTestFixtures>({
  happyFlowTest: async ({}, use, testInfo) => {
    const baseFixture = new BaseTestFixture();
    const secretsManager = SecretsManager.getInstance();
    
    await use(async (testData: SignUrlTestData, testInfoParam: TestInfo) => {
      baseFixture.logTestInfo(testData.testId, testData.description, testInfoParam);
      baseFixture.addTestAnnotation(testInfoParam, 'test-id', testData.testId);
      baseFixture.addTestAnnotation(testInfoParam, 'command', 'sign-url');
      
      baseFixture.logStep('Executing gcloud storage sign-url command', 'info');
      const cliCommand = new GcloudCliCommands();
      const result = cliCommand.executeGcloudCliCommand(testData.commandArguments);
      
      expect(result.success).toBe(testData.expectedSuccess);
      
      if (testData.expectedOutput) {
        if (result.success && result.output) {
          expect(result.output).toContain(testData.expectedOutput);
        } else if (!result.success && result.error) {
          expect(result.error).toMatch(new RegExp(testData.expectedOutput, 'i'));
        }
      }
      
      if (result.success && result.output) {
        const signedUrl = extractSignedUrl(result.output);
        
        if (signedUrl) {
          baseFixture.addTestAnnotation(testInfoParam, 'signed-url', signedUrl);
          console.log(`\n🔗 Generated signed URL for ${testData.testId}:`);
          console.log(signedUrl);
          
          baseFixture.logStep('Validating URL safety (Google Safe Browsing API)', 'info');
          
          let apiKey: string | undefined;
          try {
            apiKey = secretsManager.getSafeBrowsingApiKey();
          } catch (error) {
            console.log(`⚠️  Google Safe Browsing API key not configured, skipping security check`);
            baseFixture.logStep('GSB API key not configured, skipping', 'info');
          }
          
          const gsbResult = await validateUrlSafety(signedUrl, apiKey);
          
          if (!gsbResult.isSafe) {
            throw new Error(`⚠️ URL flagged as unsafe: ${gsbResult.reason}`);
          }
          
          if (gsbResult.reason && gsbResult.reason.includes('skipped')) {
            baseFixture.logStep(`URL safety check skipped: ${gsbResult.reason}`, 'info');
          } else {
            baseFixture.logStep('URL passed Google Safe Browsing validation', 'success');
          }
          
          if (testData.expectedDurationSeconds) {
            baseFixture.logStep(`Validating expiration duration (${testData.expectedDurationSeconds}s)`, 'info');
            const isValidDuration = validateExpirationDuration(
              signedUrl,
              testData.expectedDurationSeconds,
              120
            );
            expect(isValidDuration).toBe(true);
            baseFixture.logStep('Expiration duration validated', 'success');
          }
          
          if (testData.validateHttpGet) {
            baseFixture.logStep('Testing HTTP GET request', 'info');
            const httpResult = await validateHttpGetRequest(signedUrl);
            expect(httpResult.statusCode).toBe(testData.expectedHttpStatusCode || 200);
            baseFixture.logStep(`HTTP GET request returned status ${httpResult.statusCode}`, 'success');
          }
        }
      }
    });
  },
});

export const signUrlErrorStateTests = base.extend<SignUrlTestFixtures>({
  errorStateTest: async ({}, use, testInfo) => {
    const baseFixture = new BaseTestFixture();
    
    await use(async (testData: SignUrlTestData, testInfoParam: TestInfo) => {
      baseFixture.logTestInfo(testData.testId, testData.description, testInfoParam);
      baseFixture.addTestAnnotation(testInfoParam, 'test-id', testData.testId);
      baseFixture.addTestAnnotation(testInfoParam, 'command', 'sign-url');
      baseFixture.addTestAnnotation(testInfoParam, 'test-type', 'error-state');
      
      const cliCommand = new GcloudCliCommands();
      const result = cliCommand.executeGcloudCliCommand(testData.commandArguments);
      
      if (testData.validateHttpPost || testData.expectExpired) {
        expect(result.success).toBe(true);
        
        if (result.output) {
          const signedUrl = extractSignedUrl(result.output);
          
          if (signedUrl) {
            baseFixture.addTestAnnotation(testInfoParam, 'signed-url', signedUrl);
            console.log(`\n🔗 Generated signed URL for ${testData.testId}:`);
            console.log(signedUrl);
            
            if (testData.validateHttpPost) {
              baseFixture.logStep('Testing HTTP POST request (expect failure)', 'info');
              const httpResult = await validateHttpPostRequest(signedUrl);
              
              expect(httpResult.statusCode).toBe(testData.expectedHttpStatusCode || 403);
              baseFixture.logStep(`HTTP POST correctly rejected with status ${httpResult.statusCode}`, 'success');
            }
            
            if (testData.expectExpired) {
              baseFixture.logStep('Waiting for URL to expire (3 seconds)', 'info');
              await sleep(3000);
              
              baseFixture.logStep('Testing HTTP GET request on expired URL', 'info');
              const httpResult = await validateHttpGetRequest(signedUrl);
              
              expect(httpResult.statusCode).toBeGreaterThanOrEqual(400);
              baseFixture.logStep(`Expired URL correctly rejected with status ${httpResult.statusCode}`, 'success');
            }
          }
        }
      } else {
        expect(result.success).toBe(testData.expectedSuccess);
        
        if (testData.expectedOutput) {
          expect(result.error).toMatch(new RegExp(testData.expectedOutput, 'i'));
        }
      }
    });
  },
});
