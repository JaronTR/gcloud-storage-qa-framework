import { test as base, TestInfo } from '@playwright/test';

/**
 * BaseTestFixture provides pure test fixture functionality without CLI dependencies.
 * This class follows Playwright best practices for fixture composition and test metadata management.
 */
export class BaseTestFixture {
  /**
   * Logs test information including test ID and description
   * @param testId The unique identifier for the test
   * @param description A description of what the test does
   * @param testInfo Playwright's TestInfo object
   */
  logTestInfo(testId: string, description: string, testInfo: TestInfo): void {
    console.log(`\n📋 Test: ${testId}`);
    console.log(`📝 Description: ${description}`);
    console.log(`🏷️  Title: ${testInfo.title}`);
  }

  /**
   * Adds a custom annotation to the test for reporting purposes
   * @param testInfo Playwright's TestInfo object
   * @param type The type of annotation (e.g., 'test-id', 'category', 'signed-url')
   * @param description The annotation value/description
   */
  addTestAnnotation(testInfo: TestInfo, type: string, description: string): void {
    testInfo.annotations.push({ type, description });
  }

  /**
   * Attaches test data to the test report
   * @param testInfo Playwright's TestInfo object
   * @param name The name of the attachment
   * @param data The data to attach (will be stringified if object)
   */
  async attachTestData(testInfo: TestInfo, name: string, data: any): Promise<void> {
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    await testInfo.attach(name, {
      body: content,
      contentType: 'text/plain'
    });
  }

  /**
   * Logs a step in the test execution
   * @param step The step description
   * @param status Optional status (success, failure, info)
   */
  logStep(step: string, status: 'success' | 'failure' | 'info' = 'info'): void {
    const icons = {
      success: '✅',
      failure: '❌',
      info: 'ℹ️'
    };
    console.log(`${icons[status]} ${step}`);
  }

  /**
   * Creates a section separator in logs for better readability
   * @param title The section title
   */
  logSection(title: string): void {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  ${title}`);
    console.log('='.repeat(60));
  }
}

/**
 * Base test fixture type that can be extended by other fixtures
 */
export type BaseTestFixtures = {
  baseFixture: BaseTestFixture;
};

/**
 * Export the base test with BaseTestFixture
 */
export const baseTest = base.extend<BaseTestFixtures>({
  baseFixture: async ({}, use) => {
    const fixture = new BaseTestFixture();
    await use(fixture);
  }
});

