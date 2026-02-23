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
    // Enable mock mode for testing without AWS
    this.useMockMode = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
  }

  /**
   * Send OTP to phone number
   * @param {string} phoneNumber - Phone number with country code (e.g., +919876543210)
   * @returns {Promise<Object>} Response with success status
   */
  async sendOTP(phoneNumber) {
    // Mock mode for testing
    if (this.useMockMode) {
      console.log('🔧 Mock Mode: OTP sent to', phoneNumber);
      const mockOTP = '123456';
      localStorage.setItem('mock_otp_' + phoneNumber, mockOTP);
      console.log('Mock OTP:', mockOTP);
      return {
        success: true,
        message: 'OTP sent successfully (Mock Mode)',
        expiresIn: 300
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send OTP');
      }

      return result;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  }

  /**
   * Verify OTP code
   * @param {string} phoneNumber - Phone number with country code
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise<Object>} Response with verification status
   */
  async verifyOTP(phoneNumber, otp) {
    // Mock mode for testing
    if (this.useMockMode) {
      const mockOTP = localStorage.getItem('mock_otp_' + phoneNumber);
      if (otp === mockOTP) {
        console.log('🔧 Mock Mode: OTP verified successfully');
        localStorage.removeItem('mock_otp_' + phoneNumber);
        return {
          success: true,
          message: 'OTP verified successfully (Mock Mode)',
          phoneNumber
        };
      } else {
        throw new Error('Invalid OTP (Mock Mode)');
      }
    }

    try {
      const response = await fetch(`${this.apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber, otp })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Invalid OTP');
      }

      return result;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Response with user data
   */
  async register(userData) {
    // Mock mode for testing
    if (this.useMockMode) {
      console.log('🔧 Mock Mode: User registered', userData);
      const mockUser = {
        userId: 'user_mock_' + Date.now(),
        ...userData,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      this.setUser(mockUser);
      return {
        success: true,
        message: 'User registered successfully (Mock Mode)',
        user: mockUser
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      // Store user data
      this.setUser(result.user);

      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} phoneNumber - Phone number with country code
   * @returns {Promise<Object>} Response with token and user data
   */
  async login(phoneNumber) {
    // Mock mode for testing
    if (this.useMockMode) {
      const mockUser = this.getUser();
      if (!mockUser || mockUser.phoneNumber !== phoneNumber) {
        throw new Error('User not found (Mock Mode)');
      }
      const mockToken = 'mock_jwt_token_' + Date.now();
      this.setToken(mockToken);
      console.log('🔧 Mock Mode: User logged in', mockUser);
      return {
        success: true,
        message: 'Login successful (Mock Mode)',
        token: mockToken,
        user: mockUser
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Login failed');
      }

      // Store token and user data
      this.setToken(result.token);
      this.setUser(result.user);

      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
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
}

export default new AuthService();
