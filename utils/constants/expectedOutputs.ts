/**
 * Expected output patterns for GCloud Storage command tests
 * These patterns represent common success and error messages
 */

import { BucketPaths, FileNames } from './clousObjectPaths';

export class ExpectedOutputs {
  // ========================================
  // SUCCESS PATTERNS
  // ========================================
  
  /**
   * Empty output - used for successful operations with no stdout
   * Common in: Empty bucket listings, successful mv/cp with no verbose output
   */
  static readonly EMPTY_OUTPUT = '';
  
  /**
   * All accessible buckets listed (LS-001)
   * Returns formatted list of all buckets the user has access to
   * Note: Just check that the main bucket is in the output (format varies by platform)
   */
  static readonly ALL_BUCKETS_LISTED = `${BucketPaths.TESTING_HOMETASK_BUCKET}`;
  
  /**
   * Specific file found in bucket (LS-002)
   * Returns path to the specific file in the bucket
   */
  static readonly FILE_FOUND_IN_BUCKET = `${BucketPaths.TESTING_HOMETASK_BUCKET}/${FileNames.CLOUD_FILE_CP_002}`;
  
  /**
   * Signed URL successfully generated
   * All successful sign-url operations return a URL starting with this pattern
   */
  static readonly SIGNED_URL_GENERATED = 'https://storage.googleapis.com';
  
  // ========================================
  // ERROR PATTERNS - FILE/OBJECT NOT FOUND
  // ========================================
  
  /**
   * Source file or object does not exist
   * Used when attempting operations on non-existent files (CP-006, CP-007, MV-003)
   */
  static readonly SOURCE_NOT_FOUND = 'The following URLs matched no objects or files';
  
  /**
   * Object may not exist or no permission to access
   * Alternative error message for missing objects (MV-003, SU-004)
   */
  static readonly OBJECT_MAY_NOT_EXIST = 'or it may not exist|The following URLs matched no objects or files';
  
  /**
   * Sign-URL specific: No objects matched the URL pattern
   * Used when trying to generate signed URL for non-existent object (SU-004)
   */
  static readonly NO_URLS_MATCHED = 'No URLs matched|does not exist';
  
  // ========================================
  // ERROR PATTERNS - PERMISSION/ACCESS
  // ========================================
  
  /**
   * Bucket does not exist or permission denied
   * Used when accessing non-existent buckets (LS-003)
   */
  static readonly BUCKET_PERMISSION_ERROR = '(does not have permission|may not exist|ERROR)';
  
  /**
   * Storage permission denied or not found
   * Generic permission error for bucket operations (CP-008, MV-004)
   */
  static readonly STORAGE_PERMISSION_DENIED = 'not found|does not have storage.objects.get access|Permission.*denied';
  
  // ========================================
  // ERROR PATTERNS - VALIDATION
  // ========================================
  
  /**
   * Invalid duration format for sign-url
   * Raised when duration parameter doesn't follow expected format (SU-007)
   */
  static readonly INVALID_DURATION_FORMAT = 'Failed to parse duration|Duration unit.*must be preceded by a number';
}

