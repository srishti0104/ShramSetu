/**
 * @fileoverview Attendance and TOTP system type definitions
 */

/**
 * Work session status enumeration
 * @typedef {'active' | 'completed' | 'cancelled' | 'expired'} SessionStatus
 */

/**
 * Attendance status enumeration
 * @typedef {'present' | 'absent' | 'late' | 'early_departure' | 'half_day'} AttendanceStatus
 */

/**
 * TOTP validation result enumeration
 * @typedef {'valid' | 'invalid' | 'expired' | 'already_used' | 'not_found'} TOTPValidationResult
 */

/**
 * Work session created by contractor
 * @typedef {Object} WorkSession
 * @property {string} sessionId - Unique session identifier (UUID)
 * @property {string} contractorId - Contractor's user ID
 * @property {string} jobId - Associated job ID
 * @property {string} jobTitle - Job title for display
 * @property {string} location - Work location address
 * @property {Object} coordinates - Geographic coordinates
 * @property {number} coordinates.latitude - Latitude
 * @property {number} coordinates.longitude - Longitude
 * @property {Date} sessionDate - Date of work session
 * @property {Date} startTime - Session start time
 * @property {Date} [endTime] - Session end time (null if active)
 * @property {SessionStatus} status - Current session status
 * @property {string} totpCode - Current 6-digit TOTP code
 * @property {Date} totpGeneratedAt - TOTP generation timestamp
 * @property {Date} totpExpiresAt - TOTP expiration timestamp (5 minutes from generation)
 * @property {number} totpRotationCount - Number of times TOTP has been rotated
 * @property {string[]} workerIds - List of expected worker IDs
 * @property {number} expectedWorkers - Number of expected workers
 * @property {number} presentWorkers - Number of workers marked present
 * @property {Object} metadata - Additional session metadata
 * @property {string} [metadata.notes] - Session notes
 * @property {string} [metadata.workType] - Type of work
 * @property {number} [metadata.estimatedHours] - Estimated work hours
 * @property {Date} createdAt - Session creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * Attendance record for a worker
 * @typedef {Object} AttendanceRecord
 * @property {string} attendanceId - Unique attendance identifier (UUID)
 * @property {string} sessionId - Associated work session ID
 * @property {string} workerId - Worker's user ID
 * @property {string} contractorId - Contractor's user ID
 * @property {string} jobId - Associated job ID
 * @property {Date} sessionDate - Date of work session
 * @property {Date} markedAt - Timestamp when attendance was marked
 * @property {AttendanceStatus} status - Attendance status
 * @property {string} totpUsed - TOTP code used for verification
 * @property {Object} location - Location where attendance was marked
 * @property {number} location.latitude - Latitude
 * @property {number} location.longitude - Longitude
 * @property {number} [location.accuracy] - Location accuracy in meters
 * @property {number} [distanceFromSite] - Distance from work site in meters
 * @property {Date} [checkInTime] - Actual check-in time
 * @property {Date} [checkOutTime] - Actual check-out time
 * @property {number} [hoursWorked] - Total hours worked
 * @property {string} cryptographicSignature - HMAC signature for audit trail
 * @property {Object} auditData - Data used for signature generation
 * @property {string} auditData.workerId - Worker ID
 * @property {string} auditData.sessionId - Session ID
 * @property {string} auditData.timestamp - ISO timestamp
 * @property {string} auditData.totpCode - TOTP code used
 * @property {boolean} isVerified - Whether attendance is verified by contractor
 * @property {string} [notes] - Additional notes
 * @property {Date} createdAt - Record creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * TOTP validation details
 * @typedef {Object} TOTPValidation
 * @property {string} validationId - Unique validation identifier
 * @property {string} sessionId - Associated work session ID
 * @property {string} workerId - Worker's user ID
 * @property {string} totpCode - TOTP code being validated
 * @property {TOTPValidationResult} result - Validation result
 * @property {Date} validatedAt - Validation timestamp
 * @property {Date} totpGeneratedAt - When the TOTP was generated
 * @property {Date} totpExpiresAt - When the TOTP expires
 * @property {number} timeDifferenceSeconds - Time difference between generation and validation
 * @property {boolean} isWithinWindow - Whether validation is within 5-minute window
 * @property {string} [failureReason] - Reason for validation failure
 * @property {Object} [location] - Location where validation was attempted
 * @property {number} [location.latitude] - Latitude
 * @property {number} [location.longitude] - Longitude
 * @property {string} [ipAddress] - IP address of validation request
 * @property {string} [userAgent] - User agent of validation request
 * @property {boolean} isSuccessful - Whether validation was successful
 */

/**
 * TOTP generation parameters
 * @typedef {Object} TOTPGenerationParams
 * @property {string} sessionId - Work session ID
 * @property {string} contractorId - Contractor ID
 * @property {Date} timestamp - Generation timestamp
 * @property {string} secret - Secret key for HMAC
 */

/**
 * Attendance summary for reporting
 * @typedef {Object} AttendanceSummary
 * @property {string} workerId - Worker's user ID
 * @property {Date} periodStart - Summary period start date
 * @property {Date} periodEnd - Summary period end date
 * @property {number} totalSessions - Total work sessions
 * @property {number} presentDays - Number of days present
 * @property {number} absentDays - Number of days absent
 * @property {number} lateDays - Number of days late
 * @property {number} totalHoursWorked - Total hours worked
 * @property {number} averageHoursPerDay - Average hours per day
 * @property {number} attendanceRate - Attendance rate percentage (0-100)
 * @property {AttendanceRecord[]} records - Individual attendance records
 */

/**
 * Audit log entry for attendance
 * @typedef {Object} AttendanceAuditLog
 * @property {string} logId - Unique log identifier
 * @property {string} attendanceId - Associated attendance record ID
 * @property {string} action - Action performed (e.g., 'marked', 'verified', 'modified')
 * @property {string} performedBy - User ID who performed the action
 * @property {Date} performedAt - Action timestamp
 * @property {string} cryptographicSignature - HMAC signature for integrity
 * @property {Object} changes - Changes made (for modifications)
 * @property {string} [ipAddress] - IP address of action
 * @property {string} [userAgent] - User agent of action
 */

export {};

