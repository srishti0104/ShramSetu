/**
 * AWS Configuration
 * 
 * @fileoverview AWS services configuration
 * 
 * IMPORTANT: For production, use AWS Cognito or IAM roles instead of hardcoded credentials
 * This configuration uses environment variables for development/testing
 */

/**
 * Get AWS credentials from environment variables
 */
const getCredentials = () => {
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey) {
    return {
      accessKeyId,
      secretAccessKey
    };
  }

  // Return undefined to let SDK auto-detect (works in Node.js/Lambda)
  return undefined;
};

/**
 * AWS Configuration
 */
export const awsConfig = {
  region: import.meta.env.VITE_AWS_REGION || 'ap-south-1',
  
  // Credentials from environment variables
  credentials: getCredentials(),
  
  // Service-specific configurations
  polly: {
    region: 'ap-south-1',
    defaultVoice: {
      hi: 'Aditi',
      en: 'Kajal'
    }
  },
  
  transcribe: {
    region: 'ap-south-1',
    languageCode: 'hi-IN'
  },
  
  comprehend: {
    region: 'ap-south-1'
  }
};

/**
 * Initialize AWS services
 * Call this function when your app starts
 */
export function initializeAWS() {
  const hasCredentials = awsConfig.credentials !== undefined;
  
  if (hasCredentials) {
    console.log('✅ AWS services initialized with credentials for region:', awsConfig.region);
  } else {
    console.warn('⚠️ AWS credentials not found. Services will use SDK default credential chain.');
  }
  
  return hasCredentials;
}

/**
 * Check if AWS credentials are configured
 */
export function hasAWSCredentials() {
  return awsConfig.credentials !== undefined;
}

export default awsConfig;
