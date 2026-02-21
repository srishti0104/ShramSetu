/**
 * Offline Sync Component
 * 
 * @fileoverview Offline-first synchronization status and management
 */

import { useState, useEffect } from 'react';
import './OfflineSync.css';

// Mock sync queue data
const MOCK_SYNC_QUEUE = [
  {
    id: 'sync_001',
    type: 'job_application',
    action: 'create',
    data: { jobId: 'job_003', workerId: 'worker_456' },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'pending',
    retries: 0
  },
  {
    id: 'sync_002',
    type: 'attendance',
    action: 'mark',
    data: { sessionId: 'session_123', totpCode: '4582' },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: 'pending',
    retries: 1
  },
  {
    id: 'sync_003',
    type: 'rating',
    action: 'submit',
    data: { jobId: 'job_789', rating: 4.5 },
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    status: 'synced',
    retries: 0
  }
];

// Mock cached data
const MOCK_CACHED_DATA = {
  jobs: { count: 15, size: '245 KB', lastUpdated: new Date(Date.now() - 86400000).toISOString() },
  transactions: { count: 8, size: '128 KB', lastUpdated: new Date(Date.now() - 172800000).toISOString() },
  attendance: { count: 12, size: '89 KB', lastUpdated: new Date(Date.now() - 259200000).toISOString() },
  profiles: { count: 3, size: '45 KB', lastUpdated: new Date(Date.now() - 345600000).toISOString() }
};

/**
 * Offline Sync Component
 */
