import { lsHappyFlowTests, lsErrorStateTests } from '../fixtures/lsFixtures';
import { lsErrorStateTestData, lsHappyFlowTestData } from '../../../test-data/ls-test-data';

lsHappyFlowTests.describe('LS Command Tests - Happy Flow', () => {
  for (const testCase of lsHappyFlowTestData) {
    lsHappyFlowTests(`${testCase.testId}: ${testCase.description}`, async ({ happyFlowTest }, testInfo) => {
      happyFlowTest(testCase, testInfo);
    });
  }
});

lsErrorStateTests.describe('LS Command Tests - Error States', () => {
  for (const testCase of lsErrorStateTestData) {
    lsErrorStateTests(`${testCase.testId}: ${testCase.description}`, async ({ errorStateTest }, testInfo) => {
      errorStateTest(testCase, testInfo);
    });
  }
});