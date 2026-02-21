# Deployment Guide - Login & Onboarding Flow

## Overview

This guide covers deployment preparation, configuration, and launch procedures for the Shramik-Setu Login & Onboarding Flow.

---

## Pre-Deployment Checklist

### Code Quality
- [x] All components implemented
- [x] Error handling in place
- [x] Loading states implemented
- [x] Accessibility features added
- [x] Responsive design verified
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] E2E tests written
- [ ] Code review completed
- [ ] Performance audit passed

### Configuration
- [ ] Environment variables configured
- [ ] API endpoints verified
- [ ] AWS services configured (if using)
- [ ] CDN configured
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Analytics configured
- [ ] Error tracking configured

### Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on Edge
- [ ] Tested on mobile devices
- [ ] Tested on tablets
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Security audit passed

---

## Environment Configuration

### 1. Environment Variables

Create `.env.production` file:

```env
# API Configuration
REACT_APP_API_BASE_URL=https://api.shramsetu.com/v1
REACT_APP_API_TIMEOUT=30000

# AWS Configuration (if using)
REACT_APP_AWS_REGION=ap-south-1
REACT_APP_AWS_S3_BUCKET=shramsetu-uploads
REACT_APP_AWS_CLOUDFRONT_URL=https://cdn.shramsetu.com

# Analytics
REACT_APP_ANALYTICS_ID=UA-XXXXXXXXX-X
REACT_APP_GTM_ID=GTM-XXXXXXX

# Feature Flags
REACT_APP_ENABLE_VOICE=true
REACT_APP_ENABLE_ESHRAM=true
REACT_APP_ENABLE_ANALYTICS=true

# App Configuration
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production
```

### 2. Build Configuration

Update `package.json`:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "build:staging": "env-cmd -f .env.staging react-scripts build",
    "build:production": "env-cmd -f .env.production react-scripts build",
    "analyze": "source-map-explorer 'build/static/js/*.js'",
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false"
  }
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test -- --coverage
      - name: Run linter
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build:production
        env:
          REACT_APP_API_BASE_URL: ${{ secrets.API_BASE_URL }}
      - name: Upload build artifacts
        uses: actions/upload-artifact@v2
        with:
          name: build
          path: build/

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v2
        with:
          name: build
      - name: Deploy to staging
        run: |
          # Deploy to staging server
          echo "Deploying to staging..."

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v2
        with:
          name: build
      - name: Deploy to production
        run: |
          # Deploy to production server
          echo "Deploying to production..."
```

---

## Deployment Scripts

### 1. Build Script

Create `scripts/build.sh`:

```bash
#!/bin/bash

echo "Building for production..."

# Clean previous build
rm -rf build

# Install dependencies
npm ci

# Run tests
npm test -- --coverage --watchAll=false

# Build
npm run build:production

# Analyze bundle size
npm run analyze

echo "Build complete!"
```

### 2. Deploy Script

Create `scripts/deploy.sh`:

```bash
#!/bin/bash

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: ./deploy.sh [staging|production]"
  exit 1
fi

echo "Deploying to $ENVIRONMENT..."

# Build
./scripts/build.sh

# Deploy based on environment
if [ "$ENVIRONMENT" == "staging" ]; then
  # Deploy to staging
  aws s3 sync build/ s3://shramsetu-staging --delete
  aws cloudfront create-invalidation --distribution-id STAGING_DIST_ID --paths "/*"
elif [ "$ENVIRONMENT" == "production" ]; then
  # Deploy to production
  aws s3 sync build/ s3://shramsetu-production --delete
  aws cloudfront create-invalidation --distribution-id PROD_DIST_ID --paths "/*"
fi

echo "Deployment complete!"
```

---

## AWS Configuration

### 1. S3 Bucket Setup

```bash
# Create S3 bucket
aws s3 mb s3://shramsetu-production --region ap-south-1

# Enable static website hosting
aws s3 website s3://shramsetu-production \
  --index-document index.html \
  --error-document index.html

# Set bucket policy
aws s3api put-bucket-policy \
  --bucket shramsetu-production \
  --policy file://bucket-policy.json
