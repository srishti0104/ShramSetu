# Delta Sync for Low Data Usage

## Overview

Delta Sync is a data-efficient synchronization system designed specifically for blue-collar workers who often have limited data plans. Instead of syncing entire datasets, it only syncs **changed data** (deltas), dramatically reducing bandwidth usage.

## Key Features

### 1. **Minimal Data Usage**
- Only syncs changes, not full datasets
- Tracks modifications locally
- Batches changes for efficient transmission
- Typical savings: **80-95% less data** compared to full sync

### 2. **Offline-First**
- Works offline by default
- Queues changes locally
- Syncs when connection is available
- No data loss during offline periods

### 3. **Smart Sync Triggers**
- Auto-sync after N pending changes
- Time-based sync intervals
- Manual sync on demand
- Configurable thresholds

### 4. **Real-Time Monitoring**
- Visual sync status indicator
- Pending changes counter
- Data usage estimates
- Last sync timestamp

## Architecture

```
┌─────────────────┐
│   User Action   │
│  (Attendance,   │
│  Grievance,etc) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Track Change   │
│  (Local Queue)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Should Sync?   │
│  (Threshold)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Delta Sync    │
│  (Only Changes) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Server    │
│  (Process Δ)    │
└─────────────────┘
```

## Usage

### Basic Integration

```javascript
import { useDeltaSync } from '../hooks/useDeltaSync';

function MyComponent() {
  const { trackChange, syncNow } = useDeltaSync('attendance');
  
  const markAttendance = async (data) => {
    // Save locally
    await saveLocally(data);
    
    // Track for sync
    trackChange(data, 'create');
  };
  
  return (
    <button onClick={syncNow}>
      Sync Now
    </button>
  );
}
```

### Manual Sync

```javascript
import deltaSyncService from '../services/deltaSyncService';

// Add a change
deltaSyncService.addPendingChange('grievance', {
  id: 'GRV123',
  description: 'Safety issue',
  timestamp: Date.now()
}, 'create');

// Sync manually
const result = await deltaSyncService.syncPendingChanges(apiUrl);
console.log(`Synced ${result.synced} changes`);
```

### Check Sync Status

```javascript
const stats = deltaSyncService.getSyncStats();
console.log(`Pending: ${stats.pendingChanges}`);
console.log(`Last sync: ${stats.lastSync}`);

const usage = deltaSyncService.estimateDataUsage();
console.log(`Data to sync: ${usage.kilobytes} KB`);
```

## API Endpoints

### Push Changes (Client → Server)

```http
POST /api/sync
Content-Type: application/json

{
  "changes": [
    {
      "id": "attendance_1234_abc",
      "type": "attendance",
      "operation": "create",
      "data": { ... },
      "timestamp": 1234567890
    }
  ],
  "lastSync": 1234567890
}
```

**Response:**
```json
{
  "success": true,
  "synced": 5,
  "serverTimestamp": 1234567900
}
```

### Pull Changes (Server → Client)

```http
GET /api/changes?since=1234567890
```

**Response:**
```json
{
  "changes": [
    {
      "type": "job",
      "operation": "create",
      "data": { ... },
      "timestamp": 1234567895
    }
  ],
  "serverTimestamp": 1234567900
}
```

## Configuration

### Sync Thresholds

```javascript
// Auto-sync after 10 pending changes
const shouldSync = deltaSyncService.shouldSync(10);

// Auto-sync after 1 hour (3600000 ms)
const shouldSync = deltaSyncService.shouldSync(10, 3600000);
```

### Custom Sync Logic

```javascript
// Sync only on WiFi
if (navigator.connection.effectiveType === 'wifi') {
  await deltaSyncService.syncPendingChanges(apiUrl);
}

// Sync during off-peak hours
const hour = new Date().getHours();
if (hour >= 22 || hour <= 6) {
  await deltaSyncService.syncPendingChanges(apiUrl);
}
```

## Data Usage Comparison

### Traditional Full Sync
```
Attendance Records: 100 records × 2 KB = 200 KB
Jobs Data: 50 jobs × 3 KB = 150 KB
Grievances: 20 records × 1 KB = 20 KB
─────────────────────────────────────────
Total: 370 KB per sync
```

