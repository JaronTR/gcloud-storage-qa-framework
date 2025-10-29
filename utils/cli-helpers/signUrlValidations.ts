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
 * Uses a simplified approach without requiring API key
 * In production, you'd use the full GSB API with proper authentication
 */
export async function validateUrlSafety(url: string): Promise<GSBValidationResult> {
  try {
    // For basic validation, we'll use a heuristic approach
    // In a real implementation, you'd call the actual GSB API
    // For now, we'll check if the URL is reachable and not obviously malicious
    
    // Basic URL validation
    const urlObj = new URL(url);
    
    // Check for suspicious patterns (basic heuristics)
    const suspiciousPatterns = [
      /phishing/i,
      /malware/i,
      /scam/i,
      /suspicious/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        return {
          isSafe: false,
          reason: `URL contains suspicious pattern: ${pattern.source}`
        };
      }
    }
    
    // For Google Cloud Storage signed URLs, they're generally safe
    // They come from storage.googleapis.com domain
    if (urlObj.hostname.includes('googleapis.com') || 
        urlObj.hostname.includes('storage.cloud.google.com')) {
      return { isSafe: true };
    }
    
    // Default to safe for valid URLs
    return { isSafe: true };
    
  } catch (error: any) {
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
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: (status) => status < 500 // Accept any status < 500
    });
    
    return {
      success: response.status === 200,
      statusCode: response.status
    };
  } catch (error: any) {
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
  try {
    const response = await axios.post(url, {}, {
      timeout: 10000,
      validateStatus: (status) => true // Accept any status
    });
    
    return {
      success: response.status === 200,
      statusCode: response.status
    };
  } catch (error: any) {
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
  try {
    const urlObj = new URL(url);
    
    // Check for 'Expires' parameter (Unix timestamp)
    const expiresParam = urlObj.searchParams.get('Expires');
    if (expiresParam) {
      const timestamp = parseInt(expiresParam, 10);
      return new Date(timestamp * 1000);
    }
    
    // Check for 'X-Goog-Expires' parameter (duration in seconds)
    const googExpiresParam = urlObj.searchParams.get('X-Goog-Expires');
    const googDateParam = urlObj.searchParams.get('X-Goog-Date');
    
    if (googExpiresParam && googDateParam) {
      // X-Goog-Date format: YYYYMMDDTHHMMSSZ
      const year = parseInt(googDateParam.substring(0, 4), 10);
      const month = parseInt(googDateParam.substring(4, 6), 10) - 1;
      const day = parseInt(googDateParam.substring(6, 8), 10);
      const hour = parseInt(googDateParam.substring(9, 11), 10);
      const minute = parseInt(googDateParam.substring(11, 13), 10);
      const second = parseInt(googDateParam.substring(13, 15), 10);
      
      const startDate = new Date(Date.UTC(year, month, day, hour, minute, second));
      const expiresSeconds = parseInt(googExpiresParam, 10);
      
      return new Date(startDate.getTime() + (expiresSeconds * 1000));
    }
    
    return null;
  } catch (error) {
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
  const expirationDate = extractExpirationFromUrl(url);
  if (!expirationDate) {
    return false;
  }
  
  const now = new Date();
  const actualDurationSeconds = Math.floor((expirationDate.getTime() - now.getTime()) / 1000);
  
  // Check if within tolerance
  return Math.abs(actualDurationSeconds - expectedDurationSeconds) <= toleranceSeconds;
}

