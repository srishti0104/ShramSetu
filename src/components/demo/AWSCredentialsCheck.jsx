/**
 * AWS Credentials Check Component
 * 
 * @fileoverview Diagnostic component to check if AWS credentials are loaded
 */

import { useState, useEffect } from 'react';
import { hasAWSCredentials } from '../../config/aws-config';

export default function AWSCredentialsCheck() {
  const [status, setStatus] = useState({
    hasCredentials: false,
    accessKeyId: null,
    region: null
  });

  useEffect(() => {
    const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
    const region = import.meta.env.VITE_AWS_REGION;

    setStatus({
      hasCredentials: !!(accessKeyId && secretAccessKey),
      accessKeyId: accessKeyId ? `${accessKeyId.substring(0, 8)}...` : 'NOT FOUND',
      region: region || 'NOT FOUND'
    });
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: status.hasCredentials ? '#d4edda' : '#f8d7da',
      border: `2px solid ${status.hasCredentials ? '#28a745' : '#dc3545'}`,
      borderRadius: '8px',
      padding: '1rem',
      maxWidth: '300px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      zIndex: 9999
    }}>
      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '14px' }}>
        {status.hasCredentials ? '✅ AWS Credentials' : '❌ AWS Credentials'}
      </h4>
      <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
        <div><strong>Access Key:</strong> {status.accessKeyId}</div>
        <div><strong>Region:</strong> {status.region}</div>
        <div style={{ marginTop: '0.5rem', fontSize: '11px', opacity: 0.8 }}>
          {status.hasCredentials 
            ? 'Credentials loaded successfully!' 
            : '⚠️ Restart dev server to load credentials'}
        </div>
      </div>
    </div>
  );
}
