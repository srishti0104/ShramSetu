/**
 * @fileoverview Voice assistant and conversational AI type definitions
 */

/**
 * Intent type enumeration
 * @typedef {'search_jobs' | 'apply_job' | 'check_application' | 'record_payment' | 'view_ledger' | 'mark_attendance' | 'submit_rating' | 'file_grievance' | 'check_profile' | 'help' | 'unknown'} IntentType
 */

/**
 * Language code enumeration (extends from user.js)
 * @typedef {'hi' | 'en' | 'mr' | 'gu' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'pa'} LanguageCode
 */

/**
 * Voice command processing status enumeration
 * @typedef {'processing' | 'completed' | 'failed' | 'requires_clarification'} CommandStatus
 */

/**
 * Conversation state enumeration
 * @typedef {'idle' | 'listening' | 'processing' | 'responding' | 'waiting_for_input' | 'completed' | 'error'} ConversationState
 */

/**
 * Voice command from user
 * @typedef {Object} VoiceCommand
 * @property {string} commandId - Unique command identifier (UUID)
 * @property {string} userId - User ID
 * @property {string} sessionId - Conversation session ID
 * @property {string} audioUrl - S3 URL of audio recording
 * @property {number} audioDuration - Audio duration in seconds
 * @property {LanguageCode} languageCode - Language of audio
 * @property {string} [transcription] - Transcribed text
 * @property {number} [transcriptionConfidence] - Transcription confidence (0-1)
 * @property {IntentType} [intent] - Detected intent
 * @property {number} [intentConfidence] - Intent confidence (0-1)
 * @property {Object} [entities] - Extracted entities
 * @property {string} [entities.jobTitle] - Job title mentioned
 * @property {string} [entities.location] - Location mentioned
 * @property {number} [entities.amount] - Amount mentioned
 * @property {string} [entities.date] - Date mentioned
 * @property {string} [entities.personName] - Person name mentioned
 * @property {CommandStatus} status - Command processing status
 * @property {Date} recordedAt - Recording timestamp
 * @property {Date} [processedAt] - Processing completion timestamp
 * @property {string} [errorMessage] - Error message if failed
 * @property {Object} metadata - Additional command metadata
 * @property {string} [metadata.deviceType] - Device type (mobile, tablet, desktop)
 * @property {string} [metadata.appVersion] - App version
 * @property {boolean} [metadata.isOffline] - Whether recorded offline
 */

/**
 * Voice response to user
 * @typedef {Object} VoiceResponse
 * @property {string} responseId - Unique response identifier
 * @property {string} commandId - Associated command ID
 * @property {string} sessionId - Conversation session ID
 * @property {string} text - Response text
 * @property {LanguageCode} languageCode - Language of response
 * @property {string} [audioUrl] - S3 URL of synthesized audio (Polly)
 * @property {number} [audioDuration] - Audio duration in seconds
 * @property {IntentType} intent - Intent being responded to
 * @property {Object} [data] - Response data (e.g., job results, transaction details)
 * @property {boolean} requiresFollowUp - Whether follow-up is needed
 * @property {string[]} [suggestedActions] - Suggested next actions
 * @property {string[]} [quickReplies] - Quick reply options
 * @property {Date} generatedAt - Response generation timestamp
 * @property {Object} metadata - Additional response metadata
 * @property {boolean} metadata.isFallback - Whether this is a fallback response
 * @property {string} [metadata.fallbackReason] - Reason for fallback
 */

/**
 * Detected intent with confidence
 * @typedef {Object} Intent
 * @property {IntentType} type - Intent type
 * @property {number} confidence - Confidence score (0-1)
 * @property {Object} slots - Intent slots/parameters
 * @property {string} [slots.jobTitle] - Job title slot
 * @property {string} [slots.location] - Location slot
 * @property {string} [slots.amount] - Amount slot
 * @property {string} [slots.date] - Date slot
 * @property {string} [slots.personName] - Person name slot
 * @property {string} [slots.rating] - Rating slot
 * @property {string} [slots.category] - Category slot
 * @property {IntentType[]} alternativeIntents - Alternative intents with lower confidence
 * @property {boolean} isAmbiguous - Whether intent is ambiguous
 * @property {string} [clarificationNeeded] - What clarification is needed
 */

