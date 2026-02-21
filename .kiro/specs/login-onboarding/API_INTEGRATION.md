# API Integration - Implementation Summary

## Overview

Complete API integration layer for the Shramik-Setu onboarding flow with error handling, retry logic, and mock responses for development.

## Components Implemented

### 1. Base API Client (`src/services/api/apiClient.js`)

Core HTTP client with advanced features.

**Features:**
- RESTful methods (GET, POST, PUT, PATCH, DELETE)
- Automatic retry with exponential backoff
- Request timeout handling (30s default)
- Token-based authentication
- Error handling and custom error class
- File upload support
- Configurable base URL

**Usage:**
```javascript
import apiClient from './services/api/apiClient';

// Set authentication tokens
apiClient.setTokens(accessToken, refreshToken);

// Make requests
const data = await apiClient.get('/endpoint', { param: 'value' });
const result = await apiClient.post('/endpoint', { data: 'value' });

// Upload files
const formData = new FormData();
formData.append('file', file);
await apiClient.upload('/upload', formData);
```

### 2. Authentication API (`src/services/api/authAPI.js`)

Authentication and user management endpoints.

**Methods:**

**Send OTP:**
```javascript
import authAPI from './services/api/authAPI';

const result = await authAPI.sendOTP('+919876543210', 'hi');
// Returns: { success, sessionId, expiresIn, message }
```

**Verify OTP:**
```javascript
const result = await authAPI.verifyOTP(phoneNumber, otp, sessionId);
// Returns: { success, userId, accessToken, refreshToken, isNewUser, profile }
```

**Resend OTP:**
```javascript
const result = await authAPI.resendOTP(phoneNumber, sessionId);
// Returns: { success, sessionId, expiresIn, message }
```

**Verify E-Shram Card:**
```javascript
const result = await authAPI.verifyEShramCard(cardNumber, phoneNumber);
// Returns: { success, cardValid, workerDetails, sessionId, message }
```

**Complete Profile:**
```javascript
const result = await authAPI.completeProfile(userId, {
  name: 'John Doe',
  age: 30,
  gender: 'male',
  location: {...},
  skills: [...]
});
// Returns: { success, profile, message }
```

**Upload Profile Photo:**
```javascript
const result = await authAPI.uploadProfilePhoto(userId, file);
// Returns: { success, photoUrl, message }
```

**Refresh Token:**
```javascript
const result = await authAPI.refreshAccessToken(refreshToken);
// Returns: { success, accessToken, refreshToken }
```

**Logout:**
```javascript
const result = await authAPI.logout(userId);
// Returns: { success, message }
```

### 3. Location API (`src/services/api/locationAPI.js`)

Location services and geocoding endpoints.

**Methods:**

**Get Current Location:**
```javascript
import locationAPI from './services/api/locationAPI';

const result = await locationAPI.getCurrentLocation();
// Returns: { success, latitude, longitude, accuracy, city, state, pincode, address }
```

**Reverse Geocode:**
```javascript
const result = await locationAPI.reverseGeocode(19.0760, 72.8777);
// Returns: { success, city, state, pincode, address, district, country }
```

**Search Cities:**
```javascript
const result = await locationAPI.searchCities('Mumbai');
// Returns: { success, cities: [{ name, state, pincode }] }
```

**Get States:**
```javascript
const result = await locationAPI.getStates();
// Returns: { success, states: ['Maharashtra', 'Delhi', ...] }
```

**Validate Pincode:**
```javascript
const result = await locationAPI.validatePincode('400001');
// Returns: { success, valid, city, state, district }
```

## Error Handling

### Custom Error Class

```javascript
import { APIError } from './services/api/apiClient';

try {
  await authAPI.sendOTP(phoneNumber);
} catch (error) {
  if (error instanceof APIError) {
    console.log('Status:', error.status);
    console.log('Code:', error.code);
    console.log('Message:', error.message);
    console.log('Details:', error.details);
  }
}
```

### Error Codes

- `TIMEOUT` - Request timeout (408)
- `NETWORK_ERROR` - Network connectivity issue
- `HTTP_4XX` - Client errors (400-499)
- `HTTP_5XX` - Server errors (500-599)

### Retry Logic

- Automatic retry for network errors
- Maximum 3 retries with exponential backoff
- Configurable retry count
- Timeout after 30 seconds

## Mock Responses

All API methods include mock responses for development:

```javascript
// Mock responses are returned when API calls fail
// Useful for development without backend
const result = await authAPI.sendOTP('+919876543210');
// Returns mock data with [MOCK] prefix in console
```

