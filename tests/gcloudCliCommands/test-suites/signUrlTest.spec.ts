import { signUrlHappyFlowTests, signUrlErrorStateTests } from '../fixtures/signUrlFixtures';
import { signUrlHappyFlowTestData, signUrlErrorStateTestData } from '../../../test-data/sign-url-test-data';

signUrlHappyFlowTests.describe('Sign URL Command Tests - Happy Flow', () => {
  for (const testCase of signUrlHappyFlowTestData) {
    signUrlHappyFlowTests(`${testCase.testId}: ${testCase.description}`, async ({ happyFlowTest }, testInfo) => {
      await happyFlowTest(testCase, testInfo);
    });
  }
});

signUrlErrorStateTests.describe('Sign URL Command Tests - Error States', () => {
  for (const testCase of signUrlErrorStateTestData) {
    signUrlErrorStateTests(`${testCase.testId}: ${testCase.description}`, async ({ errorStateTest }, testInfo) => {
      await errorStateTest(testCase, testInfo);
    });
  }
});