export default function OfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState(MOCK_SYNC_QUEUE);
  const [cachedData, setCachedData] = useState(MOCK_CACHED_DATA);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date(Date.now() - 3600000));
  const [storageUsed, setStorageUsed] = useState(507); // KB
  const [storageLimit] = useState(51200); // 50 MB in KB

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSyncNow = async () => {
    if (!isOnline) {
      alert('Cannot sync while offline. Please check your internet connection.');
      return;
    }

    setIsSyncing(true);

    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update sync queue - mark pending items as synced
    setSyncQueue(prev => prev.map(item => 
      item.status === 'pending' ? { ...item, status: 'synced' } : item
    ));

    setLastSyncTime(new Date());
    setIsSyncing(false);
  };

  const handleClearCache = async (cacheType) => {
    if (confirm(`Are you sure you want to clear ${cacheType} cache? This will remove offline data.`)) {
      setCachedData(prev => ({
        ...prev,
        [cacheType]: { count: 0, size: '0 KB', lastUpdated: new Date().toISOString() }
      }));
      
      // Recalculate storage
      const newStorage = Object.values(cachedData)
        .filter(cache => cache !== cachedData[cacheType])
        .reduce((sum, cache) => sum + parseInt(cache.size), 0);
      setStorageUsed(newStorage);
    }
  };

  const handleRetrySync = async (itemId) => {
    if (!isOnline) {
      alert('Cannot retry while offline.');
      return;
    }

    setSyncQueue(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: 'syncing', retries: item.retries + 1 } : item
    ));

    await new Promise(resolve => setTimeout(resolve, 1500));

    setSyncQueue(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: 'synced' } : item
    ));
  };

  const handleRemoveFromQueue = (itemId) => {
    if (confirm('Remove this item from sync queue? Changes will be lost.')) {
      setSyncQueue(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const pendingCount = syncQueue.filter(item => item.status === 'pending').length;
  const storagePercent = (storageUsed / storageLimit) * 100;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'synced': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'syncing': return '#2196f3';
      case 'failed': return '#f44336';
      default: return '#999';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'synced': return '✓';
      case 'pending': return '⏳';
      case 'syncing': return '🔄';
      case 'failed': return '✗';
      default: return '?';
    }
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

  return (
    <div className="offline-sync">
      <div className="offline-sync__header">
        <h2>📱 Offline Sync Manager</h2>
        <p>Manage offline data and synchronization</p>
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
              ? 'Connected to internet. Data will sync automatically.' 
              : 'No internet connection. Changes will be saved locally and synced when online.'}
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

      {/* Sync Statistics */}
      <div className="offline-sync__stats">
        <div className="stat-box">
          <div className="stat-box__icon">⏳</div>
          <div className="stat-box__value">{pendingCount}</div>
          <div className="stat-box__label">Pending</div>
        </div>

        <div className="stat-box">
          <div className="stat-box__icon">✓</div>
          <div className="stat-box__value">
            {syncQueue.filter(item => item.status === 'synced').length}
          </div>
          <div className="stat-box__label">Synced</div>
        </div>

        <div className="stat-box">
          <div className="stat-box__icon">🕐</div>
          <div className="stat-box__value">{formatTimestamp(lastSyncTime)}</div>
          <div className="stat-box__label">Last Sync</div>
        </div>

        <div className="stat-box">
          <div className="stat-box__icon">💾</div>
          <div className="stat-box__value">{storageUsed} KB</div>
          <div className="stat-box__label">Storage Used</div>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="offline-sync__storage">
        <h3>💾 Storage Usage</h3>
        <div className="storage-bar">
          <div 
            className="storage-bar__fill"
            style={{ width: `${storagePercent}%` }}
          />
        </div>
        <div className="storage-info">
          <span>{storageUsed} KB used</span>
          <span>{storageLimit} KB total</span>
        </div>
      </div>

      {/* Sync Queue */}
      <div className="offline-sync__queue">
        <h3>📋 Sync Queue ({syncQueue.length} items)</h3>
        
        {syncQueue.length === 0 ? (
          <div className="offline-sync__empty">
            <p>No items in sync queue</p>
            <p>All changes are synced!</p>
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
                  <div className="queue-item__action">{item.action}</div>
                  <div className="queue-item__time">{formatTimestamp(item.timestamp)}</div>
                  {item.retries > 0 && (
                    <div className="queue-item__retries">Retries: {item.retries}</div>
                  )}
                </div>
                <div 
                  className="queue-item__status"
                  style={{ backgroundColor: getStatusColor(item.status) }}
                >
                  {getStatusIcon(item.status)} {item.status}
                </div>
                <div className="queue-item__actions">
                  {item.status === 'pending' && isOnline && (
                    <button
                      onClick={() => handleRetrySync(item.id)}
                      className="queue-item__btn queue-item__btn--retry"
                      title="Retry sync"
                    >
                      🔄
                    </button>
                  )}
                  {item.status !== 'syncing' && (
                    <button
                      onClick={() => handleRemoveFromQueue(item.id)}
                      className="queue-item__btn queue-item__btn--remove"
                      title="Remove from queue"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cached Data */}
      <div className="offline-sync__cache">
        <h3>📦 Cached Data</h3>
        <div className="cache-grid">
          {Object.entries(cachedData).map(([key, data]) => (
            <div key={key} className="cache-card">
              <div className="cache-card__header">
                <h4>{key}</h4>
                <button
                  onClick={() => handleClearCache(key)}
                  className="cache-card__clear-btn"
                  title="Clear cache"
                >
                  🗑️
                </button>
              </div>
              <div className="cache-card__stats">
                <div className="cache-card__stat">
                  <span className="cache-card__label">Items:</span>
                  <span className="cache-card__value">{data.count}</span>
                </div>
                <div className="cache-card__stat">
                  <span className="cache-card__label">Size:</span>
                  <span className="cache-card__value">{data.size}</span>
                </div>
                <div className="cache-card__stat">
                  <span className="cache-card__label">Updated:</span>
                  <span className="cache-card__value">{formatTimestamp(data.lastUpdated)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Notice */}
      <div className="offline-sync__demo-notice">
        <p>💡 <strong>Demo Mode:</strong> This is a mock offline sync system. In production, it will use IndexedDB for local storage, Service Workers for background sync, and implement conflict resolution strategies.</p>
      </div>
    </div>
  );
}
