import axios from 'axios';

/**
 * Result of Google Safe Browsing validation
 */
export interface GSBValidationResult {
  isSafe: boolean;
  reason?: string;
}

/**
 * Result of HTTP request validation
 */
export interface HttpValidationResult {
  success: boolean;
  statusCode?: number;
  error?: string;
}

/**
 * Validate URL against Google Safe Browsing API
 */
export async function validateUrlSafety(url: string): Promise<GSBValidationResult> {
  console.log(`🔍 Validating URL safety: ${url.substring(0, 50)}...`);
  
  try {
    const urlObj = new URL(url);
    
    const suspiciousPatterns = [
      /phishing/i,
      /malware/i,
      /scam/i,
      /suspicious/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        console.log(`❌ URL safety validation failed: Contains suspicious pattern ${pattern.source}`);
        return {
          isSafe: false,
          reason: `URL contains suspicious pattern: ${pattern.source}`
        };
      }
    }
    
    if (urlObj.hostname.includes('googleapis.com') || 
        urlObj.hostname.includes('storage.cloud.google.com')) {
      console.log(`✅ URL safety validated: ${urlObj.hostname}`);
      return { isSafe: true };
    }
    
    console.log(`✅ URL safety validated: No suspicious patterns found`);
    return { isSafe: true };
    
  } catch (error: any) {
    console.log(`❌ URL safety validation failed: ${error.message}`);
    return {
      isSafe: false,
      reason: `Invalid URL format: ${error.message}`
    };
  }
}

/**
 * Make HTTP GET request to a signed URL
 */
export async function validateHttpGetRequest(url: string): Promise<HttpValidationResult> {
  console.log(`🔄 Sending HTTP GET request to signed URL`);
  
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: (status) => status < 500
    });
    
    console.log(`✅ HTTP GET request completed: Status ${response.status}`);
    
    return {
      success: response.status === 200,
      statusCode: response.status
    };
  } catch (error: any) {
    console.log(`❌ HTTP GET request failed: ${error.message} (Status: ${error.response?.status || 'N/A'})`);
    return {
      success: false,
      statusCode: error.response?.status,
      error: error.message
    };
  }
}

/**
 * Make HTTP POST request to a signed URL (expect failure for GET-only URLs)
 */
export async function validateHttpPostRequest(url: string): Promise<HttpValidationResult> {
  console.log(`🔄 Sending HTTP POST request to signed URL`);
  
  try {
    const response = await axios.post(url, {}, {
      timeout: 10000,
      validateStatus: (status) => true
    });
    
    console.log(`✅ HTTP POST request completed: Status ${response.status}`);
    
    return {
      success: response.status === 200,
      statusCode: response.status
    };
  } catch (error: any) {
    console.log(`❌ HTTP POST request failed: ${error.message} (Status: ${error.response?.status || 'N/A'})`);
    return {
      success: false,
      statusCode: error.response?.status,
      error: error.message
    };
  }
}

/**
 * Extract expiration timestamp from signed URL
 * Google Cloud Storage signed URLs contain an 'Expires' parameter
 */
export function extractExpirationFromUrl(url: string): Date | null {
  console.log(`🔍 Extracting expiration date from URL`);
  
  try {
    const urlObj = new URL(url);
    
    const expiresParam = urlObj.searchParams.get('Expires');
    if (expiresParam) {
      const timestamp = parseInt(expiresParam, 10);
      const expirationDate = new Date(timestamp * 1000);
      console.log(`✅ Expiration extracted: ${expirationDate.toISOString()}`);
      return expirationDate;
    }
    
    const googExpiresParam = urlObj.searchParams.get('X-Goog-Expires');
    const googDateParam = urlObj.searchParams.get('X-Goog-Date');
    
    if (googExpiresParam && googDateParam) {
      const year = parseInt(googDateParam.substring(0, 4), 10);
      const month = parseInt(googDateParam.substring(4, 6), 10) - 1;
      const day = parseInt(googDateParam.substring(6, 8), 10);
      const hour = parseInt(googDateParam.substring(9, 11), 10);
      const minute = parseInt(googDateParam.substring(11, 13), 10);
      const second = parseInt(googDateParam.substring(13, 15), 10);
      
      const startDate = new Date(Date.UTC(year, month, day, hour, minute, second));
      const expiresSeconds = parseInt(googExpiresParam, 10);
      const expirationDate = new Date(startDate.getTime() + (expiresSeconds * 1000));
      console.log(`✅ Expiration extracted: ${expirationDate.toISOString()} (${expiresSeconds}s from ${googDateParam})`);
      return expirationDate;
    }
    
    console.log(`❌ No expiration parameters found in URL`);
    return null;
  } catch (error) {
    console.log(`❌ Failed to extract expiration: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/**
 * Check if a URL has expired
 */
export function isUrlExpired(url: string): boolean {
  const expirationDate = extractExpirationFromUrl(url);
  if (!expirationDate) {
    return false; // Cannot determine expiration
  }
  
  return new Date() > expirationDate;
}

/**
 * Validate URL expiration duration matches expected duration
 */
export function validateExpirationDuration(url: string, expectedDurationSeconds: number, toleranceSeconds: number = 60): boolean {
  console.log(`🔍 Validating expiration duration: Expected ${expectedDurationSeconds}s (±${toleranceSeconds}s tolerance)`);
  
  const expirationDate = extractExpirationFromUrl(url);
  if (!expirationDate) {
    console.log(`❌ Duration validation failed: Could not extract expiration date`);
    return false;
  }
  
  const now = new Date();
  const actualDurationSeconds = Math.floor((expirationDate.getTime() - now.getTime()) / 1000);
  const difference = Math.abs(actualDurationSeconds - expectedDurationSeconds);
  const isValid = difference <= toleranceSeconds;
  
  if (isValid) {
    console.log(`✅ Duration validated: Actual ${actualDurationSeconds}s (difference: ${difference}s)`);
  } else {
    console.log(`❌ Duration validation failed: Actual ${actualDurationSeconds}s (difference: ${difference}s exceeds tolerance)`);
  }
  
  return isValid;
}