### Delta Sync (Only Changes)
```
New Attendance: 2 records × 2 KB = 4 KB
Updated Job: 1 job × 3 KB = 3 KB
New Grievance: 1 record × 1 KB = 1 KB
─────────────────────────────────────────
Total: 8 KB per sync
```

**Savings: 362 KB (97.8% reduction)**

## UI Components

### Sync Status Widget

The `SyncStatus` component displays:
- Pending changes count
- Last sync time
- Data usage estimate
- Manual sync button
- Sync result feedback

Located at bottom-right corner of the app.

### Features:
- ✅ Collapsible interface
- ✅ Real-time updates
- ✅ Visual indicators (badges)
- ✅ Data usage metrics
- ✅ One-click sync

## Best Practices

### 1. **Batch Changes**
```javascript
// ❌ Bad: Sync after every change
onChange(() => {
  trackChange(data);
  syncNow(); // Too frequent!
});

// ✅ Good: Let auto-sync handle it
onChange(() => {
  trackChange(data);
  // Syncs automatically when threshold reached
});
```

### 2. **Handle Sync Failures**
```javascript
const result = await syncNow();
if (!result.success) {
  // Retry with exponential backoff
  setTimeout(() => syncNow(), 5000);
}
```

### 3. **Optimize Data Size**
```javascript
// ❌ Bad: Send unnecessary data
trackChange({
  ...fullObject,
  largeImage: base64Image, // Avoid large payloads
  metadata: { ... }
});

// ✅ Good: Send only essentials
trackChange({
  id: object.id,
  status: object.status,
  timestamp: Date.now()
});
```

### 4. **Monitor Data Usage**
```javascript
// Check before syncing
const usage = deltaSyncService.estimateDataUsage();
if (usage.kilobytes > 100) {
  // Warn user about large sync
  const confirmed = confirm(`Sync will use ${usage.kilobytes} KB. Continue?`);
  if (confirmed) syncNow();
}
```

## Testing

### Simulate Offline Mode
```javascript
// Add changes while offline
deltaSyncService.addPendingChange('attendance', data1);
deltaSyncService.addPendingChange('attendance', data2);
deltaSyncService.addPendingChange('grievance', data3);

// Check pending
const stats = deltaSyncService.getSyncStats();
console.log(`${stats.pendingChanges} changes pending`);

// Sync when online
await deltaSyncService.syncPendingChanges(apiUrl);
```

### Clear Sync Data
```javascript
// For testing/reset
deltaSyncService.clearSyncData();
```

## Performance Metrics

### Typical Scenarios

| Scenario | Full Sync | Delta Sync | Savings |
|----------|-----------|------------|---------|
| Daily attendance (1 record) | 200 KB | 2 KB | 99% |
| Job search (50 jobs) | 150 KB | 0 KB* | 100% |
| Submit grievance (1 record) | 20 KB | 1 KB | 95% |
| Weekly sync (10 changes) | 370 KB | 15 KB | 96% |

*Read-only operations don't require sync

## Troubleshooting

### Changes Not Syncing
```javascript
// Check pending changes
const pending = deltaSyncService.getPendingChanges();
console.log('Pending:', pending);

// Check last sync
const stats = deltaSyncService.getSyncStats();
console.log('Last sync:', stats.lastSync);

// Force sync
await deltaSyncService.syncPendingChanges(apiUrl);
```

### High Data Usage
```javascript
// Estimate before sync
const usage = deltaSyncService.estimateDataUsage();
console.log(`Will use ${usage.kilobytes} KB`);

// Check individual changes
const changes = deltaSyncService.getPendingChanges();
changes.forEach(change => {
  const size = JSON.stringify(change).length;
  console.log(`${change.type}: ${size} bytes`);
});
```

## Future Enhancements

- [ ] Compression (gzip) for even smaller payloads
- [ ] Conflict resolution for concurrent edits
- [ ] Selective sync (choose what to sync)
- [ ] Background sync (Service Worker)
- [ ] Sync analytics dashboard
- [ ] Network-aware sync (WiFi vs mobile data)

## Support

For issues or questions:
- Check console logs for sync activity
- Use `deltaSyncService.getSyncStats()` for debugging
- Review pending changes with `getPendingChanges()`
- Clear data with `clearSyncData()` if needed

---

**Built for Shram Setu** - Empowering India's blue-collar workforce with data-efficient technology.
