/**
 * Delta Sync Service
 * 
 * Implements efficient data synchronization for low-bandwidth scenarios
 * Only syncs changed data to minimize data usage for blue-collar workers
 */

class DeltaSyncService {
  constructor() {
    this.storageKey = 'shram_setu_sync_state';
    this.lastSyncKey = 'shram_setu_last_sync';
    this.pendingChangesKey = 'shram_setu_pending_changes';
  }

  /**
   * Get last sync timestamp
   * @returns {number} Timestamp of last sync
   */
  getLastSyncTime() {
    const lastSync = localStorage.getItem(this.lastSyncKey);
    return lastSync ? parseInt(lastSync) : 0;
  }

  /**
   * Set last sync timestamp
   * @param {number} timestamp - Sync timestamp
   */
  setLastSyncTime(timestamp) {
    localStorage.setItem(this.lastSyncKey, timestamp.toString());
  }

  /**
   * Get pending changes that need to be synced
   * @returns {Array} Array of pending changes
   */
  getPendingChanges() {
    const pending = localStorage.getItem(this.pendingChangesKey);
    return pending ? JSON.parse(pending) : [];
  }

  /**
   * Add a change to pending sync queue
   * @param {string} type - Type of change (attendance, grievance, job_application, etc.)
   * @param {Object} data - Change data
   * @param {string} operation - Operation type (create, update, delete)
   */
  addPendingChange(type, data, operation = 'create') {
    const changes = this.getPendingChanges();
    
    // Generate truly unique ID with timestamp, random string, and counter
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const counter = changes.length;
    const uniqueId = `${type}_${timestamp}_${random}_${counter}`;
    
    const change = {
      id: uniqueId,
      type,
      operation,
      data,
      timestamp,
      synced: false
    };

    changes.push(change);
    localStorage.setItem(this.pendingChangesKey, JSON.stringify(changes));
    
    console.log('📝 Added pending change:', change.id);
    return change.id;
  }

  /**
   * Mark changes as synced
   * @param {Array<string>} changeIds - IDs of changes to mark as synced
   */
  markChangesSynced(changeIds) {
    let changes = this.getPendingChanges();
    
    // Remove synced changes
    changes = changes.filter(change => !changeIds.includes(change.id));
    
    localStorage.setItem(this.pendingChangesKey, JSON.stringify(changes));
    console.log('✅ Marked changes as synced:', changeIds.length);
  }

  /**
   * Sync pending changes to server
   * @param {string} apiUrl - API endpoint URL
   * @param {string} userId - User ID (optional, defaults to 'anonymous')
   * @returns {Promise<Object>} Sync result
   */
  async syncPendingChanges(apiUrl, userId = 'anonymous') {
    const changes = this.getPendingChanges();
    
    if (changes.length === 0) {
      console.log('✅ No pending changes to sync');
      return { success: true, synced: 0 };
    }

    console.log(`🔄 Syncing ${changes.length} pending changes...`);

    try {
      // Send only the changes (delta)
      const response = await fetch(`${apiUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          changes,
          userId,
          lastSync: this.getLastSyncTime()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sync failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      // Mark changes as synced
      const syncedIds = changes.map(c => c.id);
      this.markChangesSynced(syncedIds);

      // Update last sync time
      this.setLastSyncTime(Date.now());

      console.log('✅ Sync completed:', result);
      return { success: true, synced: changes.length, result };

    } catch (error) {
      console.error('❌ Sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Pull changes from server (only new/updated data since last sync)
   * @param {string} apiUrl - API endpoint URL
   * @returns {Promise<Object>} Server changes
   */
  async pullChanges(apiUrl) {
    const lastSync = this.getLastSyncTime();
    
    console.log(`⬇️ Pulling changes since ${new Date(lastSync).toLocaleString()}...`);

    try {
      // Request only changes since last sync
      const response = await fetch(`${apiUrl}/changes?since=${lastSync}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Pull failed: ${response.status}`);
      }

      const result = await response.json();

      console.log(`✅ Pulled ${result.changes?.length || 0} changes from server`);
      return { success: true, changes: result.changes || [] };

    } catch (error) {
      console.error('❌ Pull failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Full sync: Push pending changes and pull server changes
   * @param {string} apiUrl - API endpoint URL
   * @returns {Promise<Object>} Sync result
   */
  async fullSync(apiUrl) {
    console.log('🔄 Starting full delta sync...');

    // Push local changes first
    const pushResult = await this.syncPendingChanges(apiUrl);
    
    // Pull server changes
    const pullResult = await pullChanges(apiUrl);

    return {
      success: pushResult.success && pullResult.success,
      pushed: pushResult.synced || 0,
      pulled: pullResult.changes?.length || 0,
      timestamp: Date.now()
    };
  }

  /**
   * Get sync statistics
   * @returns {Object} Sync stats
   */
  getSyncStats() {
    const pendingChanges = this.getPendingChanges();
    const lastSync = this.getLastSyncTime();

    return {
      pendingChanges: pendingChanges.length,
      lastSync: lastSync ? new Date(lastSync).toLocaleString() : 'Never',
      lastSyncTimestamp: lastSync,
      timeSinceLastSync: lastSync ? Date.now() - lastSync : null
    };
  }

  /**
   * Clear all sync data (for testing/reset)
   */
  clearSyncData() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.lastSyncKey);
    localStorage.removeItem(this.pendingChangesKey);
    console.log('🗑️ Sync data cleared');
  }

  /**
   * Estimate data usage for pending changes
   * @returns {Object} Data usage estimate
   */
  estimateDataUsage() {
    const changes = this.getPendingChanges();
    const jsonString = JSON.stringify(changes);
    const bytes = new Blob([jsonString]).size;
    
    return {
      bytes,
      kilobytes: (bytes / 1024).toFixed(2),
      megabytes: (bytes / (1024 * 1024)).toFixed(2),
      changeCount: changes.length
    };
  }

  /**
   * Check if sync is needed (based on pending changes or time)
   * @param {number} maxPendingChanges - Max pending changes before sync
   * @param {number} maxTimeSinceSync - Max time since last sync (ms)
   * @returns {boolean} Whether sync is needed
   */
  shouldSync(maxPendingChanges = 10, maxTimeSinceSync = 3600000) {
    const stats = this.getSyncStats();
    
    // Sync if too many pending changes
    if (stats.pendingChanges >= maxPendingChanges) {
      return true;
    }

    // Sync if too much time has passed
    if (stats.timeSinceLastSync && stats.timeSinceLastSync >= maxTimeSinceSync) {
      return true;
    }

    return false;
  }
}

export default new DeltaSyncService();
