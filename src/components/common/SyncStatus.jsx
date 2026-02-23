/**
 * Sync Status Component
 * 
 * Displays delta sync status and data usage information
 */

import { useState, useEffect } from 'react';
import './SyncStatus.css';
import deltaSyncService from '../../services/deltaSyncService';

export default function SyncStatus() {
  const [syncStats, setSyncStats] = useState(null);
  const [dataUsage, setDataUsage] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Clear old demo data and add fresh demo data
    const demoVersion = localStorage.getItem('delta_sync_demo_version');
    if (demoVersion !== '2') {
      // Clear old data
      deltaSyncService.clearSyncData();
      
      // Add new demo pending changes with unique IDs
      deltaSyncService.addPendingChange('attendance', {
        workerId: 'W123',
        timestamp: Date.now(),
        location: 'Site A'
      }, 'create');
      
      deltaSyncService.addPendingChange('grievance', {
        id: 'GRV001',
        description: 'Demo grievance',
        timestamp: Date.now()
      }, 'create');
      
      localStorage.setItem('delta_sync_demo_version', '2');
    }
    
    updateStats();
    
    // Update stats every 10 seconds
    const interval = setInterval(updateStats, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    const stats = deltaSyncService.getSyncStats();
    const usage = deltaSyncService.estimateDataUsage();
    
    setSyncStats(stats);
    setDataUsage(usage);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setLastSyncResult(null);

    try {
      // Use real API endpoint from env
      const apiUrl = import.meta.env.VITE_SYNC_API_URL;
      
      if (!apiUrl) {
        throw new Error('Sync API URL not configured');
      }
      
      // Get or create user ID
      let userId = localStorage.getItem('shram_setu_user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('shram_setu_user_id', userId);
      }
      
      console.log('🔄 Syncing to:', apiUrl, 'User:', userId);
      
      const result = await deltaSyncService.syncPendingChanges(apiUrl, userId);
      
      setLastSyncResult(result);
      updateStats();
    } catch (error) {
      setLastSyncResult({ success: false, error: error.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatTimeSince = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (!syncStats) return null;

  return (
    <div className="sync-status">
      <div 
        className="sync-status__header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="sync-status__indicator">
          {syncStats.pendingChanges > 0 ? (
            <span className="sync-status__badge sync-status__badge--pending">
              {syncStats.pendingChanges}
            </span>
          ) : (
            <span className="sync-status__badge sync-status__badge--synced">✓</span>
          )}
        </div>
        
        <div className="sync-status__info">
          <div className="sync-status__title">
            {syncStats.pendingChanges > 0 ? 'Pending Sync' : 'All Synced'}
          </div>
          <div className="sync-status__subtitle">
            Last: {formatTimeSince(syncStats.lastSyncTimestamp)}
          </div>
        </div>

        <button
          className="sync-status__toggle"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="sync-status__details">
          {/* Data Usage */}
          <div className="sync-status__section">
            <h4>📊 Data Usage</h4>
            <div className="sync-status__metric">
              <span className="sync-status__label">Pending Data:</span>
              <span className="sync-status__value">
                {dataUsage.kilobytes} KB
              </span>
            </div>
            <div className="sync-status__metric">
              <span className="sync-status__label">Changes:</span>
              <span className="sync-status__value">
                {syncStats.pendingChanges}
              </span>
            </div>
          </div>

          {/* Sync Info */}
          <div className="sync-status__section">
            <h4>🔄 Sync Status</h4>
            <div className="sync-status__metric">
              <span className="sync-status__label">Last Sync:</span>
              <span className="sync-status__value">
                {syncStats.lastSync}
              </span>
            </div>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing || syncStats.pendingChanges === 0}
            className="sync-status__sync-btn"
          >
            {isSyncing ? (
              <>
                <span className="sync-status__spinner"></span>
                Syncing...
              </>
            ) : (
              <>
                🔄 Sync Now
                {syncStats.pendingChanges > 0 && (
                  <span className="sync-status__count">
                    ({syncStats.pendingChanges})
                  </span>
                )}
              </>
            )}
          </button>

          {/* Clear Button */}
          <button
            onClick={() => {
              if (confirm('Clear all sync data and reset?')) {
                deltaSyncService.clearSyncData();
                localStorage.removeItem('delta_sync_demo_version');
                localStorage.removeItem('shram_setu_user_id');
                window.location.reload();
              }
            }}
            className="sync-status__clear-btn"
          >
            🗑️ Clear & Reset
          </button>

          {/* Sync Result */}
          {lastSyncResult && (
            <div className={`sync-status__result sync-status__result--${lastSyncResult.success ? 'success' : 'error'}`}>
              {lastSyncResult.success ? (
                <>✅ Synced {lastSyncResult.synced} changes</>
              ) : (
                <>❌ Sync failed: {lastSyncResult.error}</>
              )}
            </div>
          )}

          {/* Data Saving Tip */}
          <div className="sync-status__tip">
            💡 <strong>Data Saving:</strong> Only changed data is synced to minimize data usage.
          </div>
        </div>
      )}
    </div>
  );
}
