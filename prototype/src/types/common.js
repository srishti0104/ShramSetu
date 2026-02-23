/**
 * @fileoverview Common type definitions used across the application
 */

/**
 * Language code enumeration
 * @typedef {'hi' | 'en' | 'mr' | 'gu' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'pa'} LanguageCode
 * 
 * Language codes:
 * - hi: Hindi
 * - en: English
 * - mr: Marathi
 * - gu: Gujarati
 * - ta: Tamil
 * - te: Telugu
 * - kn: Kannada
 * - ml: Malayalam
 * - bn: Bengali
 * - pa: Punjabi
 */

/**
 * HTTP status code enumeration
 * @typedef {200 | 201 | 400 | 401 | 403 | 404 | 409 | 422 | 500 | 503} HttpStatusCode
 */

/**
 * Error severity enumeration
 * @typedef {'critical' | 'error' | 'warning' | 'info'} ErrorSeverity
 */

/**
 * Error category enumeration
 * @typedef {'validation' | 'authentication' | 'authorization' | 'not_found' | 'conflict' | 'rate_limit' | 'server_error' | 'network_error' | 'timeout'} ErrorCategory
 */

/**
 * Standardized error response
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for errors
 * @property {string} error - Error code (e.g., 'INVALID_INPUT', 'UNAUTHORIZED')
 * @property {string} message - Human-readable error message
 * @property {ErrorCategory} category - Error category
 * @property {ErrorSeverity} severity - Error severity
 * @property {Object} [details] - Additional error details
 * @property {string[]} [details.fields] - Fields with errors (for validation)
 * @property {Object} [details.fieldErrors] - Field-specific error messages
 * @property {string} [details.suggestion] - Suggested action to resolve error
 * @property {string} requestId - Request ID for tracking
 * @property {Date} timestamp - Error timestamp
 * @property {string} [path] - API path where error occurred
 * @property {HttpStatusCode} statusCode - HTTP status code
 */

/**
 * Standardized success response
 * @typedef {Object} SuccessResponse
 * @property {boolean} success - Always true for success
 * @property {Object} [data] - Response data
 * @property {string} [message] - Success message
 * @property {Object} [metadata] - Response metadata
 * @property {number} [metadata.total] - Total items (for paginated responses)
 * @property {number} [metadata.page] - Current page
 * @property {number} [metadata.pageSize] - Page size
 * @property {string} requestId - Request ID for tracking
 * @property {Date} timestamp - Response timestamp
 */

/**
 * Pagination parameters
 * @typedef {Object} PaginationParams
 * @property {number} page - Page number (1-indexed)
 * @property {number} pageSize - Number of items per page
 * @property {string} [sortBy] - Field to sort by
 * @property {'asc' | 'desc'} [sortOrder] - Sort order
 */

/**
 * Paginated response
 * @typedef {Object} PaginatedResponse
 * @property {Object[]} items - Array of items
 * @property {number} total - Total number of items
 * @property {number} page - Current page number
 * @property {number} pageSize - Items per page
 * @property {number} totalPages - Total number of pages
 * @property {boolean} hasNext - Whether there is a next page
 * @property {boolean} hasPrevious - Whether there is a previous page
 */

/**
 * Audit log entry
 * @typedef {Object} AuditLog
 * @property {string} logId - Unique log identifier (UUID)
 * @property {string} userId - User ID who performed action
 * @property {string} action - Action performed (e.g., 'create', 'update', 'delete', 'view')
 * @property {string} entityType - Type of entity affected
 * @property {string} entityId - ID of entity affected
 * @property {Object} [changes] - Changes made (for updates)
 * @property {Object} [changes.before] - State before change
 * @property {Object} [changes.after] - State after change
 * @property {string[]} [changes.fields] - Fields that changed
 * @property {Date} timestamp - Action timestamp
 * @property {string} ipAddress - IP address of request
 * @property {string} userAgent - User agent of request
 * @property {string} requestId - Associated request ID
 * @property {Object} metadata - Additional audit metadata
 * @property {string} [metadata.reason] - Reason for action
 * @property {string} [metadata.deviceId] - Device ID
 * @property {string} [metadata.location] - Geographic location
 */

