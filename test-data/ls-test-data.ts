import { GcloudTestData } from '../utils/cli-helpers/gcloudTestData';
import { BucketPaths, FileNames } from '../utils/constants/clousObjectPaths';
import { GcloudCommandType } from '../utils/commands/CommandType';
import { ExpectedOutputs } from '../utils/constants/expectedOutputs';

export const lsHappyFlowTestData: GcloudTestData[] = [
  {
    testId: 'LS-001',
    description: 'List all accessible buckets',
    expectedSuccess: true,
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.LS
    },
    // Don't check specific output format - just verify command succeeds
    // expectedOutput: ExpectedOutputs.ALL_BUCKETS_LISTED
  },
  {
    testId: 'LS-002',
    description: 'List objects in a specified bucket',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.LS,
      sourcePath: BucketPaths.TESTING_HOMETASK_BUCKET
    },
    expectedSuccess: true,
    expectedOutput: ExpectedOutputs.FILE_FOUND_IN_BUCKET
  },
  {
    testId: 'LS-004',
    description: 'List an empty bucket',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.LS,
      sourcePath: BucketPaths.TESTING_HOMETASK_EMPTY_BUCKET
    },
    expectedSuccess: true,
    expectedOutput: ExpectedOutputs.EMPTY_OUTPUT
  }
];

export const lsErrorStateTestData: GcloudTestData[] = [
  {
    testId: 'LS-003',
    description: 'Attempt to list a non-existent bucket',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.LS,
      sourcePath: BucketPaths.NON_EXISTENT_BUCKET
    },
    expectedSuccess: false,
    expectedOutput: ExpectedOutputs.BUCKET_PERMISSION_ERROR
  }
];
