/**
 * useDeltaSync Hook
 * 
 * React hook for easy delta sync integration
 */

import { useEffect, useCallback } from 'react';
import deltaSyncService from '../services/deltaSyncService';

/**
 * Hook to track changes and sync with delta sync service
 * @param {string} dataType - Type of data (attendance, grievance, etc.)
 * @param {boolean} autoSync - Whether to auto-sync on changes
 * @returns {Object} Sync functions
 */
export function useDeltaSync(dataType, autoSync = false) {
  
  /**
   * Track a change for syncing
   * @param {Object} data - Data to sync
   * @param {string} operation - Operation type (create, update, delete)
   */
  const trackChange = useCallback((data, operation = 'create') => {
    const changeId = deltaSyncService.addPendingChange(dataType, data, operation);
    
    // Auto-sync if enabled and threshold reached
    if (autoSync && deltaSyncService.shouldSync()) {
      syncNow();
    }
    
    return changeId;
  }, [dataType, autoSync]);

  /**
   * Manually trigger sync
   */
  const syncNow = useCallback(async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://api.example.com';
    return await deltaSyncService.syncPendingChanges(apiUrl);
  }, []);

  /**
   * Get sync statistics
   */
  const getSyncStats = useCallback(() => {
    return deltaSyncService.getSyncStats();
  }, []);

  /**
   * Check if sync is needed
   */
  const needsSync = useCallback(() => {
    return deltaSyncService.shouldSync();
  }, []);

  return {
    trackChange,
    syncNow,
    getSyncStats,
    needsSync
  };
}

export default useDeltaSync;
