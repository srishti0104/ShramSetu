/**
 * TOTP Attendance API Client
 * Handles all attendance-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Create a new work session
 * @param {Object} sessionData - Session details
 * @returns {Promise<Object>} Created session
 */
export async function createSession(sessionData) {
  const response = await fetch(`${API_BASE_URL}/attendance/create-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(sessionData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create session');
  }

  return response.json();
}

/**
 * Generate TOTP code for a session
 * @param {string} sessionId - Session ID
 * @param {string} contractorId - Contractor ID
 * @returns {Promise<Object>} TOTP details
 */
export async function generateTOTP(sessionId, contractorId) {
  const response = await fetch(`${API_BASE_URL}/attendance/generate-totp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({ sessionId, contractorId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate TOTP');
  }

  return response.json();
}

/**
 * Validate TOTP code
 * @param {string} sessionId - Session ID
 * @param {string} code - 6-digit TOTP code
 * @param {string} workerId - Worker ID
 * @returns {Promise<Object>} Validation result
 */
export async function validateTOTP(sessionId, code, workerId) {
  const response = await fetch(`${API_BASE_URL}/attendance/validate-totp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({ sessionId, code, workerId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Invalid TOTP code');
  }

  return response.json();
}

/**
 * Mark attendance for a worker
 * @param {Object} attendanceData - Attendance details
 * @returns {Promise<Object>} Attendance record
 */
export async function markAttendance(attendanceData) {
  const response = await fetch(`${API_BASE_URL}/attendance/mark-attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(attendanceData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark attendance');
  }

  return response.json();
}

/**
 * Get attendance log
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} Attendance records and summary
 */
export async function getAttendanceLog(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.sessionId) params.append('sessionId', filters.sessionId);
  if (filters.workerId) params.append('workerId', filters.workerId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await fetch(`${API_BASE_URL}/attendance/log?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch attendance log');
  }

  return response.json();
}

/**
 * Get session details
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Session details
 */
export async function getSession(sessionId) {
  const response = await fetch(`${API_BASE_URL}/attendance/session/${sessionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch session');
  }

  return response.json();
}

/**
 * End a work session
 * @param {string} sessionId - Session ID
 * @param {string} contractorId - Contractor ID
 * @returns {Promise<Object>} Updated session
 */
export async function endSession(sessionId, contractorId) {
  const response = await fetch(`${API_BASE_URL}/attendance/end-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({ sessionId, contractorId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to end session');
  }

  return response.json();
}

/**
 * Verify audit signature for an attendance record
 * @param {Object} record - Attendance record
 * @returns {Promise<Object>} Verification result
 */
export async function verifyAuditSignature(record) {
  const response = await fetch(`${API_BASE_URL}/attendance/verify-audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({ record })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to verify audit signature');
  }

  return response.json();
}

/**
 * Get current location using Geolocation API
 * @returns {Promise<Object|null>} Location coordinates or null
 */
export async function getCurrentLocation() {
  return new Promise((resolve) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      resolve(null);
    }
  });
}

/**
 * Get authentication token from storage
 * @returns {string|null} JWT token
 */
function getAuthToken() {
  // MOCK: In production, retrieve from secure storage
  return localStorage.getItem('authToken') || null;
}

/**
 * WebSocket connection for real-time attendance updates
 */
export class AttendanceWebSocket {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    this.ws = new WebSocket(`${wsUrl}/attendance/${this.sessionId}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data.payload);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected');
      this.attemptReconnect();
    };
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('WebSocket listener error:', error);
        }
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

export default {
  createSession,
  generateTOTP,
  validateTOTP,
  markAttendance,
  getAttendanceLog,
  getSession,
  endSession,
  verifyAuditSignature,
  getCurrentLocation,
  AttendanceWebSocket
};