```

### 2. CloudFront Distribution

```json
{
  "DistributionConfig": {
    "Origins": [{
      "DomainName": "shramsetu-production.s3.ap-south-1.amazonaws.com",
      "Id": "S3-shramsetu-production",
      "S3OriginConfig": {
        "OriginAccessIdentity": ""
      }
    }],
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-shramsetu-production",
      "ViewerProtocolPolicy": "redirect-to-https",
      "Compress": true
    },
    "Enabled": true,
    "Comment": "Shramik-Setu Production"
  }
}
```

### 3. AWS Polly/Transcribe (Optional)

```javascript
// Configure AWS SDK
import AWS from 'aws-sdk';

AWS.config.update({
  region: process.env.REACT_APP_AWS_REGION,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID
  })
});
```

---

## Performance Optimization

### 1. Code Splitting

```javascript
// Lazy load screens
const LanguageSelection = lazy(() => import('./screens/LanguageSelection'));
const RoleSelection = lazy(() => import('./screens/RoleSelection'));
// ... other screens

// Use Suspense
<Suspense fallback={<LoadingSpinner />}>
  <LanguageSelection />
</Suspense>
```

### 2. Bundle Optimization

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        }
      }
    }
  }
};
```

### 3. Service Worker

```javascript
// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
      console.log('Service Worker registered');
    });
}
```

---

## Monitoring & Analytics

### 1. Google Analytics

```javascript
// Initialize GA
import ReactGA from 'react-ga4';

ReactGA.initialize(process.env.REACT_APP_ANALYTICS_ID);

// Track page views
ReactGA.send({ hitType: "pageview", page: window.location.pathname });
```

### 2. Error Tracking (Sentry)

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENVIRONMENT,
  tracesSampleRate: 1.0,
});
```

### 3. Performance Monitoring

```javascript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to analytics
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## Security Configuration

### 1. Content Security Policy

Add to `public/index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
           script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; 
           style-src 'self' 'unsafe-inline'; 
           img-src 'self' data: https:; 
           connect-src 'self' https://api.shramsetu.com;">
```

### 2. HTTPS Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name shramsetu.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        root /var/www/shramsetu;
        try_files $uri /index.html;
    }
}
```

---

## Post-Deployment Verification

### 1. Smoke Tests

```bash
# Check homepage loads
curl -I https://shramsetu.com

# Check API connectivity
curl https://api.shramsetu.com/health

# Check SSL certificate
openssl s_client -connect shramsetu.com:443
```

### 2. Monitoring Checklist

- [ ] Application loads successfully
- [ ] All API endpoints responding
- [ ] Analytics tracking working
- [ ] Error tracking configured
- [ ] Performance metrics within targets
- [ ] SSL certificate valid
- [ ] CDN caching working
- [ ] Mobile responsiveness verified

---

## Rollback Procedure

### 1. Quick Rollback

```bash
# Rollback to previous version
aws s3 sync s3://shramsetu-backup/v1.0.0 s3://shramsetu-production --delete
aws cloudfront create-invalidation --distribution-id PROD_DIST_ID --paths "/*"
```

### 2. Database Rollback (if needed)

```bash
# Restore database backup
# (Add specific commands based on your database)
```

---

## Support & Maintenance

### 1. Monitoring Dashboard

- Application uptime
- API response times
- Error rates
- User analytics
- Performance metrics

### 2. Incident Response

1. Detect issue (monitoring alerts)
2. Assess severity
3. Communicate to stakeholders
4. Implement fix or rollback
5. Post-mortem analysis

---

## Performance Targets

- **Initial Load**: < 3 seconds on 3G
- **Time to Interactive**: < 5 seconds
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

---

## Launch Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Documentation complete
- [ ] Staging deployment successful
- [ ] Stakeholder approval received

### Launch Day
- [ ] Deploy to production
- [ ] Verify deployment
- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Check analytics
- [ ] Communicate launch
- [ ] Monitor user feedback

### Post-Launch
- [ ] Monitor for 24 hours
- [ ] Address critical issues
- [ ] Collect user feedback
- [ ] Plan improvements
- [ ] Update documentation

---

**Document Version**: 1.0  
**Last Updated**: 2025-02-21  
**Status**: Ready for Deployment

