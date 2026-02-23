/**
 * @fileoverview Grievance and safety reporting type definitions for Suraksha module
 */

/**
 * Grievance category enumeration
 * @typedef {'wage_theft' | 'unsafe_conditions' | 'harassment' | 'discrimination' | 'contract_violation' | 'working_hours' | 'health_hazard' | 'other'} GrievanceCategory
 */

/**
 * Grievance severity enumeration
 * @typedef {'critical' | 'high' | 'medium' | 'low'} GrievanceSeverity
 */

/**
 * Grievance status enumeration
 * @typedef {'submitted' | 'under_review' | 'investigating' | 'escalated' | 'resolved' | 'closed' | 'rejected'} GrievanceStatus
 */

/**
 * Sentiment enumeration
 * @typedef {'positive' | 'neutral' | 'negative' | 'very_negative'} Sentiment
 */

/**
 * Escalation level enumeration
 * @typedef {'none' | 'ngo' | 'legal_aid' | 'labour_department' | 'police'} EscalationLevel
 */

/**
 * Grievance report submitted by worker
 * @typedef {Object} Grievance
 * @property {string} grievanceId - Unique grievance identifier (UUID)
 * @property {string} workerId - Worker's user ID (null if anonymous)
 * @property {boolean} isAnonymous - Whether report is anonymous
 * @property {string} [contractorId] - Contractor ID if grievance is against specific contractor
 * @property {string} [jobId] - Job ID if grievance is related to specific job
 * @property {GrievanceCategory} category - Grievance category
 * @property {GrievanceSeverity} severity - Severity level (auto-detected or manual)
 * @property {GrievanceStatus} status - Current status
 * @property {string} audioUrl - S3 URL of voice recording (encrypted)
 * @property {string} [transcription] - Transcribed text from audio
 * @property {string} description - Text description (from transcription or manual entry)
 * @property {Date} incidentDate - Date when incident occurred
 * @property {Object} [location] - Location of incident
 * @property {number} [location.latitude] - Latitude
 * @property {number} [location.longitude] - Longitude
 * @property {string} [location.address] - Address description
 * @property {string[]} keywords - Extracted keywords from NLP processing
 * @property {Sentiment} sentiment - Sentiment analysis result
 * @property {number} sentimentScore - Sentiment score (-1 to 1)
 * @property {EscalationLevel} escalationLevel - Current escalation level
 * @property {boolean} isAutoEscalated - Whether grievance was auto-escalated
 * @property {string[]} notifiedOrganizations - List of organizations notified (NGO IDs)
 * @property {Date} submittedAt - Submission timestamp
 * @property {Date} [reviewedAt] - Review timestamp
 * @property {Date} [resolvedAt] - Resolution timestamp
 * @property {string} [resolution] - Resolution description
 * @property {string} [reviewedBy] - User ID of reviewer
 * @property {Object} metadata - Additional metadata
 * @property {string} [metadata.languageCode] - Language of audio/text
 * @property {number} [metadata.audioDuration] - Audio duration in seconds
 * @property {string[]} [metadata.attachments] - Additional attachment URLs
 * @property {string} [metadata.contactMethod] - Preferred contact method if not anonymous
 * @property {Date} createdAt - Record creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * Grievance triage and NLP processing result
 * @typedef {Object} GrievanceTriage
 * @property {string} triageId - Unique triage identifier
 * @property {string} grievanceId - Associated grievance ID
 * @property {Date} processedAt - Processing timestamp
 * @property {Object} transcription - Transcription details
 * @property {string} transcription.text - Transcribed text
 * @property {number} transcription.confidence - Transcription confidence (0-1)
 * @property {string} transcription.languageCode - Detected language
 * @property {Object} nlpAnalysis - NLP analysis results
 * @property {string[]} nlpAnalysis.keywords - Extracted keywords
 * @property {Object[]} nlpAnalysis.entities - Named entities
 * @property {string} nlpAnalysis.entities[].text - Entity text
 * @property {string} nlpAnalysis.entities[].type - Entity type (PERSON, ORGANIZATION, LOCATION, etc.)
 * @property {number} nlpAnalysis.entities[].confidence - Entity confidence
 * @property {Object} nlpAnalysis.sentiment - Sentiment analysis
 * @property {Sentiment} nlpAnalysis.sentiment.label - Sentiment label
 * @property {number} nlpAnalysis.sentiment.score - Sentiment score
 * @property {Object} nlpAnalysis.sentiment.mixed - Mixed sentiment scores
 * @property {number} nlpAnalysis.sentiment.mixed.positive - Positive score
 * @property {number} nlpAnalysis.sentiment.mixed.negative - Negative score
 * @property {number} nlpAnalysis.sentiment.mixed.neutral - Neutral score
 * @property {Object} categoryClassification - Category classification results
 * @property {GrievanceCategory} categoryClassification.predicted - Predicted category
 * @property {number} categoryClassification.confidence - Classification confidence
 * @property {Object[]} categoryClassification.alternatives - Alternative categories
 * @property {GrievanceCategory} categoryClassification.alternatives[].category - Category
 * @property {number} categoryClassification.alternatives[].confidence - Confidence
 * @property {Object} severityDetection - Severity detection results
 * @property {GrievanceSeverity} severityDetection.level - Detected severity level
 * @property {string[]} severityDetection.indicators - Severity indicators found
 * @property {boolean} severityDetection.requiresImmediateAction - Immediate action flag
 * @property {Object} escalationRecommendation - Escalation recommendation
 * @property {EscalationLevel} escalationRecommendation.level - Recommended escalation level
 * @property {string} escalationRecommendation.reason - Reason for recommendation
 * @property {string[]} escalationRecommendation.suggestedOrganizations - Suggested organizations to notify
 * @property {boolean} isProcessingSuccessful - Whether processing was successful
 * @property {string} [errorMessage] - Error message if processing failed
 */

