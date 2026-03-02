/**
 * Role Manager Utility
 * 
 * @fileoverview Manages user role persistence, validation, and feature access control
 */

// Storage keys
const ROLE_STORAGE_KEY = 'user_role';

// Valid role values
const VALID_ROLES = ['worker', 'employer'];

// Feature access map - defines which features each role can access
export const FEATURE_ACCESS = {
  worker: [
    'home',
    'voice',
    'jobs',           // Job Search
    'attendance',     // TOTP Input
    'attendance-log',
    'ledger',
    'payslip',
    'grievance',
    'rating',
    'sync',
    'ai-assistant'
  ],
  employer: [
    'home',
    'voice',
    'talent-search',  // Talent Search (replaces jobs)
    'session-start',  // TOTP Creation
    'totp-display',
    'ledger',
    'grievance',
    'rating',
    'sync',
    'ai-assistant'
  ]
};

/**
 * Save user role to localStorage
 * @param {string} role - User role ('worker' or 'employer')
 * @throws {Error} If role is invalid
 */
export function saveRole(role) {
  if (!isValidRole(role)) {
    throw new Error(`Invalid role: ${role}. Must be 'worker' or 'employer'`);
  }
  
  try {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
  } catch (error) {
    console.error('Failed to save role to localStorage:', error);
    throw error;
  }
}

/**
 * Retrieve user role from localStorage
 * @returns {string|null} User role or null if not found
 */
export function getRole() {
  try {
    const role = localStorage.getItem(ROLE_STORAGE_KEY);
    return role;
  } catch (error) {
    console.error('Failed to retrieve role from localStorage:', error);
    return null;
  }
}

/**
 * Validate if a role value is valid
 * @param {string} role - Role value to validate
 * @returns {boolean} True if role is valid
 */
export function isValidRole(role) {
  return VALID_ROLES.includes(role);
}

/**
 * Clear user role from localStorage
 */
export function clearRole() {
  try {
    localStorage.removeItem(ROLE_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear role from localStorage:', error);
  }
}

/**
 * Check if a role has access to a specific feature
 * @param {string} role - User role ('worker' or 'employer')
 * @param {string} feature - Feature ID to check
 * @returns {boolean} True if role has access to feature
 */
export function hasFeatureAccess(role, feature) {
  if (!isValidRole(role)) {
    return false;
  }
  
  const allowedFeatures = FEATURE_ACCESS[role];
  return allowedFeatures.includes(feature);
}

/**
 * Get all features accessible by a role
 * @param {string} role - User role ('worker' or 'employer')
 * @returns {string[]} Array of feature IDs
 */
export function getRoleFeatures(role) {
  if (!isValidRole(role)) {
    return [];
  }
  
  return FEATURE_ACCESS[role];
}
