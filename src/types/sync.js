/**
 * @fileoverview Delta sync and offline-first architecture type definitions
 */

/**
 * Sync operation type enumeration
 * @typedef {'create' | 'update' | 'delete'} SyncOperationType
 */

/**
 * Sync operation status enumeration
 * @typedef {'pending' | 'in_progress' | 'completed' | 'failed' | 'conflict'} SyncOperationStatus
 */

/**
 * Entity type enumeration
 * @typedef {'job' | 'transaction' | 'attendance' | 'profile' | 'rating' | 'grievance' | 'application'} EntityType
 */

/**
 * Conflict resolution strategy enumeration
 * @typedef {'server_wins' | 'client_wins' | 'merge' | 'manual'} ConflictResolutionStrategy
 */

/**
 * Sync priority enumeration
 * @typedef {'high' | 'medium' | 'low'} SyncPriority
 */

/**
 * Sync operation queued for processing
 * @typedef {Object} SyncOperation
 * @property {string} operationId - Unique operation identifier (UUID)
 * @property {string} userId - User ID who initiated operation
 * @property {EntityType} entityType - Type of entity being synced
 * @property {string} entityId - ID of entity being synced
 * @property {SyncOperationType} operationType - Type of operation
 * @property {SyncOperationStatus} status - Current operation status
 * @property {SyncPriority} priority - Operation priority
 * @property {Object} data - Entity data to sync
 * @property {Object} [previousData] - Previous entity data (for updates)
 * @property {number} version - Entity version number
 * @property {Date} createdAt - Operation creation timestamp (client time)
 * @property {Date} [attemptedAt] - Last sync attempt timestamp
 * @property {number} attemptCount - Number of sync attempts
 * @property {number} maxRetries - Maximum retry attempts (default: 3)
 * @property {Date} [completedAt] - Sync completion timestamp
 * @property {Date} [failedAt] - Sync failure timestamp
 * @property {string} [errorMessage] - Error message if failed
 * @property {string} [conflictId] - Conflict ID if conflict detected
 * @property {Object} metadata - Additional operation metadata
 * @property {boolean} metadata.requiresNetwork - Whether operation requires network
 * @property {boolean} metadata.isUrgent - Whether operation is urgent
 * @property {string} [metadata.deviceId] - Device ID where operation originated
 */

/**
 * Sync conflict detected during synchronization
 * @typedef {Object} SyncConflict
 * @property {string} conflictId - Unique conflict identifier
 * @property {string} operationId - Associated sync operation ID
 * @property {EntityType} entityType - Type of entity in conflict
 * @property {string} entityId - ID of entity in conflict
 * @property {Object} clientData - Client version of data
 * @property {number} clientVersion - Client version number
 * @property {Date} clientTimestamp - Client modification timestamp
 * @property {Object} serverData - Server version of data
 * @property {number} serverVersion - Server version number
 * @property {Date} serverTimestamp - Server modification timestamp
 * @property {ConflictResolutionStrategy} suggestedStrategy - Suggested resolution strategy
 * @property {ConflictResolutionStrategy} [appliedStrategy] - Applied resolution strategy
 * @property {Object} [resolvedData] - Resolved data after conflict resolution
 * @property {string[]} conflictingFields - List of fields in conflict
 * @property {boolean} isResolved - Whether conflict is resolved
 * @property {Date} detectedAt - Conflict detection timestamp
 * @property {Date} [resolvedAt] - Conflict resolution timestamp
 * @property {string} [resolvedBy] - User ID who resolved conflict (for manual resolution)
 */

/**
 * Cached entity stored locally
 * @typedef {Object} CachedEntity
 * @property {string} cacheId - Unique cache identifier
 * @property {EntityType} entityType - Type of cached entity
 * @property {string} entityId - ID of cached entity
 * @property {Object} data - Cached entity data
 * @property {number} version - Entity version number
 * @property {Date} cachedAt - Cache timestamp
 * @property {Date} expiresAt - Cache expiration timestamp
 * @property {Date} lastAccessedAt - Last access timestamp
 * @property {number} accessCount - Number of times accessed
 * @property {number} sizeBytes - Size of cached data in bytes
 * @property {SyncPriority} priority - Cache priority for eviction
 * @property {boolean} isPinned - Whether cache entry is pinned (never evicted)
 * @property {Object} metadata - Additional cache metadata
 * @property {boolean} metadata.isStale - Whether cache is stale
 * @property {string} [metadata.etag] - ETag for cache validation
 */

