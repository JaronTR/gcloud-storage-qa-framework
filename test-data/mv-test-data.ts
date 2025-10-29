/**
 * Test data for MV command tests
 */

import { GcloudTestData } from '../utils/cli-helpers/gcloudTestData';
import { BucketPaths, CloudDirectoryNames, FileNames } from '../utils/constants/clousObjectPaths';
import { GcloudCommandType } from '../utils/commands/CommandType';
import { ExpectedOutputs } from '../utils/constants/expectedOutputs';

export const mvHappyFlowTestData: GcloudTestData[] = [
  {
    testId: 'MV-001',
    description: 'Move an object within the same bucket',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.MV,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.ORIGINAL_CLOUD_FILE_MV_001}`,
      destinationPath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${CloudDirectoryNames.TEST_MV_DIR}/${FileNames.ORIGINAL_CLOUD_FILE_MV_001}`
    },
    expectedSuccess: true
  },
  {
    testId: 'MV-002',
    description: 'Move an object between different buckets',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.MV,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.ORIGINAL_CLOUD_FILE_MV_002}`,
      destinationPath: `${BucketPaths.TESTING_HOMETASK_MOVE_DESTINATION_BUCKET}/${FileNames.ORIGINAL_CLOUD_FILE_MV_002}`
    },
    expectedSuccess: true
  },
  {
    testId: 'MV-005',
    description: 'Move file with a name that already exists in the destination path without overwriting the existing file',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.MV,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.ORIGINAL_CLOUD_FILE_MV_005}`,
      destinationPath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${CloudDirectoryNames.TEST_MV_DIR}/${FileNames.ORIGINAL_CLOUD_FILE_MV_005}`,
      cmdFlags: ['--no-clobber']
    },
    expectedSuccess: true
  }
];

export const mvErrorStateTestData: GcloudTestData[] = [
  {
    testId: 'MV-003',
    description: 'Attempt to move a non-existent source object',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.MV,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.NON_EXISTENT_FILE}`,
      destinationPath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${CloudDirectoryNames.TEST_MV_DIR}/${FileNames.NON_EXISTENT_FILE}`
    },
    expectedSuccess: false,
    expectedOutput: ExpectedOutputs.OBJECT_MAY_NOT_EXIST
  },
  {
    testId: 'MV-004',
    description: 'Attempt to move to a non-existent destination bucket',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.MV,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.ORIGINAL_CLOUD_FILE_MV_004}`,
      destinationPath: `${BucketPaths.NON_EXISTENT_BUCKET}/${FileNames.ORIGINAL_CLOUD_FILE_MV_004}`
    },
    expectedSuccess: false,
    expectedOutput: ExpectedOutputs.STORAGE_PERMISSION_DENIED
  }
];
