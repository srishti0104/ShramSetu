/**
 * AttendanceLog Component
 * Displays attendance history with audit verification
 */

import { useState, useEffect } from 'react';
import './AttendanceLog.css';

const AttendanceLog = ({ sessionId, workerId, filters }) => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchAttendanceLog();
  }, [sessionId, workerId, filters]);

  const fetchAttendanceLog = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      if (workerId) params.append('workerId', workerId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.limit) params.append('limit', filters.limit);

      const response = await fetch(`/api/v1/attendance/log?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch attendance log');
      }

      const data = await response.json();
      setRecords(data.records);
      setSummary(data.summary);
      setLoading(false);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('hi-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVerificationBadge = (record) => {
    if (record.auditVerified) {
      return (
        <span className="badge verified" title="Audit verified">
          ✓ सत्यापित / Verified
        </span>
      );
    }
    return (
      <span className="badge tampered" title="Audit failed">
        ⚠️ छेड़छाड़ / Tampered
      </span>
    );
  };

  const getLocationBadge = (record) => {
    if (!record.locationVerification) {
      return <span className="badge neutral">स्थान नहीं / No Location</span>;
    }

    if (record.locationVerification.withinRange) {
      return (
        <span className="badge success" title={`${record.locationVerification.distance}m away`}>
          📍 सीमा में / Within Range
        </span>
      );
    }

    return (
      <span className="badge warning" title={`${record.locationVerification.distance}m away`}>
        📍 सीमा से बाहर / Out of Range
      </span>
    );
  };

  if (loading) {
    return (
      <div className="attendance-log loading">
        <div className="loading-spinner"></div>
        <p>लोड हो रहा है... / Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attendance-log error">
        <div className="error-icon">⚠️</div>
        <p className="error-text">{error}</p>
        <button onClick={fetchAttendanceLog} className="btn-retry">
          पुनः प्रयास करें / Retry
        </button>
      </div>
    );
  }

  return (
    <div className="attendance-log">
      <div className="attendance-log-header">
        <h2>उपस्थिति रिकॉर्ड / Attendance Records</h2>
        <button onClick={fetchAttendanceLog} className="btn-refresh" aria-label="Refresh">
          🔄
        </button>
      </div>

      {summary && (
        <div className="attendance-summary">
          <div className="summary-card">
            <div className="summary-value">{summary.totalRecords}</div>
            <div className="summary-label">कुल रिकॉर्ड / Total</div>
          </div>
          <div className="summary-card success">
            <div className="summary-value">{summary.verifiedRecords}</div>
            <div className="summary-label">सत्यापित / Verified</div>
          </div>
          {summary.tamperedRecords > 0 && (
            <div className="summary-card warning">
              <div className="summary-value">{summary.tamperedRecords}</div>
              <div className="summary-label">छेड़छाड़ / Tampered</div>
            </div>
          )}
        </div>
      )}

      {records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>कोई रिकॉर्ड नहीं मिला / No records found</p>
        </div>
      ) : (
        <div className="records-list">
          {records.map((record) => (
            <div
              key={record.attendanceId}
              className={`record-card ${selectedRecord?.attendanceId === record.attendanceId ? 'selected' : ''}`}
              onClick={() => setSelectedRecord(record)}
            >
              <div className="record-header">
                <div className="record-date">
                  <span className="date">{formatDate(record.timestamp)}</span>
                  <span className="time">{formatTime(record.timestamp)}</span>
                </div>
                <div className="record-badges">
                  {getVerificationBadge(record)}
                  {getLocationBadge(record)}
                </div>
              </div>

              <div className="record-body">
                <div className="record-info">
                  <div className="info-row">
                    <span className="info-label">कर्मचारी / Worker:</span>
                    <span className="info-value">{record.workerId}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">सत्र / Session:</span>
                    <span className="info-value">{record.sessionId}</span>
                  </div>
                  {record.locationVerification && (
                    <div className="info-row">
                      <span className="info-label">दूरी / Distance:</span>
                      <span className="info-value">{record.locationVerification.distance}m</span>
                    </div>
                  )}
                </div>

                {selectedRecord?.attendanceId === record.attendanceId && (
                  <div className="record-details">
                    <div className="detail-section">
                      <h4>ऑडिट जानकारी / Audit Information</h4>
                      <div className="detail-item">
                        <span>हस्ताक्षर / Signature:</span>
                        <code className="signature">{record.auditSignature.substring(0, 32)}...</code>
                      </div>
                      <div className="detail-item">
                        <span>स्थिति / Status:</span>
                        <span className={record.auditVerified ? 'status-verified' : 'status-failed'}>
                          {record.auditStatus}
                        </span>
                      </div>
                    </div>

                    {record.location && (
                      <div className="detail-section">
                        <h4>स्थान / Location</h4>
                        <div className="detail-item">
                          <span>अक्षांश / Latitude:</span>
                          <span>{record.location.latitude.toFixed(6)}</span>
                        </div>
                        <div className="detail-item">
                          <span>देशांतर / Longitude:</span>
                          <span>{record.location.longitude.toFixed(6)}</span>
                        </div>
                      </div>
                    )}

                    {record.metadata && (
                      <div className="detail-section">
                        <h4>मेटाडेटा / Metadata</h4>
                        <div className="detail-item">
                          <span>IP पता / IP Address:</span>
                          <span>{record.metadata.ipAddress}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceLog;
