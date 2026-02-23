/**
 * Offline Sync Component
 * 
 * @fileoverview Offline-first synchronization with AWS DynamoDB backend
 */

import { useState, useEffect } from 'react';
import './OfflineSync.css';
import deltaSyncService from '../../services/deltaSyncService';

/**
 * Offline Sync Component - Now powered by Delta Sync + DynamoDB
 */
export default function OfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStats, setSyncStats] = useState(null);
  const [dataUsage, setDataUsage] = useState(null);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming online
      if (deltaSyncService.shouldSync()) {
        handleSyncNow();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load initial data
    updateSyncData();

    // Update every 5 seconds
    const interval = setInterval(updateSyncData, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const updateSyncData = () => {
    const queue = deltaSyncService.getPendingChanges();
    const stats = deltaSyncService.getSyncStats();
    const usage = deltaSyncService.estimateDataUsage();
    
    setSyncQueue(queue);
    setSyncStats(stats);
    setDataUsage(usage);
    setLastSyncTime(stats.lastSyncTimestamp);
  };

  const handleSyncNow = async () => {
    if (!isOnline) {
      alert('Cannot sync while offline. Please check your internet connection.');
      return;
    }

    setIsSyncing(true);
    setLastSyncResult(null);

    try {
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

      console.log('🔄 Syncing to AWS DynamoDB...');
      
      const result = await deltaSyncService.syncPendingChanges(apiUrl, userId);
      
      setLastSyncResult(result);
      updateSyncData();

      if (result.success) {
        alert(`✅ Successfully synced ${result.synced} changes to AWS DynamoDB!`);
      } else {
        alert(`❌ Sync failed: ${result.error}`);
      }
    } catch (error) {
      setLastSyncResult({ success: false, error: error.message });
      alert(`❌ Sync error: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRemoveFromQueue = (changeId) => {
    if (confirm('Remove this item from sync queue? Changes will be lost.')) {
      const changes = deltaSyncService.getPendingChanges();
      const filtered = changes.filter(c => c.id !== changeId);
      localStorage.setItem('shram_setu_pending_changes', JSON.stringify(filtered));
      updateSyncData();
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all pending changes? This cannot be undone.')) {
      deltaSyncService.clearSyncData();
      updateSyncData();
    }
  };

  const handleAddDemoData = () => {
    // Add some demo changes
    deltaSyncService.addPendingChange('attendance', {
      workerId: 'W' + Math.floor(Math.random() * 1000),
      timestamp: Date.now(),
      location: 'Site ' + String.fromCharCode(65 + Math.floor(Math.random() * 5))
    }, 'create');
    
    deltaSyncService.addPendingChange('job_application', {
      jobId: 'JOB' + Math.floor(Math.random() * 100),
      workerId: 'W' + Math.floor(Math.random() * 1000),
      timestamp: Date.now()
    }, 'create');
    
    updateSyncData();
  };

  const pendingCount = syncQueue.length;
  const storageUsed = dataUsage ? parseFloat(dataUsage.kilobytes) : 0;
  const storageLimit = 51200; // 50 MB in KB
  const storagePercent = (storageUsed / storageLimit) * 100;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'job_application': return '📍';
      case 'attendance': return '📋';
      case 'rating': return '⭐';
      case 'transaction': return '💰';
      case 'grievance': return '🛡️';
      default: return '📄';
    }
  };

  if (!syncStats || !dataUsage) {
    return <div className="offline-sync">Loading...</div>;
  }

  return (
    <div className="offline-sync">
      <div className="offline-sync__header">
        <h2>📱 Offline Sync Manager</h2>
        <p>Delta sync with AWS DynamoDB backend</p>
      </div>

      {/* Connection Status */}
      <div className={`connection-status connection-status--${isOnline ? 'online' : 'offline'}`}>
        <div className="connection-status__icon">
          {isOnline ? '🟢' : '🔴'}
        </div>
        <div className="connection-status__content">
          <div className="connection-status__label">
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <div className="connection-status__description">
            {isOnline 
              ? 'Connected to internet. Data will sync to AWS DynamoDB.' 
              : 'No internet connection. Changes saved locally and will sync when online.'}
          </div>
        </div>
        {isOnline && (
          <button
            onClick={handleSyncNow}
            disabled={isSyncing || pendingCount === 0}
            className="connection-status__sync-btn"
          >
            {isSyncing ? '🔄 Syncing...' : '🔄 Sync Now'}
          </button>
        )}
      </div>

      {/* Sync Result */}
      {lastSyncResult && (
        <div className={`sync-result sync-result--${lastSyncResult.success ? 'success' : 'error'}`}>
          {lastSyncResult.success ? (
            <>✅ Successfully synced {lastSyncResult.synced} changes to AWS DynamoDB!</>
          ) : (
            <>❌ Sync failed: {lastSyncResult.error}</>
          )}
        </div>
      )}

      {/* Sync Statistics */}
      <div className="offline-sync__stats">
        <div className="stat-box">
          <div className="stat-box__icon">⏳</div>
          <div className="stat-box__value">{pendingCount}</div>
          <div className="stat-box__label">Pending</div>
        </div>

        <div className="stat-box">
          <div className="stat-box__icon">🕐</div>
          <div className="stat-box__value">{formatTimestamp(lastSyncTime)}</div>
          <div className="stat-box__label">Last Sync</div>
        </div>

        <div className="stat-box">
          <div className="stat-box__icon">💾</div>
          <div className="stat-box__value">{dataUsage.kilobytes} KB</div>
          <div className="stat-box__label">Data to Sync</div>
        </div>

        <div className="stat-box">
          <div className="stat-box__icon">☁️</div>
          <div className="stat-box__value">DynamoDB</div>
          <div className="stat-box__label">Backend</div>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="offline-sync__storage">
        <h3>💾 Local Storage Usage</h3>
        <div className="storage-bar">
          <div 
            className="storage-bar__fill"
            style={{ width: `${Math.min(storagePercent, 100)}%` }}
          />
        </div>
        <div className="storage-info">
          <span>{storageUsed.toFixed(2)} KB used</span>
          <span>{storageLimit} KB limit</span>
        </div>
      </div>

      {/* Sync Queue */}
      <div className="offline-sync__queue">
        <div className="offline-sync__queue-header">
          <h3>📋 Sync Queue ({syncQueue.length} items)</h3>
          <div className="offline-sync__queue-actions">
            <button onClick={handleAddDemoData} className="btn-secondary">
              ➕ Add Demo Data
            </button>
            {syncQueue.length > 0 && (
              <button onClick={handleClearAll} className="btn-danger">
                🗑️ Clear All
              </button>
            )}
          </div>
        </div>
        
        {syncQueue.length === 0 ? (
          <div className="offline-sync__empty">
            <p>✅ No items in sync queue</p>
            <p>All changes are synced to AWS DynamoDB!</p>
            <button onClick={handleAddDemoData} className="btn-primary">
              Add Demo Data to Test
            </button>
          </div>
        ) : (
          <div className="queue-list">
            {syncQueue.map(item => (
              <div key={item.id} className="queue-item">
                <div className="queue-item__icon">
                  {getTypeIcon(item.type)}
                </div>
                <div className="queue-item__content">
                  <div className="queue-item__type">{item.type.replace('_', ' ')}</div>
                  <div className="queue-item__action">{item.operation}</div>
                  <div className="queue-item__time">{formatTimestamp(item.timestamp)}</div>
                  <div className="queue-item__id">{item.id}</div>
                </div>
                <div className="queue-item__status queue-item__status--pending">
                  ⏳ pending
                </div>
                <div className="queue-item__actions">
                  <button
                    onClick={() => handleRemoveFromQueue(item.id)}
                    className="queue-item__btn queue-item__btn--remove"
                    title="Remove from queue"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Notice */}
      <div className="offline-sync__info-notice">
        <h4>🚀 Delta Sync Features:</h4>
        <ul>
          <li>✅ Only syncs changed data (80-95% data savings)</li>
          <li>✅ Stores in AWS DynamoDB for persistence</li>
          <li>✅ Works offline - queues changes locally</li>
          <li>✅ Auto-syncs when coming online</li>
          <li>✅ Perfect for limited data plans</li>
        </ul>
      </div>
    </div>
  );
}

