/**
 * @fileoverview Rating and trust tier system type definitions
 */

/**
 * Rating type enumeration
 * @typedef {'worker_to_contractor' | 'contractor_to_worker'} RatingType
 */

/**
 * Trust tier enumeration
 * @typedef {'bronze' | 'silver' | 'gold' | 'platinum' | 'unrated'} TrustTier
 */

/**
 * Rating aspect enumeration
 * @typedef {'professionalism' | 'punctuality' | 'quality' | 'communication' | 'safety' | 'payment_timeliness' | 'work_conditions'} RatingAspect
 */

/**
 * Rating submitted by worker or contractor
 * @typedef {Object} Rating
 * @property {string} ratingId - Unique rating identifier (UUID)
 * @property {RatingType} type - Type of rating
 * @property {string} raterId - User ID of person giving rating
 * @property {string} rateeId - User ID of person being rated
 * @property {string} jobId - Associated job ID
 * @property {number} overallScore - Overall rating score (1-5)
 * @property {Object} aspectScores - Scores for specific aspects
 * @property {number} [aspectScores.professionalism] - Professionalism score (1-5)
 * @property {number} [aspectScores.punctuality] - Punctuality score (1-5)
 * @property {number} [aspectScores.quality] - Work quality score (1-5)
 * @property {number} [aspectScores.communication] - Communication score (1-5)
 * @property {number} [aspectScores.safety] - Safety compliance score (1-5)
 * @property {number} [aspectScores.paymentTimeliness] - Payment timeliness score (1-5, for contractors)
 * @property {number} [aspectScores.workConditions] - Work conditions score (1-5, for contractors)
 * @property {string} [comment] - Optional text comment
 * @property {string[]} tags - Predefined tags (e.g., 'reliable', 'skilled', 'fair_pay')
 * @property {boolean} isVerified - Whether rating is from verified job completion
 * @property {Date} submittedAt - Rating submission timestamp
 * @property {boolean} isVisible - Whether rating is visible to public
 * @property {boolean} isFlagged - Whether rating is flagged for review
 * @property {string} [flagReason] - Reason for flagging
 * @property {Date} createdAt - Record creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * Detailed rating feedback
 * @typedef {Object} RatingFeedback
 * @property {string} feedbackId - Unique feedback identifier
 * @property {string} ratingId - Associated rating ID
 * @property {RatingAspect} aspect - Aspect being rated
 * @property {number} score - Score for this aspect (1-5)
 * @property {string} [comment] - Specific comment for this aspect
 * @property {Date} createdAt - Feedback creation timestamp
 */

/**
 * Trust profile for a user (worker or contractor)
 * @typedef {Object} TrustProfile
 * @property {string} userId - User ID
 * @property {TrustTier} tier - Current trust tier
 * @property {number} overallRating - Overall average rating (0-5)
 * @property {number} totalRatings - Total number of ratings received
 * @property {number} totalJobsCompleted - Total jobs completed
 * @property {Object} ratingDistribution - Distribution of ratings
 * @property {number} ratingDistribution.fiveStar - Number of 5-star ratings
 * @property {number} ratingDistribution.fourStar - Number of 4-star ratings
 * @property {number} ratingDistribution.threeStar - Number of 3-star ratings
 * @property {number} ratingDistribution.twoStar - Number of 2-star ratings
 * @property {number} ratingDistribution.oneStar - Number of 1-star ratings
 * @property {Object} aspectAverages - Average scores by aspect
 * @property {number} [aspectAverages.professionalism] - Average professionalism score
 * @property {number} [aspectAverages.punctuality] - Average punctuality score
 * @property {number} [aspectAverages.quality] - Average quality score
 * @property {number} [aspectAverages.communication] - Average communication score
 * @property {number} [aspectAverages.safety] - Average safety score
 * @property {number} [aspectAverages.paymentTimeliness] - Average payment timeliness score
 * @property {number} [aspectAverages.workConditions] - Average work conditions score
 * @property {string[]} topTags - Most common tags received
 * @property {string[]} badges - Earned badges (e.g., 'verified_professional', 'top_rated', 'safety_champion')
 * @property {Object} tierProgress - Progress towards next tier
 * @property {TrustTier} tierProgress.currentTier - Current tier
 * @property {TrustTier} [tierProgress.nextTier] - Next tier (null if platinum)
 * @property {number} tierProgress.currentPoints - Current tier points
 * @property {number} [tierProgress.pointsToNextTier] - Points needed for next tier
 * @property {string[]} tierProgress.requirements - Requirements for next tier
 * @property {Date} lastRatingReceived - Timestamp of last rating received
 * @property {Date} tierAchievedAt - When current tier was achieved
 * @property {Date} calculatedAt - When profile was last calculated
 * @property {Date} createdAt - Profile creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * Trust tier calculation parameters
 * @typedef {Object} TierCalculationParams
 * @property {number} totalRatings - Total ratings received
 * @property {number} averageRating - Average rating score
 * @property {number} jobsCompleted - Jobs completed
 * @property {number} monthsActive - Months active on platform
 * @property {number} responseRate - Response rate percentage
 * @property {number} completionRate - Job completion rate percentage
 * @property {boolean} hasVerifiedCredentials - Whether user has verified credentials
 * @property {number} grievancesAgainst - Number of grievances filed against user
 * @property {number} complianceScore - Compliance score (0-100)
 */

/**
 * Trust tier requirements
 * @typedef {Object} TierRequirements
 * @property {TrustTier} tier - Tier level
 * @property {number} minRatings - Minimum number of ratings required
 * @property {number} minAverageRating - Minimum average rating required
 * @property {number} minJobsCompleted - Minimum jobs completed required
 * @property {number} minMonthsActive - Minimum months active required
 * @property {number} minResponseRate - Minimum response rate percentage
 * @property {number} minCompletionRate - Minimum completion rate percentage
 * @property {boolean} requiresVerification - Whether verification is required
 * @property {number} maxGrievances - Maximum allowed grievances
 * @property {string[]} benefits - Benefits of this tier
 */

/**
 * Rating prompt notification
 * @typedef {Object} RatingPrompt
 * @property {string} promptId - Unique prompt identifier
 * @property {string} userId - User ID to prompt
 * @property {string} jobId - Job ID to rate
 * @property {string} otherUserId - User ID of person to rate
 * @property {RatingType} ratingType - Type of rating to submit
 * @property {Date} jobCompletedAt - When job was completed
 * @property {Date} promptSentAt - When prompt was sent
 * @property {Date} [ratingSubmittedAt] - When rating was submitted
 * @property {boolean} isCompleted - Whether rating has been submitted
 * @property {Date} expiresAt - When prompt expires
 */

/**
 * Rating statistics for reporting
 * @typedef {Object} RatingStatistics
 * @property {string} userId - User ID
 * @property {Date} periodStart - Statistics period start
 * @property {Date} periodEnd - Statistics period end
 * @property {number} ratingsReceived - Ratings received in period
 * @property {number} ratingsGiven - Ratings given in period
 * @property {number} averageReceived - Average rating received
 * @property {number} averageGiven - Average rating given
 * @property {Object} trendData - Rating trend over time
 * @property {Date[]} trendData.dates - Dates
 * @property {number[]} trendData.ratings - Ratings at each date
 */

export {};