/**
 * Sync status for the application
 * @typedef {Object} SyncStatus
 * @property {boolean} isOnline - Whether device is online
 * @property {boolean} isSyncing - Whether sync is in progress
 * @property {Date} [lastSyncAt] - Last successful sync timestamp
 * @property {Date} [nextSyncAt] - Next scheduled sync timestamp
 * @property {number} pendingOperations - Number of pending operations
 * @property {number} failedOperations - Number of failed operations
 * @property {number} conflictCount - Number of unresolved conflicts
 * @property {Object} operationsByType - Operations grouped by type
 * @property {number} operationsByType.create - Create operations
 * @property {number} operationsByType.update - Update operations
 * @property {number} operationsByType.delete - Delete operations
 * @property {Object} operationsByEntity - Operations grouped by entity type
 * @property {number} [operationsByEntity.job] - Job operations
 * @property {number} [operationsByEntity.transaction] - Transaction operations
 * @property {number} [operationsByEntity.attendance] - Attendance operations
 * @property {number} [operationsByEntity.profile] - Profile operations
 * @property {number} [operationsByEntity.rating] - Rating operations
 * @property {number} [operationsByEntity.grievance] - Grievance operations
 * @property {number} [operationsByEntity.application] - Application operations
 * @property {string} [errorMessage] - Last sync error message
 */

/**
 * Delta change for incremental sync
 * @typedef {Object} DeltaChange
 * @property {string} changeId - Unique change identifier
 * @property {EntityType} entityType - Type of entity changed
 * @property {string} entityId - ID of entity changed
 * @property {SyncOperationType} changeType - Type of change
 * @property {Object} delta - Delta/diff of changes
 * @property {number} version - New version number
 * @property {Date} timestamp - Change timestamp
 * @property {string} userId - User who made the change
 */

/**
 * Sync configuration
 * @typedef {Object} SyncConfig
 * @property {boolean} autoSync - Whether auto-sync is enabled
 * @property {number} syncIntervalMinutes - Sync interval in minutes (default: 15)
 * @property {number} maxRetries - Maximum retry attempts (default: 3)
 * @property {number} retryDelaySeconds - Delay between retries in seconds
 * @property {ConflictResolutionStrategy} defaultConflictStrategy - Default conflict resolution strategy
 * @property {boolean} syncOnReconnect - Whether to sync immediately on reconnect
 * @property {boolean} backgroundSync - Whether background sync is enabled
 * @property {EntityType[]} priorityEntities - Entity types to sync first
 * @property {number} maxCacheSizeMB - Maximum cache size in MB (default: 50)
 * @property {number} cacheExpirationHours - Cache expiration in hours
 */

/**
 * Storage quota information
 * @typedef {Object} StorageQuota
 * @property {number} totalBytes - Total storage quota in bytes
 * @property {number} usedBytes - Used storage in bytes
 * @property {number} availableBytes - Available storage in bytes
 * @property {number} usagePercentage - Usage percentage (0-100)
 * @property {boolean} isNearLimit - Whether storage is near limit (>80%)
 * @property {Object} byEntityType - Storage usage by entity type
 * @property {number} [byEntityType.job] - Job storage usage
 * @property {number} [byEntityType.transaction] - Transaction storage usage
 * @property {number} [byEntityType.attendance] - Attendance storage usage
 * @property {number} [byEntityType.profile] - Profile storage usage
 * @property {number} [byEntityType.rating] - Rating storage usage
 * @property {number} [byEntityType.grievance] - Grievance storage usage
 * @property {number} [byEntityType.cache] - Cache storage usage
 * @property {Date} calculatedAt - Calculation timestamp
 */

/**
 * Sync event for monitoring
 * @typedef {Object} SyncEvent
 * @property {string} eventId - Unique event identifier
 * @property {string} eventType - Event type (e.g., 'sync_started', 'sync_completed', 'conflict_detected')
 * @property {Date} timestamp - Event timestamp
 * @property {Object} [data] - Event-specific data
 * @property {string} [operationId] - Associated operation ID
 * @property {string} [conflictId] - Associated conflict ID
 */

export {};
