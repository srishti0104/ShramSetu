/**
 * Authentication Service
 * 
 * Handles user authentication with AWS Lambda backend
 */

class AuthService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_AUTH_API_URL;
    this.tokenKey = 'shram_setu_token';
    this.userKey = 'shram_setu_user';
    this.loginAttemptsKey = 'shram_setu_login_attempts';
    this.otpAttemptsKey = 'shram_setu_otp_attempts';
    this.rateLimitKey = 'shram_setu_rate_limit';
    // Enable mock mode for testing without AWS
    this.useMockMode = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
    
    // Configuration
    this.maxLoginAttempts = 5;
    this.maxOTPAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
    this.maxOTPRequests = 3;
    this.rateLimitWindow = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    // Validate HTTPS-only in production (except mock mode)
    if (!this.useMockMode && this.apiUrl && !this.apiUrl.startsWith('https://')) {
      throw new Error('API URL must use HTTPS protocol for security');
    }
  }

  /**
   * Secure logging helper - removes sensitive data in production
   * @param {string} message - Log message
   * @param {any} data - Data to log (will be sanitized)
   */
  _secureLog(message, data = null) {
    if (this.useMockMode) {
      // In mock mode, log everything for debugging
      if (data) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    } else {
      // In production, only log message without sensitive data
      console.log(message);
    }
  }

  /**
   * Secure error logging - removes sensitive data
   * @param {string} message - Error message
   * @param {Error} error - Error object
   */
  _secureErrorLog(message, error) {
    if (this.useMockMode) {
      console.error(message, error);
    } else {
      // In production, log only error message without stack trace or details
      console.error(message, error.message || 'An error occurred');
    }
  }

  /**
   * Send OTP to phone number
   * @param {string} phoneNumber - Phone number with country code (e.g., +919876543210)
   * @returns {Promise<Object>} Response with success status
   */
  async sendOTP(phoneNumber) {
    // Validate phone number format before API call
    if (!this.isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format. Please enter a valid 10-digit phone number.');
    }
    
    // Format phone number
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    
    // Check rate limiting
    const rateLimitStatus = this.checkRateLimit(formattedPhone);
    if (rateLimitStatus.isLimited) {
      const remainingTime = Math.ceil(rateLimitStatus.remainingTime / 60000);
      throw new Error(`Too many OTP requests. Please try again in ${remainingTime} minutes.`);
    }
    
    // Mock mode for testing
    if (this.useMockMode) {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this._secureLog('🔧 Mock Mode: OTP sent to', formattedPhone);
      const mockOTP = '123456';
      localStorage.setItem('mock_otp_' + formattedPhone, mockOTP);
      this._secureLog('Mock OTP:', mockOTP);
      
      // Record OTP request for rate limiting
      this.recordOTPRequest(formattedPhone);
      
      return {
        success: true,
        message: 'OTP sent successfully (Mock Mode)',
        expiresIn: 300
      };
    }

    try {
      const response = await this._retryWithBackoff(async () => {
        return await fetch(`${this.apiUrl}/auth/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ phoneNumber: formattedPhone })
        });
      }, 3);

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Check for specific error codes
        if (result.error === 'PHONE_ALREADY_REGISTERED') {
          throw new Error('This phone number is already registered. Please login instead.');
        }
        throw new Error(result.error || 'Failed to send OTP');
      }

      // Record OTP request for rate limiting
      this.recordOTPRequest(formattedPhone);

      return result;
    } catch (error) {
      this._secureErrorLog('Send OTP error:', error);
      throw error;
    }
  }

  /**
   * Check if OTP requests are rate limited
   * @param {string} phoneNumber - Formatted phone number
   * @returns {Object} Rate limit status
   */
  checkRateLimit(phoneNumber) {
    const rateLimitData = this.getRateLimitData(phoneNumber);
    
    if (!rateLimitData || rateLimitData.requests.length < this.maxOTPRequests) {
      return { isLimited: false, remainingTime: 0 };
    }
    
    // Check if oldest request is outside the window
    const oldestRequest = rateLimitData.requests[0];
    const timeSinceOldest = Date.now() - oldestRequest;
    
    if (timeSinceOldest >= this.rateLimitWindow) {
      // Window expired, clear old requests
      this.clearRateLimitData(phoneNumber);
      return { isLimited: false, remainingTime: 0 };
    }
    
    return {
      isLimited: true,
      remainingTime: this.rateLimitWindow - timeSinceOldest
    };
  }

  /**
   * Record an OTP request for rate limiting
   * @param {string} phoneNumber - Formatted phone number
   */
  recordOTPRequest(phoneNumber) {
    const rateLimitData = this.getRateLimitData(phoneNumber) || { requests: [] };
    
    // Add current timestamp
    rateLimitData.requests.push(Date.now());
    
    // Keep only requests within the window
    const cutoffTime = Date.now() - this.rateLimitWindow;
    rateLimitData.requests = rateLimitData.requests.filter(time => time > cutoffTime);
    
    // Keep only the most recent maxOTPRequests
    if (rateLimitData.requests.length > this.maxOTPRequests) {
      rateLimitData.requests = rateLimitData.requests.slice(-this.maxOTPRequests);
    }
    
    localStorage.setItem(
      `${this.rateLimitKey}_${phoneNumber}`,
      JSON.stringify(rateLimitData)
    );
  }

  /**
   * Get rate limit data for a phone number
   * @param {string} phoneNumber - Formatted phone number
   * @returns {Object|null} Rate limit data
   */
  getRateLimitData(phoneNumber) {
    const data = localStorage.getItem(`${this.rateLimitKey}_${phoneNumber}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Clear rate limit data for a phone number
   * @param {string} phoneNumber - Formatted phone number
   */
  clearRateLimitData(phoneNumber) {
    localStorage.removeItem(`${this.rateLimitKey}_${phoneNumber}`);
  }

  /**
   * Retry a function with exponential backoff
   * @param {Function} fn - Async function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Promise<any>} Result of the function
   */
  async _retryWithBackoff(fn, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on last attempt
        if (attempt === maxRetries - 1) {
          break;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Verify OTP code
   * @param {string} phoneNumber - Phone number with country code
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise<Object>} Response with verification status
   */
  async verifyOTP(phoneNumber, otp) {
    // Validate phone number format before API call
    if (!this.isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format.');
    }
    
    // Validate OTP format before API call
    if (!this.isValidOTP(otp)) {
      throw new Error('Invalid OTP format. Please enter a 6-digit code.');
    }
    
    // Format phone number
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    
    // Check if OTP verification is locked
    const lockStatus = this.checkOTPLockout(formattedPhone);
    if (lockStatus.isLocked) {
      const remainingTime = Math.ceil(lockStatus.remainingTime / 60000);
      throw new Error(`Too many failed attempts. Try again in ${remainingTime} minutes.`);
    }
    
    // Mock mode for testing
    if (this.useMockMode) {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockOTP = localStorage.getItem('mock_otp_' + formattedPhone);
      if (otp === mockOTP) {
        this._secureLog('🔧 Mock Mode: OTP verified successfully');
        localStorage.removeItem('mock_otp_' + formattedPhone);
        this.clearOTPAttempts(formattedPhone);
        return {
          success: true,
          message: 'OTP verified successfully (Mock Mode)',
          phoneNumber: formattedPhone
        };
      } else {
        this.recordOTPAttempt(formattedPhone, false);
        throw new Error('Invalid OTP (Mock Mode)');
      }
    }

    try {
      const response = await fetch(`${this.apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          phoneNumber: formattedPhone, 
          otp 
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Record failed attempt
        this.recordOTPAttempt(formattedPhone, false);
        
        // Check for specific error codes
        if (result.error === 'OTP_EXPIRED') {
          throw new Error('OTP has expired. Please request a new one.');
        }
        throw new Error(result.error || 'Invalid OTP');
      }

      // Successful verification - clear attempts
      this.clearOTPAttempts(formattedPhone);

      return result;
    } catch (error) {
      this._secureErrorLog('Verify OTP error:', error);
      throw error;
    }
  }

  /**
   * Check if OTP verification is locked due to failed attempts
   * @param {string} phoneNumber - Formatted phone number
   * @returns {Object} Lock status with isLocked and remainingTime
   */
  checkOTPLockout(phoneNumber) {
    const attemptsData = this.getOTPAttempts(phoneNumber);
    
    if (!attemptsData || attemptsData.count < this.maxOTPAttempts) {
      return { isLocked: false, remainingTime: 0 };
    }
    
    const timeSinceLastAttempt = Date.now() - attemptsData.lastAttempt;
    
    if (timeSinceLastAttempt < this.lockoutDuration) {
      return {
        isLocked: true,
        remainingTime: this.lockoutDuration - timeSinceLastAttempt
      };
    }
    
    // Lockout period expired, clear attempts
    this.clearOTPAttempts(phoneNumber);
    return { isLocked: false, remainingTime: 0 };
  }

  /**
   * Record an OTP verification attempt
   * @param {string} phoneNumber - Formatted phone number
   * @param {boolean} success - Whether the attempt was successful
   */
  recordOTPAttempt(phoneNumber, success) {
    if (success) {
      this.clearOTPAttempts(phoneNumber);
      return;
    }
    
    const attemptsData = this.getOTPAttempts(phoneNumber) || { count: 0, lastAttempt: 0 };
    attemptsData.count += 1;
    attemptsData.lastAttempt = Date.now();
    
    localStorage.setItem(
      `${this.otpAttemptsKey}_${phoneNumber}`,
      JSON.stringify(attemptsData)
    );
  }

  /**
   * Get OTP verification attempts for a phone number
   * @param {string} phoneNumber - Formatted phone number
   * @returns {Object|null} Attempts data
   */
  getOTPAttempts(phoneNumber) {
    const data = localStorage.getItem(`${this.otpAttemptsKey}_${phoneNumber}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Clear OTP verification attempts for a phone number
   * @param {string} phoneNumber - Formatted phone number
   */
  clearOTPAttempts(phoneNumber) {
    localStorage.removeItem(`${this.otpAttemptsKey}_${phoneNumber}`);
  }

  /**
   * Get remaining OTP verification attempts before lockout
   * @param {string} phoneNumber - Formatted phone number
   * @returns {number} Remaining attempts
   */
  getRemainingOTPAttempts(phoneNumber) {
    const attemptsData = this.getOTPAttempts(phoneNumber);
    if (!attemptsData) return this.maxOTPAttempts;
    return Math.max(0, this.maxOTPAttempts - attemptsData.count);
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.phoneNumber - Phone number
   * @param {string} userData.password - User password
   * @param {string} userData.role - User role (worker/employer)
   * @param {string} userData.language - Preferred language
   * @param {Object} userData.location - Location data
   * @param {Array} userData.skills - Skills (for workers)
   * @param {Object} userData.profile - Profile data
   * @returns {Promise<Object>} Response with user data and token
   */
  async register(userData) {
    // Validate phone number format before API call
    if (!this.isValidPhoneNumber(userData.phoneNumber)) {
      throw new Error('Invalid phone number format.');
    }
    
    // Validate password format before API call
    if (!this.isValidPassword(userData.password)) {
      throw new Error('Password must be at least 8 characters long and contain both letters and numbers.');
    }
    
    // Format phone number
    const formattedPhone = this.formatPhoneNumber(userData.phoneNumber);
    
    // Prepare registration data
    const registrationData = {
      ...userData,
      phoneNumber: formattedPhone
    };
    
    // Mock mode for testing
    if (this.useMockMode) {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user already exists in mock registry
      const mockUsersKey = 'mock_registered_users';
      const mockUsersData = localStorage.getItem(mockUsersKey);
      const mockUsers = mockUsersData ? JSON.parse(mockUsersData) : {};
      
      if (mockUsers[formattedPhone]) {
        throw new Error('This phone number is already registered. Please login instead.');
      }
      
      this._secureLog('🔧 Mock Mode: User registered', { phoneNumber: formattedPhone, role: registrationData.role });
      const mockUser = {
        userId: 'user_mock_' + Date.now(),
        ...registrationData,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      // Don't store password in user object
      delete mockUser.password;
      
      // Store user in mock registry for future logins
      mockUsers[formattedPhone] = mockUser;
      localStorage.setItem(mockUsersKey, JSON.stringify(mockUsers));
      
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      this.setToken(mockToken);
      this.setUser(mockUser);
      
      return {
        success: true,
        message: 'User registered successfully (Mock Mode)',
        user: mockUser,
        token: mockToken
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Check for specific error codes
        if (result.error === 'PHONE_ALREADY_REGISTERED') {
          throw new Error('This phone number is already registered. Please login instead.');
        }
        if (result.error === 'VALIDATION_ERROR') {
          throw new Error(result.message || 'Invalid registration data');
        }
        throw new Error(result.error || 'Registration failed');
      }

      // Store token and user data
      this.setToken(result.token);
      this.setUser(result.user);

      return result;
    } catch (error) {
      this._secureErrorLog('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user with phone number and password
   * @param {string} phoneNumber - Phone number with country code
   * @param {string} password - User password
   * @returns {Promise<Object>} Response with token and user data
   */
  async login(phoneNumber, password) {
    // Validate phone number format before API call
    if (!this.isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format.');
    }
    
    // Validate password format before API call
    if (!password || password.trim().length === 0) {
      throw new Error('Password is required.');
    }
    
    // Format phone number
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    
    // Check if account is locked
    const lockStatus = this.checkAccountLockout(formattedPhone);
    if (lockStatus.isLocked) {
      const remainingTime = Math.ceil(lockStatus.remainingTime / 60000);
      throw new Error(`Account locked. Try again in ${remainingTime} minutes.`);
    }
    
    // Mock mode for testing
    if (this.useMockMode) {
      // In mock mode, we need to check if user was registered
      // First check if there's a currently logged in user
      const mockUser = this.getUser();
      
      // Check if this phone number matches the registered user
      if (mockUser && mockUser.phoneNumber === formattedPhone) {
        // In mock mode, we don't actually verify password, just check if user exists
        // Successful login
        this.clearLoginAttempts(formattedPhone);
        const mockToken = 'mock_jwt_token_' + Date.now();
        this.setToken(mockToken);
        this._secureLog('🔧 Mock Mode: User logged in', { phoneNumber: formattedPhone });
        
        return {
          success: true,
          message: 'Login successful (Mock Mode)',
          token: mockToken,
          user: mockUser
        };
      }
      
      // Check if user exists in mock users storage
      const mockUsersKey = 'mock_registered_users';
      const mockUsersData = localStorage.getItem(mockUsersKey);
      const mockUsers = mockUsersData ? JSON.parse(mockUsersData) : {};
      
      if (mockUsers[formattedPhone]) {
        // User exists, log them in
        const user = mockUsers[formattedPhone];
        this.clearLoginAttempts(formattedPhone);
        const mockToken = 'mock_jwt_token_' + Date.now();
        this.setToken(mockToken);
        this.setUser(user);
        this._secureLog('🔧 Mock Mode: User logged in from registry', { phoneNumber: formattedPhone });
        
        return {
          success: true,
          message: 'Login successful (Mock Mode)',
          token: mockToken,
          user: user
        };
      }
      
      // User not found
      this.recordLoginAttempt(formattedPhone, false);
      throw new Error('Invalid phone number or password (Mock Mode)');
    }

    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          phoneNumber: formattedPhone,
          password 
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Record failed attempt
        this.recordLoginAttempt(formattedPhone, false);
        throw new Error(result.error || 'Invalid phone number or password');
      }

      // Successful login - clear attempts
      this.clearLoginAttempts(formattedPhone);
      
      // Store token and user data
      this.setToken(result.token);
      this.setUser(result.user);

      return result;
    } catch (error) {
      this._secureErrorLog('Login error:', error);
      throw error;
    }
  }

  /**
   * Check if account is locked due to failed login attempts
   * @param {string} phoneNumber - Formatted phone number
   * @returns {Object} Lock status with isLocked and remainingTime
   */
  checkAccountLockout(phoneNumber) {
    const attemptsData = this.getLoginAttempts(phoneNumber);
    
    if (!attemptsData || attemptsData.count < this.maxLoginAttempts) {
      return { isLocked: false, remainingTime: 0 };
    }
    
    const timeSinceLastAttempt = Date.now() - attemptsData.lastAttempt;
    
    if (timeSinceLastAttempt < this.lockoutDuration) {
      return {
        isLocked: true,
        remainingTime: this.lockoutDuration - timeSinceLastAttempt
      };
    }
    
    // Lockout period expired, clear attempts
    this.clearLoginAttempts(phoneNumber);
    return { isLocked: false, remainingTime: 0 };
  }

  /**
   * Record a login attempt
   * @param {string} phoneNumber - Formatted phone number
   * @param {boolean} success - Whether the attempt was successful
   */
  recordLoginAttempt(phoneNumber, success) {
    if (success) {
      this.clearLoginAttempts(phoneNumber);
      return;
    }
    
    const attemptsData = this.getLoginAttempts(phoneNumber) || { count: 0, lastAttempt: 0 };
    attemptsData.count += 1;
    attemptsData.lastAttempt = Date.now();
    
    localStorage.setItem(
      `${this.loginAttemptsKey}_${phoneNumber}`,
      JSON.stringify(attemptsData)
    );
  }

  /**
   * Get login attempts for a phone number
   * @param {string} phoneNumber - Formatted phone number
   * @returns {Object|null} Attempts data
   */
  getLoginAttempts(phoneNumber) {
    const data = localStorage.getItem(`${this.loginAttemptsKey}_${phoneNumber}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Clear login attempts for a phone number
   * @param {string} phoneNumber - Formatted phone number
   */
  clearLoginAttempts(phoneNumber) {
    localStorage.removeItem(`${this.loginAttemptsKey}_${phoneNumber}`);
  }

  /**
   * Get remaining login attempts before lockout
   * @param {string} phoneNumber - Formatted phone number
   * @returns {number} Remaining attempts
   */
  getRemainingLoginAttempts(phoneNumber) {
    const attemptsData = this.getLoginAttempts(phoneNumber);
    if (!attemptsData) return this.maxLoginAttempts;
    return Math.max(0, this.maxLoginAttempts - attemptsData.count);
  }

  /**
   * Check if the current JWT token is expired
   * @returns {boolean} True if token is expired or invalid
   */
  isTokenExpired() {
    const token = this.getToken();
    
    if (!token) {
      return true;
    }
    
    // In mock mode, tokens don't expire
    if (this.useMockMode) {
      return false;
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
      this._secureErrorLog('Error parsing JWT token:', error);
      return true; // Treat parsing errors as expired
    }
  }

  /**
   * Logout user and clear all authentication data
   */
  logout() {
    // Clear authentication tokens and user data
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    
    // Clear any stored user ID
    localStorage.removeItem('userId');
    
    // Clear any other auth-related data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    this._secureLog('User logged out successfully');
  }

  /**
   * Check if user is authenticated with a valid token
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired();
  }

  /**
   * Get stored token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Set token in localStorage
   * @param {string} token
   */
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Get stored user data
   * @returns {Object|null}
   */
  getUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Set user data in localStorage
   * @param {Object} user
   */
  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Get authorization header for API requests
   * @returns {Object}
   */
  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Format phone number to E.164 format
   * @param {string} phoneNumber - Phone number (10 digits)
   * @returns {string} Formatted phone number with +91 prefix
   */
  formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add +91 prefix if not present
    if (cleaned.startsWith('91')) {
      return `+${cleaned}`;
    } else if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    return `+${cleaned}`;
  }

  /**
   * Validate phone number
   * @param {string} phoneNumber
   * @returns {boolean}
   */
  isValidPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('91'));
  }

  /**
   * Validate OTP
   * @param {string} otp
   * @returns {boolean}
   */
  isValidOTP(otp) {
    return /^\d{6}$/.test(otp);
  }

  /**
   * Validate password format
   * @param {string} password
   * @returns {boolean}
   */
  isValidPassword(password) {
    if (!password || password.length < 8) return false;
    
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return hasLetters && hasNumbers;
  }

  /**
   * Validate password strength and return detailed feedback
   * @param {string} password
   * @returns {Object} Validation result with strength and requirements
   */
  validatePasswordStrength(password) {
    const requirements = {
      minLength: password && password.length >= 8,
      hasLetters: /[a-zA-Z]/.test(password),
      hasNumbers: /\d/.test(password)
    };
    
    const errors = [];
    if (!requirements.minLength) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!requirements.hasLetters) {
      errors.push('Password must contain letters');
    }
    if (!requirements.hasNumbers) {
      errors.push('Password must contain numbers');
    }
    
    const isValid = requirements.minLength && requirements.hasLetters && requirements.hasNumbers;
    
    // Calculate strength
    let strength = 'weak';
    if (isValid) {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const isLong = password.length >= 12;
      
      const strengthScore = [hasUpperCase, hasLowerCase, hasSpecialChar, isLong]
        .filter(Boolean).length;
      
      if (strengthScore >= 3) {
        strength = 'strong';
      } else if (strengthScore >= 1) {
        strength = 'medium';
      }
    }
    
    return {
      isValid,
      strength,
      errors,
      requirements
    };
  }
}

export default new AuthService();
