import { cpHappyFlowTests, cpErrorStateTests } from '../fixtures/cpFixtures';
import { cpHappyFlowTestData, cpErrorStateTestData } from '../../../test-data/cp-test-data';

cpHappyFlowTests.describe('CP Command Tests - Happy Flow', () => {
  for (const testCase of cpHappyFlowTestData) {
    cpHappyFlowTests(`${testCase.testId}: ${testCase.description}`, async ({ happyFlowTest }, testInfo) => {
      happyFlowTest(testCase, testInfo);
    });
  }
});

cpErrorStateTests.describe('CP Command Tests - Error States', () => {
  for (const testCase of cpErrorStateTestData) {
    cpErrorStateTests(`${testCase.testId}: ${testCase.description}`, async ({ errorStateTest }, testInfo) => {
      errorStateTest(testCase, testInfo);
    });
  }
});

