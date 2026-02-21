/**
 * Job Type Definitions for Shram-Setu
 * 
 * Note: Using JSDoc for type hints in JavaScript
 */

/**
 * @typedef {Object} Location
 * @property {number} latitude - Latitude coordinate
 * @property {number} longitude - Longitude coordinate
 * @property {string} [address] - Full address
 * @property {string} city - City name
 * @property {string} state - State name
 * @property {string} pincode - Postal code
 */

/**
 * @typedef {Object} Job
 * @property {string} jobId - Unique job identifier
 * @property {string} contractorId - Contractor who posted the job
 * @property {string} title - Job title
 * @property {string} description - Job description
 * @property {Location} location - Job location
 * @property {number} wageRate - Wage rate amount
 * @property {'hourly' | 'daily' | 'piece_rate' | 'contract'} wageType - Type of wage calculation
 * @property {string} duration - Expected duration (e.g., "1 day", "1 week")
 * @property {string[]} skillsRequired - Required skills
 * @property {number} workersNeeded - Number of workers needed
 * @property {number} workersHired - Number of workers already hired
 * @property {string} startDate - Job start date (ISO string)
 * @property {string} [endDate] - Job end date (ISO string)
 * @property {'open' | 'in_progress' | 'completed' | 'cancelled'} status - Job status
 * @property {number} postedAt - Job posting timestamp
 * @property {JobApplication[]} applications - Job applications
 */

/**
 * @typedef {Object} JobApplication
 * @property {string} applicationId - Unique application identifier
 * @property {string} jobId - Job identifier
 * @property {string} workerId - Worker identifier
 * @property {number} appliedAt - Application timestamp
 * @property {'pending' | 'accepted' | 'rejected' | 'withdrawn'} status - Application status
 * @property {number} distance - Distance from worker to job (km)
 * @property {number} matchScore - Match score (0-100)
 */

/**
 * @typedef {Object} JobMatch
 * @property {Job} job - Job details
 * @property {number} distance - Distance from worker to job (km)
 * @property {number} travelTime - Estimated travel time (minutes)
 * @property {number} matchScore - Match score (0-100)
 * @property {import('./user.js').ContractorProfile} contractor - Contractor profile
 */

/**
 * @typedef {Object} JobSearchCriteria
 * @property {string} workerId - Worker identifier
 * @property {Location} workerLocation - Worker's current location
 * @property {string[]} skills - Worker's skills
 * @property {number} [maxDistance] - Maximum distance in km
 * @property {number} [minWage] - Minimum wage rate
 */

// Export empty object for module system
export {};

