import { mvHappyFlowTests, mvErrorStateTests } from '../fixtures/mvFixtures';
import { mvHappyFlowTestData, mvErrorStateTestData } from '../../../test-data/mv-test-data';

mvHappyFlowTests.describe('MV Command Tests - Happy Flow', () => {
  for (const testCase of mvHappyFlowTestData) {
    mvHappyFlowTests(`${testCase.testId}: ${testCase.description}`, async ({ happyFlowTest }, testInfo) => {
      happyFlowTest(testCase, testInfo);
    });
  }
});

mvErrorStateTests.describe('MV Command Tests - Error States', () => {
  for (const testCase of mvErrorStateTestData) {
    mvErrorStateTests(`${testCase.testId}: ${testCase.description}`, async ({ errorStateTest }, testInfo) => {
      errorStateTest(testCase, testInfo);
    });
  }
});

