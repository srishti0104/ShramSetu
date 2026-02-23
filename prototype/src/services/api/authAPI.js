/**
 * Authentication API
 * 
 * @fileoverview API methods for authentication and onboarding
 */

import apiClient from './apiClient';

/**
 * Authentication API Service
 */
class AuthAPI {
  /**
   * Send OTP to phone number
   * @param {string} phoneNumber - Phone number with country code
   * @param {string} language - Language code
   * @returns {Promise<Object>} Response with session ID
   */
  async sendOTP(phoneNumber, language = 'en') {
    try {
      const response = await apiClient.post('/auth/send-otp', {
        phoneNumber,
        language
      });

      return {
        success: true,
        sessionId: response.sessionId,
        expiresIn: response.expiresIn || 300, // 5 minutes default
        message: response.message
      };
    } catch (error) {
      console.error('[MOCK] Send OTP error:', error);
      
      // Mock response for development
      return {
        success: true,
        sessionId: `session_${Date.now()}`,
        expiresIn: 300,
        message: 'OTP sent successfully (MOCK)'
      };
    }
  }

  /**
   * Verify OTP
   * @param {string} phoneNumber - Phone number
   * @param {string} otp - OTP code
   * @param {string} sessionId - Session ID from sendOTP
   * @returns {Promise<Object>} Response with tokens and user data
   */
  async verifyOTP(phoneNumber, otp, sessionId) {
    try {
      const response = await apiClient.post('/auth/verify-otp', {
        phoneNumber,
        otp,
        sessionId
      });

      // Store tokens
      if (response.accessToken) {
        apiClient.setTokens(response.accessToken, response.refreshToken);
      }

      return {
        success: true,
        userId: response.userId,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isNewUser: response.isNewUser,
        profile: response.profile
      };
    } catch (error) {
      console.error('[MOCK] Verify OTP error:', error);
      
      // Mock response for development
      return {
        success: true,
        userId: `user_${Date.now()}`,
        accessToken: `mock_access_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
        isNewUser: true,
        profile: null
      };
    }
  }

  /**
   * Resend OTP
   * @param {string} phoneNumber - Phone number
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Response
   */
  async resendOTP(phoneNumber, sessionId) {
    try {
      const response = await apiClient.post('/auth/resend-otp', {
        phoneNumber,
        sessionId
      });

      return {
        success: true,
        sessionId: response.sessionId,
        expiresIn: response.expiresIn || 300,
        message: response.message
      };
    } catch (error) {
      console.error('[MOCK] Resend OTP error:', error);
      
      // Mock response
      return {
        success: true,
        sessionId: sessionId || `session_${Date.now()}`,
        expiresIn: 300,
        message: 'OTP resent successfully (MOCK)'
      };
    }
  }

  /**
   * Verify E-Shram card
   * @param {string} cardNumber - E-Shram card number
   * @param {string} phoneNumber - Phone number for OTP
   * @returns {Promise<Object>} Response with card details
   */
  async verifyEShramCard(cardNumber, phoneNumber) {
    try {
      const response = await apiClient.post('/auth/verify-eshram', {
        cardNumber,
        phoneNumber
      });

      return {
        success: true,
        cardValid: response.cardValid,
        workerDetails: response.workerDetails,
        sessionId: response.sessionId,
        message: response.message
      };
    } catch (error) {
      console.error('[MOCK] E-Shram verification error:', error);
      
      // Mock response
      return {
        success: true,
        cardValid: true,
        workerDetails: {
          name: 'Mock Worker',
          age: 30,
          gender: 'male',
          occupation: 'mason'
        },
        sessionId: `session_${Date.now()}`,
        message: 'E-Shram card verified (MOCK)'
      };
    }
  }

  /**
   * Complete user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} Response
   */
  async completeProfile(userId, profileData) {
    try {
      const response = await apiClient.post('/auth/complete-profile', {
        userId,
        ...profileData
      });

      return {
        success: true,
        profile: response.profile,
        message: response.message
      };
    } catch (error) {
      console.error('[MOCK] Complete profile error:', error);
      
      // Mock response
      return {
        success: true,
        profile: profileData,
        message: 'Profile completed successfully (MOCK)'
      };
    }
  }

  /**
   * Upload profile photo
   * @param {string} userId - User ID
   * @param {File} file - Photo file
   * @returns {Promise<Object>} Response with photo URL
   */
  async uploadProfilePhoto(userId, file) {
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('photo', file);

      const response = await apiClient.upload('/auth/upload-photo', formData);

      return {
        success: true,
        photoUrl: response.photoUrl,
        message: response.message
      };
    } catch (error) {
      console.error('[MOCK] Upload photo error:', error);
      
      // Mock response with data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            success: true,
            photoUrl: reader.result,
            message: 'Photo uploaded successfully (MOCK)'
          });
        };
        reader.readAsDataURL(file);
      });
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Response with new tokens
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await apiClient.post('/auth/refresh-token', {
        refreshToken
      });

      // Update tokens
      if (response.accessToken) {
        apiClient.setTokens(response.accessToken, response.refreshToken);
      }

      return {
        success: true,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      };
    } catch (error) {
      console.error('[MOCK] Refresh token error:', error);
      
      // Mock response
      return {
        success: true,
        accessToken: `mock_access_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`
      };
    }
  }

  /**
   * Logout user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Response
   */
  async logout(userId) {
    try {
      const response = await apiClient.post('/auth/logout', { userId });
      
      // Clear tokens
      apiClient.clearTokens();

      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('[MOCK] Logout error:', error);
      
      // Clear tokens anyway
      apiClient.clearTokens();
      
      return {
        success: true,
        message: 'Logged out successfully (MOCK)'
      };
    }
  }
}

// Create singleton instance
const authAPI = new AuthAPI();

export default authAPI;
export { AuthAPI };
