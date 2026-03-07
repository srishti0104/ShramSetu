/**
 * API Interceptor Utility
 * 
 * Provides authenticated fetch wrapper that automatically:
 * - Adds Authorization header with JWT token
 * - Handles 401 Unauthorized responses
 * - Handles token expiration
 * - Redirects to login on authentication failure
 */

/**
 * Creates an authenticated fetch function that adds JWT token to requests
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export async function createAuthenticatedFetch(url, options = {}) {
  // Get token from localStorage
  const token = localStorage.getItem('authToken');
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Make the request
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.warn('Authentication failed: 401 Unauthorized');
      handleAuthenticationFailure();
      throw new Error('Authentication failed. Please login again.');
    }
    
    return response;
  } catch (error) {
    // Re-throw network errors
    throw error;
  }
}

/**
 * Handles authentication failure by clearing session and redirecting to login
 */
function handleAuthenticationFailure() {
  // Clear authentication data
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('userId');
  
  // Redirect to login/onboarding
  // Check if we're already on the onboarding page to avoid infinite loops
  if (!window.location.pathname.includes('/onboarding') && 
      !window.location.pathname.includes('/login')) {
    window.location.href = '/';
  }
}

/**
 * Checks if the current JWT token is expired
 * @returns {boolean} - True if token is expired or invalid
 */
export function isTokenExpired() {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return true;
  }
  
  try {
    // Parse JWT token (format: header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }
    
    // Decode payload (base64)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration time (exp is in seconds, Date.now() is in milliseconds)
    if (!payload.exp) {
      return false; // No expiration set
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= payload.exp;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return true; // Treat parsing errors as expired
  }
}

/**
 * Gets the current authentication token
 * @returns {string|null} - JWT token or null if not authenticated
 */
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Checks if user is currently authenticated
 * @returns {boolean} - True if authenticated with valid token
 */
export function isAuthenticated() {
  const token = getAuthToken();
  return token !== null && !isTokenExpired();
}