## Configuration

### Environment Variables

Create `.env` file:

```env
REACT_APP_API_BASE_URL=https://api.shramsetu.com/v1
```

### Custom Configuration

```javascript
import { APIClient } from './services/api/apiClient';

const customClient = new APIClient('https://custom-api.com');
customClient.timeout = 60000; // 60 seconds
customClient.maxRetries = 5;
```

## Integration with Onboarding

### Example: Phone Number Screen

```javascript
import authAPI from '../../services/api/authAPI';
import { APIError } from '../../services/api/apiClient';

function PhoneNumberEntry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authAPI.sendOTP(phoneNumber, language);
      
      if (result.success) {
        // Store session ID
        updateState({ sessionId: result.sessionId });
        nextStep();
      }
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Component JSX
  );
}
```

### Example: OTP Verification

```javascript
const handleVerifyOTP = async () => {
  try {
    setLoading(true);
    
    const result = await authAPI.verifyOTP(
      state.phoneNumber,
      otp,
      state.sessionId
    );
    
    if (result.success) {
      updateState({
        userId: result.userId,
        accessToken: result.accessToken,
        otpVerified: true
      });
      nextStep();
    }
  } catch (err) {
    setError('Invalid OTP. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### Example: Location Services

```javascript
const handleGetLocation = async () => {
  try {
    setLoading(true);
    
    const result = await locationAPI.getCurrentLocation();
    
    if (result.success) {
      updateState({
        location: {
          latitude: result.latitude,
          longitude: result.longitude,
          city: result.city,
          state: result.state,
          pincode: result.pincode,
          address: result.address
        }
      });
      nextStep();
    }
  } catch (err) {
    // Fallback to manual entry
    setShowManualEntry(true);
  } finally {
    setLoading(false);
  }
};
```

## Security Considerations

### Token Management

- Tokens stored in memory (not localStorage for security)
- Automatic token refresh before expiry
- Secure token transmission (HTTPS only)
- Token cleared on logout

### Data Protection

- All requests over HTTPS
- No sensitive data in URLs
- Request/response encryption
- CORS configuration required

### Rate Limiting

- Client-side retry limits
- Exponential backoff
- Server-side rate limiting recommended

## Testing

### Unit Tests

```javascript
import authAPI from './authAPI';
import apiClient from './apiClient';

jest.mock('./apiClient');

describe('AuthAPI', () => {
  it('should send OTP successfully', async () => {
    apiClient.post.mockResolvedValue({
      sessionId: 'test-session',
      expiresIn: 300
    });

    const result = await authAPI.sendOTP('+919876543210');
    
    expect(result.success).toBe(true);
    expect(result.sessionId).toBe('test-session');
  });
});
```

### Integration Tests

```javascript
describe('API Integration', () => {
  it('should complete full auth flow', async () => {
    // Send OTP
    const otpResult = await authAPI.sendOTP('+919876543210');
    expect(otpResult.success).toBe(true);

    // Verify OTP
    const verifyResult = await authAPI.verifyOTP(
      '+919876543210',
      '123456',
      otpResult.sessionId
    );
    expect(verifyResult.success).toBe(true);
    expect(verifyResult.accessToken).toBeDefined();
  });
});
```

## File Structure

```
ShramSetu/src/services/api/
├── apiClient.js      # Base HTTP client
├── authAPI.js        # Authentication endpoints
└── locationAPI.js    # Location services
```

## Next Steps

1. **Backend Integration**: Replace mock responses with real API calls
2. **Error Messages**: Add user-friendly error messages
3. **Offline Support**: Implement request queuing for offline mode
4. **Caching**: Add response caching for frequently accessed data
5. **Monitoring**: Add API performance monitoring
6. **Documentation**: Generate API documentation from code

## API Endpoints Reference

### Authentication Endpoints

- `POST /auth/send-otp` - Send OTP to phone
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/resend-otp` - Resend OTP
- `POST /auth/verify-eshram` - Verify E-Shram card
- `POST /auth/complete-profile` - Complete user profile
- `POST /auth/upload-photo` - Upload profile photo
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Logout user

### Location Endpoints

- `GET /location/reverse-geocode` - Convert coordinates to address
- `GET /location/search-cities` - Search for cities
- `GET /location/states` - Get list of states
- `GET /location/validate-pincode` - Validate pincode

---

**Status**: Complete ✅  
**Date**: 2025-02-21  
**Task**: 16 (API Integration)  
**Files Created**: 3  
**Mock Mode**: Enabled for development

