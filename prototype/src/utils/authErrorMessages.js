/**
 * Authentication Error Messages
 * 
 * Localized error messages for authentication flows
 */

export const authErrorMessages = {
  en: {
    // Phone number errors
    invalidPhoneFormat: 'Invalid phone number format. Please enter a valid 10-digit phone number.',
    phoneRequired: 'Phone number is required.',
    
    // OTP errors
    invalidOTPFormat: 'Invalid OTP format. Please enter a 6-digit code.',
    invalidOTP: 'Invalid OTP. Please try again.',
    otpExpired: 'OTP has expired. Please request a new one.',
    otpAttemptsExceeded: 'Too many failed attempts. Try again in {minutes} minutes.',
    otpRateLimited: 'Too many OTP requests. Please try again in {minutes} minutes.',
    
    // Password errors
    passwordRequired: 'Password is required.',
    invalidPasswordFormat: 'Password must be at least 8 characters long and contain both letters and numbers.',
    passwordsDoNotMatch: 'Passwords do not match.',
    passwordTooShort: 'Password must be at least 8 characters long.',
    passwordNeedsLetters: 'Password must contain letters.',
    passwordNeedsNumbers: 'Password must contain numbers.',
    
    // Login errors
    invalidCredentials: 'Invalid phone number or password.',
    accountLocked: 'Account locked. Try again in {minutes} minutes.',
    
    // Registration errors
    phoneAlreadyRegistered: 'This phone number is already registered. Please login instead.',
    registrationFailed: 'Registration failed. Please try again.',
    validationError: 'Invalid registration data. Please check your information.',
    
    // Network errors
    networkError: 'Network error. Please check your connection and try again.',
    serverError: 'Server error. Please try again later.',
    offline: 'You are offline. Please check your internet connection.',
    
    // Token errors
    tokenExpired: 'Your session has expired. Please login again.',
    authenticationFailed: 'Authentication failed. Please login again.',
    
    // Generic errors
    unknownError: 'An error occurred. Please try again.',
    tryAgain: 'Please try again.',
  },
  
  hi: {
    // Phone number errors
    invalidPhoneFormat: 'अमान्य फ़ोन नंबर प्रारूप। कृपया एक मान्य 10-अंकीय फ़ोन नंबर दर्ज करें।',
    phoneRequired: 'फ़ोन नंबर आवश्यक है।',
    
    // OTP errors
    invalidOTPFormat: 'अमान्य OTP प्रारूप। कृपया 6-अंकीय कोड दर्ज करें।',
    invalidOTP: 'अमान्य OTP। कृपया पुनः प्रयास करें।',
    otpExpired: 'OTP समाप्त हो गया है। कृपया नया अनुरोध करें।',
    otpAttemptsExceeded: 'बहुत अधिक असफल प्रयास। {minutes} मिनट में पुनः प्रयास करें।',
    otpRateLimited: 'बहुत अधिक OTP अनुरोध। कृपया {minutes} मिनट में पुनः प्रयास करें।',
    
    // Password errors
    passwordRequired: 'पासवर्ड आवश्यक है।',
    invalidPasswordFormat: 'पासवर्ड कम से कम 8 अक्षर लंबा होना चाहिए और इसमें अक्षर और संख्याएं दोनों होने चाहिए।',
    passwordsDoNotMatch: 'पासवर्ड मेल नहीं खाते।',
    passwordTooShort: 'पासवर्ड कम से कम 8 अक्षर लंबा होना चाहिए।',
    passwordNeedsLetters: 'पासवर्ड में अक्षर होने चाहिए।',
    passwordNeedsNumbers: 'पासवर्ड में संख्याएं होनी चाहिए।',
    
    // Login errors
    invalidCredentials: 'अमान्य फ़ोन नंबर या पासवर्ड।',
    accountLocked: 'खाता लॉक है। {minutes} मिनट में पुनः प्रयास करें।',
    
    // Registration errors
    phoneAlreadyRegistered: 'यह फ़ोन नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।',
    registrationFailed: 'पंजीकरण विफल। कृपया पुनः प्रयास करें।',
    validationError: 'अमान्य पंजीकरण डेटा। कृपया अपनी जानकारी जांचें।',
    
    // Network errors
    networkError: 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।',
    serverError: 'सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।',
    offline: 'आप ऑफ़लाइन हैं। कृपया अपना इंटरनेट कनेक्शन जांचें।',
    
    // Token errors
    tokenExpired: 'आपका सत्र समाप्त हो गया है। कृपया फिर से लॉगिन करें।',
    authenticationFailed: 'प्रमाणीकरण विफल। कृपया फिर से लॉगिन करें।',
    
    // Generic errors
    unknownError: 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
    tryAgain: 'कृपया पुनः प्रयास करें।',
  }
};