/**
 * Conversation context for multi-turn dialogue
 * @typedef {Object} ConversationContext
 * @property {string} sessionId - Unique session identifier
 * @property {string} userId - User ID
 * @property {LanguageCode} languageCode - Conversation language
 * @property {ConversationState} state - Current conversation state
 * @property {IntentType} [currentIntent] - Current intent being processed
 * @property {Object} contextData - Context data accumulated during conversation
 * @property {string} [contextData.jobId] - Job ID in context
 * @property {string} [contextData.contractorId] - Contractor ID in context
 * @property {string} [contextData.transactionId] - Transaction ID in context
 * @property {Object} [contextData.searchCriteria] - Search criteria in context
 * @property {Object} [contextData.partialData] - Partial data being collected
 * @property {string[]} conversationHistory - List of command IDs in this session
 * @property {number} turnCount - Number of turns in conversation
 * @property {Date} startedAt - Session start timestamp
 * @property {Date} lastActivityAt - Last activity timestamp
 * @property {Date} [expiresAt] - Session expiration timestamp
 * @property {Object} metadata - Additional session metadata
 * @property {string} [metadata.deviceId] - Device ID
 * @property {boolean} [metadata.isMultiStep] - Whether this is a multi-step workflow
 * @property {string} [metadata.workflowStep] - Current workflow step
 */

/**
 * Voice transcription result
 * @typedef {Object} TranscriptionResult
 * @property {string} transcriptionId - Unique transcription identifier
 * @property {string} audioUrl - S3 URL of audio
 * @property {string} text - Transcribed text
 * @property {number} confidence - Overall confidence (0-1)
 * @property {LanguageCode} detectedLanguage - Detected language
 * @property {Object[]} alternatives - Alternative transcriptions
 * @property {string} alternatives[].text - Alternative text
 * @property {number} alternatives[].confidence - Alternative confidence
 * @property {Object[]} words - Word-level transcription
 * @property {string} words[].word - Word text
 * @property {number} words[].startTime - Start time in seconds
 * @property {number} words[].endTime - End time in seconds
 * @property {number} words[].confidence - Word confidence
 * @property {Date} processedAt - Processing timestamp
 * @property {string} service - Transcription service used (e.g., 'amazon_transcribe')
 */

/**
 * Voice synthesis request
 * @typedef {Object} SynthesisRequest
 * @property {string} requestId - Unique request identifier
 * @property {string} text - Text to synthesize
 * @property {LanguageCode} languageCode - Target language
 * @property {string} [voiceId] - Specific voice ID (Polly voice)
 * @property {string} [engine] - Synthesis engine (standard, neural)
 * @property {number} [speakingRate] - Speaking rate (0.5-2.0)
 * @property {string} [outputFormat] - Audio format (mp3, ogg, pcm)
 */

/**
 * Voice synthesis result
 * @typedef {Object} SynthesisResult
 * @property {string} synthesisId - Unique synthesis identifier
 * @property {string} requestId - Associated request ID
 * @property {string} audioUrl - S3 URL of synthesized audio
 * @property {number} audioDuration - Audio duration in seconds
 * @property {number} audioSize - Audio file size in bytes
 * @property {LanguageCode} languageCode - Language of audio
 * @property {Date} synthesizedAt - Synthesis timestamp
 * @property {string} service - Synthesis service used (e.g., 'amazon_polly')
 */

/**
 * Fallback prompt for failed voice interaction
 * @typedef {Object} FallbackPrompt
 * @property {string} promptId - Unique prompt identifier
 * @property {string} commandId - Associated command ID
 * @property {string} reason - Reason for fallback
 * @property {string} message - Fallback message to display
 * @property {string[]} suggestedActions - Suggested actions for user
 * @property {boolean} allowRetry - Whether user can retry voice command
 * @property {boolean} showVisualAlternative - Whether to show visual alternative
 * @property {Date} triggeredAt - Fallback trigger timestamp
 */

/**
 * Voice command analytics
 * @typedef {Object} VoiceAnalytics
 * @property {string} userId - User ID
 * @property {Date} periodStart - Analytics period start
 * @property {Date} periodEnd - Analytics period end
 * @property {number} totalCommands - Total voice commands
 * @property {number} successfulCommands - Successful commands
 * @property {number} failedCommands - Failed commands
 * @property {number} averageConfidence - Average transcription confidence
 * @property {Object} intentDistribution - Commands by intent type
 * @property {Object} languageDistribution - Commands by language
 * @property {number} averageProcessingTime - Average processing time in seconds
 * @property {number} fallbackRate - Fallback rate percentage
 */

export {};

