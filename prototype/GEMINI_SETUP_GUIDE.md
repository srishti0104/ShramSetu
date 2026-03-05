# Google Gemini AI Setup Guide

## Overview
ShramSetu now supports both **Google Gemini** and **Groq AI** with an easy toggle to switch between them.

## Why Gemini?
- ✅ **Better multilingual support** - Excellent with Hindi, Tamil, Telugu, Bengali
- ✅ **Free forever** - 15 requests/minute, 1M tokens/day
- ✅ **Longer context** - 32k tokens vs Groq's 8k
- ✅ **Better instruction following** - More consistent responses
- ✅ **Perfect for Indian workers** - Understands cultural context better

## Setup Steps

### 1. Get Your Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 2. Add to .env File
Open `ShramSetu/prototype/.env` and replace:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
with your actual API key:
```
VITE_GEMINI_API_KEY=AIzaSyC...your_actual_key
```

### 3. Restart the Server
```bash
npm run dev
```

## How to Use

### In the AI Assistant:
1. **AI Mode Toggle** - Turn AI on/off (Mock mode for testing)
2. **Provider Selector** - Choose between:
   - 🌟 **Gemini** (Best for Hindi) - Default, recommended
   - ⚡ **Groq** (Fastest) - Backup option

### Features:
- **Smart job matching** - Detects job types and locations automatically
- **Multilingual** - Responds in English/Hindi mix
- **Context-aware** - Understands ShramSetu platform features
- **Empathetic** - Supportive tone for worker problems
- **Action buttons** - Auto-generates redirect buttons

## Testing

Try these queries:
1. "I need a job" → Lists categories
2. "construction" → Direct redirect button
3. "plumber job in Delhi" → Filtered search
4. "my salary is less" → Payslip auditor suggestion
5. "what are my rights" → Worker rights info

## Troubleshooting

### "Gemini API key not found"
- Check `.env` file has `VITE_GEMINI_API_KEY=...`
- Restart the dev server after adding key
- Make sure key starts with `AIzaSy`

### Slow responses
- Gemini: 1-2 seconds (normal)
- Groq: <1 second (faster)
- Switch to Groq if speed is critical

### API quota exceeded
- Free tier: 15 requests/minute
- Wait 1 minute and try again
- Switch to Groq temporarily

## API Limits Comparison

| Feature | Gemini | Groq |
|---------|--------|------|
| Requests/min | 15 | 30 |
| Tokens/day | 1M | Unlimited |
| Speed | 1-2s | <1s |
| Hindi support | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Context length | 32k | 8k |
| Cost | Free | Free |

## Recommendation
Use **Gemini as default** for better multilingual support and accuracy. Keep Groq as backup for speed-critical scenarios.