/**
 * Get localized error message
 * @param {string} errorKey - Error message key
 * @param {string} language - Language code (en, hi)
 * @param {Object} params - Parameters to replace in message (e.g., {minutes: 5})
 * @returns {string} Localized error message
 */
export function getAuthErrorMessage(errorKey, language = 'en', params = {}) {
  const messages = authErrorMessages[language] || authErrorMessages.en;
  let message = messages[errorKey] || messages.unknownError;
  
  // Replace parameters in message
  Object.keys(params).forEach(key => {
    message = message.replace(`{${key}}`, params[key]);
  });
  
  return message;
}

/**
 * Parse error from API response or Error object
 * @param {Error|Object} error - Error object or API response
 * @param {string} language - Language code
 * @returns {string} Localized error message
 */
export function parseAuthError(error, language = 'en') {
  // Check if offline
  if (!navigator.onLine) {
    return getAuthErrorMessage('offline', language);
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Match error messages to keys
    if (message.includes('invalid phone number')) {
      return getAuthErrorMessage('invalidPhoneFormat', language);
    }
    if (message.includes('invalid otp')) {
      return getAuthErrorMessage('invalidOTP', language);
    }
    if (message.includes('otp has expired') || message.includes('otp expired')) {
      return getAuthErrorMessage('otpExpired', language);
    }
    if (message.includes('too many failed attempts')) {
      // Extract minutes from error message
      const match = message.match(/(\d+)\s*minutes?/);
      const minutes = match ? match[1] : '15';
      return getAuthErrorMessage('otpAttemptsExceeded', language, { minutes });
    }
    if (message.includes('too many otp requests')) {
      const match = message.match(/(\d+)\s*minutes?/);
      const minutes = match ? match[1] : '5';
      return getAuthErrorMessage('otpRateLimited', language, { minutes });
    }
    if (message.includes('account locked')) {
      const match = message.match(/(\d+)\s*minutes?/);
      const minutes = match ? match[1] : '15';
      return getAuthErrorMessage('accountLocked', language, { minutes });
    }
    if (message.includes('already registered')) {
      return getAuthErrorMessage('phoneAlreadyRegistered', language);
    }
    if (message.includes('invalid phone number or password') || message.includes('invalid credentials')) {
      return getAuthErrorMessage('invalidCredentials', language);
    }
    if (message.includes('password must be')) {
      return getAuthErrorMessage('invalidPasswordFormat', language);
    }
    if (message.includes('network') || message.includes('fetch')) {
      return getAuthErrorMessage('networkError', language);
    }
    
    // Return original message if no match
    return error.message;
  }
  
  // Handle API error responses
  if (error && error.error) {
    const errorCode = error.error;
    
    if (errorCode === 'PHONE_ALREADY_REGISTERED') {
      return getAuthErrorMessage('phoneAlreadyRegistered', language);
    }
    if (errorCode === 'INVALID_CREDENTIALS') {
      return getAuthErrorMessage('invalidCredentials', language);
    }
    if (errorCode === 'OTP_EXPIRED') {
      return getAuthErrorMessage('otpExpired', language);
    }
    if (errorCode === 'VALIDATION_ERROR') {
      return getAuthErrorMessage('validationError', language);
    }
    
    return error.message || getAuthErrorMessage('unknownError', language);
  }
  
  return getAuthErrorMessage('unknownError', language);
}
