/**
 * Test data for Sign URL command tests
 */

import { GcloudTestData } from '../utils/cli-helpers/gcloudTestData';
import { BucketPaths, FileNames, SERVICE_ACCOUNT } from '../utils/constants/clousObjectPaths';
import { GcloudCommandType } from '../utils/commands/CommandType';
import { ExpectedOutputs } from '../utils/constants/expectedOutputs';

export interface SignUrlTestData extends GcloudTestData {
  validateHttpGet?: boolean;
  validateHttpPost?: boolean;
  expectedHttpStatusCode?: number;
  expectedDurationSeconds?: number;
  expectExpired?: boolean;
}

export const signUrlHappyFlowTestData: SignUrlTestData[] = [
  {
    testId: 'SU-001',
    description: 'Generate a signed URL for an existing object with default expiration',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.SIGN_URL,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.CLOUD_FILE_SU_001}`,
      cmdFlags: [`--impersonate-service-account=${SERVICE_ACCOUNT}`, '--region=US']
    },
    expectedSuccess: true,
    expectedOutput: ExpectedOutputs.SIGNED_URL_GENERATED
  },
  {
    testId: 'SU-002',
    description: 'Generate a signed URL with custom expiration (5 minutes)',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.SIGN_URL,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.CLOUD_FILE_SU_002}`,
      cmdFlags: ['--duration=5m', `--impersonate-service-account=${SERVICE_ACCOUNT}`, '--region=US']
    },
    expectedSuccess: true,
    expectedOutput: ExpectedOutputs.SIGNED_URL_GENERATED,
    expectedDurationSeconds: 300 // 5 minutes = 300 seconds
  },
  {
    testId: 'SU-003',
    description: 'Generate a signed URL for GET HTTP method and verify access with GET request',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.SIGN_URL,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.CLOUD_FILE_SU_003}`,
      cmdFlags: ['--duration=1h', '--http-verb=GET', `--impersonate-service-account=${SERVICE_ACCOUNT}`, '--region=US']
    },
    expectedSuccess: true,
    expectedOutput: ExpectedOutputs.SIGNED_URL_GENERATED,
    validateHttpGet: true,
    expectedHttpStatusCode: 200
  },

];

export const signUrlErrorStateTestData: SignUrlTestData[] = [
  {
    testId: 'SU-004',
    description: 'Attempt to generate a signed URL for a non-existent object',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.SIGN_URL,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.NON_EXISTENT_FILE_SU_004}`,
      cmdFlags: [`--impersonate-service-account=${SERVICE_ACCOUNT}`, '--region=US']
    },
    expectedSuccess: false,
    expectedOutput: ExpectedOutputs.NO_URLS_MATCHED
  },
  {
    testId: 'SU-005',
    description: 'Use wrong HTTP method (POST) on a GET-only signed URL',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.SIGN_URL,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.CLOUD_FILE_SU_005}`,
      cmdFlags: ['--http-verb=GET', `--impersonate-service-account=${SERVICE_ACCOUNT}`, '--region=US']
    },
    expectedSuccess: true, // URL generation succeeds
    expectedOutput: ExpectedOutputs.SIGNED_URL_GENERATED,
    validateHttpPost: true, // But POST request should fail
    expectedHttpStatusCode: 403
  },
  {
    testId: 'SU-006',
    description: 'Access a signed URL after it has expired',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.SIGN_URL,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.CLOUD_FILE_SU_006}`,
      cmdFlags: ['--duration=2s', `--impersonate-service-account=${SERVICE_ACCOUNT}`, '--region=US']
    },
    expectedSuccess: true, // URL generation succeeds
    expectedOutput: ExpectedOutputs.SIGNED_URL_GENERATED,
    expectExpired: true, // Wait for expiration then test
    expectedHttpStatusCode: 403
  },
  {
    testId: 'SU-007',
    description: 'Attempt to generate a signed URL with an invalid duration format',
    commandArguments: {
      cmdPrefix: 'gcloud storage',
      cmdName: GcloudCommandType.SIGN_URL,
      sourcePath: `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.CLOUD_FILE_SU_006}`,
      cmdFlags: ['--duration=invalid-time-format', `--impersonate-service-account=${SERVICE_ACCOUNT}`, '--region=US']
    },
    expectedSuccess: false,
    expectedOutput: ExpectedOutputs.INVALID_DURATION_FORMAT
  }
];
