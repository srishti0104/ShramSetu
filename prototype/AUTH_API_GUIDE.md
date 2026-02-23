# Authentication API Guide

## Understanding the "Missing Authentication Token" Error

The error `{"message":"Missing Authentication Token"}` from AWS API Gateway is **NORMAL** and happens when you:
1. Visit the base API URL directly in a browser (e.g., `https://c6ikb39522.execute-api.ap-south-1.amazonaws.com/prod`)
2. Try to access a route that doesn't exist
3. Use the wrong HTTP method (e.g., GET instead of POST)

**This is NOT an error with your setup!** It's just AWS API Gateway's way of saying "you need to specify a valid endpoint."

## Your API is Working! ✅

Your authentication API is deployed and working at:
```
https://c6ikb39522.execute-api.ap-south-1.amazonaws.com/prod
```

### Available Endpoints:

1. **Send OTP**: `POST /auth/send-otp`
2. **Verify OTP**: `POST /auth/verify-otp`
3. **Register**: `POST /auth/register`
4. **Login**: `POST /auth/login`

## How to Test the API

### Option 1: Use the Test HTML File (Easiest)

1. Open `test-auth-api.html` in your browser
2. Click the buttons to test each endpoint
3. See the results in real-time

### Option 2: Use the Auth Demo in Your App

1. Start your dev server: `npm run dev`
2. Go to http://localhost:5173
3. Click "🔐 Auth Demo" in the navigation
4. Test the authentication flow

### Option 3: Use Mock Mode (No AWS SNS Required)

If AWS SNS is not configured for SMS, you can use mock mode:

1. Edit `.env` and uncomment this line:
   ```
   VITE_USE_MOCK_AUTH=true
   ```

2. Restart your dev server

3. Now the Auth Demo will work without AWS:
   - OTP will be logged to console (check browser DevTools)
   - Use the OTP from console to verify
   - Everything else works the same

## Why SMS Might Not Work

Your Lambda functions are deployed and working, but SMS sending requires AWS SNS configuration:

### Current Status:
- ✅ Lambda functions deployed
- ✅ DynamoDB tables created
- ✅ API Gateway configured
- ⚠️ AWS SNS SMS not configured

### To Enable SMS:

#### Sandbox Mode (For Testing):
1. Go to AWS Console → SNS → Text messaging (SMS)
2. Click "Sandbox destination phone numbers"
3. Add your phone number
4. Verify it via the code sent to your phone
5. Now you can send SMS to that number only

#### Production Mode (For Real Use):
1. Go to AWS Console → SNS → Text messaging (SMS)
2. Click "Request production access"
3. Fill out the form explaining your use case
4. Wait for AWS approval (usually 24 hours)
5. Once approved, you can send SMS to any number

## Testing Without SMS

You can still test the full authentication flow without SMS:

### Method 1: Check DynamoDB Directly
1. Go to AWS Console → DynamoDB
2. Open table: `ShramSetuAuthStack-OTPTable8364059A-RQQ546MZRJ9X`
3. Click "Explore table items"
4. After clicking "Send OTP" in your app, find your phone number in the table
5. Copy the OTP code
6. Use it in your app to verify

### Method 2: Use Mock Mode
Enable `VITE_USE_MOCK_AUTH=true` in `.env` as described above.

## API Request Examples

### Send OTP
```javascript
fetch('https://c6ikb39522.execute-api.ap-south-1.amazonaws.com/prod/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phoneNumber: '+919876543210' })
})
```

### Verify OTP
```javascript
fetch('https://c6ikb39522.execute-api.ap-south-1.amazonaws.com/prod/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    phoneNumber: '+919876543210',
    otp: '123456'
  })
})
```

### Register
```javascript
fetch('https://c6ikb39522.execute-api.ap-south-1.amazonaws.com/prod/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+919876543210',
    name: 'Test User',
    role: 'worker'
  })
})
```

### Login
```javascript
fetch('https://c6ikb39522.execute-api.ap-south-1.amazonaws.com/prod/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phoneNumber: '+919876543210' })
})
```

## Summary

✅ **Your API is connected and working!**

The "Missing Authentication Token" error is normal when accessing the base URL. Your React app is correctly configured to use the proper endpoints.

To test:
1. Use the Auth Demo in your app
2. Or enable mock mode in `.env`
3. Or configure AWS SNS for real SMS

No additional AWS website configuration is needed for the API itself - it's already deployed and ready!
