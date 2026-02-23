/**
 * useAuth Hook
 * 
 * Custom React hook for authentication
 */

import { useState, useEffect } from 'react';
import authService from '../services/aws/authService';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const token = authService.getToken();
    const userData = authService.getUser();

    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, []);

  const sendOTP = async (phoneNumber) => {
    try {
      const formattedPhone = authService.formatPhoneNumber(phoneNumber);
      
      if (!authService.isValidPhoneNumber(formattedPhone)) {
        throw new Error('Invalid phone number');
      }

      const result = await authService.sendOTP(formattedPhone);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (phoneNumber, otp) => {
    try {
      const formattedPhone = authService.formatPhoneNumber(phoneNumber);
      
      if (!authService.isValidOTP(otp)) {
        throw new Error('Invalid OTP format');
      }

      const result = await authService.verifyOTP(formattedPhone, otp);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const formattedData = {
        ...userData,
        phoneNumber: authService.formatPhoneNumber(userData.phoneNumber)
      };

      const result = await authService.register(formattedData);
      setUser(result.user);
      setIsAuthenticated(false); // User needs to login after registration
      return result;
    } catch (error) {
      throw error;
    }
  };

  const login = async (phoneNumber) => {
    try {
      const formattedPhone = authService.formatPhoneNumber(phoneNumber);
      const result = await authService.login(formattedPhone);
      
      setUser(result.user);
      setIsAuthenticated(true);
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    sendOTP,
    verifyOTP,
    register,
    login,
    logout
  };
}
