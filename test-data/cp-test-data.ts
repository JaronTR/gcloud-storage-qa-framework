/**
 * Test data for CP command tests
 */

import { GcloudTestData } from '../utils/cli-helpers/gcloudTestData';
import { BucketPaths, LocalPaths, FileNames } from '../utils/constants/clousObjectPaths';
import { GcloudCommandType } from '../utils/commands/CommandType';
import { ExpectedOutputs } from '../utils/constants/expectedOutputs';

export const cpHappyFlowTestData: GcloudTestData[] = [
  {
    testId: 'CP-001',
    description: 'Copy a local file to a bucket',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.CP,
      sourcePath: LocalPaths.LOCAL_FILE_CP_001,
      destinationPath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.UPLOADED_FILE}`
    },
    expectedSuccess: true
  },
  {
    testId: 'CP-002',
    description: 'Download an object from a bucket to local',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.CP,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.CLOUD_FILE_CP_002}`,
      destinationPath: LocalPaths.DOWNLOADED_FILES_DIR
    },
    expectedSuccess: true
  },
  {
    testId: 'CP-003',
    description: 'Copy an object to a different directory within the same bucket',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.CP,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.ORIGINAL_CLOUD_FILE_CP_003}`,
      destinationPath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/test-cp-directory/${FileNames.COPY_OF_ORIGINAL_CLOUD_FILE_CP_003}`
    },
    expectedSuccess: true
  }
];

export const cpErrorStateTestData: GcloudTestData[] = [
  {
    testId: 'CP-006',
    description: 'Attempt to copy a non-existent local file to cloud',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.CP,
      sourcePath: LocalPaths.LOCAL_FILE_CP_007,
      destinationPath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/target-file.json`
    },
    expectedSuccess: false,
    expectedOutput: ExpectedOutputs.SOURCE_NOT_FOUND
  },
  {
    testId: 'CP-007',
    description: 'Attempt to copy a non-existent cloud object to local',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.CP,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.NON_EXISTENT_CLOUD_CP_008}`,
      destinationPath: `${LocalPaths.DOWNLOADED_FILES_DIR}${FileNames.NON_EXISTENT_CLOUD_CP_008}`
    },
    expectedSuccess: false,
    expectedOutput: ExpectedOutputs.SOURCE_NOT_FOUND
  },
  {
    testId: 'CP-008',
    description: 'Attempt to copy to a non-existent destination bucket',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.CP,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.CLOUD_FILE_CP_002}`,
      destinationPath: `${BucketPaths.NON_EXISTENT_BUCKET}/${FileNames.CLOUD_FILE_CP_002}`
    },
    expectedSuccess: false,
    expectedOutput: ExpectedOutputs.STORAGE_PERMISSION_DENIED
  }
];
