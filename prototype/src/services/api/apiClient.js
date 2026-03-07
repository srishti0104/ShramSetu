/**
 * API Client
 * 
 * @fileoverview Base API client with error handling and retry logic
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.shramsetu.com/v1';
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

/**
 * API Error Class
 */
export class APIError extends Error {
  constructor(message, status, code, details = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * API Client Class
 */
class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.timeout = API_TIMEOUT;
    this.maxRetries = MAX_RETRIES;
    this.accessToken = null;
    this.refreshToken = null;
  }

  /**
   * Set authentication tokens
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token
   */
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  /**
   * Clear authentication tokens
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  /**
   * Get default headers
   * @returns {Object} Headers
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  /**
   * Make HTTP request with retry logic
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @param {number} retryCount - Current retry count
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}, retryCount = 0) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(options.headers),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const error = await this.handleErrorResponse(response);
        throw error;
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error.name === 'AbortError') {
        throw new APIError('Request timeout', 408, 'TIMEOUT');
      }

      // Handle network errors with retry
      if (error.name === 'TypeError' && retryCount < this.maxRetries) {
        console.log(`Retrying request (${retryCount + 1}/${this.maxRetries})...`);
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.request(endpoint, options, retryCount + 1);
      }

      // Re-throw API errors
      if (error instanceof APIError) {
        throw error;
      }

      // Wrap other errors
      throw new APIError(
        error.message || 'Network error',
        0,
        'NETWORK_ERROR',
        { originalError: error }
      );
    }
  }

  /**
   * Handle error response
   * @param {Response} response - Fetch response
   * @returns {APIError} API error
   */
  async handleErrorResponse(response) {
    let errorData = {};
    
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }

    const message = errorData.message || `HTTP ${response.status} error`;
    const code = errorData.code || `HTTP_${response.status}`;
    
    return new APIError(message, response.status, code, errorData);
  }

  /**
   * Delay helper for retry logic
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} Response data
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<any>} Response data
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<any>} Response data
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<any>} Response data
   */
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<any>} Response data
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  /**
   * Upload file
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with file
   * @returns {Promise<any>} Response data
   */
  async upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  }
}

// Create singleton instance
const apiClient = new APIClient();

export default apiClient;
export { APIClient };