/**
 * Geographic coordinates
 * @typedef {Object} Coordinates
 * @property {number} latitude - Latitude (-90 to 90)
 * @property {number} longitude - Longitude (-180 to 180)
 * @property {number} [accuracy] - Accuracy in meters
 * @property {number} [altitude] - Altitude in meters
 * @property {Date} [timestamp] - Timestamp when coordinates were captured
 */

/**
 * Address information
 * @typedef {Object} Address
 * @property {string} [line1] - Address line 1
 * @property {string} [line2] - Address line 2
 * @property {string} city - City name
 * @property {string} state - State name
 * @property {string} [district] - District name
 * @property {string} [pincode] - PIN code
 * @property {string} country - Country name (default: 'India')
 * @property {Coordinates} [coordinates] - Geographic coordinates
 */

/**
 * File upload metadata
 * @typedef {Object} FileMetadata
 * @property {string} fileId - Unique file identifier
 * @property {string} fileName - Original file name
 * @property {string} fileType - MIME type
 * @property {number} fileSize - File size in bytes
 * @property {string} url - S3 URL of file
 * @property {string} [thumbnailUrl] - Thumbnail URL (for images)
 * @property {Date} uploadedAt - Upload timestamp
 * @property {string} uploadedBy - User ID who uploaded
 * @property {boolean} isEncrypted - Whether file is encrypted
 * @property {string} [checksum] - File checksum (SHA-256)
 */

/**
 * Notification
 * @typedef {Object} Notification
 * @property {string} notificationId - Unique notification identifier
 * @property {string} userId - User ID to notify
 * @property {string} type - Notification type (e.g., 'job_match', 'payment_received', 'rating_request')
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {Object} [data] - Additional notification data
 * @property {string} [actionUrl] - URL to navigate to on click
 * @property {boolean} isRead - Whether notification is read
 * @property {Date} createdAt - Notification creation timestamp
 * @property {Date} [readAt] - Read timestamp
 * @property {Date} [expiresAt] - Expiration timestamp
 * @property {string} [priority] - Priority (high, medium, low)
 */

/**
 * API request context
 * @typedef {Object} RequestContext
 * @property {string} requestId - Unique request identifier
 * @property {string} userId - User ID making request
 * @property {string} [sessionId] - Session ID
 * @property {string} ipAddress - IP address
 * @property {string} userAgent - User agent
 * @property {LanguageCode} languageCode - Preferred language
 * @property {Date} timestamp - Request timestamp
 * @property {string} [deviceId] - Device identifier
 * @property {string} [appVersion] - App version
 */

/**
 * Feature flag
 * @typedef {Object} FeatureFlag
 * @property {string} flagName - Feature flag name
 * @property {boolean} isEnabled - Whether feature is enabled
 * @property {string} [description] - Feature description
 * @property {Date} [enabledAt] - When feature was enabled
 * @property {string[]} [enabledForUsers] - Specific users with access
 * @property {number} [rolloutPercentage] - Rollout percentage (0-100)
 */

/**
 * Health check response
 * @typedef {Object} HealthCheck
 * @property {string} status - Overall status (healthy, degraded, unhealthy)
 * @property {Date} timestamp - Check timestamp
 * @property {string} version - Application version
 * @property {Object} services - Service-specific health
 * @property {string} services.database - Database status
 * @property {string} services.cache - Cache status
 * @property {string} services.storage - Storage status
 * @property {string} services.queue - Queue status
 * @property {Object} [metrics] - System metrics
 * @property {number} [metrics.uptime] - Uptime in seconds
 * @property {number} [metrics.memoryUsage] - Memory usage percentage
 * @property {number} [metrics.cpuUsage] - CPU usage percentage
 */

/**
 * Rate limit information
 * @typedef {Object} RateLimitInfo
 * @property {number} limit - Maximum requests allowed
 * @property {number} remaining - Remaining requests
 * @property {Date} resetAt - When limit resets
 * @property {number} retryAfter - Seconds to wait before retry (if limited)
 */

/**
 * Validation error detail
 * @typedef {Object} ValidationError
 * @property {string} field - Field name with error
 * @property {string} message - Error message
 * @property {string} code - Error code (e.g., 'required', 'invalid_format', 'out_of_range')
 * @property {*} [value] - Invalid value provided
 * @property {Object} [constraints] - Validation constraints
 */

export {};

