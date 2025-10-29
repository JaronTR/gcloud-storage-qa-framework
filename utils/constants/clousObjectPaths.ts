import { SecretsManager } from '../../config/SecretsManager';

const secrets = SecretsManager.getInstance();

export class BucketPaths {
  static readonly TESTING_HOMETASK_BUCKET = secrets.getBucket('MAIN');
  static readonly TESTING_HOMETASK_EMPTY_BUCKET = secrets.getBucket('EMPTY');
  static readonly TESTING_HOMETASK_MOVE_DESTINATION_BUCKET = secrets.getBucket('MOVE_DEST');
  static readonly NON_EXISTENT_BUCKET = 'gs://non-existent-bucket';
  static readonly RESTRICTED_BUCKET = 'gs://restricted-bucket';
}

export const SERVICE_ACCOUNT = secrets.getServiceAccount();
export enum CloudDirectoryNames {
    TEST_CP_DIR = 'test-cp-directory',
    TEST_MV_DIR = 'test-mv-directory',
    NON_EXISTENT_DIR = 'non-existent-directory',
}
export enum LocalPaths {
  // Base directories
  BASE_LOCAL_FILES_DIR = './test-data/local-files/',
  BASE_CP_FILES_DIR = './test-data/local-files/cp/',
  BASE_SIGN_URL_FILES_DIR = './test-data/local-files/sign-url/',
  BASE_MV_FILES_DIR = './test-data/local-files/mv/',
  DOWNLOADED_FILES_DIR = './test-data/local-files/downloaded-files/',
  
  // CP local files (using BASE_CP_FILES_DIR)
  LOCAL_FILE_CP_001 = `${BASE_CP_FILES_DIR}local-file-cp-001.json`,
  CLOUD_FILE_CP_002 = `${BASE_CP_FILES_DIR}cloud-file-cp-002.json`,
  ORIGINAL_CLOUD_FILE_CP_003 = `${BASE_CP_FILES_DIR}original-cloud-file-cp-003.json`,
  CLOUD_FILE_CP_004 = `${BASE_CP_FILES_DIR}cloud-file-cp-004.json`,
  LARGE_CLOUD_FILE_CP_005 = `${BASE_CP_FILES_DIR}large-cloud-file-cp-005.json`,
  LOCAL_FILE_CP_007 = `${BASE_CP_FILES_DIR}non-existent-local-cp-007.json`,
  
  // MV local files (using BASE_MV_FILES_DIR)
  ORIGINAL_CLOUD_FILE_MV_001_LOCAL = `${BASE_MV_FILES_DIR}original-cloud-file-mv-001.json`,
  ORIGINAL_CLOUD_FILE_MV_002_LOCAL = `${BASE_MV_FILES_DIR}original-cloud-file-mv-002.json`,
  ORIGINAL_CLOUD_FILE_MV_004_LOCAL = `${BASE_MV_FILES_DIR}original-cloud-file-mv-004.json`,
  ORIGINAL_CLOUD_FILE_MV_005_LOCAL = `${BASE_MV_FILES_DIR}original-cloud-file-mv-005.json`,
  
  // Sign URL local files (using BASE_SIGN_URL_FILES_DIR)
  CLOUD_FILE_SU_001_LOCAL = `${BASE_SIGN_URL_FILES_DIR}cloud-file-su-001.json`,
  CLOUD_FILE_SU_002_LOCAL = `${BASE_SIGN_URL_FILES_DIR}cloud-file-su-002.json`,
  CLOUD_FILE_SU_003_LOCAL = `${BASE_SIGN_URL_FILES_DIR}cloud-file-su-003.json`,
  CLOUD_FILE_SU_005_LOCAL = `${BASE_SIGN_URL_FILES_DIR}cloud-file-su-005.json`,
  CLOUD_FILE_SU_006_LOCAL = `${BASE_SIGN_URL_FILES_DIR}cloud-file-su-006.json`,
  
  // Other paths
  TEST_DATA_LOGS = `${BASE_LOCAL_FILES_DIR}*.log`
}

export enum FileNames {
  // LS files
  LS_002_TEST_FILE = 'ls-002-test-file.json',
  
  // CP files
  UPLOADED_FILE = 'uploaded-file.json',
  CLOUD_FILE_CP_002 = 'cloud-file-cp-002.json',
  ORIGINAL_CLOUD_FILE_CP_003 = 'original-cloud-file-cp-003.json',
  COPY_OF_ORIGINAL_CLOUD_FILE_CP_003 = 'copy-of-original-cloud-file-cp-003.json',
  CLOUD_FILE_CP_004 = 'cloud-file-cp-004.json',
  LARGE_CLOUD_FILE_CP_005 = 'large-cloud-file-cp-005.json',
  NON_EXISTENT_CLOUD_CP_008 = 'non-existent-cloud-cp-008.json',
  
  // MV files
  ORIGINAL_CLOUD_FILE_MV_001 = `original-cloud-file-mv-001.json`,
  ORIGINAL_CLOUD_FILE_MV_002 = `original-cloud-file-mv-002.json`,
  ORIGINAL_CLOUD_FILE_MV_004 = `original-cloud-file-mv-004.json`,
  ORIGINAL_CLOUD_FILE_MV_005 = `original-cloud-file-mv-005.json`,
  
  // Sign URL files
  CLOUD_FILE_SU_001 = 'cloud-file-su-001.json',
  CLOUD_FILE_SU_002 = 'cloud-file-su-002.json',
  CLOUD_FILE_SU_003 = 'cloud-file-su-003.json',
  NON_EXISTENT_FILE_SU_004 = 'non-existent-file-su-004.json',
  CLOUD_FILE_SU_005 = 'cloud-file-su-005.json',
  CLOUD_FILE_SU_006 = 'cloud-file-su-006.json',

  //General files
  NON_EXISTENT_FILE = 'i-dont-exist-file.json',
}