/**
 * Grievance update/action log
 * @typedef {Object} GrievanceAction
 * @property {string} actionId - Unique action identifier
 * @property {string} grievanceId - Associated grievance ID
 * @property {string} performedBy - User ID who performed action
 * @property {string} action - Action type (e.g., 'status_change', 'escalation', 'comment', 'resolution')
 * @property {GrievanceStatus} [previousStatus] - Previous status (for status changes)
 * @property {GrievanceStatus} [newStatus] - New status (for status changes)
 * @property {string} [comment] - Action comment/note
 * @property {Date} performedAt - Action timestamp
 * @property {Object} [metadata] - Additional action metadata
 */

/**
 * NGO/Organization details for grievance routing
 * @typedef {Object} SupportOrganization
 * @property {string} organizationId - Unique organization identifier
 * @property {string} name - Organization name
 * @property {string} type - Organization type (e.g., 'ngo', 'legal_aid', 'labour_union')
 * @property {GrievanceCategory[]} specializations - Categories they handle
 * @property {string[]} regions - Geographic regions they serve
 * @property {Object} contact - Contact information
 * @property {string} contact.email - Email address
 * @property {string} contact.phone - Phone number
 * @property {string} [contact.website] - Website URL
 * @property {boolean} isActive - Whether organization is active
 * @property {number} responseTimeHours - Average response time in hours
 */

/**
 * Grievance statistics for reporting
 * @typedef {Object} GrievanceStatistics
 * @property {Date} periodStart - Statistics period start
 * @property {Date} periodEnd - Statistics period end
 * @property {number} totalGrievances - Total grievances submitted
 * @property {number} anonymousGrievances - Number of anonymous reports
 * @property {Object} byCategory - Grievances by category
 * @property {Object} bySeverity - Grievances by severity
 * @property {Object} byStatus - Grievances by status
 * @property {number} escalatedCount - Number of escalated grievances
 * @property {number} resolvedCount - Number of resolved grievances
 * @property {number} averageResolutionTimeHours - Average resolution time
 * @property {string[]} topKeywords - Most common keywords
 */

export {};

