/**
 * User Type Definitions for Shramik-Setu
 * 
 * Note: Using JSDoc for type hints in JavaScript
 */

/**
 * @typedef {'hi' | 'en' | 'ta' | 'te' | 'bn' | 'mr' | 'gu'} LanguageCode
 * Language codes: Hindi, English, Tamil, Telugu, Bengali, Marathi, Gujarati
 */

/**
 * @typedef {Object} DeviceInfo
 * @property {string} deviceId - Unique device identifier
 * @property {string} platform - Device platform (web, android, ios)
 * @property {string} userAgent - Browser user agent
 * @property {string} [appVersion] - App version
 */

/**
 * @typedef {Object} NotificationSettings
 * @property {boolean} jobAlerts - Receive job posting notifications
 * @property {boolean} paymentAlerts - Receive payment notifications
 * @property {boolean} attendanceReminders - Receive attendance reminders
 * @property {boolean} grievanceUpdates - Receive grievance status updates
 * @property {boolean} pushEnabled - Enable push notifications
 * @property {boolean} smsEnabled - Enable SMS notifications
 */

/**
 * @typedef {Object} User
 * @property {string} userId - Unique user identifier
 * @property {string} mobileNumber - User's mobile number
 * @property {'worker' | 'contractor'} role - User role
 * @property {LanguageCode} preferredLanguage - Preferred language
 * @property {number} createdAt - Account creation timestamp
 * @property {number} lastLoginAt - Last login timestamp
 * @property {boolean} isVerified - Whether user is verified
 * @property {DeviceInfo} deviceInfo - Device information
 */

/**
 * @typedef {Object} WorkerPreferences
 * @property {number} maxTravelDistance - Maximum travel distance in km
 * @property {number} minWageRate - Minimum acceptable wage rate
 * @property {string[]} preferredJobTypes - Preferred job types
 * @property {NotificationSettings} notificationSettings - Notification preferences
 */

/**
 * @typedef {Object} TrustProfile
 * @property {string} userId - User identifier
 * @property {'bronze' | 'silver' | 'gold' | 'platinum'} trustTier - Trust tier level
 * @property {number} averageRating - Average rating (0-5)
 * @property {number} totalRatings - Total number of ratings received
 * @property {Object} ratingBreakdown - Rating distribution
 * @property {number} ratingBreakdown.5 - Number of 5-star ratings
 * @property {number} ratingBreakdown.4 - Number of 4-star ratings
 * @property {number} ratingBreakdown.3 - Number of 3-star ratings
 * @property {number} ratingBreakdown.2 - Number of 2-star ratings
 * @property {number} ratingBreakdown.1 - Number of 1-star ratings
 * @property {Array} recentRatings - Recent ratings (last 5)
 * @property {string[]} badges - Earned badges
 * @property {number} joinedAt - Account creation timestamp
 * @property {number} [lastRatingAt] - Last rating received timestamp
 */

/**
 * @typedef {User & {
 *   role: 'worker',
 *   eShramCardNumber: string,
 *   name: string,
 *   skills: string[],
 *   location: import('./job.js').Location,
 *   trustProfile: TrustProfile,
 *   preferences: WorkerPreferences
 * }} WorkerProfile
 */

/**
 * @typedef {User & {
 *   role: 'contractor',
 *   businessName: string,
 *   gstNumber?: string,
 *   location: import('./job.js').Location,
 *   trustProfile: TrustProfile,
 *   verificationDocuments: string[]
 * }} ContractorProfile
 */

// Export empty object for module system
export {};
